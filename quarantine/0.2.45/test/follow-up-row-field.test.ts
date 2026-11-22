// Following up from a finished row of the drawer (Conversation.tsx, WorkDrawer + PillPrompt place="row"):
// pressing Follow Up on a reply that ended opens a field on that row's own second line — one line tall,
// as wide as the row, starting where the session's name starts (past the state glyph, not at its edge),
// with the glyph that sends at that end. Laid out as the app draws it and measured in Chromium, at a
// window's width and at a phone's. The row carries no written label for how it ended (that is the
// glyph's title), because the label took the line's room and pushed the pill onto a second line.
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')

const ROW = (open: boolean): string => `
  <div class="work-drawer is-open">
    <div class="work-drawer__list">
      <div class="work-drawer__group">Terminadas</div>
      <div class="work-row work-row--done">
        <button type="button" class="work-row__go">
          <span class="work-row__state work-row__state--ok" title="Concluída">
            <svg class="icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12l6 6L20 6" /></svg>
          </span>
          <span class="work-row__name">Astra</span>
          <span class="work-row__text">· fix the line under the header so it never wraps</span>
        </button>
        <div class="work-row__follow">
          <div class="steps__ask steps__ask--down">
            <button type="button" class="steps__ask-pill" aria-expanded="${open}">Follow Up</button>
            ${
              open
                ? `<div class="steps__ask-note steps__ask-note--row">
                     <input placeholder="What next?" aria-label="What more this reply should do">
                     <button type="button" class="icon-btn icon-btn--sm steps__ask-send" title="Send" aria-label="Send">
                       <svg class="icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12 20 4l-6 16-3-7-7-1Z" /></svg>
                     </button>
                   </div>`
                : ''
            }
          </div>
        </div>
        <button type="button" class="icon-btn icon-btn--sm work-row__thread-btn" aria-label="Open this reply’s thread">
          <svg class="icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h16v11H10l-4 4v-4H4V5Z" /></svg>
        </button>
        <button type="button" class="icon-btn icon-btn--sm work-row__remove" aria-label="Remove from the list">
          <svg class="icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 7h14M9 7V5h6v2M7 7l1 12h8l1-12" /></svg>
        </button>
      </div>
    </div>
  </div>`

const page = (body: string): string =>
  `<style>${css}</style><style>body{margin:0}</style><main class="main"><div class="messages" style="width:600px;padding:12px">${body}</div></main>`

const box = (p: import('playwright').Page, sel: string) =>
  p.locator(sel).first().evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, w: r.width, h: r.height }
  })

// How much height two boxes share: a whole row when they are on the same line, nothing when one of
// them has wrapped under the other.
const band = (a: { top: number; bottom: number }, b: { top: number; bottom: number }) =>
  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)

const skip = !existsSync(chromium.executablePath())

it.skipIf(skip)('puts the open follow up field on the finished row’s second line, from the name to the row’s end', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const p = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    await p.setContent(page(ROW(true)))

    const row = await box(p, '.work-row')
    const go = await box(p, '.work-row__go')
    const state = await box(p, '.work-row__state')
    const name = await box(p, '.work-row__name')
    const pill = await box(p, '.steps__ask-pill')
    const thread = await box(p, '.work-row__thread-btn')
    const remove = await box(p, '.work-row__remove')
    const note = await box(p, '.steps__ask-note--row')
    const field = await box(p, '.steps__ask-note--row input')
    const send = await box(p, '.steps__ask-send')

    // The field starts where the name starts — past the state glyph, not at its edge — and ends at the
    // row's own right end, the same ruling the steer field on a working row follows.
    expect(field.left).toBeCloseTo(name.left, 0)
    expect(field.left).toBeGreaterThan(state.right)
    expect(field.right).toBeLessThan(send.left)
    expect(send.right).toBeCloseTo(row.right, 0)
    // One line tall, and the send glyph sits on that same line.
    expect(field.h).toBeLessThan(30)
    expect(Math.abs(send.top + send.h / 2 - (field.top + field.h / 2))).toBeLessThan(2)
    // It is the row's second line: the pill, the numbers and the two glyphs keep the row they were on.
    expect(note.top).toBeGreaterThan(pill.bottom)
    expect(note.left).toBeCloseTo(go.left + 6 + state.w + 7, 0)
    // One line: the pill shares the band with the jump button beside it, not with the field below.
    expect(band(pill, go)).toBeGreaterThan(8)
    expect(band(pill, thread)).toBeGreaterThan(8)
    expect(band(thread, remove)).toBeGreaterThan(8)
    expect(pill.right).toBeLessThan(thread.left)
    expect(thread.right).toBeLessThan(remove.left)
    // Nothing pushed sideways by the field taking the row's width.
    expect(await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0)
  } finally {
    await browser.close()
  }
})

it.skipIf(skip)('leaves the finished row a single line while the follow up field is shut', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const p = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    await p.setContent(page(ROW(false)))

    const row = await box(p, '.work-row')
    const go = await box(p, '.work-row__go')
    const pill = await box(p, '.steps__ask-pill')
    const remove = await box(p, '.work-row__remove')
    // Shut, the row is the flex line it always was: every part of it shares one band, and the pill sits
    // between the name's own line and the two glyphs, where a working row carries its steer.
    expect(band(go, pill)).toBeGreaterThan(8)
    expect(band(pill, remove)).toBeGreaterThan(8)
    expect(pill.right).toBeLessThan(boxRight(await box(p, '.work-row__thread-btn')))
    expect(await p.locator('.steps__ask-note').count()).toBe(0)
    expect(row.h).toBeLessThan(30)
  } finally {
    await browser.close()
  }
})

it.skipIf(skip)('keeps the field and its glyph inside a 420 px window', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const p = await browser.newPage({ viewport: { width: 420, height: 800 } })
    await p.setContent(page(ROW(true)))

    const row = await box(p, '.work-row')
    const name = await box(p, '.work-row__name')
    const field = await box(p, '.steps__ask-note--row input')
    const send = await box(p, '.steps__ask-send')
    expect(field.left).toBeCloseTo(name.left, 0)
    expect(send.right).toBeCloseTo(row.right, 0)
    expect(field.w).toBeGreaterThan(60)
    const measured = await p.evaluate(() => ({ page: document.documentElement.scrollWidth, window: window.innerWidth }))
    expect(measured.page).toBeLessThanOrEqual(measured.window)
  } finally {
    await browser.close()
  }
})

const boxRight = (b: { right: number }): number => b.right
