import { beforeAll, expect, it, vi } from 'vitest'
import { bootCore, type TestCore, type Client } from './helpers/core'
import type { Settings } from '../src/shared/types'
import { settingsPatchError } from '../src/core/settings-patch'
import { autostartEntry } from '../src/core/platform'

vi.setConfig({ testTimeout: 60_000 })
let core: TestCore
let client: Client
beforeAll(async () => { core = await bootCore(); client = core.connect() }, 60_000)

it('persists the startup choice and refreshes login registration when either preference changes', async () => {
  await client.call('updateSettings', { patch: { openAtLogin: true, launchMinimized: true } })
  expect(core.toMain.filter(m => m.type === 'login_item').at(-1)).toMatchObject({ open: true, minimized: true })
  expect((await client.call<{ settings: Settings }>('snapshot')).settings.launchMinimized).toBe(true)
  await client.call('updateSettings', { patch: { openAtLogin: false } })
  expect(core.toMain.filter(m => m.type === 'login_item').at(-1)).toMatchObject({ open: false, minimized: true })
  await client.call('updateSettings', { patch: { launchMinimized: false } })
  expect(core.toMain.filter(m => m.type === 'login_item').at(-1)).toMatchObject({ open: false, minimized: false })
})
it('rejects a non-boolean startup choice', () => {
  expect(settingsPatchError({ launchMinimized: 'yes' })).toBeDefined()
})
it('adds the minimized argument only to the selected login entry', () => {
  expect(autostartEntry('/opt/TucanoNext/app', true)).toContain('Exec=/opt/TucanoNext/app --minimized')
  expect(autostartEntry('/opt/TucanoNext/app')).not.toContain('--minimized')
})
