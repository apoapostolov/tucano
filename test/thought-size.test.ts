// The reasoning block's size setting (6 / 12 / 18 lines) and its width against the steps' chain.
// Laid out as the app draws it (Conversation.tsx, RunSteps): `.thought` is a child of `.steps`, beside
// `.steps__list`, with the size on `data-size`. Two things are pinned here, both of them measured in a
// browser rather than read off the sheet:
//   - the text shows the number of lines the setting names before it scrolls. A fixed `max-height` on
//     `.thought__text` (the six lines it was before the setting existed) outranked the block's own
//     height and pinned all three sizes to six lines.
//   - the block's text runs the same width as a step's row: the chain's own column, from the row's left
//     edge to the chain's right edge, not 10 px in from each side.
//   - the name over it is one dim line in full caps, starting on the block's own text edge, with nothing
//     to click and no background of its own: the header the refactor removed came back as the word only.
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')
const LINES = { sm: 6, md: 12, lg: 18 } as const
const LINE_HEIGHT = 12 * 1.55 // the block's own font size and line-height

// Enough reasoning to overflow the largest size: 30 lines of it.
const LONG = Array.from({ length: 30 }, (_, i) => `line ${i + 1} of what it thought before answering.`).join('\n')

const markup = (size: keyof typeof LINES): string => `
  <style>${css}</style>
  <article class="msg msg--agent is-left-stack"><div class="msg__gutter"></div><div class="msg__body">
    <div class="steps is-open is-working steps--all">
      <div class="steps__body">
        <ol class="steps__list">
          <li class="step step--tool step--running"><span class="step__icon"></span><span class="step__label">Reading the two last commits</span></li>
        </ol>
      </div>
      <div class="thought__head">Pensando</div>
      <div class="thought is-working" data-size="${size}">
        <div class="thought__text">${LONG}</div>
      </div>
    </div>
  </div></article>`

it.skipIf(!existsSync(chromium.executablePath()))('shows 6, 12 or 18 lines before it scrolls, and as wide as a step row', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1280, height: 880 })
    for (const size of ['sm', 'md', 'lg'] as const) {
      await page.setContent(markup(size))
      const m = await page.evaluate(() => {
        const thought = document.querySelector('.thought')!
        const text = document.querySelector('.thought__text')!
        const row = document.querySelector('.step')!
        const list = document.querySelector('.steps__list')!
        const rect = (el: Element) => el.getBoundingClientRect()
        // The block scrolls; the text inside it is the content. What it shows is the block's height,
        // less the padding around the text: there is no header over it any more.
        const padding = parseFloat(getComputedStyle(thought).paddingTop) + parseFloat(getComputedStyle(thought).paddingBottom)
        return {
          textHeight: thought.clientHeight - padding,
          hidden: thought.scrollHeight - thought.clientHeight,
          lines: getComputedStyle(thought).getPropertyValue('--thought-lines').trim(),
          textBox: { l: Math.round(rect(text).left), r: Math.round(rect(text).right) },
          rowBox: { l: Math.round(rect(row).left), r: Math.round(rect(row).right) },
          blockBox: { l: Math.round(rect(thought).left), r: Math.round(rect(thought).right) },
          listBox: { l: Math.round(rect(list).left), r: Math.round(rect(list).right) },
          head: (() => {
            const head = document.querySelector('.thought__head')!
            const cs = getComputedStyle(head)
            return {
              text: head.textContent,
              left: Math.round(rect(head).left),
              bottom: Math.round(rect(head).bottom),
              transform: cs.textTransform,
              size: parseFloat(cs.fontSize),
              background: cs.backgroundColor
            }
          })(),
          blockTop: Math.round(rect(thought).top),
          blockBackground: getComputedStyle(thought).backgroundColor,
          clickable: thought.querySelectorAll('button, [role="button"]').length + document.querySelectorAll('.thought__head button').length
        }
      })
      // The number of whole lines it shows: the setting's own count, not a fixed six.
      expect({ size, lines: m.lines, shown: Math.round(m.textHeight / LINE_HEIGHT) }).toEqual({ size, lines: String(LINES[size]), shown: LINES[size] })
      // It really is longer than what it shows, so the count above is a cap and not the whole text.
      expect(m.hidden).toBeGreaterThan(LINE_HEIGHT * 2)
      // The same column as the steps' own rows, and the same box as the chain's list.
      expect({ size, ...m.textBox }).toEqual({ size, ...m.rowBox })
      expect({ size, ...m.blockBox }).toEqual({ size, ...m.listBox })
      // The name over it: full caps, small, on the block's own text edge, in a line of its own above it.
      expect({ size, text: m.head.text, left: m.head.left, transform: m.head.transform, font: m.head.size }).toEqual({
        size,
        text: 'Pensando',
        left: m.textBox.l,
        transform: 'uppercase',
        font: 10
      })
      expect(m.head.bottom).toBeLessThanOrEqual(m.blockTop)
      // Nothing to click, and no background of its own — not the name, not the block.
      expect({ size, clickable: m.clickable, headBg: m.head.background, blockBg: m.blockBackground }).toEqual({
        size,
        clickable: 0,
        headBg: 'rgba(0, 0, 0, 0)',
        blockBg: 'rgba(0, 0, 0, 0)'
      })
    }
  } finally {
    await browser.close()
  }
})
