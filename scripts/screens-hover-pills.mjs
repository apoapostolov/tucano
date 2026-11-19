// Frames for the way on from a reply that stopped: Continue and Try again are the pill Follow Up is —
// same height, same radius, same 11.5px, same dim colour — and a row only shows them under the
// pointer. Measured with the pointer away and over the message, at 1280 and at 420.
// A workspace made from nothing, one channel seeded with two replies: one that ended (Follow Up) and
// one the person stopped (Continue + Try again). Fake engines; nothing runs.
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'

const out = process.argv[2] ?? 'C:/tmp/frames/hover-pills'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-hover-pills-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en-US' }
const errors = []
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const launch = async () => {
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1280, height: 880 })
  await win.waitForSelector('.sidebar')
  win.on('pageerror', (e) => errors.push(String(e)))
  win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  return { app, win }
}

// 1. A first launch, to create the workspace and its starter team.
const first = await launch()
await first.win.waitForTimeout(1200)
await first.app.close()

// 2. Two replies in one channel, written straight into the file: one that ended with words (its
//    Follow Up pill is the one the others are held to), one the person stopped mid-work.
const db = new DatabaseSync(join(data, 'tucano.db'))
const channel = db.prepare("SELECT id, name FROM conversations WHERE kind = 'channel' ORDER BY name LIMIT 1").get()
const agent = db.prepare('SELECT id FROM agents ORDER BY handle LIMIT 1').get()
const now = Date.now()
const step = (label, detail, at) => ({ id: randomUUID(), label, detail, status: 'done', ms: 1200, at })
const add = db.prepare('INSERT INTO messages (id, conversation_id, author_kind, author_id, text, at, run) VALUES (?, ?, ?, ?, ?, ?, ?)')
add.run(randomUUID(), channel.id, 'agent', agent.id, 'The changelog is updated for 0.2.41, and the release notes carry the two fixes.', now - 60_000, JSON.stringify({ status: 'done', task: 'Update the changelog', steps: [step('Thought', 'Pi'), step('Ran', 'npx vitest run')] }))
add.run(randomUUID(), channel.id, 'agent', agent.id, '', now - 30_000, JSON.stringify({ status: 'stopped', task: 'Rebase the settings PR', cutAt: now - 31_000, steps: [step('Thought', 'Pi'), step('Ran', 'git rebase upstream/main')] }))
db.close()

// 3. Look at them.
const { app, win } = await launch()
await win.waitForSelector('.sidebar')
const nav = await win.evaluate(() => [...document.querySelectorAll('.nav-item')].map((n) => n.textContent?.trim()).slice(0, 40))
console.log('sidebar:', JSON.stringify(nav))
await win.locator('.nav-item', { hasText: channel.name ?? '' }).first().click().catch(() => {})
await win.waitForTimeout(300)
// The channel with the two replies may not be the seeded one by name; fall back to any nav item.
const openChannel = await win.evaluate(() => document.querySelectorAll('.msg').length)
if (openChannel < 2) {
  const items = await win.locator('.nav-item').all()
  for (const item of items) {
    await item.click().catch(() => {})
    await win.waitForTimeout(200)
    if ((await win.evaluate(() => document.querySelectorAll('.msg').length)) >= 2) break
  }
}
await win.waitForSelector('.msg')
await win.mouse.move(4, 4)
await win.waitForTimeout(400)

// What a pill is, drawn: the two classes, the box, and the paint. `.msg__hire` is the same pill as
// Follow Up, so their numbers have to agree.
const look = (win) =>
  win.evaluate(() => {
    const paint = (el) => {
      const s = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      return { radius: s.borderTopLeftRadius, height: Math.round(r.height), font: s.fontSize, color: s.color, border: s.borderTopColor, padding: s.padding, opacity: Number(s.opacity) }
    }
    return {
      hire: [...document.querySelectorAll('.msg__hire')].map((p) => ({ text: p.textContent?.trim(), classes: p.className, ...paint(p) })),
      follow: [...document.querySelectorAll('.msg__meta .steps__ask-pill:not(.msg__hire)')].map((p) => ({ text: p.textContent?.trim(), classes: p.className, ...paint(p) })),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    }
  })

const away = await look(win)
console.log('1280, pointer away:', JSON.stringify(away))
await win.screenshot({ path: `${out}/01-1280-pointer-away.png` })

// Over the message that stopped: the pill is there.
const stopped = win.locator('.msg', { has: win.locator('.msg__hire') }).last()
await stopped.hover()
await win.waitForTimeout(400)
const over = await look(win)
console.log('1280, over the message:', JSON.stringify(over))
await win.screenshot({ path: `${out}/02-1280-over-the-message.png` })

// Off it again: back to the words and the numbers alone.
await win.mouse.move(4, 4)
await win.waitForTimeout(400)
console.log('1280, away again:', JSON.stringify(await look(win)))
await win.screenshot({ path: `${out}/03-1280-away-again.png` })

// 420 px: the same two pills inside the column, nothing sideways.
await win.setViewportSize({ width: 420, height: 880 })
await win.waitForTimeout(400)
await win.mouse.move(4, 4)
await win.waitForTimeout(300)
console.log('420, pointer away:', JSON.stringify(await look(win)))
await win.screenshot({ path: `${out}/04-420-pointer-away.png` })
await stopped.hover()
await win.waitForTimeout(400)
console.log('420, over the message:', JSON.stringify(await look(win)))
await win.screenshot({ path: `${out}/05-420-over-the-message.png` })

console.log('page errors:', JSON.stringify(errors.slice(0, 6)))
await app.close()
