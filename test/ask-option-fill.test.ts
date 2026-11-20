// The live question card's options, measured in Chromium with the real stylesheet. What this holds: an
// option nobody has picked sits a shade above its card (the same raise the finished record uses), it is
// a very dark grey on the dark theme rather than the card's own colour or black, and pointing at one
// makes it lighter still instead of replacing its fill with a translucent overlay that reads darker.
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')
const skip = !existsSync(chromium.executablePath())

// The probes resolve the same expressions the rules use, so the test compares computed colours with the
// tokens themselves instead of with a second guess at the maths.
const probes = '<div id="pmix" style="background:color-mix(in srgb, var(--text) 7%, var(--panel))"></div><div id="pup" style="background:color-mix(in srgb, var(--text) 12%, var(--panel))"></div><div id="ppanel" style="background:var(--panel)"></div>'

const card = `
  <div class="ask">
    <div class="ask__head"><span class="ask__badge">Pergunta</span></div>
    <div class="ask-options" role="radiogroup">
      <button class="ask-option"><span class="ask-option__key">1</span><span class="ask-option__text"><span class="ask-option__line"><span class="ask-option__label">Sim, publico</span></span></span></button>
      <button class="ask-option"><span class="ask-option__key">2</span><span class="ask-option__text"><span class="ask-option__line"><span class="ask-option__label">Não, espero</span></span></span></button>
    </div>
  </div>`

const page = (body: string): string => `<style>${css}</style><style>body{margin:0;background:var(--bg);padding:16px}#pmix,#pup,#ppanel{width:8px;height:8px}
/* The option transitions its background, so a computed style read mid-transition comes back in oklab;
   the measurement is of the resting rule, not of a frame of the fade. */
.ask-option,.ask{transition:none!important}</style>${probes}${body}`

const rgb = (c: string): number[] => {
  const n = (c.match(/[\d.]+/g) ?? []).map(Number)
  return (Math.max(...n) <= 1 ? n.map((v) => v * 255) : n).slice(0, 3).map((v) => Math.round(v))
}

it.skipIf(skip)('sets an option a shade above its card, and pointing at it raises it further', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const p = await browser.newPage({ viewport: { width: 900, height: 700 }, colorScheme: 'dark' })
    await p.setContent(page(card))
    const resting = await p.evaluate(() => {
      const of = (sel: string) => getComputedStyle(document.querySelector(sel)!).backgroundColor
      return { option: of('.ask-option'), card: of('.ask'), mix: of('#pmix'), up: of('#pup') }
    })
    expect(resting.option).toBe(resting.mix)
    expect(resting.option).not.toBe(resting.card)
    // Raised, not sunk: every channel above the card's own.
    const option = rgb(resting.option)
    expect(option.every((v, i) => v > (rgb(resting.card)[i] ?? 0))).toBe(true)
    // Very dark grey, never black and never light.
    expect(Math.min(...option)).toBeGreaterThan(20)
    expect(Math.max(...option)).toBeLessThan(70)
    // The hover keeps the raise going instead of falling back to the card.
    await p.hover('.ask-option')
    const hovered = await p.evaluate(() => getComputedStyle(document.querySelector('.ask-option')!).backgroundColor)
    expect(hovered).toBe(resting.up)
  } finally {
    await browser.close()
  }
})
