// The identity Windows shows for this app: its install folder, its taskbar button, its window and its
// shortcuts. Every one of them is a string, and an upstream merge that brings its own strings back makes
// a TucanoNext build replace the released Tucano. scripts/lib/identity.mjs is the one place that says
// what those strings must be; the build (self-build.mjs), the shared install lock (tn-install.py) and this
// test all read it, so no copy can drift from the others.
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
// @ts-expect-error The identity gate is JavaScript, executed directly by Node.
import { IDENTITY, identityProblems } from '../scripts/lib/identity.mjs'

const root = join(import.meta.dirname, '..')
const source = (file: string): string => readFileSync(join(root, file), 'utf8')

describe('app identity', () => {
  it('is TucanoNext in every string that decides where it installs and what it is called', () => {
    expect(identityProblems(root)).toEqual([])
    const pkg = JSON.parse(source('package.json')) as { name: string; build: { productName: string; appId: string; nsis: { shortcutName: string } } }
    expect(pkg.name).toBe(IDENTITY.package)
    expect(pkg.build.productName).toBe(IDENTITY.product)
    expect(pkg.build.appId).toBe(IDENTITY.appId)
    expect(pkg.build.nsis.shortcutName).toBe(IDENTITY.shortcut)
  })

  it('names the app and its window after the fork, not the released app', () => {
    const main = source('src/main/index.ts')
    expect(/const NAME = '([^']+)'/.exec(main)?.[1]).toBe(IDENTITY.product)
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

  it('catches a checkout that an upstream merge renamed back to the released app', () => {
    // A tree whose manifest is upstream's: package, product, app id and shortcut all say Tucano, which is
    // exactly what puts the fork's build into Programs\tucano, over the released app and its shortcut.
    const kept = mkdtempSync(join(tmpdir(), 'tucano-identity-'))
    writeFileSync(join(kept, 'package.json'), JSON.stringify({
      name: 'tucano',
      build: { productName: 'Tucano', appId: 'dev.tucano.app', nsis: { shortcutName: 'Tucano', artifactName: 'tucano-setup-${version}.${ext}' }, publish: [{ provider: 'github' }] }
    }))
    mkdirSync(join(kept, 'src', 'shared'), { recursive: true })
    mkdirSync(join(kept, 'src', 'main'), { recursive: true })
    writeFileSync(join(kept, 'src', 'shared', 'app-identity.ts'), "export const APP_ID = 'dev.tucano.app'\n")
    writeFileSync(join(kept, 'src', 'main', 'index.ts'), "const NAME = 'Tucano'\napp.setName(NAME)\n")
    const problems = (identityProblems(kept) as string[]).join('\n')
    expect(problems).toMatch(/package\.json › name/)
    expect(problems).toMatch(/productName/)
    expect(problems).toMatch(/appId/)
    expect(problems).toMatch(/shortcutName/)
    expect(problems).toMatch(/publish/)
  })
})
