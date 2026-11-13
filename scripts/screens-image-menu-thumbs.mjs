// A picture in a reply answers a right-click with the same menu as the full-screen view, whether it
// is the picture on its own or a cell of the album, and "Send to prompt" puts the full picture into
// that conversation's field. This photographs the menu on a cell, the chip it leaves in the composer,
// and the clipboard path, on the built app.
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { deflateSync } from 'node:zlib'
import { randomUUID } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'

const out = process.argv[2] ?? 'screens-image-menu-thumbs'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-thumbs-'))

// A PNG of coloured blocks, drawn without a browser: enough to be told apart.
const TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, body) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(body.length)
  const named = Buffer.concat([Buffer.from(type, 'ascii'), body])
  const sum = Buffer.alloc(4)
  sum.writeUInt32BE(crc(named))
  return Buffer.concat([len, named, sum])
}
const png = (w, h, color) => {
  const raw = Buffer.alloc((w * 3 + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0
    for (let x = 0; x < w; x++) {
      const [r, g, b] = color(x, y)
      const at = y * (w * 3 + 1) + 1 + x * 3
      raw[at] = r
      raw[at + 1] = g
      raw[at + 2] = b
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}
const PALETTE = [
  [32, 39, 61],
  [72, 46, 96],
  [24, 72, 78],
  [96, 52, 33]
]
const picture = (n, w = 900, h = 620) => {
  const [r, g, b] = PALETTE[n % PALETTE.length]
  return png(w, h, (x, y) => {
    if (y < 46) return [18, 19, 22]
    if (y > 70 && y < h - 40 && (y - 70) % 42 < 12 && x > 40 && x < w * 0.4) return [r + 26, g + 26, b + 26]
    return [r, g, b]
  })
}

const say = async (win, text) => {
  await win.fill('.composer textarea', text)
  await win.keyboard.press('Enter')
}
const idle = async (win) => {
  await win.waitForTimeout(600)
  for (let i = 0; i < 60; i++) {
    if (!(await win.locator('.steps.is-working').count())) break
    await win.waitForTimeout(250)
  }
  await win.waitForTimeout(900)
}

// ---- first run: two replies in Lia's DM, one with three pictures and one with a single picture ----
let app = await electron.launch({ args: ['.'], env: { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en' } })
let win = await app.firstWindow()
await win.setViewportSize({ width: 1280, height: 900 })
await win.waitForSelector('.sidebar')
await win.click('.section:has-text("Agents") .nav-item:has-text("Lia")')
if (await win.locator('button:has-text("Open DM")').count()) await win.locator('button:has-text("Open DM")').first().click()
await win.waitForSelector('.composer textarea')
await say(win, 'olha os três modelos do painel de vendas que eu te mandei')
await idle(win)
await say(win, 'gere só o gráfico do mês, uma imagem')
await idle(win)
await app.close()
await new Promise((r) => setTimeout(r, 1500)) // the single-instance lock frees a moment after the window closes

// ---- name those pictures on the replies that made them ----
const db = new DatabaseSync(join(data, 'tucano.db'))
const dm = db.prepare("SELECT id FROM conversations WHERE kind = 'dm' LIMIT 1").get()
const withRuns = db
  .prepare("SELECT id, author_id, run FROM messages WHERE conversation_id = ? AND run IS NOT NULL AND author_kind = 'agent' ORDER BY at")
  .all(dm.id)
  .map((r) => ({ id: r.id, agentId: r.author_id, run: JSON.parse(r.run) }))
// The second cell of the album is the one right-clicked below, and the chip is named by its title.
const toPromptImageName = 'Painel de vendas — agosto.png'
const shapes = [
  { count: 3, titles: ['Painel de vendas — julho', 'Painel de vendas — agosto', 'Comparativo mês a mês'] },
  { count: 1, titles: ['Vendas do mês'] }
]
const insert = db.prepare('INSERT INTO artifacts (id, agent_id, conversation_id, message_id, kind, name, title, source, size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
let pictureNo = 0
shapes.forEach((shape, runNo) => {
  const target = withRuns[withRuns.length - shapes.length + runNo]
  const ids = []
  for (let i = 0; i < shape.count; i++) {
    const id = randomUUID()
    const name = `screenshot-${++pictureNo}.png`
    const file = picture(pictureNo)
    mkdirSync(join(data, 'artifacts', id), { recursive: true })
    writeFileSync(join(data, 'artifacts', id, name), file)
    insert.run(id, target.agentId, dm.id, target.id, 'image', name, shape.titles[i] ?? `Imagem ${i + 1}`, `C:/Users/theap/Desktop/${name}`, file.length, Date.now())
    ids.push(id)
  }
  target.run.artifactIds = ids
  db.prepare('UPDATE messages SET run = ? WHERE id = ?').run(JSON.stringify(target.run), target.id)
})
db.close()

// ---- second run: the menu on a thumbnail, the picture it sends, the clipboard ----
app = await electron.launch({ args: ['.'], env: { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '0', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en' } })
win = await app.firstWindow()
await win.setViewportSize({ width: 1280, height: 900 })
await win.waitForSelector('.sidebar')
const errors = []
win.on('pageerror', (e) => errors.push(String(e)))
win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await win.click('.section:has-text("Agents") .nav-item:has-text("Lia")')
if (await win.locator('button:has-text("Open DM")').count()) await win.locator('button:has-text("Open DM")').first().click()
await win.waitForSelector('.artifacts-gallery')
await win.waitForTimeout(600)
const shot = (name) => win.screenshot({ path: `${out}/${name}.png` })
const items = () => win.locator('.image-menu [role="menuitem"]').evaluateAll((els) => els.map((e) => e.textContent?.trim() ?? ''))

const report = {}
// A cell beside the large one: the thumbnail that had no menu before, and the first save of a session,
// which names the system's downloads folder because nothing has been saved yet.
const beside = win.locator('.artifacts-gallery').first().locator('.gallery__cell:not(.gallery__cell--hero)').first()
await beside.scrollIntoViewIfNeeded()
await beside.click({ button: 'right' })
await win.waitForSelector('.image-menu')
report.cellMenuFirstSave = await items()
const menuBox = await win.locator('.image-menu').boundingBox()
report.menuAt = { x: Math.round(menuBox.x), y: Math.round(menuBox.y), w: Math.round(menuBox.width), h: Math.round(menuBox.height) }
await shot('01-menu-on-a-cell')

// "Send to prompt": the picture arrives in this conversation's field, at its full size.
await win.locator('.image-menu__item:has-text("Send to prompt")').click()
await win.waitForSelector('.composer__images .composer__image')
await win.waitForTimeout(400)
report.composerChip = await win.locator('.composer__images .composer__image').first().getAttribute('title')
report.composerThumb = await win.locator('.composer__images .composer__image img').first().evaluate((e) => ({ w: e.naturalWidth, h: e.naturalHeight, src: e.src.slice(0, 12) }))
report.chipIsTheCellPicture = report.composerChip === toPromptImageName
await shot('02-sent-to-prompt')
await win.locator('.composer__image-x').first().click()
await win.waitForTimeout(200)

// The picture on its own keeps the menu it always had, and the clipboard takes it.
const single = win.locator('.artifact-image:not(.gallery__cell)').first()
await single.scrollIntoViewIfNeeded()
await single.click({ button: 'right' })
await win.waitForSelector('.image-menu')
report.singleMenu = await items()
await shot('03-menu-on-a-single-picture')
await win.locator('.image-menu__item:has-text("Copy to clipboard")').click()
await win.waitForTimeout(600)
report.copyToast = await win.locator('.toast__text').last().innerText().catch(() => '(none)')
await app.close()
await new Promise((r) => setTimeout(r, 1500))

// ---- third run: one click into the folder the last picture went to, no dialog ----
const shots = join(out, 'shots')
mkdirSync(shots, { recursive: true })
const db2 = new DatabaseSync(join(data, 'tucano.db'))
db2.prepare("INSERT INTO settings (key, value) VALUES ('lastImageFolder', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(JSON.stringify(shots)) // settings values are JSON, so a string goes in quoted
db2.close()

app = await electron.launch({ args: ['.'], env: { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '0', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en' } })
win = await app.firstWindow()
await win.setViewportSize({ width: 1280, height: 900 })
await win.waitForSelector('.sidebar')
win.on('pageerror', (e) => errors.push(String(e)))
win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await win.click('.section:has-text("Agents") .nav-item:has-text("Lia")')
if (await win.locator('button:has-text("Open DM")').count()) await win.locator('button:has-text("Open DM")').first().click()
await win.waitForSelector('.artifacts-gallery')
await win.waitForTimeout(600)
const cellAgain = win.locator('.artifacts-gallery').first().locator('.gallery__cell:not(.gallery__cell--hero)').first()
await cellAgain.scrollIntoViewIfNeeded()
await cellAgain.click({ button: 'right' })
await win.waitForSelector('.image-menu')
report.cellMenuRemembered = await items()
await win.locator('.image-menu__item:has-text("Save to Shots")').click()
await win.waitForTimeout(900)
report.saveToast = await win.locator('.toast__text').last().innerText().catch(() => '(none)')
report.savedFiles = readdirSync(shots).map((name) => ({ name, bytes: statSync(join(shots, name)).size }))
await shot('04-saved-into-the-folder')

report.errors = errors
console.log(JSON.stringify(report, null, 1))
await app.close()
