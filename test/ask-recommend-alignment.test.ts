// The review footer has one recommendation control: the moved button, first in the row.
// The old inline checkbox with the same label and action is gone.
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')
const source = readFileSync(new URL('../src/renderer/src/components/Decisions.tsx', import.meta.url), 'utf8')

// The markup mirrors the Review footer: moved button, hint, Send, Cancel.
const FOOT = `
  <div class="ask ask--answer">
    <div class="ask__body">
      <div class="ask__title">Check before sending</div>
      <div class="ask__foot">
        <div class="ask__recommend ask__recommend--foot">
          <button class="btn btn--sm">Go with the recommendation</button>
        </div>
        <span class="ask__hint">Click an answer to change it</span>
        <button class="btn btn--primary btn--sm">Send</button>
        <button class="btn btn--ghost btn--sm">Cancel</button>
      </div>
    </div>
  </div>`

it('keeps one recommendation action in the review footer', () => {
  const review = source.slice(source.indexOf('function Review('), source.indexOf('function AnswersSummary('))
  expect(review).toContain('ask__recommend--foot')
  expect(review).toContain('{recommend}')
  expect(source.split('Go with the recommendation').length - 1).toBe(1)
  expect(review).not.toContain('ask__recommend--inline')
  expect(review).not.toContain('type="checkbox"')
})

for (const width of [1440, 420]) {
  it.skipIf(!existsSync(chromium.executablePath()))(`leads the review footer at ${width} px`, async () => {
    const browser = await chromium.launch({ headless: true })
    try {
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      await page.setContent(`<style>${css}</style><body style="padding:12px">${FOOT}</body>`)
      await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important }' })
      await page.evaluate(() => document.fonts.ready.then(() => undefined))
      const boxes = await page.evaluate(() => {
        const foot = document.querySelector('.ask__foot')!
        const r = (el: Element) => {
          const b = el.getBoundingClientRect()
          return { left: b.left, right: b.right, top: b.top, bottom: b.bottom }
        }
        const moved = foot.querySelector('.ask__recommend--foot')!
        return {
          foot: r(foot),
          moved: r(moved),
          children: [...foot.children].map((el) => ({ cls: el.className, ...r(el) })),
          overflow: document.documentElement.scrollWidth - window.innerWidth
        }
      })
      expect(boxes.overflow).toBeLessThanOrEqual(0.5)
      expect(boxes.moved.right).toBeLessThanOrEqual(boxes.foot.right + 0.5)
      const onMovedRow = boxes.children.filter((b) => Math.abs(b.top - boxes.moved.top) < 8)
      expect(onMovedRow[0]?.cls).toContain('ask__recommend--foot')
      if (width === 1440) expect(Math.abs(boxes.moved.left - boxes.foot.left)).toBeLessThanOrEqual(0.5)
    } finally {
      await browser.close()
    }
  })
}
