// Updates (the installed app only): Tucano looks for a newer release on GitHub,
// downloads it in the background and says so; the person restarts when it suits
// them, or it goes in the next time the app quits. The release carries each system's
// feed: latest-mac.yml next to the .zip (scripts/release.sh), latest-linux*.yml and
// latest.yml, for Windows, from the workflows that build those installers.
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'
import { offline } from '../shared/errors'
import { L } from '../shared/lang'
import type { UpdateState } from '../shared/types'
import { updaterModule } from './updater-module'

const FIRST_CHECK_MS = 20_000 // after opening, once the app has settled
const EVERY_MS = 4 * 3_600_000

export class Updates {
  private state: UpdateState
  private timer: NodeJS.Timeout | null = null
  private downloaded: string | null = null
  // Made when first used: making it reads the app's version, and an unpacked build's may not be one
  // it accepts, which would stop the app from opening. With updates off it's never used.
  private get updater() {
    return updaterModule!.autoUpdater
  }

  // A build with a feed of its own looks for a newer version; one installed beside the released app
  // carries no app-update.yml of its own, and must not go looking in that one's feed (it would
  // replace this build with the released app). Without the resources folder to look in (tests), the
  // feed is assumed, as it always was.
  private readonly checking: boolean

  constructor(private readonly onChange: (s: UpdateState) => void) {
    // A test points the app at a local server instead of GitHub.
    const feed = process.env['TUCANO_UPDATE_URL']
    // This build never updates itself: it is installed beside the released app and rebuilt from its
    // own branch. The released app keeps the feed it has always had.
    this.checking = !!updaterModule && (!!feed || (app.getName() !== 'TucanoNext' && (!app.isPackaged || process.resourcesPath === undefined || existsSync(join(process.resourcesPath, 'app-update.yml')))))
    this.state = { version: app.getVersion(), status: this.checking ? 'idle' : 'off' }
    // An updater that didn't load leaves the app opened and updates off, instead of a window that never comes.
    if (!updaterModule) return

    if (feed) this.updater.setFeedURL({ provider: 'generic', url: feed })
    this.updater.logger = null
    this.updater.autoDownload = true
    this.updater.autoInstallOnAppQuit = true
    this.updater.on('checking-for-update', () => this.set({ status: 'checking', error: undefined, errorKind: undefined }))
    this.updater.on('update-not-available', () => this.set({ status: 'latest', checkedAt: Date.now() }))
    this.updater.on('update-available', (info) => this.set({ status: 'downloading', next: info.version, percent: 0, checkedAt: Date.now() }))
    this.updater.on('download-progress', (p) => this.set({ status: 'downloading', percent: Math.round(p.percent) }))
    this.updater.on('update-downloaded', (info) => {
      this.downloaded = info.downloadedFile
      this.set({ status: 'ready', next: info.version, percent: undefined })
    })
    app.on('will-quit', () => {
      if (this.downloadGone()) this.updater.autoInstallOnAppQuit = false
    })
    // No internet just waits for the next check; anything else may need the new version by hand.
    this.updater.on('error', (e) => {
      console.error('[updates]', e)
      this.set(
        offline(e)
          ? { status: 'error', errorKind: 'offline', error: L('Sem internet pra procurar uma versão nova. Tento de novo mais tarde.', 'No internet to look for a new version. I’ll try again later.') }
          : { status: 'error', errorKind: 'other', error: L('Não consegui atualizar sozinho. Baixe a versão nova na página de versões do Tucano.', 'I couldn’t update on my own. Download the new version from Tucano’s releases page.') }
      )
    })
  }

  get(): UpdateState {
    return this.state
  }

  start(): void {
    if (!this.checking || this.state.status === 'off') return
    setTimeout(() => this.check(), FIRST_CHECK_MS).unref()
    this.timer = setInterval(() => this.check(), EVERY_MS)
    this.timer.unref()
  }

  // Already downloading or ready: nothing new to ask for.
  check(): void {
    if (this.state.status === 'off' || this.state.status === 'checking' || this.state.status === 'downloading' || this.state.status === 'ready') return
    this.updater.checkForUpdates().catch(() => {}) // the 'error' event already says what went wrong
  }

  install(): void {
    if (this.state.status !== 'ready') return
    if (this.downloadGone()) {
      this.set({ status: 'idle', next: undefined })
      this.check()
      return
    }
    // On Windows the installer runs without its window, then opens the app again.
    if (process.platform === 'win32') this.updater.quitAndInstall(true, true)
    else this.updater.quitAndInstall()
  }

  // electron-updater deletes the AppImage in use before it moves the download into place, so
  // installing a download that's no longer there leaves the person with no app at all.
  private downloadGone(): boolean {
    return Boolean(process.env['APPIMAGE'] && this.downloaded && !existsSync(this.downloaded))
  }

  private set(patch: Partial<UpdateState>): void {
    this.state = { ...this.state, ...patch }
    this.onChange(this.state)
  }
}
