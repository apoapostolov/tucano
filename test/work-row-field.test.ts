// The work drawer's one-line field, laid out as WorkDrawer.tsx draws it and measured in Chromium:
// pressing Steer on a working row, or Follow on a done one, opens a field on that row's own second line,
// one line tall, from where its words start to the row's right edge, with a send glyph at that end. The
// row stays one line while the field is shut. Adapted from the 0.2.44 steer-row-field and
// follow-up-row-field tests to this driver's row (no session name; the dot and state glyph set the inset).
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')

// `done`: a finished row with its state glyph and the Follow pill; otherwise a working row with the
// pulsing dot and Steer. `open`: the one-line field drawn under the pill (WorkDrawer's `steps__ask-note--row`).
const ROW = (done: boolean, open: boolean): string => `
  <div class="work-drawer is-open"><div class="work-drawer__list">
    <div class="work-row ${done ? 'work-row--done' : ''}">
      <button type="button" class="work-row__go">
        ${done ? '<span class="work-row__state work-row__state--ok"><svg width="11" height="11"></svg></span>' : '<span class="work-row__dot"></span>'}
        <span class="work-row__text">fix the line under the header so it never wraps</span>
      </button>
      <span class="work-row__meta">${done ? '' : '1m 59s'}</span>
      <div class="${done ? 'work-row__follow' : 'work-row__steer'}">
        <div class="steps__ask steps__ask--${done ? 'down' : 'pointer'}">
          <button type="button" class="steps__ask-pill" aria-expanded="${open}"><svg width="11" height="11"></svg><span class="steps__ask-pill__word">${done ? 'Follow' : 'Steer'}</span></button>
          ${open ? `<div class="steps__ask-note steps__ask-note--row">
            <input placeholder="${done ? 'What next?' : 'How should it go on?'}" aria-label="a row note">
            <button type="button" class="icon-btn icon-btn--sm steps__ask-send" disabled aria-label="Send"><svg width="12" height="12"></svg></button>
          </div>` : ''}
        </div>
      </div>
      <button type="button" class="icon-btn icon-btn--sm work-row__thread-btn"><svg width="12" height="12"></svg></button>
      <button type="button" class="icon-btn icon-btn--sm ${done ? 'work-row__remove' : 'work-row__stop'}"><svg width="12" height="12"></svg></button>
    </div>
  </div></div>`

const page = (body: string): string =>
  `<style>${css}</style><style>body{margin:0}</style><main class="main"><div class="messages" style="width:600px;padding:12px">${body}</div></main>`

const box = (p: import('playwright').Page, sel: string) =>
  p.locator(sel).first().evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, w: r.width, h: r.height }
  })
const band = (a: { top: number; bottom: number }, b: { top: number; bottom: number }) => Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)

const skip = !existsSync(chromium.executablePath())

for (const [label, done] of [['Steer', false], ['Follow', true]] as const) {
  it.skipIf(skip)(`${label}: the open field is the row's one second line, from the words to the row's end`, async () => {
    const browser = await chromium.launch({ headless: true })
    try {
      const p = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await p.setContent(page(ROW(done, true)))
      const row = await box(p, '.work-row')
      const words = await box(p, '.work-row__text')
      const dot = await box(p, done ? '.work-row__state' : '.work-row__dot')
      const pill = await box(p, '.steps__ask-pill')
      const thread = await box(p, '.work-row__thread-btn')
      const stop = await box(p, done ? '.work-row__remove' : '.work-row__stop')
      const note = await box(p, '.steps__ask-note--row')
      const field = await box(p, '.steps__ask-note--row input')
      const send = await box(p, '.steps__ask-send')

      expect(field.left).toBeCloseTo(words.left, 0) // starts where the prompt text starts, past the glyph
      expect(field.left).toBeGreaterThan(dot.right)
      expect(send.right).toBeCloseTo(row.right, 0) // ends at the row's right edge
      expect(field.right).toBeLessThan(send.left)
      expect(field.h).toBeLessThan(30) // one line, never a textarea
      expect(Math.abs(send.top + send.h / 2 - (field.top + field.h / 2))).toBeLessThan(2)
      expect(note.top).toBeGreaterThan(pill.bottom) // the row's second line
      expect(band(pill, thread)).toBeGreaterThan(8) // first line untouched
      expect(band(thread, stop)).toBeGreaterThan(8)
      expect(field.w).toBeGreaterThan(60)
      expect(await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0)
    } finally {
      await browser.close()
    }
  })

  it.skipIf(skip)(`${label}: the row stays one line while the field is shut`, async () => {
    const browser = await chromium.launch({ headless: true })
    try {
      const p = await browser.newPage({ viewport: { width: 1280, height: 800 } })
      await p.setContent(page(ROW(done, false)))
      const row = await box(p, '.work-row')
      const pill = await box(p, '.steps__ask-pill')
      const stop = await box(p, done ? '.work-row__remove' : '.work-row__stop')
      expect(band(pill, stop)).toBeGreaterThan(8)
      expect(await p.locator('.steps__ask-note').count()).toBe(0)
      expect(row.h).toBeLessThan(30)
    } finally {
      await browser.close()
    }
  })

  it.skipIf(skip)(`${label}: field and glyph stay inside a 420 px window`, async () => {
    const browser = await chromium.launch({ headless: true })
    try {
      const p = await browser.newPage({ viewport: { width: 420, height: 800 } })
      await p.setContent(page(ROW(done, true)))
      const row = await box(p, '.work-row')
      const words = await box(p, '.work-row__text')
      const field = await box(p, '.steps__ask-note--row input')
      const send = await box(p, '.steps__ask-send')
      expect(field.left).toBeCloseTo(words.left, 0)
      expect(send.right).toBeCloseTo(row.right, 0)
      expect(field.w).toBeGreaterThan(60)
      const measured = await p.evaluate(() => ({ page: document.documentElement.scrollWidth, window: window.innerWidth }))
      expect(measured.page).toBeLessThanOrEqual(measured.window)
    } finally {
      await browser.close()
    }
  })
}
