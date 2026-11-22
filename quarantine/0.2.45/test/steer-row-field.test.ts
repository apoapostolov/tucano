// Steering from a row of the drawer (Conversation.tsx, WorkDrawer + PillPrompt place="row"):
// pressing Steer on a working session opens a field on the row's own second line — one line tall, as
// wide as the row, starting where the session's name starts (past the pulsing dot, not at its edge),
// with one glyph at that line's right end that sends it. Laid out as the app draws it and measured in
// Chromium: the numbers are what this pins, at a window's width and at a phone's.
import { existsSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')

const ROW = (open: boolean): string => `
  <div class="work-drawer is-open">
    <div class="work-drawer__list">
      <div class="work-row">
        <button type="button" class="work-row__go">
          <span class="work-row__dot" aria-hidden></span>
          <span class="work-row__name">Astra</span>
          <span class="work-row__text">· fix the line under the header so it never wraps</span>
        </button>
        <span class="work-row__meta">1m 59s</span>
        <div class="work-row__steer">
          <div class="steps__ask steps__ask--pointer">
            <button type="button" class="steps__ask-pill" aria-expanded="${open}">Steer</button>
            ${
              open
                ? `<div class="steps__ask-note steps__ask-note--row">
                     <input placeholder="How should it go on?" aria-label="A steer for this reply">
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
        <button type="button" class="icon-btn icon-btn--sm work-row__stop" aria-label="Stop this reply">
          <svg class="icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18" /></svg>
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

it.skipIf(skip)('puts the open steer field on the row’s second line, from the name to the row’s end', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const p = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    await p.setContent(page(ROW(true)))

    const row = await box(p, '.work-row')
    const go = await box(p, '.work-row__go')
    const dot = await box(p, '.work-row__dot')
    const name = await box(p, '.work-row__name')
    const meta = await box(p, '.work-row__meta')
    const pill = await box(p, '.steps__ask-pill')
    const thread = await box(p, '.work-row__thread-btn')
    const stop = await box(p, '.work-row__stop')
    const note = await box(p, '.steps__ask-note--row')
    const field = await box(p, '.steps__ask-note--row input')
    const send = await box(p, '.steps__ask-send')

    // The field starts where the name starts — past the dot, not at its edge — and ends at the row's
    // own right end, which is what "full width under the entry" means for the row it hangs under.
    expect(field.left).toBeCloseTo(name.left, 0)
    expect(field.left).toBeGreaterThan(dot.right)
    expect(field.right).toBeLessThan(send.left)
    expect(send.right).toBeCloseTo(row.right, 0)
    // One line tall: the field never grows into a textarea, and the send glyph sits on that same line.
    expect(field.h).toBeLessThan(30)
    expect(Math.abs(send.top + send.h / 2 - (field.top + field.h / 2))).toBeLessThan(2)
    // It is the row's second line, and the first line is untouched: the pill, the numbers and the two
    // glyphs keep the row they were on, and only the field goes under them.
    expect(note.top).toBeGreaterThan(pill.bottom)
    expect(note.left).toBeCloseTo(go.left + 6 + 6 + 7, 0)
    expect(band(pill, meta)).toBeGreaterThan(8)
    expect(band(pill, thread)).toBeGreaterThan(8)
    expect(band(thread, stop)).toBeGreaterThan(8)
    expect(pill.right).toBeLessThan(thread.left)
    expect(thread.right).toBeLessThan(stop.left)
    // Nothing pushed sideways by the field taking the row's width.
    expect(await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0)
  } finally {
    await browser.close()
  }
})

it.skipIf(skip)('leaves the row a single line while the steer field is shut', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const p = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    await p.setContent(page(ROW(false)))

    const row = await box(p, '.work-row')
    const pill = await box(p, '.steps__ask-pill')
    const meta = await box(p, '.work-row__meta')
    const stop = await box(p, '.work-row__stop')
    // Shut, the row is the flex line it always was: every part of it shares one band.
    expect(band(meta, pill)).toBeGreaterThan(8)
    expect(band(pill, stop)).toBeGreaterThan(8)
    expect(await p.locator('.steps__ask-note').count()).toBe(0)
    // A shut row keeps its own height, so opening a field is the only thing that gives it a second line.
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
