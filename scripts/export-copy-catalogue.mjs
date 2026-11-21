import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { collectCopy } from './lib/copy-source.mjs'

// Export the reviewed English as a catalogue: one row per approved string, plus an inventory of
// every L() pair in the source so the gap between reviewed and unreviewed copy stays visible.
const args = process.argv.slice(2)
const option = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback
}
const outDir = resolve(option('--out', '.tucano-local/strings'))
const bom = args.includes('--bom') ? '\ufeff' : ''

const git = (...argv) => execFileSync('git', argv, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
const files = git('ls-files', 'src').split('\n').filter(file => /\.[cm]?[jt]sx?$/.test(file))
const rows = files.flatMap(file => collectCopy(readFileSync(file, 'utf8'), file))

const registry = JSON.parse(readFileSync('scripts/data/english-copy-overrides.json', 'utf8'))
const entries = registry.entries

const field = value => {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text
}
const line = values => values.map(field).join(',')

const matches = entry => rows.filter(row => row.kind === 'localized' && row.source === entry.source && entry.files.includes(row.file) && (!entry.contexts || entry.contexts.includes(row.context)))
const byKey = new Map()
for (const entry of entries) for (const row of matches(entry)) byKey.set(row.file + '\0' + row.source + '\0' + row.context, entry)

const processed = [line(['portuguese', 'english', 'files', 'contexts', 'previous_variants', 'expression_literals', 'occurrences', 'in_source', 'status', 'review_records'])]
const counts = { live: 0, drifted: 0, absent: 0 }
for (const entry of entries) {
  const live = matches(entry)
  const status = !live.length ? 'absent' : live.every(row => row.english === entry.approved) ? 'live' : 'drifted'
  counts[status]++
  processed.push(line([
    entry.source,
    entry.approved,
    entry.files.join('; '),
    (entry.contexts || []).join('; '),
    (entry.previous || []).join(' | '),
    entry.englishExpressionLiterals ? 'yes' : '',
    live.length,
    live.map(row => `${row.file}:${row.line}`).join('; '),
    status,
    (entry.reviews || []).join('; ')
  ]))
}

const inventory = [line(['file', 'line', 'context', 'syntax', 'characters', 'portuguese', 'english', 'registry_approved', 'status'])]
let covered = 0
for (const row of rows) {
  if (row.kind !== 'localized') continue
  const entry = byKey.get(row.file + '\0' + row.source + '\0' + row.context)
  const approved = entry ? entry.approved : ''
  const status = !entry ? 'unreviewed' : entry.approved === row.english ? 'approved' : 'drifted'
  if (status === 'approved') covered++
  inventory.push(line([row.file, row.line, row.context, row.syntax, row.english.length, row.source, row.english, approved, status]))
}

mkdirSync(outDir, { recursive: true })
const processedPath = resolve(outDir, 'strings-processed.csv')
const inventoryPath = resolve(outDir, 'strings-inventory.csv')
writeFileSync(processedPath, bom + processed.join('\n') + '\n')
writeFileSync(inventoryPath, bom + inventory.join('\n') + '\n')

const localized = inventory.length - 1
console.log(JSON.stringify({
  entries: entries.length,
  approvedLive: counts.live,
  drifted: counts.drifted,
  absent: counts.absent,
  localizedStrings: localized,
  approvedStrings: covered,
  unreviewedStrings: localized - covered,
  processedPath,
  inventoryPath
}, null, 2))
