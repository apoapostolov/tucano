// The identity Windows shows for this app: its taskbar button, its window and its shortcuts.
// The app id the main process sets must be the one the installer registers (package.json › build ›
// appId), and the window must carry the app's own name rather than upstream's 'Tucano', or the fork
// reads as the released app while running beside it.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { APP_ID } from '../src/shared/app-identity'

const root = join(import.meta.dirname, '..')
const source = (file: string): string => readFileSync(join(root, file), 'utf8')
const pkg = JSON.parse(source('package.json')) as { name: string; build: { productName: string; appId: string } }

describe('app identity', () => {
  it('sets the app id the installer registers for the shortcuts', () => {
    expect(APP_ID).toBe(pkg.build.appId)
  })

  it('names the app and its window after the fork, not the released app', () => {
    const main = source('src/main/index.ts')
    const name = /const NAME = '([^']+)'/.exec(main)?.[1]
    expect(name).toBe(pkg.build.productName)
    expect(main).toContain('app.setName(NAME)')
    // The renderer's page is upstream's, titled 'Tucano': its title never renames the app's window.
    expect(main).toContain("win.webContents.on('page-title-updated'")
    expect(main).toContain('win.setTitle(NAME)')
  })

  it('titles the window from the app name in every state, including a server on screen', () => {
    const servers = source('src/main/servers.ts')
    expect(servers).toContain('win.setTitle(app.getName())')
    expect(servers).toContain('win.setTitle(`${app.getName()} · ${serverName(s.origin)}`)')
    expect(servers).not.toMatch(/setTitle\(['`]Tucano/)
  })
})
