// The "Go with the recommendation" checkbox is the first thing on the decisions card's footer:
// its input starts at the footer's left edge and shares the Send button's line, at both widths.
import { existsSync, readFileSync } from 'node:fs'
import { chromium, type Locator } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')
const source = readFileSync(new URL('../src/renderer/src/components/Decisions.tsx', import.meta.url), 'utf8')

// The markup is the Review footer, with the same classes, input, icon, hint and buttons.
const FOOT = `
  <div class="ask ask--answer">
    <div class="ask__body">
      <div class="ask__title">Check before sending</div>
      <div class="ask__foot">
        <label class="ask__recommend ask__recommend--inline">
          <input type="checkbox" aria-label="Go with the recommendation" />
          <svg class="icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 13 5 5L20 7"></path></svg>
          Go with the recommendation
        </label>
        <span class="ask__hint">Click an answer to change it</span>
        <button class="btn btn--primary btn--sm">Send</button>
        <button class="btn btn--ghost btn--sm">Cancel</button>
      </div>
    </div>
  </div>`

type Box = { left: number; right: number; top: number; bottom: number; cy: number }
const box = (loc: Locator) =>
  loc.evaluate((el): Box => {
    const r = el.getBoundingClientRect()
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, cy: (r.top + r.bottom) / 2 }
  })

it('keeps the one-click recommendation control as an accessible checkbox', () => {
  const review = source.slice(source.indexOf('function Review('), source.indexOf('function AnswersSummary('))
  expect(review).toContain('<input type="checkbox"')
  expect(review).toContain('onGoRecommended()')
  expect(review).toContain('Go with the recommendation')
})

for (const width of [1440, 420]) {
  it.skipIf(!existsSync(chromium.executablePath()))(`keeps the checkbox at the footer's left, level with Send at ${width} px`, async () => {
    const browser = await chromium.launch({ headless: true })
    try {
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      await page.setContent(`<style>${css}</style><body style="padding:12px">${FOOT}</body>`)
      await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important }' })
      await page.evaluate(() => document.fonts.ready.then(() => undefined))
      const foot = await box(page.locator('.ask__foot'))
      const checkbox = await box(page.locator('.ask__foot input[type="checkbox"]'))
      const send = await box(page.locator('.ask__foot .btn--primary'))
      const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }))
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth + 0.5)
      expect(Math.abs(checkbox.left - foot.left)).toBeLessThanOrEqual(0.5)
      const sameLine = checkbox.top < send.bottom && send.top < checkbox.bottom
      if (sameLine) {
        expect(Math.abs(checkbox.cy - send.cy)).toBeLessThanOrEqual(1)
      } else {
        // When the footer wraps, the checkbox stays on the left, on the line above Send.
        expect(checkbox.bottom).toBeLessThanOrEqual(send.top + 0.5)
        expect(Math.abs(send.left - foot.left)).toBeLessThanOrEqual(0.5)
      }
    } finally {
      await browser.close()
    }
  })
}
