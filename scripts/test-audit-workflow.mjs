import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { cachePRPatch } from './lib/audit-patch-cache.mjs'

const temp = () => mkdtempSync(join(tmpdir(), 'tucano-audit-test-'))
const sha = letter => letter.repeat(40)
const invoke = (script, args) => JSON.parse(execFileSync(process.execPath, [script, ...args], { encoding: 'utf8' }))
const fixture = () => ({ upstream: 'eduwxyz/tucano', author: 'all', capturedAt: '2026-11-15T00:00:00Z', prs: [
  { number: 1, author: 'apoapostolov', state: 'OPEN', title: 'Pause a reply', head: sha('a'), baseCommit: sha('b'), url: 'https://github.com/eduwxyz/tucano/pull/1', createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-10T00:00:00Z' },
  { number: 2, author: 'contributor', state: 'MERGED', title: 'Database recovery', head: sha('c'), baseCommit: sha('b'), url: 'https://github.com/eduwxyz/tucano/pull/2' }
] })

test('canonical audits survive an unchanged identity and reopen on head or base changes', () => {
  const dir = temp(), input = join(dir, 'inventory.json'), output = join(dir, 'canonical.md')
  const data = fixture()
  writeFileSync(input, JSON.stringify(data))
  const command = ['--inventory', input, '--states', 'all', '--output', output]
  assert.equal(invoke('scripts/audit-backlog.mjs', command).selected, 2)
  writeFileSync(output, readFileSync(output, 'utf8').replaceAll('- [ ]', '- [x]'))
  assert.equal(invoke('scripts/audit-backlog.mjs', command).complete, 2)
  data.prs[0].head = sha('d')
  data.prs[1].baseCommit = sha('e')
  writeFileSync(input, JSON.stringify(data))
  assert.equal(invoke('scripts/audit-backlog.mjs', command).complete, 0)
})

test('open views inherit canonical completion and contributor views exclude Apo', () => {
  const dir = temp(), input = join(dir, 'inventory.json'), canonical = join(dir, 'canonical.md'), view = join(dir, 'view.md')
  writeFileSync(input, JSON.stringify(fixture()))
  invoke('scripts/audit-backlog.mjs', ['--inventory', input, '--states', 'all', '--output', canonical])
  writeFileSync(canonical, readFileSync(canonical, 'utf8').replaceAll('- [ ]', '- [x]'))
  const open = invoke('scripts/audit-backlog.mjs', ['--inventory', input, '--completion-source', canonical, '--output', view])
  assert.equal(open.selected, 1)
  assert.equal(open.complete, 1)
  const other = invoke('scripts/audit-backlog.mjs', ['--inventory', input, '--states', 'all', '--exclude-author', 'apoapostolov', '--output', view])
  assert.equal(other.selected, 1)
  assert.ok(readFileSync(view, 'utf8').includes('#2 ['))
  assert.ok(!readFileSync(view, 'utf8').includes('#1 ['))
})

test('head-only legacy completion cannot silently certify an unknown base', () => {
  const dir = temp(), input = join(dir, 'inventory.json'), output = join(dir, 'queue.md')
  writeFileSync(input, JSON.stringify(fixture()))
  writeFileSync(output, `- [x] #1 old <!-- head:${sha('a')} -->\n`)
  assert.equal(invoke('scripts/audit-backlog.mjs', ['--inventory', input, '--output', output]).complete, 0)
})

test('patch capture rejects a PR changing mid-request without saving a mislabeled diff', () => {
  const dir = temp(), pr = { number: 1, head: sha('a'), baseCommit: sha('b') }
  let reads = 0
  const run = (_command, args) => args.includes('diff') ? 'diff --git a/a b/a' : JSON.stringify({ headRefOid: ++reads === 1 ? pr.head : sha('c'), baseRefOid: pr.baseCommit })
  assert.throws(() => cachePRPatch(pr, dir, run), /changed during diff capture/)
  assert.deepEqual(readdirSync(dir), [])
})

test('verified patches are reused; tampering requires recapture', () => {
  const dir = temp(), pr = { number: 1, head: sha('a'), baseCommit: sha('b') }
  const run = (_command, args) => args.includes('diff') ? 'diff --git a/a b/a' : JSON.stringify({ headRefOid: pr.head, baseRefOid: pr.baseCommit })
  const first = cachePRPatch(pr, dir, run)
  assert.equal(first.cached, false)
  assert.equal(cachePRPatch(pr, dir, () => { throw Error('Unchanged cache should not call GitHub') }).cached, true)
  writeFileSync(first.path, 'changed bytes')
  assert.equal(cachePRPatch(pr, dir, run).cached, false)
})

test('metadata-only intake preserves owners/base identities and discloses missing file evidence', () => {
  const dir = temp(), input = join(dir, 'prs.json'), report = join(dir, 'inventory.md')
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  writeFileSync(input, JSON.stringify([{ number: 2, title: 'Recovery', author: { login: 'contributor' }, state: 'MERGED', headRefOid: head, baseRefOid: head, baseRefName: 'main', url: 'https://github.com/eduwxyz/tucano/pull/2', changedFiles: 3, createdAt: '2026-11-01T00:00:00Z' }]))
  invoke('scripts/audit-prs.mjs', ['--author', 'all', '--metadata-only', '--input', input, '--next', 'HEAD', '--output', dir, '--report', report])
  const snapshot = JSON.parse(readFileSync(join(dir, 'inventory.json'), 'utf8'))
  assert.equal(snapshot.prs[0].author, 'contributor')
  assert.equal(snapshot.prs[0].baseCommit, head)
  assert.equal(snapshot.prs[0].fileListComplete, false)
  assert.ok(readFileSync(report, 'utf8').includes('not collected'))
})

test('release delivery boxes are tied to the actual tag target', () => {
  const dir = temp(), input = join(dir, 'releases.json'), refs = join(dir, 'refs.txt'), state = join(dir, 'state.json'), report = join(dir, 'versions.md')
  const main = execFileSync('git', ['rev-parse', 'upstream/main'], { encoding: 'utf8' }).trim()
  writeFileSync(state, JSON.stringify({ upstream: 'eduwxyz/tucano', deltaBaselineMain: main, releaseBaselineTag: 'v0.2.32', deliveries: [{ tag: 'v0.2.32', upstreamCommit: main, source: main, evidence: 'docs/example.md' }] }))
  writeFileSync(input, JSON.stringify([{ tagName: 'v0.2.32', publishedAt: '2026-11-15T00:00:00Z', isDraft: false, isPrerelease: false }]))
  writeFileSync(refs, `${main}\trefs/tags/v0.2.32\n`)
  const args = ['--state', state, '--input', input, '--tag-refs', refs, '--next', 'upstream/main', '--output', dir, '--report', report]
  assert.equal(invoke('scripts/audit-upstream.mjs', args).pendingVersions, 0)
  writeFileSync(refs, `${sha('f')}\trefs/tags/v0.2.32\n`)
  assert.equal(invoke('scripts/audit-upstream.mjs', args).pendingVersions, 1)
})
