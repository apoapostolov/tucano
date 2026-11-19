// Keeps the feature map in AGENTS.md honest: every row is an issue/PR pair on the upstream project, and
// the pair is what a reviewer reads. This script reads the table, asks GitHub what became of each number,
// and reports (or with --write, drops) the rows that no longer need to be there.
//
//   node scripts/feature-map-sync.mjs            # the audit, nothing written
//   node scripts/feature-map-sync.mjs --write    # drop the rows whose pair is closed upstream
//   node scripts/feature-map-sync.mjs --check    # exit 1 when a row is stale, for a cron job
//   node scripts/feature-map-sync.mjs --json     # machine-readable
//
// A row goes when its PR is merged upstream and its issue, if it has one, is closed: the feature shipped
// and nobody needs to be pointed at it again. A row stays when anything in it is still open, and the
// audit lists what it cannot decide (a PR closed without a merge, a number that no longer exists, an open
// PR of ours with no row) rather than acting on it.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const repo = process.env['TUCANO_UPSTREAM'] ?? 'eduwxyz/tucano'
const root = resolve(import.meta.dirname, '..')
const mapFile = resolve(root, 'AGENTS.md')
const args = process.argv.slice(2)
const write = args.includes('--write')
const check = args.includes('--check')
const json = args.includes('--json')
// The map tracks this person's own features, never another contributor's PR: those are theirs to change.
const owner = process.env['TUCANO_OWNER'] ?? 'apoapostolov'
const everyAuthor = args.includes('--all-authors')

const gh = (...argv) => JSON.parse(execFileSync('gh', ['api', ...argv], { encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 }))

// One request per resource, paged: the numbers in the map go back years.
function all(path) {
  const out = []
  for (let page = 1; page <= 20; page++) {
    const chunk = gh(`repos/${repo}/${path}?state=all&per_page=100&page=${page}`, '--jq', 'map({number, state, title, author: .user.login, merged_at: (.merged_at // null)})')
    out.push(...chunk)
    if (chunk.length < 100) break
  }
  return out
}

const issues = new Map(all('issues').map((i) => [i.number, i]))
const pulls = new Map(all('pulls').map((p) => [p.number, p]))

const text = readFileSync(mapFile, 'utf8')
const lines = text.split('\n')
const head = lines.findIndex((line) => line.trim() === '| Feature | Issue | PR |')
if (head < 0) throw new Error('AGENTS.md has no feature map (| Feature | Issue | PR |)')
let end = head + 2
while (end < lines.length && lines[end].startsWith('|')) end++

const numbers = (cell) => (cell ?? '').match(/\d+/g)?.map(Number) ?? []
const rows = lines.slice(head + 2, end).map((line, i) => {
  const cells = line.split('|').slice(1, -1).map((c) => c.trim())
  return { line, at: head + 2 + i, feature: cells[0] ?? '', issues: numbers(cells[1]), prs: numbers(cells[2]) }
})

const state = (n, table) => table.get(n)?.merged_at ? 'merged' : (table.get(n)?.state ?? 'missing')
const report = { drop: [], keep: [], attention: [], unlisted: [] }

// An open PR of ours with no row is the other half of the drift: work in flight that the map never heard of.
const rowPrs = new Set(rows.flatMap((r) => r.prs))
for (const [n, p] of pulls) {
  if (p.state !== 'open' || rowPrs.has(n)) continue
  if (!everyAuthor && p.author !== owner) continue
  report.unlisted.push({ pr: n, title: p.title })
}

for (const row of rows) {
  const prStates = row.prs.map((n) => state(n, pulls))
  const issueStates = row.issues.map((n) => state(n, issues))
  const merged = row.prs.length > 0 && prStates.every((s) => s === 'merged')
  const issuesClosed = issueStates.every((s) => s === 'closed' || s === 'merged')
  if (merged && issuesClosed) {
    report.drop.push({ ...row, prStates, issueStates })
    continue
  }
  const problems = []
  if (prStates.includes('missing')) problems.push(`PR ${row.prs.filter((n) => state(n, pulls) === 'missing').join(', ')} does not exist`)
  if (issueStates.includes('missing')) problems.push(`issue ${row.issues.filter((n) => state(n, issues) === 'missing').join(', ')} does not exist`)
  if (row.prs.some((n) => state(n, pulls) === 'closed')) problems.push(`PR closed without a merge: ${row.prs.filter((n) => state(n, pulls) === 'closed').join(', ')}`)
  if (row.prs.length === 0 && row.issues.length === 0) problems.push('neither an issue nor a PR')
  if (problems.length) report.attention.push({ ...row, problems })
  else report.keep.push({ ...row, prStates, issueStates })
}

if (json) {
  console.log(JSON.stringify({ repo, rows: rows.length, ...report }, null, 1))
} else {
  console.log(`feature map: ${rows.length} rows, ${report.keep.length} live, ${report.drop.length} shipped, ${report.attention.length} to look at, ${report.unlisted.length} open PRs with no row`)
  for (const r of report.drop) console.log(`  shipped, can go: ${r.feature} (${r.prs.join('/')} merged)`)
  for (const r of report.attention) console.log(`  look at: ${r.feature} — ${r.problems.join('; ')}`)
  for (const u of report.unlisted) console.log(`  no row for #${u.pr}: ${u.title}`)
}

if (write && report.drop.length) {
  const gone = new Set(report.drop.map((r) => r.at))
  writeFileSync(mapFile, lines.filter((_, i) => !gone.has(i)).join('\n'), 'utf8')
  console.log(`dropped ${report.drop.length} row(s) from AGENTS.md`)
}
const strict = args.includes('--strict')
if (check && (report.drop.length || report.attention.length || (strict && report.unlisted.length))) process.exitCode = 1
