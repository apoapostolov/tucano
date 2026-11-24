// A reply at work ends where every other reply ends: one footer row under everything it drew, its
// steps and what it thought included, with the pill in that row and the field it opens under the
// pill. The field is the footer's own note (`.msg__meta .retry-note`), the one "Try with
// instructions" opens, so it starts where the footer starts and stops at 560 px instead of running
// on to the message body's edge. Laid out as Conversation.tsx draws it: the steps box with its
// thought block, then the footer row.
import { existsSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')

const REPLY = (open: boolean): string => `
  <article class="msg msg--agent"><div class="msg__gutter"></div><div class="msg__body">
    <div class="steps is-open is-working">
      <button class="steps__toggle" aria-expanded="true">
        <span class="steps__pulse"></span>
        <span class="steps__summary">Working · 2 steps</span>
        <span class="steps__elapsed">4s</span>
        <span class="btn btn--xs btn--ghost steps__stop">Stop</span>
      </button>
      <ol class="steps__list">
        <li class="step step--tool step--done"><span class="step__icon"></span><span class="step__label">Read steer-demo</span></li>
        <li class="step step--tool step--running"><span class="step__icon"></span><span class="step__label">Reading the two last commits</span></li>
      </ol>
      <div class="thought is-open is-working">
        <button class="thought__head" aria-expanded="true"><span class="thought__label">Thinking</span></button>
        <div class="thought__text">the request has two parts; the first one is the count.</div>
      </div>
    </div>
    <div class="msg__meta">
      <button class="steps__ask-pill steps__steer-pill" aria-expanded="${open}">
        <span class="steps__ask-pill__word">Steer</span>
      </button>
      ${open ? `<div class="retry-note">
        <textarea rows="2" aria-label="A steer for the reply running now" placeholder="How should it go on?"></textarea>
        <div class="retry-note__row">
          <button class="btn btn--primary btn--xs" disabled>Steer</button>
          <button class="link">Cancel</button>
          <span class="muted small">Ctrl+Enter sends</span>
        </div>
      </div>` : ''}
    </div>
  </div></article>`

const box = (page: import('playwright').Page, sel: string) =>
  page.locator(sel).first().evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, w: r.width, h: r.height }
  })

it.skipIf(!existsSync(chromium.executablePath()))('puts the steer under the thought block, not between the steps and it', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 880 } })
    await page.setContent(`<style>${css}</style><main class="main"><div class="messages">${REPLY(true)}</div></main>`)

    const chain = await box(page, '.steps')
    const thought = await box(page, '.thought')
    const foot = await box(page, '.msg__meta')
    const pill = await box(page, '.steps__steer-pill')
    const field = await box(page, '.retry-note textarea')

    // The whole chain, thought block included, is above the footer: the steer is not inside it.
    expect(foot.top).toBeGreaterThanOrEqual(thought.bottom)
    expect(chain.bottom).toBeLessThanOrEqual(foot.top + 1)
    expect(await page.locator('.steps .steps__steer-pill').count()).toBe(0)
    expect(await page.locator('.steps .retry-note').count()).toBe(0)

    // The pill opens the row, the field takes the line under it, both from the footer's left edge.
    expect(pill.left).toBeCloseTo(foot.left, 0)
    expect(field.top).toBeGreaterThanOrEqual(pill.bottom)
    expect(field.left).toBeCloseTo(foot.left, 0)
    // It stops at the same width the retry note stops at, instead of at the message body's edge.
    expect(field.w).toBeCloseTo(Math.min(foot.w, 560), 0)

    // No sideways scroll while the field is open at either width, and it keeps the footer's measure.
    for (const width of [1280, 420]) {
      await page.setViewportSize({ width, height: 880 })
      const scroll = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }))
      expect(scroll.scrollWidth).toBeLessThanOrEqual(scroll.clientWidth)
      const narrowFoot = await box(page, '.msg__meta')
      const narrowField = await box(page, '.retry-note textarea')
      expect(narrowField.left).toBeCloseTo(narrowFoot.left, 0)
      expect(narrowField.w).toBeCloseTo(Math.min(narrowFoot.w, 560), 0)
    }
    expect(chain.w).toBeCloseTo(600, 0)
  } finally {
    await browser.close()
  }
})

it.skipIf(!existsSync(chromium.executablePath()))('keeps the steer a pill in that row while its field is closed', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 880 } })
    await page.setContent(`<style>${css}</style><main class="main"><div class="messages">${REPLY(false)}</div></main>`)
    const foot = await box(page, '.msg__meta')
    const pill = await box(page, '.steps__steer-pill')
    const thought = await box(page, '.thought')
    // The same 22 px pill Continue and Try again are, at the footer's left, under the thought block.
    expect(pill.left).toBeCloseTo(foot.left, 0)
    expect(pill.h).toBeCloseTo(22, 0)
    expect(pill.top).toBeGreaterThanOrEqual(thought.bottom)
    expect(await page.locator('.retry-note').count()).toBe(0)
  } finally {
    await browser.close()
  }
})
