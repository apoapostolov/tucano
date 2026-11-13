// Screenshots of two messages in one direct message, sent while the first reply is still working:
// each gets its own reply and its own session, side by side. Fake engines, throwaway data, no model
// called; the slow reply is asked for in the message ("demore 2 s").
// Run after `npm run build`: node scripts/screens-parallel-dm.mjs [out-dir]
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const out = process.argv[2] ?? 'frames/parallel-dm'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-parallel-'))
const app = await electron.launch({
  args: ['.', `--user-data-dir=${join(data, 'electron')}`],
  ...(process.env.TUCANO_ELECTRON ? { executablePath: process.env.TUCANO_ELECTRON } : {}),
  env: { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en-US' }
})
const win = await app.firstWindow()
const errors = []
win.on('pageerror', (e) => errors.push(String(e)))
win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await win.setViewportSize({ width: 1280, height: 860 })
await win.waitForSelector('.sidebar')

// Lia's direct message: her page in the sidebar, then Open DM.
await win.locator('.sidebar .nav-item', { hasText: /^Lia/ }).first().click()
await win.locator('button', { hasText: 'Open DM' }).first().click()
await win.waitForSelector('.composer textarea')
const say = async (text) => {
  await win.fill('.composer textarea', text)
  await win.keyboard.press('Enter')
  await win.waitForTimeout(120)
}
// Both replies take two seconds, and the second message goes while the first still works: if it waited
// for it, only one of them would ever be running at once.
await say('demore 2 s')
await say('demore 2 s também')
await win.waitForTimeout(900)
const busy = await win.locator('.msg .shimmer, .msg .typing').count()
await win.screenshot({ path: `${out}/two-working.png` })
await win.waitForTimeout(4000)
await win.screenshot({ path: `${out}/both-answered.png` })

const count = await win.evaluate(() => ({
  replies: [...document.querySelectorAll('.msg')].filter((m) => m.closest('[data-author-kind="agent"], .msg--agent, .msg')).length,
  agent: [...document.querySelectorAll('.msg')].filter((m) => m.classList.contains('msg--agent') || m.querySelector('.msg__from')).length
}))
console.log(JSON.stringify({ busy, count, errors }, null, 1))
await app.close()
