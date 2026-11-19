import { spawnSync } from 'node:child_process'
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, rmdirSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { expect, it } from 'vitest'

it('refuses packaging a shared dependency junction before invoking build tools', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'tucano-build-preflight-'))
  const linked = join(fixture, 'node_modules')
  mkdirSync(join(fixture, 'scripts'))
  for (const file of ['self-build.mjs', 'self-build-launch.mjs']) copyFileSync(new URL(`../scripts/${file}`, import.meta.url), join(fixture, 'scripts', file))
  writeFileSync(join(fixture, 'package.json'), readFileSync(new URL('../package.json', import.meta.url)))
  symlinkSync(resolve('node_modules'), linked, process.platform === 'win32' ? 'junction' : 'dir')
  try {
    const result = spawnSync(process.execPath, [join(fixture, 'scripts/self-build.mjs'), 'build', '--json'], { encoding: 'utf8', windowsHide: true })
    expect(result.status).toBe(1)
    expect(JSON.parse(result.stdout)).toMatchObject({ stage: 'preflight', ok: false, error: expect.stringContaining('local node_modules') })
  } finally {
    // Unlink the junction before removing the fixture; never recurse into the shared install.
    if (lstatSync(linked).isSymbolicLink()) {
      if (process.platform === 'win32') rmdirSync(linked)
      else unlinkSync(linked)
    }
    if (resolve(fixture).startsWith(resolve(tmpdir())) && basename(fixture).startsWith('tucano-build-preflight-')) rmSync(fixture, { recursive: true })
  }
})
