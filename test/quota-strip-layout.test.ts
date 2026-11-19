// The widths of the bars in a session's header. That rule is one about layout, so it is measured in a
// browser against the checkout's own stylesheet: linkedom has no layout, and a DOM test cannot tell a
// bar as wide as its own name from a bar as wide as the longest name beside it.
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')
const pill = (name: string, tone = ''): string =>
  `<span class="quota-strip__pill${tone ? ` ${tone}` : ''}"><span class="quota-strip__name">${name}</span><span class="quota-strip__track"><i style="width:40%"></i></span></span>`
const strip = (markup: string): string =>
  `<style>${css}</style><div class="topbar__actions"><button type="button" class="quota-strip">${markup}</button></div>`

// A bar, and its name's two widths: the box the label sits in, and the width the letters themselves
// take, which is the width a pill sized by its own label would have had.
const measure = (): { bar: number; box: number; text: number; clipped: number }[] =>
  [...document.querySelectorAll<HTMLElement>('.quota-strip__pill')]
    .filter((el) => getComputedStyle(el).display !== 'none')
    .map((el) => {
      const name = el.querySelector<HTMLElement>('.quota-strip__name')!
      const track = el.querySelector<HTMLElement>('.quota-strip__track')!
      const range = document.createRange()
      range.selectNodeContents(name)
      return {
        bar: Math.round(track.getBoundingClientRect().width),
        box: Math.round(name.getBoundingClientRect().width),
        text: Math.round(range.getBoundingClientRect().width),
        clipped: name.scrollWidth - name.clientWidth
      }
    })

it.skipIf(!existsSync(chromium.executablePath()))('gives every bar the width of the longest name in the strip', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 400 } })
    // The two pills a conversation draws at most, with names of very different lengths.
    await page.setContent(strip(pill('OpenAI Codex') + pill('Z.ai', 'is-warn')))
    const [long, short] = await page.evaluate(measure)
    expect(long!.text).toBeGreaterThan(short!.text + 20)
    // Both bars take the longest name's width, and the short name sits inside its column uncut.
    expect(short!.bar).toBe(long!.bar)
    expect(short!.box).toBe(long!.bar)
    expect(Math.abs(long!.bar - long!.text)).toBeLessThanOrEqual(1)
    expect([long!.clipped, short!.clipped]).toEqual([0, 0])
  } finally {
    await browser.close()
  }
})

it.skipIf(!existsSync(chromium.executablePath()))('sizes the one bar a narrow header keeps to itself', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 760, height: 400 } })
    await page.setContent(strip(pill('OpenAI Codex') + pill('Z.ai', 'is-warn')))
    // Below 900 px only the bar that is running low stays, and the provider that is hidden sets no
    // width: the one left is as wide as its own name.
    const shown = await page.evaluate(measure)
    expect(shown).toHaveLength(1)
    expect(Math.abs(shown[0]!.bar - shown[0]!.text)).toBeLessThanOrEqual(1)
    expect(shown[0]!.clipped).toBe(0)
  } finally {
    await browser.close()
  }
})

// Where the box over a bar lands. It hangs under the strip and it must not be drawn over anything
// else in the header: in this conversation's actions the strip comes first and the routines pill,
// Summary and the settings gear follow it, so a box anchored to the header's own right edge — or to
// the strip's left edge, growing rightwards — would cover them. This is measured against the
// checkout's stylesheet because only a browser knows where those boxes are.
const actions = (): string =>
  `<div class="topbar__actions">
     <div class="quota-strip-wrap">
       <button type="button" class="quota-strip" aria-label="Usage and limits">
         ${pill('OpenAI Codex')}${pill('Z.ai', 'is-warn')}
       </button>
       <div class="quota-card" role="tooltip">
         <div class="quota-card__provider">
           <div class="quota-card__name">OpenAI Codex<span class="quota-card__plan">Pro</span></div>
           <div class="quota-card__window"><span class="quota-card__span">Month</span><span class="quota-card__left">50% left</span>
             <span class="quota-card__track"><i style="width:50%"></i></span><span class="quota-card__reset">resets Mon, 24 Nov 09:00</span></div>
           <div class="quota-card__window"><span class="quota-card__span">Week</span><span class="quota-card__left">70% left</span>
             <span class="quota-card__track is-warn"><i style="width:70%"></i></span><span class="quota-card__reset">resets in 3 h 12 min</span></div>
         </div>
       </div>
     </div>
     <div class="stack"><span class="stack__item"><i style="display:block;width:24px;height:24px"></i></span><span class="stack__count">2 agents</span></div>
     <button type="button" class="btn btn--ghost" id="routine">1 routine</button>
     <button type="button" class="btn btn--ghost" id="summary">Summary</button>
     <button type="button" class="icon-btn" id="settings" aria-label="Conversation settings">x</button>
   </div>`

const boxes = (): Record<string, { x: number; right: number; y: number; bottom: number }> =>
  Object.fromEntries(
    ['#routine', '#summary', '#settings', '.stack', '.quota-strip-wrap', '.quota-card'].map((sel) => {
      const r = document.querySelector(sel)!.getBoundingClientRect()
      return [sel, { x: Math.round(r.x), right: Math.round(r.right), y: Math.round(r.y), bottom: Math.round(r.bottom) }]
    })
  )
const overlaps = (a: { x: number; right: number; y: number; bottom: number }, b: { x: number; right: number; y: number; bottom: number }): boolean =>
  !(a.right <= b.x || a.x >= b.right || a.bottom <= b.y || a.y >= b.bottom)

it.skipIf(!existsSync(chromium.executablePath()))('hangs the box under the strip, clear of the routines pill and the rest of the actions', async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    for (const width of [1280, 760]) {
      const page = await browser.newPage({ viewport: { width, height: 600 } })
      await page.setContent(`<style>${css}</style><header class="topbar"><div class="topbar__title"><h1>Lia</h1></div>${actions()}</header>`)
      const m = await page.evaluate(boxes)
      const card = m['.quota-card']!
      const wrap = m['.quota-strip-wrap']!
      // Under the strip, never beside it.
      expect(card.y).toBeGreaterThanOrEqual(wrap.bottom)
      // Hung from the strip's right edge: it opens towards the page, away from the actions, so it
      // cannot reach the routines pill even when the two are neighbours.
      expect(Math.abs(card.right - wrap.right)).toBeLessThanOrEqual(1)
      for (const sel of ['#routine', '#summary', '#settings', '.stack']) {
        expect({ width, sel, over: overlaps(card, m[sel]!) }).toEqual({ width, sel, over: false })
      }
      // And it stays on the screen at the smallest width the app's window allows.
      expect(card.x).toBeGreaterThanOrEqual(0)
      expect(card.right).toBeLessThanOrEqual(width)
      await page.close()
    }
  } finally {
    await browser.close()
  }
})
