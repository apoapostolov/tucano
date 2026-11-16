// A prompt's own glyphs — reply in thread, the pencil that edits it, the trash that takes it out —
// stand in one column beside the bubble on a prompt tall enough for them, and fan out sideways on a
// short one. Either way they are the same box: left to itself the pencil was a 13 px glyph where the
// other two are 20 px icons, so in the column it sat 7 px in from their edge with 4 px above it and 11
// below, and in the fan it broke the even 6 px between them. Laid out from the real stylesheet, with
// the row `Conversation.tsx` draws (test/edit-prompt.test.tsx owns the behaviour).
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')

// The three glyphs where the app puts them: the pencil and the trash inside the body, before the head,
// and the reply-in-thread button after the words (Conversation.tsx, msg__body).
const ROW = (stack: boolean): string => `
  <article class="msg msg--me${stack ? ' is-left-stack' : ''}"><div class="msg__gutter"></div>
    <div class="msg__body">
      <button class="icon-btn icon-btn--sm msg__edit" title="Edit prompt" aria-label="Edit prompt" style="opacity: 1"><svg width="13" height="13"></svg></button>
      <button class="icon-btn icon-btn--sm msg__delete msg__delete--prompt" title="Delete prompt" aria-label="Delete prompt" style="opacity: 1"><svg width="13" height="13"></svg></button>
      <div class="msg__head"><span class="msg__author">Ana</span><span class="msg__time">01:30 PM</span></div>
      <div class="md">${
        stack
          ? '<p>Corrige o login do painel, linha por linha:<br />ponto 1<br />ponto 2<br />ponto 3<br />ponto 4<br />ponto 5</p>'
          : '<p>corrige o login</p>'
      }</div>
      <button class="icon-btn icon-btn--sm msg__reply" title="Reply in thread" aria-label="Reply in thread" style="opacity: 1"><svg width="13" height="13"></svg></button>
    </div>
  </article>`

type Box = { left: number; right: number; top: number; bottom: number; w: number; h: number; cy: number }

const place = async (stack: boolean, width: number): Promise<{ thread: Box; pencil: Box; trash: Box; row: Box }> => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width, height: 880 } })
    await page.setContent(`<style>${css}</style><main class="main"><div class="messages">${ROW(stack)}</div></main>`)
    return await page.evaluate(() => {
      const box = (sel: string) => {
        const el = document.querySelector(sel)
        if (!el) throw new Error(`no ${sel} in the row`)
        const r = el.getBoundingClientRect()
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, w: r.width, h: r.height, cy: r.top + r.height / 2 }
      }
      return { thread: box('.msg__reply'), pencil: box('.msg__edit'), trash: box('.msg__delete--prompt'), row: box('.msg') }
    })
  } finally {
    await browser.close()
  }
}

it.skipIf(!existsSync(chromium.executablePath()))('stands the three glyphs in one column on a tall prompt, all the same box', async () => {
  const { thread, pencil, trash, row } = await place(true, 1280)
  expect(row.h).toBeGreaterThan(74) // tall enough that the row stacks them (Conversation.tsx, leftStack)
  // One box for all three: the pencil is a glyph like the others, not a smaller thing beside them.
  expect(pencil.w).toBeCloseTo(thread.w, 1)
  expect(pencil.h).toBeCloseTo(thread.h, 1)
  expect(pencil.w).toBeCloseTo(trash.w, 1)
  expect(pencil.h).toBeCloseTo(trash.h, 1)
  // One column: the same edge on both sides, and the middle of each glyph on the same axis.
  expect(pencil.right).toBeCloseTo(thread.right, 1)
  expect(pencil.right).toBeCloseTo(trash.right, 1)
  expect(pencil.left).toBeCloseTo(thread.left, 1)
  expect(pencil.left).toBeCloseTo(trash.left, 1)
  // Even spacing down the column, and even between the middles: 24 px apart, as the three offsets intend.
  const below = pencil.top - thread.bottom
  const under = trash.top - pencil.bottom
  expect(below).toBeCloseTo(under, 1)
  expect(pencil.cy - thread.cy).toBeCloseTo(trash.cy - pencil.cy, 1)
})

it.skipIf(!existsSync(chromium.executablePath()))('fans the same three out on one band on a short prompt, evenly spaced', async () => {
  const { thread, pencil, trash, row } = await place(false, 1280)
  expect(row.h).toBeLessThan(74) // too short for a column, so they fan out to the left instead
  expect(pencil.cy).toBeCloseTo(thread.cy, 1)
  expect(pencil.cy).toBeCloseTo(trash.cy, 1)
  // The same gap between each pair, with no small glyph squeezing one of them.
  const first = thread.left - pencil.right
  const second = pencil.left - trash.right
  expect(first).toBeCloseTo(second, 1)
  expect(first).toBeGreaterThan(0)
})

it.skipIf(!existsSync(chromium.executablePath()))('keeps the column on the rail inside a 420 px window', async () => {
  const { thread, pencil, trash, row } = await place(true, 420)
  expect(row.h).toBeGreaterThan(74)
  expect(pencil.w).toBeCloseTo(thread.w, 1)
  expect(pencil.left).toBeCloseTo(thread.left, 1)
  expect(pencil.left).toBeCloseTo(trash.left, 1)
  expect(pencil.cy - thread.cy).toBeCloseTo(trash.cy - pencil.cy, 1)
})
