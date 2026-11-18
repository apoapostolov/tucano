// Refresh the open-feature queue without mutating GitHub or public feature branches.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const index = args.indexOf(name)
  if (index < 0) return fallback
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${name} needs a path`)
  return args[index + 1]
}
const input = resolve(option('--inventory', '.tucano-local/audit/inventory.json'))
const output = resolve(option('--output', 'docs/open-pr-audit.md'))
const snapshot = JSON.parse(readFileSync(input, 'utf8'))
if (snapshot.upstream !== 'eduwxyz/tucano' || !['apoapostolov', 'all'].includes(snapshot.author) || !Array.isArray(snapshot.prs)) throw new Error('Unexpected inventory owner or format')
const completionSource = resolve(option('--completion-source', output))
const old = existsSync(completionSource) ? readFileSync(completionSource, 'utf8') : ''
const states = option('--states', 'OPEN') === 'all' ? ['OPEN', 'MERGED', 'CLOSED'] : option('--states', 'OPEN').split(',')
if (states.some(state => !['OPEN', 'MERGED', 'CLOSED'].includes(state))) throw new Error('Invalid state selection')
const excludeAuthor = option('--exclude-author', null)
const completed = new Map([...old.matchAll(/^- \[x\] #([0-9]+) .*?<!-- head:([a-f0-9]{40})(?: base:([a-f0-9]{40}|unknown))? -->/gm)].map(match => [Number(match[1]), { head: match[2], base: match[3] }]))
const isComplete = pr => completed.get(pr.number)?.head === pr.head && /^[a-f0-9]{40}$/.test(pr.baseCommit ?? '') && completed.get(pr.number)?.base === pr.baseCommit

const groups = [
  ['Privacy, permissions and data integrity', /privacy|permission|retention|clear|delete|backup|history|connector|approval|wiki|memory/i],
  ['Execution, cancellation and reliability', /run|reply|replies|routing|routed|team.up|delegat|harness|pause|steer|queue|restart|timeout|wait|CI|opencode/i],
  ['Features, usability and accessibility', /./]
]
const open = snapshot.prs.filter(pr => states.includes(pr.state) && (!excludeAuthor || (pr.author ?? snapshot.author) !== excludeAuthor))
const buckets = groups.map(([name]) => ({ name, prs: [] }))
for (const pr of open) {
  if (!/^[a-f0-9]{40}$/.test(pr.head) || !Number.isInteger(pr.number)) throw new Error('Invalid PR identity')
  const group = Math.max(0, groups.findIndex(([, pattern]) => pattern.test(pr.title)))
  buckets[group].prs.push(pr)
}
const checked = open.filter(pr => isComplete(pr)).length
const lines = [
  option('--title', '# Open PR audit queue'), '',
  `Inventory captured ${snapshot.capturedAt}. Full exact-head audits: **${checked}/${open.length}** (${states.join(', ')}).`, '',
  ...(completionSource !== output ? [`Completion is read from ${option('--completion-source', '')}; edit that canonical queue rather than this generated view.`, ''] : []),
  ...(excludeAuthor === 'apoapostolov' ? ['This is an intake/approval queue. Independent reviews or changes require explicit user approval recorded in docs/audit-approvals.md.', ''] : []),
  'Check a box only after the complete feature audit in docs/audit-plan.md passes. Targeted repairs,',
  'integration and green CI alone do not qualify. Refreshing this file preserves checked boxes only',
  'at the same head and base; either revision reopens the review. Keep findings and evidence in the private',
  'reviews.json record, keyed to the exact head/base. A stale targeted review remains useful history.', '',
  'Groups are initial title-based triage, not an assessed severity. Within a group, lower PR numbers',
  'come first as an approximation of submission order. Age is time since PR creation, including time after closure; the update date includes discussion activity',
  'and does not establish the age of the source commit. Reprioritize concrete defects in the main plan.', '',
  'Do not routinely update these public branches to current main. Audit their existing code and its',
  'integrated behavior; make focused repairs when evidence warrants them.', ''
]
for (const bucket of buckets) {
  lines.push(`## ${bucket.name}`, '')
  for (const pr of bucket.prs.sort((a, b) => a.number - b.number)) {
    const done = isComplete(pr)
    lines.push(`- [${done ? 'x' : ' '}] #${pr.number} [${pr.title.replaceAll('\n', ' ')}](${pr.url}) <!-- head:${pr.head} base:${pr.baseCommit ?? 'unknown'} -->`,
      `  Head \`${pr.head.slice(0, 12)}\`; ${pr.state}; author ${pr.author ?? snapshot.author}; age ${pr.createdAt ? Math.floor((Date.parse(snapshot.capturedAt) - Date.parse(pr.createdAt)) / 86_400_000) + ' days' : 'age unavailable'}; updated ${pr.updatedAt}; integration ancestry: ${pr.inNext === true ? 'present' : 'inspect equivalence'}; review: ${pr.review?.status ?? 'not reviewed'}${pr.review?.stale ? ' (stale)' : ''}.`)
  }
  lines.push('')
}
writeFileSync(output, lines.join('\n'))
console.log(JSON.stringify({ output, snapshot: snapshot.capturedAt, selected: open.length, open: open.filter(pr => pr.state === 'OPEN').length, complete: checked }))
