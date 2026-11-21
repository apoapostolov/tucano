import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectCopy } from './lib/copy-source.mjs'
import { planOverrides } from './lib/copy-overrides.mjs'

const root = mkdtempSync(join(tmpdir(), 'tucano-copy-override-test-'))
mkdirSync(join(root, 'src'))
const path = join(root, 'src', 'fixture.ts')
const registryPath = join(root, 'registry.json')
const output = join(root, 'report.json')
const cli = fileURLToPath(new URL('./maintain-english-copy.mjs', import.meta.url))
const gitconfig = join(root, 'gitconfig')
writeFileSync(gitconfig, '[init]\n')
const env = { ...process.env, GIT_CONFIG_GLOBAL: gitconfig, GIT_CONFIG_NOSYSTEM: '1' }
const run = (command, args) => spawnSync(command, args, { cwd: root, env, encoding: 'utf8', windowsHide: true })
for (const args of [['init', '--quiet'], ['add', 'src']]) {
  if (args[0] === 'add') writeFileSync(path, `const hint = L('Texto em português', 'Old verbose wording.');\n`)
  assert.equal(run('git', args).status, 0)
}
assert.equal(run('git', ['-c', 'user.name=Copy fixture', '-c', 'user.email=copy-fixture@example.invalid', 'commit', '--quiet', '-m', 'Fixture']).status, 0)
const entry = { source: 'Texto em português', files: ['src/fixture.ts'], approved: 'Approved wording.', previous: ['Old verbose wording.'], reviews: ['fixture-review.json'] }
writeFileSync(registryPath, JSON.stringify({ version: 1, entries: [entry] }))
const call = (...args) => run(process.execPath, [cli, ...args, '--registry', registryPath, '--output', output])
assert.equal(call('check').status, 1, 'A known regression fails the check')
assert.equal(JSON.parse(readFileSync(output)).restore.length, 1)
assert.equal(call('apply').status, 0, 'The CLI restores known wording')
assert.equal(readFileSync(path, 'utf8'), `const hint = L('Texto em português', "Approved wording.");\n`, 'Portuguese and surrounding code are preserved')
assert.equal(call('check').status, 0)
assert.notEqual(call('check', '--unknown', 'value').status, 0, 'Unknown options fail loudly')
assert.equal(call('apply').status, 0, 'Applying twice is safe')
writeFileSync(path, `const hint = L('Texto em português', 'A new behavioral meaning.');\n`)
assert.equal(call('apply').status, 1, 'Unfamiliar text requires review')
assert.ok(readFileSync(path, 'utf8').includes('A new behavioral meaning.'))
writeFileSync(registryPath, JSON.stringify({ version: 1, entries: [entry, { ...entry, approved: 'Conflicting approval.' }] }))
assert.notEqual(call('apply').status, 0, 'Ambiguous approvals fail before writing')
assert.ok(readFileSync(path, 'utf8').includes('A new behavioral meaning.'))
const moved = collectCopy(`const hint = L('Texto em português', 'Old verbose wording.');`, 'src/moved.ts')
assert.equal(planOverrides(moved, [entry]).restore.length, 0, 'A common translation key in an undeclared file is not overwritten')
assert.equal(planOverrides(moved, [{ ...entry, files: [...entry.files, 'src/moved.ts'] }]).restore.length, 1, 'An explicit move alias preserves ownership')
const review = { strings: [{ ...collectCopy(readFileSync(path, 'utf8'), 'src/fixture.ts')[0], decision: 'replace', replacement: 'A new behavioral meaning.' }] }
writeFileSync(join(root, 'review.json'), JSON.stringify(review))
writeFileSync(registryPath, JSON.stringify({ version: 1, entries: [entry] }))
assert.equal(call('register', '--review', 'review.json').status, 0)
assert.equal(call('check').status, 0, 'Reviewed meaning changes can be registered explicitly')
review.strings[0].decision = 'retain'
delete review.strings[0].replacement
writeFileSync(join(root, 'review.json'), JSON.stringify(review))
assert.equal(call('register', '--review', 'review.json').status, 0, 'Retained reviewed text can be registered')
writeFileSync(path, `function first() { return L('Texto em português', 'Old verbose wording.') }\nfunction second() { return L('Texto em português', 'Leave this wording.') }\n`)
writeFileSync(registryPath, JSON.stringify({ version: 1, entries: [{ ...entry, contexts: ['first'] }] }))
assert.equal(call('apply').status, 0, 'A context-scoped entry restores only its own occurrence')
assert.ok(readFileSync(path, 'utf8').includes('Leave this wording.'))
assert.ok(readFileSync(path, 'utf8').includes('Approved wording.'))
assert.equal(call('check', '--base', 'HEAD').status, 1, 'Base comparison exposes unregistered additions')
assert.equal(JSON.parse(readFileSync(output)).additions.length, 1)
writeFileSync(path, `const hint = L('Quantidade', \`Old \${n + 1}\`);\n`)
writeFileSync(registryPath, JSON.stringify({ version: 1, entries: [{ source: 'Quantidade', files: ['src/fixture.ts'], approved: 'Approved ${n + 2}', previous: ['Old ${n + 1}'], reviews: ['fixture'] }] }))
assert.notEqual(call('apply').status, 0, 'Interpolation changes are rejected')
assert.ok(readFileSync(path, 'utf8').includes('n + 1'))
console.log('Copy overrides: regression detection, restoration, idempotence, unknown text, ambiguity, file ownership, explicit aliases, registration and interpolation protection passed.')

