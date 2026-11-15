import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

const digest = bytes => createHash('sha256').update(bytes).digest('hex')

// A cached PR diff must describe the head/base printed on its filename, not a later live PR.
export function cachePRPatch(pr, directory, run) {
  if (![pr.head, pr.baseCommit].every(sha => /^[a-f0-9]{40}$/.test(sha ?? ''))) throw new Error('Patch caching requires exact head and base commits')
  const path = join(directory, `${pr.number}-${pr.head}-${pr.baseCommit}.patch`)
  const metadata = path + '.json'
  if (existsSync(path) && existsSync(metadata)) {
    const saved = JSON.parse(readFileSync(metadata, 'utf8'))
    if (saved.head === pr.head && saved.baseCommit === pr.baseCommit && saved.sha256 === digest(readFileSync(path))) return { cached: true, path }
  }
  const identity = () => JSON.parse(run('gh', ['pr', 'view', String(pr.number), '--repo', 'eduwxyz/tucano', '--json', 'headRefOid,baseRefOid']))
  const same = current => current.headRefOid === pr.head && current.baseRefOid === pr.baseCommit
  if (!same(identity())) throw new Error(`PR #${pr.number} changed before diff capture; refresh intake`)
  const patch = run('gh', ['pr', 'diff', String(pr.number), '--repo', 'eduwxyz/tucano']) + '\n'
  if (!same(identity())) throw new Error(`PR #${pr.number} changed during diff capture; refresh intake`)
  writeFileSync(path, patch)
  writeFileSync(metadata, JSON.stringify({ number: pr.number, head: pr.head, baseCommit: pr.baseCommit, sha256: digest(patch), checkedAt: new Date().toISOString() }, null, 2) + '\n')
  return { cached: false, path }
}
