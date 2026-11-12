// The updater, loaded where a failure can be caught. A package whose electron-updater is missing one
// of its own dependencies throws while resolving it: through a static import that stops the app before
// any window exists, and the process left behind holds the single-instance lock, so every later launch
// does nothing. Loaded this way, the same failure leaves the app open with updates reading "off".
import { createRequire } from 'node:module'
import type { AppUpdater } from 'electron-updater'

export type UpdaterModule = { autoUpdater: AppUpdater }

export const updaterModule = ((): UpdaterModule | null => {
  try {
    return createRequire(import.meta.url)('electron-updater') as UpdaterModule
  } catch (error) {
    console.error('[updates] electron-updater did not load', error)
    return null
  }
})()
