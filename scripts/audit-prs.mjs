// Read-only GitHub inventory for the fork. Reports stay local unless --output is supplied.
import { cachePRPatch } from './lib/audit-patch-cache.mjs'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'

const upstream = 'eduwxyz/tucano'
const args = process.argv.slice(2)
const value = (key, fallback) => {
  const i = args.indexOf(key)
  if (i < 0) return fallback
  if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`${key} needs a value`)
  return args[i + 1]
}
const author = value('--author', 'apoapostolov')
if (!['apoapostolov', 'all'].includes(author)) throw new Error('Use apoapostolov or all for maintained inventories')
const metadataOnly = args.includes('--metadata-only')
const output = resolve(value('--output', author === 'all' ? '.tucano-local/upstream-audit' : '.tucano-local/audit'))
const nextRef = value('--next', 'next')
const report = value('--report', null)
const run = (command, argv) => execFileSync(command, argv, { encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024 }).trim()
const git = (...argv) => run('git', argv)
let graph
const ancestry = new Map()
const ancestor = (a, b) => {
  graph ??= new Map(git('rev-list', '--all', '--parents').split('\n').map((line) => {
    const [sha, ...parents] = line.split(' ')
    return [sha, parents]
  }))
  if (!graph.has(a) || !graph.has(b)) return null
  if (!ancestry.has(b)) {
    const seen = new Set()
    const todo = [b]
    while (todo.length) {
      const sha = todo.pop()
      if (seen.has(sha)) continue
      seen.add(sha)
      todo.push(...(graph.get(sha) ?? []))
    }
    ancestry.set(b, seen)
  }
  return ancestry.get(b).has(a)
}
const fields = 'number,title,state,isDraft,url,author,headRefName,headRefOid,baseRefName,baseRefOid,createdAt,updatedAt,mergedAt,closedAt,additions,deletions,changedFiles' + (metadataOnly ? '' : ',mergeable,mergeStateStatus,body,statusCheckRollup')
const input = value('--input', null)
const prs = input ? JSON.parse(readFileSync(input, 'utf8')) : JSON.parse(run('gh', ['pr', 'list', '--repo', upstream, ...(author === 'all' ? [] : ['--author', author]), '--state', 'all', '--limit', '1000', '--json', fields]))
// Large nested file lists can exhaust GitHub's list query. File paths are immutable at a head.
let previous = []
try { previous = JSON.parse(readFileSync(join(output, 'inventory.json'), 'utf8')).prs ?? [] } catch (error) { if (error.code !== 'ENOENT') throw error }
for (const pr of prs) {
  if (metadataOnly) { pr.files = []; continue }
  if (Array.isArray(pr.files)) continue
  const saved = previous.find((p) => p.number === pr.number && p.head === pr.headRefOid && p.baseCommit === pr.baseRefOid && p.fileListComplete)
  pr.files = saved ? saved.files.map((path) => ({ path })) : JSON.parse(run('gh', ['pr', 'view', String(pr.number), '--repo', upstream, '--json', 'files'])).files
}
if (!Array.isArray(prs) || prs.some((p) => !p.url?.startsWith(`https://github.com/${upstream}/pull/`) || !/^[a-f0-9]{40}$/.test(p.headRefOid))) throw new Error('Unexpected PR inventory')
if (prs.length >= 1000) throw new Error('Inventory reached the limit; add pagination before accepting it')
if (args.includes('--fetch')) {
  git('fetch', `https://github.com/${upstream}.git`, '+refs/heads/main:refs/remotes/upstream/main', ...prs.filter((p) => p.state === 'OPEN').map((p) => `+refs/pull/${p.number}/head:refs/remotes/audit/pr-${p.number}`))
}
const next = git('rev-parse', nextRef)
const main = git('rev-parse', 'upstream/main')
const previousPath = join(output, 'reviews.json')
let reviews = {}
try { reviews = JSON.parse(readFileSync(previousPath, 'utf8')) } catch (e) { if (e.code !== 'ENOENT') throw e }
const records = prs.sort((a, b) => a.number - b.number).map((p) => {
  const files = p.files.map((f) => f.path)
  const renderer = files.some((f) => /^src\/renderer\//.test(f))
  const review = reviews[p.number]
  return {
    number: p.number, author: p.author?.login ?? (author === 'all' ? 'unknown' : author), title: p.title, state: p.state, draft: p.isDraft, url: p.url,
    branch: p.headRefName, head: p.headRefOid, base: p.baseRefName, baseCommit: p.baseRefOid ?? null, createdAt: p.createdAt, updatedAt: p.updatedAt,
    mergeable: p.mergeable, mergeStateStatus: p.mergeStateStatus,
    inNext: ancestor(p.headRefOid, next), inUpstream: ancestor(p.headRefOid, main),
    additions: p.additions, deletions: p.deletions, changedFiles: p.changedFiles, files,
    fileListComplete: !metadataOnly && files.length === p.changedFiles,
    testsChanged: files.filter((f) => /^test\//.test(f)), rendererChanged: renderer,
    screenshotLinksInDescription: [...(p.body ?? '').matchAll(/https:\/\/[^\s<>"')|]+\.(?:png|jpe?g|webp|gif)(?:\?[^\s<>"')|]*)?/gi)].map((m) => m[0]),
    checks: (p.statusCheckRollup ?? []).map((c) => ({ name: c.name ?? c.context, status: c.status ?? c.state, conclusion: c.conclusion, url: c.detailsUrl ?? c.targetUrl })),
    review: review ? { ...review, stale: review.head !== p.headRefOid || (!!review.baseCommit && review.baseCommit !== p.baseRefOid) } : { status: 'not reviewed', stale: false }
  }
})
const open = records.filter((p) => p.state === 'OPEN')
const collisions = {}
for (const p of open) for (const file of p.files) (collisions[file] ??= []).push(p.number)
const overlaps = Object.entries(collisions).filter(([, numbers]) => numbers.length > 1).sort((a, b) => b[1].length - a[1].length)
const dependencies = []
for (const p of open) for (const q of open) if (p.number !== q.number && p.head !== q.head && ancestor(p.head, q.head) === true) dependencies.push({ before: p.number, after: q.number })
const snapshot = { capturedAt: new Date().toISOString(), upstream, author, metadataOnly, nextRef, next, main, upstreamInNext: ancestor(main, next), counts: { total: records.length, open: open.length, merged: records.filter((p) => p.state === 'MERGED').length, closed: records.filter((p) => p.state === 'CLOSED').length }, dependencies, overlaps: Object.fromEntries(overlaps), prs: records }
const cell = (s) => String(s).replaceAll('|', '\\|').replaceAll('\n', ' ')
const inclusion = (v) => v === null ? 'object unavailable' : v ? 'yes' : 'no: inspect patch equivalence'
const lines = [
  author === 'all' ? '# Upstream contributor PR inventory' : '# Tucano PR inventory', '',
  `Captured ${snapshot.capturedAt}. Upstream: [${upstream}](https://github.com/${upstream}); fork: [apoapostolov/tucano](https://github.com/apoapostolov/tucano).`, '',
  `${records.length} total: ${snapshot.counts.open} open, ${snapshot.counts.merged} merged, ${snapshot.counts.closed} closed.`, '',
  `Upstream main: \`${main}\`. Daily driver ${nextRef}: \`${next}\`. Upstream main is contained: ${inclusion(snapshot.upstreamInNext)}.`, '',
  'Containment compares commit ancestry. A rebased or independently integrated feature may be present without its current PR head. Screenshot links and changed tests are inventory signals; they do not establish quality or passing tests. GitHub mergeability compares each PR to its base, not to the other PRs.', '',
  ...(metadataOnly ? ['Metadata-only intake: descriptions, checks and file lists were not collected; review them for each selected PR. Zero collected test/screenshot signals must not be read as absence.', ''] : []),
  '| PR | Author | State | Feature | Head in next | Tests changed | Screenshot links | Review |',
  '| --- | --- | --- | --- | --- | ---: | ---: | --- |',
  ...records.map((p) => `| [#${p.number}](${p.url}) | ${cell(p.author)} | ${p.state} | ${cell(p.title)} | ${inclusion(p.inNext)} | ${metadataOnly ? 'not collected' : p.testsChanged.length} | ${metadataOnly ? 'not collected' : p.screenshotLinksInDescription.length} | ${cell(p.review.status)}${p.review.stale ? ' (stale)' : ''} |`), '',
  '## Commit dependencies', '',
  ...dependencies.map((d) => `- #${d.before} → #${d.after}`), '',
  '## Shared files among open PRs', '',
  '| File | PRs |', '| --- | --- |',
  ...overlaps.map(([file, numbers]) => `| ${file} | ${numbers.map((n) => `#${n}`).join(', ')} |`), ''
]
mkdirSync(output, { recursive: true })
// Preserve dated intake evidence before replacing the current snapshot. Cached patches already use head SHAs.
const history = join(output, 'history')
mkdirSync(history, { recursive: true })
const stamp = snapshot.capturedAt.replaceAll(':', '-')
writeFileSync(join(history, `${stamp}.json`), JSON.stringify({ ...snapshot, reviews }, null, 2) + '\n')
writeFileSync(join(output, 'inventory.json'), JSON.stringify(snapshot, null, 2) + '\n')
writeFileSync(join(output, 'inventory.md'), lines.join('\n'))
if (report) {
  mkdirSync(dirname(resolve(report)), { recursive: true })
  writeFileSync(resolve(report), lines.join('\n'))
}
if (args.includes('--patches')) {
  const dir = join(output, 'patches')
  mkdirSync(dir, { recursive: true })
  for (const p of open) cachePRPatch(p, dir, run)
}
console.log(JSON.stringify({ output, counts: snapshot.counts, upstreamInNext: snapshot.upstreamInNext, headsNotInNext: open.filter((p) => p.inNext !== true).map((p) => p.number) }, null, 2))
