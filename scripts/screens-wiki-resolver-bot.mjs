// Screenshots of the resolver section of Wiki settings: the app's own resolver with its model, then a
// bot given the job, which hides the model field because the bot brings its own instructions, model and
// effort. A seeded workspace, no model called. Run after `npm run build`:
//   node scripts/screens-wiki-resolver-bot.mjs [out-dir]
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const out = process.argv[2] ?? 'frames/wiki-resolver-bot'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-resolver-'))
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
const shot = (name) => win.screenshot({ path: `${out}/${name}.png` })

// The wiki, from the sidebar.
await win.locator('.sidebar .nav-item', { hasText: /^Wiki$/ }).click()
await win.waitForSelector('button[title="Wiki settings"]')
await win.locator('button[title="Wiki settings"]').click()
await win.waitForSelector('.wk-settings')

// The resolver section: turn it on, which brings its fields out.
const section = win.locator('.wk-settings section', { hasText: 'The resolver' })
await section.locator('.toggle').click()
await section.locator('.select__trigger').first().waitFor()
await win.waitForTimeout(300)
await shot('resolver-app')

// Hand the job to a bot: the model field belongs to the app's resolver, so it goes.
const picker = win.locator('.wk-settings button[aria-label="Who settles the finding"]')
await picker.click()
await win.locator('[role="option"]').nth(1).click()
await win.waitForTimeout(400)
await shot('resolver-bot')

const texts = await win.evaluate(() => {
  const secs = [...document.querySelectorAll('.wk-settings section')]
  const resolver = secs.find((s) => (s.querySelector('h4')?.textContent ?? '').includes('The resolver'))
  return {
    rows: [...(resolver?.querySelectorAll('.wk-setting b') ?? [])].map((b) => b.textContent?.trim()),
    model: (resolver?.textContent ?? '').includes('Its model'),
    picker: resolver?.querySelector('.select__trigger')?.textContent?.trim() ?? ''
  }
})
console.log(JSON.stringify({ ...texts, errors }, null, 1))
await app.close()
