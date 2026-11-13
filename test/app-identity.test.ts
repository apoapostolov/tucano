// One identity, two halves: the string the main process hands Windows (APP_ID, which registers the
// taskbar button and the notification sender) and the appId electron-builder stamps into the installer
// and its shortcut. Windows draws the toucan for a window only when the two are the same string; a
// mismatch leaves the window grouped on its own and drawn with the framework's icon, and drops toasts.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { APP_ID } from '../src/shared/app-identity'

const root = join(import.meta.dirname, '..')
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  name: string
  build: { appId: string; win: { icon: string } }
  scripts: Record<string, string>
}

describe('the app identity Windows is given', () => {
  it('is the one the installer registers for the shortcut', () => {
    expect(APP_ID).toBe(manifest.build.appId)
  })

  it('is set from that constant, so the two cannot drift apart again', () => {
    const main = readFileSync(join(root, 'src', 'main', 'index.ts'), 'utf8')
    expect(main).toContain('app.setAppUserModelId(APP_ID)')
    // No literal left behind: a second copy of the id is how the two drifted apart.
    expect(main).not.toContain("setAppUserModelId('")
  })

  it('leaves Windows a window icon to draw from, and a file to read it from', () => {
    const main = readFileSync(join(root, 'src', 'main', 'index.ts'), 'utf8')
    // The main window hands BrowserWindow an icon everywhere but a Mac, where the bundle carries it.
    expect(main).toContain("process.platform !== 'darwin' ? { icon: resource('icon.png') }")
    // electron-builder embeds the same picture in the exe, from the file it is told about.
    const icon = join(root, manifest.build.win.icon)
    const png = readFileSync(icon)
    // A PNG big enough for the biggest Windows icon, which is what the packager converts it from.
    const width = png.readUInt32BE(16)
    const height = png.readUInt32BE(20)
    expect([width, height]).toEqual([1024, 1024])
  })
})
