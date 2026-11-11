// Before: the wiki's card where it was (the Memory tab, two levels) and the Tools tab without it.
// Run in a checkout of main after `npm run build`: node scripts/screens-wiki-before.mjs [out-dir]
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const out = process.argv[2] ?? 'frames/wiki-write-before'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-'))
const app = await electron.launch({
  args: ['.'],
  env: { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: process.env.TUCANO_LOCALE ?? 'pt-BR' }
})
const win = await app.firstWindow()
const errors = []
win.on('pageerror', (e) => errors.push(String(e)))
await win.setViewportSize({ width: 1280, height: 860 })
await win.waitForSelector('.sidebar')
const shot = (name) => win.screenshot({ path: `${out}/${name}.png` })
const card = (title) => win.locator('.card', { has: win.locator(`h2:text-is("${title}")`) }).first()
const agentRow = () => win.locator('.nav-item', { has: win.locator('.nav-item__role') }).filter({ hasText: /Lia/ }).first()

await agentRow().click()
await win.waitForSelector('.agent-form')
await win.locator('[role="tab"], .tabs button, .tab', { hasText: /^(Ferramentas|Tools)$/ }).first().click()
await win.waitForTimeout(400)
console.log('tools tab, a wiki card?', await win.locator('.card', { has: win.locator('h2:text-is("Wiki")') }).count())

await win.locator('[role="tab"], .tabs button, .tab', { hasText: /^(Memória|Memory)$/ }).first().click()
await win.waitForTimeout(400)
const wiki = card('Wiki')
await wiki.scrollIntoViewIfNeeded()
await win.waitForTimeout(250)
console.log('memory tab levels:', await wiki.locator('[role="radio"]').allTextContents())
await shot('01-before-card-on-memory')
console.log('page errors:', errors)
await app.close()
