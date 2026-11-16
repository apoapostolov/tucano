// The steer's field, open: it takes the width of the reply's chain, not a column in the middle of it,
// and it goes under Pause and Steer, which keep the row they were on. Laid out as the app draws it
// (Conversation.tsx, RunSteps + PillPrompt). Left to itself, the note took the width of the textarea's
// own twenty columns — 200 px in a 600 px chain; given the row, it carried the steer pill down with it.
// Both are what this pins.
import { existsSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')

const CHAIN = (open: boolean, summary = 'Working · 2 steps'): string => `
  <article class="msg msg--agent is-left-stack"><div class="msg__gutter"></div><div class="msg__body">
    <div class="steps is-open is-working steps--all">
      <div class="steps__header">
        <button type="button" class="steps__toggle" aria-expanded="true">
          <span class="steps__chev">›</span>
          <span class="steps__pulse"></span>
          <span class="steps__summary">${summary}</span>
          <span class="steps__elapsed">4s</span>
        </button>
        <button type="button" class="btn btn--xs btn--ghost steps__stop">Stop</button>
      </div>
      <div class="steps__body">
        <button type="button" class="steps__rail" aria-label="Fold the steps"></button>
        <ol class="steps__list">
          <li class="step step--tool step--done"><span class="step__icon"></span><span class="step__label">Read steer-demo</span></li>
          <li class="step step--tool step--running"><span class="step__icon"></span><span class="step__label">Reading the two last commits</span></li>
        </ol>
      </div>
      <div class="thought"><div class="thought__text">lendo o arquivo antes de responder</div></div>
      <div class="steps__hold">
        <button type="button" class="steps__ask-pill">Pause</button>
        <div class="steps__ask steps__ask--pointer">
          <button type="button" class="steps__ask-pill" aria-expanded="${open}">Steer</button>
          ${
            open
              ? `<div class="steps__ask-note">
                   <textarea placeholder="How should it go on?" aria-label="A steer for the reply running now"></textarea>
                   <div class="steps__ask-row">
                     <button type="button" class="btn btn--primary btn--xs" disabled>Steer</button>
                     <button type="button" class="link">Cancel</button>
                     <span class="muted small">Ctrl+Enter sends</span>
                   </div>
                 </div>`
              : ''
          }
        </div>
      </div>
    </div>
  </div></article>`

const box = (page: import('playwright').Page, sel: string) =>
  page.locator(sel).first().evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, w: r.width, h: r.height }
  })

it.skipIf(!existsSync(chromium.executablePath()))('gives the open steer field the chain’s whole width, not the textarea’s twenty columns', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 880 } })
    await page.setContent(`<style>${css}</style><main class="main"><div class="messages">${CHAIN(true)}</div></main>`)

    const chain = await box(page, '.steps')
    const pause = await box(page, '.steps__hold > .steps__ask-pill')
    const pill = await box(page, '.steps__hold .steps__ask .steps__ask-pill')
    const field = await box(page, '.steps__ask-note textarea')
    const note = await box(page, '.steps__ask-note')
    const row = await box(page, '.steps__ask-row')

    // The chain's content box: its own width less the footer's margin and the indent the steps have.
    const contentLeft = chain.left + 3 + 14
    expect(chain.w).toBeGreaterThan(500)
    // Full width: the field ends where the chain ends and starts where the steps' text starts.
    expect(field.right).toBeCloseTo(chain.right, 0)
    expect(field.left).toBeCloseTo(contentLeft, 0)
    expect(field.w).toBeCloseTo(chain.w - 17, 0)
    expect(note.w).toBeCloseTo(chain.w - 17, 0)
    // Under the pills, not beside them: they keep the row they were on.
    expect(field.top).toBeGreaterThan(pill.bottom)
    expect(pill.left).toBeCloseTo(pause.right + 8, 0)
    // Pause and Steer share that row, side by side: the open field must not carry the steer pill down
    // with it, which is what a row-taking wrapper did.
    expect(Math.abs(pause.top - pill.top)).toBeLessThan(1)
    expect(pause.right).toBeLessThan(pill.left)
    // The send row follows the field, as wide as it.
    expect(row.top).toBeGreaterThan(field.bottom)
    expect(row.w).toBeLessThanOrEqual(note.w + 0.5)
    // Nothing pushed sideways by the wider field.
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0)
  } finally {
    await browser.close()
  }
})

it.skipIf(!existsSync(chromium.executablePath()))('keeps Pause and Steer on one row while the field is closed', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 880 } })
    await page.setContent(`<style>${css}</style><main class="main"><div class="messages">${CHAIN(false)}</div></main>`)

    const pause = await box(page, '.steps__hold > .steps__ask-pill')
    const steer = await box(page, '.steps__hold .steps__ask .steps__ask-pill')
    // The same band, beside each other: wrapping the footer must not drop one pill under the other.
    expect(Math.abs(pause.top - steer.top)).toBeLessThan(6)
    expect(pause.right).toBeLessThanOrEqual(steer.left)
    expect(await page.locator('.steps__ask-note').count()).toBe(0)
  } finally {
    await browser.close()
  }
})

it.skipIf(!existsSync(chromium.executablePath()))('keeps the open steer field inside a 420 px window', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 420, height: 880 } })
    await page.setContent(`<style>${css}</style><main class="main"><div class="messages">${CHAIN(true, 'Working · 2 steps of a long run')}</div></main>`)

    const chain = await box(page, '.steps')
    const field = await box(page, '.steps__ask-note textarea')
    const pause = await box(page, '.steps__hold > .steps__ask-pill')
    const steer = await box(page, '.steps__hold .steps__ask .steps__ask-pill')
    expect(field.right).toBeCloseTo(chain.right, 0)
    expect(field.w).toBeCloseTo(chain.w - 17, 0)
    // A phone's width is where a footer wraps first: the two pills still share the row above the field.
    expect(Math.abs(pause.top - steer.top)).toBeLessThan(1)
    expect(field.top).toBeGreaterThan(steer.bottom)
    const measured = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, window: window.innerWidth }))
    expect(measured.page).toBeLessThanOrEqual(measured.window)
  } finally {
    await browser.close()
  }
})
