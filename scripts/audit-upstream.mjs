// Read-only release/main intake. Delivery and semantic-review decisions are explicit state.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

const args = process.argv.slice(2)
const option = (key, fallback) => {
  const at = args.indexOf(key)
  if (at < 0) return fallback
  if (!args[at + 1] || args[at + 1].startsWith('--')) throw new Error(`${key} needs a value`)
  return args[at + 1]
}
const run = (command, values) => execFileSync(command, values, { encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024 }).trim()
const git = (...values) => run('git', values)
const state = JSON.parse(readFileSync(option('--state', 'docs/audit-state.json'), 'utf8'))
if (state.upstream !== 'eduwxyz/tucano' || !/^[a-f0-9]{40}$/.test(state.deltaBaselineMain)) throw new Error('Unexpected audit baseline')
const remote = git('remote', 'get-url', 'upstream')
if (!['https://github.com/eduwxyz/tucano.git', 'git@github.com:eduwxyz/tucano.git'].includes(remote)) throw new Error('Unexpected upstream remote')
const main = git('rev-parse', 'upstream/main')
const integration = git('rev-parse', option('--next', 'origin/next'))
git('merge-base', '--is-ancestor', state.deltaBaselineMain, main)
const contains = (a, b) => {
  try { git('merge-base', '--is-ancestor', a, b); return true } catch { return false }
}
const input = option('--input', null)
const releases = input ? JSON.parse(readFileSync(input, 'utf8')) : JSON.parse(run('gh', ['release', 'list', '--repo', state.upstream, '--limit', '1000', '--json', 'tagName,name,publishedAt,isDraft,isPrerelease,isLatest']))
if (!Array.isArray(releases) || releases.length >= 1000) throw new Error('Release intake needs pagination or valid input')
const refsInput = option('--tag-refs', null)
const refs = new Map((refsInput ? readFileSync(refsInput, 'utf8') : git('ls-remote', 'upstream', 'refs/tags/*')).split('\n').filter(Boolean).map(line => {
  const [sha, ref] = line.split(/\s+/)
  return [ref, sha]
}))
const version = tag => /^v?(\d+)\.(\d+)\.(\d+)$/.exec(tag)?.slice(1).map(Number)
const baselineVersion = version(state.releaseBaselineTag ?? '')
if (!baselineVersion) throw new Error('A verified delivery must establish the release baseline')
const newerOrEqual = current => {
  for (let i = 0; i < 3; i++) if (current[i] !== baselineVersion[i]) return current[i] > baselineVersion[i]
  return true
}
const rows = releases.filter(release => !release.isDraft && (!version(release.tagName) || newerOrEqual(version(release.tagName)))).map(release => {
  const commit = refs.get(`refs/tags/${release.tagName}^{}`) ?? refs.get(`refs/tags/${release.tagName}`) ?? null
  const delivered = state.deliveries.find(item => item.tag === release.tagName && item.upstreamCommit === commit && contains(commit, integration))
  return { ...release, commit, delivered: !!delivered, evidence: delivered?.evidence ?? null }
}).sort((a, b) => String(a.publishedAt).localeCompare(String(b.publishedAt)))
const commits = git('log', '--first-parent', '--reverse', '--format=%H%x09%s', `${state.deltaBaselineMain}..${main}`).split('\n').filter(Boolean).map(line => {
  const [sha, ...subject] = line.split('\t')
  return { sha, subject: subject.join('\t'), reviewed: (state.reviewedMainCommits ?? []).includes(sha), integrated: contains(sha, integration) }
})
const snapshot = { capturedAt: new Date().toISOString(), main, integration, deltaBaselineMain: state.deltaBaselineMain, legacyBaselineAuditComplete: state.legacyBaselineAuditComplete === true, releases: rows, commits }
const output = resolve(option('--output', '.tucano-local/upstream-feed'))
mkdirSync(join(output, 'history'), { recursive: true })
const json = JSON.stringify(snapshot, null, 2) + '\n'
writeFileSync(join(output, 'snapshot.json'), json)
writeFileSync(join(output, 'history', snapshot.capturedAt.replaceAll(':', '-') + '.json'), json)
const clean = value => String(value).replaceAll('\n', ' ').replaceAll('|', '\\|')
const lines = ['# Upstream version and commit intake', '', `Captured ${snapshot.capturedAt}. Main: \`${main}\`; integration: \`${integration}\`.`, '',
  'Release boxes mean verified integration, installation and release evidence recorded in audit-state.json,',
  'not a complete audit of the release code. The baseline whole-tree audit remains separate.', '', '## Published versions from the delivery baseline', '',
  ...rows.map(row => `- [${row.delivered ? 'x' : ' '}] [${clean(row.tagName)}](https://github.com/eduwxyz/tucano/releases/tag/${encodeURIComponent(row.tagName)}) — ${row.isPrerelease ? 'prerelease; triage separately' : 'published'}; target \`${row.commit ?? 'unresolved'}\`${row.evidence ? `; [delivery evidence](${row.evidence.replace(/^docs\//, '')})` : '; intake/delivery pending'}.`), '',
  '## Main changes after the baseline', '',
  'These first-parent commits are the upstream integration events. Review the linked PR and its full',
  'commit range too. Checked means semantic delta review recorded in audit-state.json; ancestry alone',
  'does not check a box. Baseline code is covered by the full-stack work packages, not this delta list.', '',
  ...(commits.length ? commits.map(commit => `- [${commit.reviewed ? 'x' : ' '}] [${commit.sha.slice(0, 12)}](https://github.com/eduwxyz/tucano/commit/${commit.sha}) ${clean(commit.subject)}; integrated: ${commit.integrated ? 'yes' : 'no'}.`) : ['No post-baseline main changes in this snapshot. This does not certify the baseline.']), '']
writeFileSync(resolve(option('--report', 'docs/upstream-intake.md')), lines.join('\n'))
console.log(JSON.stringify({ output, main, versions: rows.length, pendingVersions: rows.filter(row => !row.delivered).length, unreviewedMainDeltas: commits.filter(commit => !commit.reviewed).length }))
