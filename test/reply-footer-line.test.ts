import { existsSync, readFileSync } from 'node:fs'
import { chromium, type Locator } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')

it('draws the thread pill before the provider receipt in ReplyFooter', () => {
  const source = readFileSync(new URL('../src/renderer/src/components/Conversation.tsx', import.meta.url), 'utf8')
  const footer = source.slice(source.indexOf('export function ReplyFooter('), source.indexOf('function Steer('))
  expect(footer.indexOf('{threadPill}')).toBeGreaterThan(0)
  expect(footer.indexOf('{threadPill}')).toBeLessThan(footer.indexOf('<ReceiptLine'))
})

const DOT = '<span class="thread-link__dot" aria-label="2 new"></span>'
const FACES = (n: number): string =>
  `<span class="thread-link__faces" aria-hidden>${Array.from({ length: n }, () => '<span class="avatar" style="width:18px;height:18px"></span>').join('')}</span>`
const CHEVRON =
  '<svg class="icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>'
const REPLY_GLYPH =
  '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 17H7a4 4 0 0 1 0-8h10M13 7l-4 5 4 5"></path></svg>'
const COPY_GLYPH =
  '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>'

// ReplyFooter draws the thread pill before the provider receipt and reply glyph.
const ROW = `
  <div class="msg__meta">
    <button class="thread-link" aria-label="Open the thread: 12 replies">
      ${DOT}${FACES(2)}<strong class="thread-link__count">12 replies<span class="thread-link__fresh"> · 2 new</span></strong>
      <span class="thread-link__when"><span class="thread-link__ago">2m</span><span class="thread-link__see">View thread</span></span>
      ${CHEVRON}
    </button>
    <button class="retry">Continue</button>
    <button class="retry">Follow</button>
    <div class="receipt"><button class="receipt__line">Sonnet · 12.4k tokens · 7s</button></div>
    <div class="msg__actions">
      <button class="msg__copy" title="Copy as Markdown" aria-label="Copy as Markdown">${COPY_GLYPH}</button>
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
  it.skipIf(!existsSync(chromium.executablePath()))(`keeps the thread pill first and left-aligned: ${c.name}`, async () => {
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
      const copy = await box(row.locator('.msg__copy'))
      const receipt = await box(row.locator('.receipt'))
      const style = await row.locator('.msg__meta').evaluate((el) => {
        const css = getComputedStyle(el)
        return { columnGap: css.columnGap, rowGap: css.rowGap }
      })
      expect(style).toEqual({ columnGap: '10px', rowGap: '6px' })
      expect(await row.locator('.msg__meta > .thread-link + .retry + .retry + .receipt').count()).toBe(1)
      const firstAction = await box(row.locator('.retry').nth(0))
      const secondAction = await box(row.locator('.retry').nth(1))
      for (const [previous, next] of [[pill, firstAction], [firstAction, secondAction]] as const) {
        if (next.top >= previous.bottom) {
          expect(Math.abs(next.left - meta.left)).toBeLessThanOrEqual(0.5)
          // The thread pill can be taller than an action sharing its line.
          const lineBottom = Math.max(...[pill, firstAction, secondAction]
            .filter((item) => item.top < next.top && item.bottom > previous.top)
            .map((item) => item.bottom))
          expect(Math.abs(next.top - lineBottom - 6)).toBeLessThanOrEqual(0.5)
        } else {
          expect(Math.abs(next.left - previous.right - 10)).toBeLessThanOrEqual(0.5)
        }
      }
      if (c.width === 420) expect(receipt.top).toBeGreaterThanOrEqual(pill.bottom)
      expect(Math.abs(pill.left - meta.left)).toBeLessThanOrEqual(0.5)
      expect(receipt.left >= pill.right || receipt.top >= pill.bottom).toBe(true)
      if (receipt.top >= secondAction.bottom) {
        expect(Math.abs(receipt.left - meta.left)).toBeLessThanOrEqual(0.5)
      }
      expect(Math.abs(glyph.right - meta.right)).toBeLessThanOrEqual(0.5)
      expect(glyph.left).toBeGreaterThanOrEqual(pill.right)
      expect(pill.top).toBeGreaterThanOrEqual(meta.top - 0.5)
      expect(glyph.bottom).toBeLessThanOrEqual(meta.bottom + 0.5)
      // Copy as Markdown rides the same right-hand group, immediately left of the reply glyph.
      expect(await row.locator('.msg__actions > .msg__copy + .msg__replyto').count()).toBe(1)
      expect(copy.right).toBeLessThanOrEqual(glyph.left)
      expect(Math.abs(glyph.left - copy.right - 10)).toBeLessThanOrEqual(0.5)
      expect(copy.top).toBeLessThan(glyph.bottom)
      expect(glyph.top).toBeLessThan(copy.bottom)
      expect(copy.top).toBeGreaterThanOrEqual(meta.top - 0.5)
      expect(copy.bottom).toBeLessThanOrEqual(meta.bottom + 0.5)
    } finally {
      await browser.close()
    }
  })
}
