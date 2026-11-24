// The identity Windows attaches to the app has two halves that have to stay one string: the id the
// process registers (setAppUserModelId) and the id the shortcut carries (package.json › build ›
// appId, registered by the installer and written onto the .lnk on this machine).
//
// When they drift, the window groups on its own taskbar button and Windows draws the framework's
// icon instead of the toucan. That is exactly what happened on 2026-11-24: the build declared
// dev.tucano.next while src/main/index.ts still registered upstream's dev.tucano.app.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { APP_ID } from '../src/shared/app-identity'

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

describe('app identity', () => {
  it('is the id the build ships', () => {
    const pkg = JSON.parse(read('package.json')) as { build?: { appId?: string } }
    expect(pkg.build?.appId).toBe(APP_ID)
  })

  it('is the id the main process registers, with no hardcoded id beside it', () => {
    const main = read('src/main/index.ts')
    expect(main).toMatch(/app\.setAppUserModelId\(APP_ID\)/)
    const hardcoded = [...main.matchAll(/setAppUserModelId\(['"]([^'"]+)['"]\)/g)].map((m) => m[1])
    expect(hardcoded).toEqual([])
  })

  it('is the id the identity script prints', () => {
    const script = read('scripts/lib/identity.mjs')
    expect(script).toContain(APP_ID)
  })
})
