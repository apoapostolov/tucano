// A row's glyphs used to all turn red under the pointer, because one broad `.work-row .icon-btn:hover`
// painted every button in the row with --danger. Red belongs to the presses that destroy — the two x's
// and the trash — and every other glyph (open the thread, start a queued prompt) answers in the app's
// signature orange. Apo, 20 Nov 00:24: "hover on threaded should use signature color, not red color;
// only red color is used for hover over x".
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')

const markup = `
  <div class="work-row" id="running">
    <button class="work-row__go">go</button>
    <button class="icon-btn icon-btn--sm work-row__thread-btn" id="thread">thread</button>
    <button class="icon-btn icon-btn--sm work-row__stop" id="stop">x</button>
  </div>
  <div class="work-row" id="queued">
    <button class="icon-btn icon-btn--sm work-row__thread-btn" id="thread-q">thread</button>
    <button class="icon-btn icon-btn--sm work-row__start" id="start">play</button>
    <button class="icon-btn icon-btn--sm work-row__drop" id="drop">x</button>
  </div>
  <div class="work-row" id="done">
    <button class="icon-btn icon-btn--sm work-row__thread-btn" id="thread-d">thread</button>
    <button class="icon-btn icon-btn--sm work-row__remove" id="remove">trash</button>
  </div>
  <i id="accent" style="color:var(--accent)"></i>
  <i id="danger" style="color:var(--danger)"></i>`

it.skipIf(!existsSync(chromium.executablePath()))('answers the pointer in orange, and only the destroyers in red', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    // The buttons carry --transition-ui; the colour has to be read once it has arrived, not mid-way.
    await page.setContent(`<style>${css}</style><style>.icon-btn{transition:none!important}</style>
      <main style="width:360px">${markup}</main>`)
    const token = (id: string) => page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).color)
    const accent = await token('accent')
    const danger = await token('danger')
    expect(accent).not.toBe(danger)

    const hovered = async (id: string): Promise<string> => {
      await page.locator(`#${id}`).hover()
      return page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).color)
    }

    // Orange: opening a thread, from a running, a queued and a finished row; and starting a prompt now.
    expect(await hovered('thread')).toBe(accent)
    expect(await hovered('thread-q')).toBe(accent)
    expect(await hovered('thread-d')).toBe(accent)
    expect(await hovered('start')).toBe(accent)

    // Red: the x that stops a reply, the x that takes a prompt back, the trash that removes a row.
    expect(await hovered('stop')).toBe(danger)
    expect(await hovered('drop')).toBe(danger)
    expect(await hovered('remove')).toBe(danger)
  } finally {
    await browser.close()
  }
})
