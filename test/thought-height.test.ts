// The reasoning block's height, measured in a browser: 6, 12 or 18 lines before it scrolls, which is
// what the setting in Settings › Conversations says. Upstream 0.2.45 replaced the block (its own head,
// its own fold) and left a fixed `max-height` on the box that scrolls, which outranked the setting and
// pinned all three sizes to the same height. The block carries the size as `data-size` and the rule
// that reads it sits on `.thought__text`, the box that scrolls.
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')
const LINES = { sm: 6, md: 12, lg: 18 } as const

// Enough reasoning to overflow the largest size: thirty lines of it.
const LONG = Array.from({ length: 30 }, (_, i) => `line ${i + 1} of what it thought before answering.`).join('\n')

// The block as the conversation draws it (Conversation.tsx, `Thought`): the head over it, the size on
// `data-size`, the text in `.thought__text`. `size` is left out for the block drawn before any setting
// was ever read.
const markup = (size?: keyof typeof LINES): string => `
  <style>${css}</style>
  <article class="msg msg--agent is-left-stack"><div class="msg__gutter"></div><div class="msg__body">
    <div class="steps is-open is-working steps--all">
      <button type="button" class="thought__head"><span class="thought__label">Pensando</span></button>
      <div class="thought is-open is-working"${size ? ` data-size="${size}"` : ''}>
        <div class="thought__text">${LONG}</div>
      </div>
    </div>
  </div></article>`

it.skipIf(!existsSync(chromium.executablePath()))('shows 6, 12 or 18 lines before it scrolls, as the setting says', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1280, height: 880 })
    const shown: Record<string, number> = {}
    for (const size of ['sm', 'md', 'lg'] as const) {
      await page.setContent(markup(size))
      const m = await page.evaluate(() => {
        const text = document.querySelector<HTMLElement>('.thought__text')!
        const cs = getComputedStyle(text)
        const lineHeight = parseFloat(cs.lineHeight) // the block's own 12px at line-height 1.55
        const content = text.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
        return {
          lines: cs.getPropertyValue('--thought-lines').trim(),
          shown: Math.round(content / lineHeight),
          hidden: text.scrollHeight - text.clientHeight
        }
      })
      // The count the setting names, not a fixed six: the var resolves to it and the box shows it.
      expect({ size, lines: m.lines, shown: m.shown }).toEqual({ size, lines: String(LINES[size]), shown: LINES[size] })
      // It really is longer than what it shows, so the count is a cap and not the whole text.
      expect(m.hidden).toBeGreaterThan(20)
      shown[size] = m.shown
    }
    // Three sizes, three heights: no size may quietly be another one.
    expect(new Set(Object.values(shown)).size).toBe(3)
  } finally {
    await browser.close()
  }
})

it.skipIf(!existsSync(chromium.executablePath()))('falls back to the middle size when the block carries no size', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1280, height: 880 })
    await page.setContent(markup())
    const lines = await page.evaluate(() => {
      const text = document.querySelector<HTMLElement>('.thought__text')!
      const cs = getComputedStyle(text)
      const content = text.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      return Math.round(content / parseFloat(cs.lineHeight))
    })
    expect(lines).toBe(LINES.md)
  } finally {
    await browser.close()
  }
})
