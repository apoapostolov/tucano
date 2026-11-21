import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectCopy } from './lib/copy-source.mjs'
import { planOverrides, registerReview } from './lib/copy-overrides.mjs'

const args = process.argv.slice(2)
const command = args[0] || 'check'
const options = new Map()
for (let index = 1; index < args.length; index += 2) {
  const name = args[index], value = args[index + 1]
  assert.ok(['--registry', '--review', '--base', '--output'].includes(name), `Unknown option: ${name}`)
  assert.ok(value && !value.startsWith('--') && !options.has(name), `Supply one value for ${name}`)
  options.set(name, value)
}
const option = (name, fallback) => options.get(name) ?? fallback
assert.ok(['check', 'apply', 'register'].includes(command), 'Usage: node scripts/maintain-english-copy.mjs check|apply|register [--review FILE] [--base SHA] [--output FILE]')
const registryPath = resolve(option('--registry', 'scripts/data/english-copy-overrides.json'))
const registry = JSON.parse(readFileSync(registryPath, 'utf8'))
assert.equal(registry.version, 1, 'Unsupported registry version')
assert.ok(Array.isArray(registry.entries), 'Registry entries must be an array')
for (const entry of registry.entries) {
  assert.ok(typeof entry.source === 'string' && entry.source && typeof entry.approved === 'string' && entry.approved, 'Registry source and approval must be nonempty strings')
  assert.ok(Array.isArray(entry.files) && entry.files.length && entry.files.every(file => typeof file === 'string' && file.startsWith('src/') && !file.includes('..')), 'Declare source files for each approval')
  assert.ok(Array.isArray(entry.previous) && entry.previous.every(text => typeof text === 'string'), 'Previous variants must be strings')
  assert.ok(!entry.contexts || Array.isArray(entry.contexts) && entry.contexts.length && entry.contexts.every(context => typeof context === 'string'), 'Contexts must be a nonempty array of names')
}
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
const files = git('ls-files', 'src').split('\n').filter(file => /\.[cm]?[jt]sx?$/.test(file))
const rows = files.flatMap(file => collectCopy(readFileSync(file, 'utf8'), file))
const source = git('rev-parse', 'HEAD')
if (command === 'register') {
  const path = option('--review')
  assert.ok(path, 'register requires --review with an editorially approved inventory')
  const review = JSON.parse(readFileSync(path, 'utf8'))
  const result = registerReview(rows, registry.entries, review, path.replaceAll('\\', '/'))
  writeFileSync(registryPath, JSON.stringify({ version: 1, entries: result.entries }, null, 2) + '\n')
  console.log(JSON.stringify({ command, source, registered: result.registered, entries: result.entries.length }))
} else {
  const plan = planOverrides(rows, registry.entries)
  const base = option('--base')
  const additions = []
  if (base) {
    const known = new Set(registry.entries.flatMap(entry => entry.files.map(file => file + '\0' + entry.source + '\0' + entry.approved)))
    for (const file of files) {
      let before = []
      // A file absent from the base is new. Other Git failures must propagate.
      if (git('ls-tree', base, '--', file)) before = collectCopy(git('show', base + ':' + file), file)
      const old = new Set(before.map(row => row.kind + '\0' + row.source + '\0' + row.english))
      for (const row of rows.filter(row => row.file === file)) {
        if (!old.has(row.kind + '\0' + row.source + '\0' + row.english) && !known.has(row.file + '\0' + row.source + '\0' + row.english)) additions.push(row)
      }
    }
  }
  const output = resolve(option('--output', '.tucano-local/copy-overrides/report.json'))
  const report = { command, source, base: base || null, approved: plan.approved.length, restore: plan.restore, review: plan.review, ambiguous: plan.ambiguous, additions, applied: 0 }
  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n')
  assert.equal(plan.ambiguous.length, 0, `Ambiguous copy keys; resolve registry ownership in ${output} before applying overrides`)
  if (command === 'apply' && plan.restore.length) {
    mkdirSync(dirname(output), { recursive: true })
    const path = resolve(dirname(output), 'restore-plan.json')
    writeFileSync(path, JSON.stringify({ strings: plan.restore }, null, 2) + '\n')
    execFileSync(process.execPath, [fileURLToPath(new URL('./apply-copy-review.mjs', import.meta.url)), path, '--write'], { stdio: 'inherit' })
    report.applied = plan.restore.length
  }
  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ command, source, approved: report.approved, regressions: plan.restore.length, applied: report.applied, unfamiliar: plan.review.length, additions: additions.length, output }))
  for (const row of [...plan.review, ...additions]) console.error(`${row.file}:${row.line}: review English: ${row.english}`)
  if (plan.review.length || additions.length || (command === 'check' && plan.restore.length)) process.exitCode = 1
}
