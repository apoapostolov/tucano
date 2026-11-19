// The steps window (Settings › General: the latest few): a reply's steps scroll down and never
// sideways. A box that scrolls one way computes the other to `auto`, so one step wider than the
// window — a long path, a URL, a label that cannot break — added a horizontal bar under the list.
// Measured in a browser, against the sheet as it ships.
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')

const row = (label: string, detail: string): string =>
  `<li class="step step--tool"><span class="step__icon"></span><span class="step__label">${label}</span><span class="step__detail">${detail}</span></li>`
const LONG_LABEL = 'Ran the whole suite again on the packaged build to see what the last change did to it'
const LONG_DETAIL = 'C:/git-ext/tucano-wt/steps-fix/src/renderer/src/components/Conversation.tsx:1234'
const rows = Array.from({ length: 24 }, (_, i) => row(`${LONG_LABEL} ${i + 1}`, LONG_DETAIL)).join('')

const markup = (): string => `
  <style>${css}</style>
  <article class="msg msg--agent is-left-stack"><div class="msg__gutter"></div><div class="msg__body">
    <div class="steps is-open is-working steps--latest">
      <div class="steps__body">
        <ol class="steps__list">${rows}</ol>
      </div>
    </div>
  </div></article>`

it.skipIf(!existsSync(chromium.executablePath()))('a long step scrolls down inside its window and never sideways', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    for (const width of [1280, 900]) {
      const page = await browser.newPage()
      await page.setViewportSize({ width, height: 880 })
      await page.setContent(markup())
      const m = await page.evaluate(() => {
        const list = document.querySelector<HTMLElement>('.steps__list')!
        const doc = document.documentElement
        return {
          sideways: list.scrollWidth - list.clientWidth,
          down: list.scrollHeight - list.clientHeight,
          pageSideways: doc.scrollWidth - doc.clientWidth,
          overflowX: getComputedStyle(list).overflowX
        }
      })
      // Nothing wider than the window, in the list or on the page, and it still scrolls down.
      expect({ width, sideways: m.sideways, page: m.pageSideways }).toEqual({ width, sideways: 0, page: 0 })
      expect(m.down).toBeGreaterThan(50)
      expect(m.overflowX).toBe('hidden')
      await page.close()
    }
  } finally {
    await browser.close()
  }
})

it('says in the sheet that the window goes one way only', () => {
  expect(css).toMatch(/\.steps--latest \.steps__list\s*\{[^}]*overflow-y:\s*auto/)
  expect(css).toMatch(/\.steps--latest \.steps__list\s*\{[^}]*overflow-x:\s*hidden/)
  expect(css).toMatch(/\.steps--latest \.step__detail[\s\S]{0,200}overflow-wrap:\s*anywhere/)
})
