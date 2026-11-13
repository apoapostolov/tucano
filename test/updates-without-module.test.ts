import { EventEmitter } from 'node:events'
import { describe, expect, it, vi } from 'vitest'

const { app } = vi.hoisted(() => {
  const { EventEmitter: Emitter } = require('node:events') as { EventEmitter: typeof EventEmitter }
  return { app: Object.assign(new Emitter(), { isPackaged: true, getVersion: () => '1.0.0', getName: () => 'Tucano' }) }
})

vi.mock('electron', () => ({ app }))
// The whole failure that stopped the app at load: updater-module catches a missing dependency of
// the updater and reports nothing loaded. The app must still open, with updates off.
vi.mock('../src/main/updater-module', () => ({ updaterModule: null }))

import { Updates } from '../src/main/updates'
import type { UpdateState } from '../src/shared/types'

describe('an updater that did not load', () => {
  it('leaves the app open with updates off instead of stopping while the window is made', () => {
    const seen: UpdateState[] = []
    const updates = new Updates((state) => seen.push(state))
    expect(updates.get()).toMatchObject({ version: '1.0.0', status: 'off' })
    // The calls the window and the quit handler make; none of them may throw for lack of an updater.
    expect(() => updates.start()).not.toThrow()
    expect(() => updates.check()).not.toThrow()
    expect(() => updates.install()).not.toThrow()
    expect(seen).toEqual([])
  })
})
