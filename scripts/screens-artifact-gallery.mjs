// Screenshots of a reply's pictures as an album: several images from one tool-call session drawn as
// one large and the rest beside it, the golden section, instead of one big picture under another.
// A single picture keeps the shape it had, a reply that also made a document keeps its card, and
// past four the last cell says how many are left. The images are written into the app's own
// artifact store and named by the reply that made them, so what is photographed is the real screen.
//
//   node scripts/screens.mjs artifact-gallery                 (after, 1280x900)
//   node scripts/screens.mjs artifact-gallery --tag before    (the build without the album)
import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { deflateSync } from 'node:zlib'
import { close, idle, measure, openApp, settle, shot, until, writeFrames } from './screens/lib.mjs'

export const title = 'A replys pictures as an album'
// The size the story was first photographed at, a MacBook's window, kept so the before and the after
// are the same window.
export const size = '1280x900'

// A PNG of a few coloured blocks: enough to be told apart in a gallery, drawn without a browser.
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
// `color(x, y)` gives the pixel; the bands and the bar make it read as a small window.
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
  ihdr[8] = 8 // bits
  ihdr[9] = 2 // truecolour
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}
const PALETTE = [
  [32, 39, 61],
  [72, 46, 96],
  [24, 72, 78],
  [96, 52, 33],
  [38, 60, 100],
  [64, 36, 52],
  [30, 74, 52],
  [84, 66, 26]
]
const picture = (n, w = 900, h = 620) => {
  const [r, g, b] = PALETTE[n % PALETTE.length]
  return png(w, h, (x, y) => {
    if (y < 46) return [18, 19, 22] // the window's bar
    if (y < 46 + 3) return [60, 62, 70]
    // rows of text-like blocks, and one accent block per picture
    const row = Math.floor((y - 70) / 42)
    if (y > 70 && y < h - 40 && (y - 70) % 42 < 12 && x > 40 && x < w * (0.35 + 0.06 * ((row * 7 + n) % 6))) return [r + 26, g + 26, b + 26]
    if (x > w * 0.62 && x < w * 0.62 + 180 && y > h * 0.55 && y < h * 0.55 + 120) return [r + 60, g + 40, b + 20]
    return [r, g, b]
  })
}

const say = async (win, text) => {
  await win.fill('.composer textarea', text)
  await win.keyboard.press('Enter')
}

export default async function story(context) {
  // The old shape, on the build before the album: every picture at its own size, one under the other.
  const before = context.tag === 'before'
  const rows = []
  const data = {}

  // ---- first run: three replies in Lia's DM, one for each picture shape ----
  let app = await openApp({ size })
  const { data: folder } = app
  let { win } = app
  await until(win, '.sidebar')
  await win.click('.section:has-text("Agents") .nav-item:has-text("Lia")')
  const openDm = win.locator('button:has-text("Open DM")')
  if (await openDm.count()) await openDm.first().click()
  await until(win, '.composer textarea')
  await say(win, 'olha os quatro modelos do painel de vendas que eu te mandei')
  await idle(app)
  await say(win, 'e agora compare as versões de julho e agosto, uma em cada janela')
  await idle(app)
  await say(win, 'gere só o gráfico do mês, uma imagem')
  await idle(app)
  await close(app)

  // ---- name those pictures on the replies that made them (what a tool-call session leaves) ----
  const db = new DatabaseSync(join(folder, 'tucano.db'))
  const dm = db.prepare("SELECT id FROM conversations WHERE kind = 'dm' LIMIT 1").get()
  const withRuns = db
    .prepare("SELECT id, author_id, run FROM messages WHERE conversation_id = ? AND run IS NOT NULL AND author_kind = 'agent' ORDER BY at")
    .all(dm.id)
    .map((r) => ({ id: r.id, agentId: r.author_id, run: JSON.parse(r.run) }))
  const shapes = [
    { count: 3, titles: ['Painel de vendas — julho', 'Painel de vendas — agosto', 'Comparativo mês a mês'] },
    { count: 7, titles: ['Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro', 'O ano em uma tela'] },
    { count: 1, titles: ['Vendas do mês'] }
  ]
  const insert = db.prepare('INSERT INTO artifacts (id, agent_id, conversation_id, message_id, kind, name, title, source, size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  let pictureNo = 0
  if (withRuns.length < shapes.length) {
    db.close()
    throw new Error(`gallery: expected ${shapes.length} completed replies, got ${withRuns.length}`)
  }
  shapes.forEach((shape, runNo) => {
    const target = withRuns[withRuns.length - shapes.length + runNo]
    const ids = []
    for (let i = 0; i < shape.count; i++) {
      const id = randomUUID() // the app serves an artifact only under a real id
      const name = `screenshot-${++pictureNo}.png`
      const file = picture(pictureNo)
      mkdirSync(join(folder, 'artifacts', id), { recursive: true })
      writeFileSync(join(folder, 'artifacts', id, name), file)
      insert.run(id, target.agentId, dm.id, target.id, 'image', name, shape.titles[i] ?? `Imagem ${i + 1}`, `C:/Users/theap/Desktop/${name}`, file.length, Date.now())
      ids.push(id)
    }
    target.run.artifactIds = ids
    db.prepare('UPDATE messages SET run = ? WHERE id = ?').run(JSON.stringify(target.run), target.id)
  })
  // The last reply also made a document: the album must not swallow it.
  const docId = randomUUID()
  const docName = 'vendas-2026.pdf'
  mkdirSync(join(folder, 'artifacts', docId), { recursive: true })
  const docBytes = Buffer.from('%PDF-1.4\n% seeded for the gallery screenshot\n')
  writeFileSync(join(folder, 'artifacts', docId, docName), docBytes)
  const last = withRuns[withRuns.length - 1]
  insert.run(docId, last.agentId, dm.id, last.id, 'pdf', docName, 'Vendas 2026 — relatório', 'C:/Users/theap/Desktop/vendas-2026.pdf', docBytes.length, Date.now())
  last.run.artifactIds = [...(last.run.artifactIds ?? []), docId]
  db.prepare('UPDATE messages SET run = ? WHERE id = ?').run(JSON.stringify(last.run), last.id)
  db.close()

  // ---- second run: the same replies, read with the pictures named ----
  app = await openApp({ size, data: folder, seed: 0 })
  ;({ win } = app)
  await win.click('.section:has-text("Agents") .nav-item:has-text("Lia")')
  if (await win.locator('button:has-text("Open DM")').count()) await win.locator('button:has-text("Open DM")').first().click()
  await until(win, before ? '.artifacts .artifact-image' : '.artifacts-gallery')
  await settle(win, 600)

  // One measured frame at a time: the element it is of, and the computed style and box it kept.
  const frame = async (name, selector, props = [], index = 0) => {
    const found = await measure(app, selector, props)
    found[index].frame = await shot(app, name)
    rows.push(...found.map((row) => ({ ...row, data: { frame: name } })))
    return found
  }

  data.galleries = (await measure(app, '.artifacts-gallery', [], { optional: true })).length
  data.stacks = (await measure(app, '.artifacts')).map((row) => row.box.h)
  if (before) {
    // The old shape: every picture at its own size, one under the other.
    const images = await measure(app, '.artifact-image')
    data.pictures = images.length
    data.pictureBoxes = images.slice(0, 4).map((row) => `${row.box.w}x${row.box.h}`)
    await frame('01-tres-imagens', '.artifact-image')
    await win.locator('.artifacts').nth(1).scrollIntoViewIfNeeded()
    await settle(win, 300)
    await frame('02-sete-imagens', '.artifacts')
    await win.locator('.artifact-image').first().scrollIntoViewIfNeeded()
    await settle(win, 300)
    await frame('03-uma-imagem', '.artifact-image')
    writeFrames(app.out, rows, { data })
    await close(app)
    return
  }

  const galleries = await measure(app, '.artifacts-gallery')
  const cellsIn = (at) => win.locator('.artifacts-gallery').nth(at).locator('.gallery__cell').count()
  data.cells = [await cellsIn(0), await cellsIn(1)]
  data.singleImages = (await measure(app, '.artifact-image:not(.gallery__cell)', [], { optional: true })).length
  data.docCards = (await measure(app, '.artifact-card', [], { optional: true })).length
  const hero = (await measure(app, '.artifacts-gallery .gallery__cell--hero'))[0]
  const beside = (await measure(app, '.artifacts-gallery .gallery__cell:not(.gallery__cell--hero)'))[0]
  data.ratio = +(hero.box.w / beside.box.w).toFixed(3)
  data.containerRatio = +(galleries[0].box.w / galleries[0].box.h).toFixed(3)
  // A picture wider or taller than the cell it sits in is a cropped picture. Both lists come back in
  // document order, one picture per cell, so the index pairs them without asking a class.
  const cells = await measure(app, '.artifacts-gallery .gallery__cell')
  const pictures = await measure(app, '.artifacts-gallery .gallery__cell img')
  data.cut = pictures.filter((picture, at) => cells[at] && (picture.box.w > cells[at].box.w + 1 || picture.box.h > cells[at].box.h + 1)).length
  data.images = pictures.length
  const moreLabel = await win.locator('.gallery__more').first().innerText().catch(() => '(none)')
  data.more = moreLabel
  await frame('01-tres-imagens', '.gallery__cell')

  // The big album, with what is left counted on the last cell.
  await win.locator('.artifacts-gallery').nth(1).scrollIntoViewIfNeeded()
  await settle(win, 300)
  await frame('02-sete-imagens', '.gallery__cell--hero')
  data.moreRendered = await win.locator('.artifacts-gallery').nth(1).locator('.gallery__more').innerText()

  // A single picture is not an album.
  await win.locator('.artifact-image:not(.gallery__cell)').first().scrollIntoViewIfNeeded()
  await settle(win, 300)
  await frame('03-uma-imagem', '.artifact-image:not(.gallery__cell)')

  // Pressing a cell opens the window on that picture.
  await win.locator('.artifacts-gallery').nth(0).locator('.gallery__cell').nth(1).click()
  await settle(win, 500)
  data.lightbox = await win.locator('.lightbox__title').innerText().catch(() => '(none)')
  data.lightboxCount = await win.locator('.lightbox .lightbox__bar span.small').first().innerText().catch(() => '')
  await frame('04-janela', '.lightbox')
  await win.keyboard.press('Escape')
  await settle(win, 300)

  // The same album in a narrow window: 420 wide, the pillow size a phone gives it.
  await win.setViewportSize({ width: 420, height: 900 })
  await settle(win, 500)
  await win.locator('.artifacts-gallery').nth(1).scrollIntoViewIfNeeded()
  await settle(win, 300)
  const narrow = (await measure(app, '.artifacts-gallery'))[1]
  const narrowHero = (await measure(app, '.artifacts-gallery .gallery__cell--hero'))[1]
  const narrowBeside = (await measure(app, '.artifacts-gallery .gallery__cell:not(.gallery__cell--hero)'))[1]
  data.narrow = { w: narrow.box.w, h: narrow.box.h, ratio: +(narrowHero.box.w / narrowBeside.box.w).toFixed(3) }
  data.sideways = (await win.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) ?? null
  const narrowRows = await measure(app, '.artifacts-gallery')
  narrowRows[1].frame = await shot(app, '05-420')
  rows.push(...narrowRows.map((row) => ({ ...row, data: { frame: '05-420' } })))

  writeFrames(app.out, rows, { data })
  await close(app)
}
