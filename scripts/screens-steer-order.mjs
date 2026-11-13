// Screenshot of a working reply with its reasoning showing: the steer pill sits under the thinking
// block, never above it. Fake engines with thinking turned on, throwaway data, no model called.
// Run after `npm run build`: node scripts/screens-steer-order.mjs [out-dir]
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const out = process.argv[2] ?? 'frames/steer-order'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-steer-'))
const app = await electron.launch({
  args: ['.', `--user-data-dir=${join(data, 'electron')}`],
  ...(process.env.TUCANO_ELECTRON ? { executablePath: process.env.TUCANO_ELECTRON } : {}),
  env: { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_FAKE_THINKING: '1', TUCANO_LOCALE: 'en-US' }
})
const win = await app.firstWindow()
const errors = []
win.on('pageerror', (e) => errors.push(String(e)))
win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await win.setViewportSize({ width: 1280, height: 900 })
await win.waitForSelector('.sidebar')

// Settings › The conversation › the reasoning, turned on from the window itself.
await win.locator('.sidebar .nav-item', { hasText: /^Settings/ }).click()
await win.locator('.key-row', { hasText: 'reasoning shows' }).locator('.toggle').click()
await win.waitForTimeout(300)

// Lia's direct message: her page in the sidebar, then Open DM.
await win.locator('.sidebar .nav-item', { hasText: /^Lia/ }).first().click()
await win.locator('button', { hasText: 'Open DM' }).first().click()
await win.waitForSelector('.composer textarea')
await win.fill('.composer textarea', 'demore 2 s')
await win.keyboard.press('Enter')

// The message asks for two seconds, then the fake model thinks out loud for a couple more.
await win.waitForSelector('.thought', { timeout: 15000 })
await win.waitForTimeout(400)
const order = await win.evaluate(() =>
  [...document.querySelectorAll('.thought, .steps__ask')].map((el) => ({
    cls: el.className.split(' ')[0],
    top: Math.round(el.getBoundingClientRect().top),
    bottom: Math.round(el.getBoundingClientRect().bottom)
  }))
)
await win.screenshot({ path: `${out}/steer-under-thinking.png` })
console.log(JSON.stringify({ order, errors }, null, 1))
await app.close()
