// One line under a message, not two: the glyph that replies to the message and the pill that opens its
// thread are controls of the same reply row (`.msg__meta`), so they start on the same pixel row and
// never touch. Laid out as Conversation.tsx draws them, in a channel's reply row and in a thread's, at
// 1440 px and at 420 px.
//
// The DOM, verbatim from MessageRow → ReplyFooter (the `{threadPill}` line sits before `.msg__actions`,
// whose `margin-left: auto` keeps the glyph at the row's right end):
//
//   <article class="msg msg--agent">
//     <div class="msg__gutter">…</div>
//     <div class="msg__body">
//       <div class="md msg__text"><p>…</p></div>
//       <div class="msg__meta">
//         <div class="receipt"><button class="receipt__line">Sonnet · 12.4k tokens · 7s</button></div>
//         <button class="thread-link">…</button>            ← ThreadPill, ReplyFooter's `threadPill`
//         <div class="msg__actions"><button class="msg__replyto">…</button></div>
//       </div>
//     </div>
//   </article>
//
// The pill's own line under the footer is what the change removes: before it, `.thread-link` was a
// sibling of `.msg__meta`, so the row and the pill stacked.
import { existsSync, readFileSync } from 'node:fs'
import { chromium, type Locator } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')

const DOT = '<span class="thread-link__dot" aria-label="2 new"></span>'
const FACES = (n: number): string =>
  `<span class="thread-link__faces" aria-hidden>${Array.from({ length: n }, () => '<span class="avatar" style="width:18px;height:18px"></span>').join('')}</span>`
const CHEVRON =
  '<svg class="icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>'
const REPLY_GLYPH =
  '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 17H7a4 4 0 0 1 0-8h10M13 7l-4 5 4 5"></path></svg>'

// The footer row: a receipt's numbers on the left, then the thread's pill, then the reply-to glyph at
// the right end — the children ReplyFooter draws, in the order it draws them.
const ROW = `
  <div class="msg__meta">
    <div class="receipt"><button class="receipt__line">Sonnet · 12.4k tokens · 7s</button></div>
    <button class="thread-link" aria-label="Open the thread: 12 replies">
      ${DOT}${FACES(2)}<strong class="thread-link__count">12 replies<span class="thread-link__fresh"> · 2 new</span></strong>
      <span class="thread-link__when"><span class="thread-link__ago">2m</span><span class="thread-link__see">View thread</span></span>
      ${CHEVRON}
    </button>
    <div class="msg__actions">
      <button class="msg__replyto" title="Reply to message" aria-label="Reply to message">${REPLY_GLYPH}</button>
    </div>
  </div>`

const MESSAGE = `
  <article class="msg msg--agent">
    <div class="msg__gutter"><span class="avatar" style="width:34px;height:34px"></span></div>
    <div class="msg__body">
      <div class="md msg__text"><p>Two lines are read twice and the last one is dropped: the loop counts bytes, not lines.</p></div>
      ${ROW}
    </div>
  </article>`

// A channel's list, and the same list inside a thread's panel: the two places a reply row appears.
const CHANNEL = (): string => `<main class="main"><div class="messages">${MESSAGE}</div></main>`
const THREAD = (): string => `
  <div style="display:flex;height:100%">
    <main class="main"><div class="messages">${MESSAGE}</div></main>
    <aside class="side-panel side-panel--thread"><div class="messages">${MESSAGE}</div></aside>
  </div>`

const box = (loc: Locator) =>
  loc.first().evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, w: r.width, h: r.height, offsetTop: (el as HTMLElement).offsetTop }
  })

const cases: { name: string; html: () => string; width: number; row: number }[] = [
  { name: 'a channel row at 1440 px', html: CHANNEL, width: 1440, row: 0 },
  { name: 'a channel row at 420 px', html: CHANNEL, width: 420, row: 0 },
  { name: 'a thread row at 1440 px', html: THREAD, width: 1440, row: 1 },
  { name: 'a thread row at 420 px', html: THREAD, width: 420, row: 1 }
]

for (const c of cases) {
  it.skipIf(!existsSync(chromium.executablePath()))(`puts the reply-to glyph on the thread pill's line: ${c.name}`, async () => {
    const browser = await chromium.launch({ headless: true })
    try {
      const page = await browser.newPage({ viewport: { width: c.width, height: 900 } })
      await page.setContent(`<style>${css}</style>${c.html()}`)
      // The layout is the claim here, not the entrance: rows and pills rise in on mount, which moves
      // their rects by the first frames. Measured with the motion off, the boxes are where they live.
      await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important }' })
      await page.waitForTimeout(50)
      const row = page.locator('.msg').nth(c.row)
      // The pill and the glyph are children of the same row, not one above the other.
      expect(await row.locator('.msg__meta > .thread-link').count()).toBe(1)
      const meta = await box(row.locator('.msg__meta'))
      const pill = await box(row.locator('.thread-link'))
      const glyph = await box(row.locator('.msg__replyto'))
      const receipt = await box(row.locator('.receipt'))
      // Same line: the two boxes start on the same pixel row (a pixel or two of rounding allowed).
      expect(Math.abs(glyph.offsetTop - pill.offsetTop)).toBeLessThanOrEqual(2)
      // The order the design intends: the pill first, the glyph at the row's right end, apart by the
      // row's own gap (14 px), never overlapping.
      expect(glyph.left).toBeGreaterThanOrEqual(pill.right)
      expect(glyph.left - pill.right).toBeGreaterThanOrEqual(12)
      expect(glyph.left - pill.right).toBeLessThanOrEqual(16)
      // Both inside the row: nothing wrapped onto a line of its own, nothing spilled out of it.
      expect(pill.top).toBeGreaterThanOrEqual(meta.top - 0.5)
      expect(pill.bottom).toBeLessThanOrEqual(meta.bottom + 0.5)
      expect(glyph.bottom).toBeLessThanOrEqual(meta.bottom + 0.5)
      // And the row's other control did not move to make room: the receipt's numbers still start the
      // row, and the pill sits beside them or on the line below them, never over them.
      expect(Math.round(receipt.left - meta.left)).toBe(0)
      expect(pill.left >= receipt.right || pill.top >= receipt.bottom - 0.5).toBe(true)
    } finally {
      await browser.close()
    }
  })
}
