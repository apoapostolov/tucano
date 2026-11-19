// Probe: a reasoning block many pages long, scrolled to the middle, while more reasoning arrives.
// What must not happen is the line being read moving: this marks a character at the middle of the
// block's viewport and follows that same character's place on screen while the text keeps coming.
// Run: node scripts/probe-thinking-long.mjs [small|medium|large]
import { _electron as electron } from 'playwright'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const size = process.argv[2] === 'list' ? 'large' : (process.argv[2] ?? 'small')
// `list`: read the reasoning by scrolling the list (the block scrolls itself only inside its own box),
// which is what a person does when the reply is long and the thinking sits pages up the conversation.
const byList = process.argv[2] === 'list'
const data = mkdtempSync(join(tmpdir(), 'tucano-long-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_FAKE_THINKING: '1', TUCANO_FAKE_THINKING_LONG: '1', TUCANO_LOCALE: 'en-US' }
const app = await electron.launch({ args: ['.'], env })
const win = await app.firstWindow()
// `list` mode reads by scrolling the page, so the window is short enough for the list to overflow.
await win.setViewportSize(byList ? { width: 1100, height: 620 } : { width: 1280, height: 880 })
await win.waitForSelector('.sidebar')
const errors = []
win.on('pageerror', (e) => errors.push(String(e)))
win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

await win.locator('.nav-item:has-text("Settings")').first().click()
await win.waitForSelector('.page')
const row = '.key-row:has-text("Show reasoning")'
await win.locator(row).scrollIntoViewIfNeeded()
await win.locator(`${row} .toggle`).click()
await win.waitForTimeout(200)
const sizeRow = '.key-row:has-text("Reasoning panel height")'
await win.locator(sizeRow).scrollIntoViewIfNeeded()
const label = { small: 'Small', medium: 'Medium', large: 'Large' }[size]
await win.locator(`${sizeRow} button:has-text("${label}")`).first().click()
await win.waitForTimeout(200)

await win.locator('.section .nav-item', { hasText: 'engineering' }).first().click()
await win.waitForSelector('.composer textarea')
await win.locator('.composer textarea').fill('Lia, o test/wiki-git.test.ts falha aqui. É do build ou da máquina?')
await win.keyboard.press('Enter')

// Wait for a block worth scrolling: several times its own viewport.
const geom = () =>
  win.evaluate(() => {
    const t = [...document.querySelectorAll('.thought')].at(-1)
    const box = t // the block is the scroller: max-height by lines, overflow-y auto
    const list = t?.closest('.messages')
    const r = t?.getBoundingClientRect()
    return {
      label: t?.querySelector('.thought__label')?.textContent ?? null,
      chars: box?.textContent?.length ?? 0,
      scrollTop: box ? Math.round(box.scrollTop) : null,
      scrollHeight: box ? Math.round(box.scrollHeight) : null,
      client: box ? Math.round(box.clientHeight) : null,
      blockTop: r ? Math.round(r.top) : null,
      listTop: list ? Math.round(list.scrollTop) : null,
      working: !!document.querySelector('.steps__stop')
    }
  })

let g = await geom()
for (let i = 0; i < 300; i++) {
  g = await geom()
  if (g.working && g.scrollHeight > g.client * 3) break
  await win.waitForTimeout(100)
}
console.log('the block when it is many pages long:', JSON.stringify(g))

// Mark the line at the middle of what the block shows, then scroll there: the marker is a character,
// so its place on screen is the place of that line, whatever the scrollTop does.
const marked = await win.evaluate((byList) => {
  const t = [...document.querySelectorAll('.thought')].at(-1)
  const box = byList ? t.closest('.messages') : t
  // The middle of the reasoning, not the middle of what happens to be shown: the block was pinned at
  // its end while it streamed, so a caret under the middle of the viewport is a line near the end.
  const lr = box.getBoundingClientRect()
  const tr = t.getBoundingClientRect()
  const target = Math.round(
    byList
      ? // The list, so that the middle of the reasoning sits in the middle of the window.
        box.scrollTop + (tr.top - lr.top) + tr.height / 2 - box.clientHeight / 2
      : (box.scrollHeight - box.clientHeight) / 2
  )
  box.scrollTop = target
  box.dispatchEvent(new Event('scroll', { bubbles: true }))
  const r = box.getBoundingClientRect()
  const mid = document.caretRangeFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  if (!mid || !mid.startContainer || mid.startContainer.nodeType !== 3) return { ok: false, target, at: Math.round(box.scrollTop) }
  window.__line = { node: mid.startContainer, offset: mid.startOffset }
  const range = document.createRange()
  range.setStart(mid.startContainer, mid.startOffset)
  range.setEnd(mid.startContainer, Math.min(mid.startContainer.length, mid.startOffset + 12))
  return {
    ok: true,
    target,
    at: Math.round(box.scrollTop),
    max: Math.round(box.scrollHeight - box.clientHeight),
    chars: box.textContent.length,
    lineAt: Math.round(range.getBoundingClientRect().top),
    byList
  }
}, byList)
console.log('the line marked and scrolled to:', JSON.stringify(marked))
await win.waitForTimeout(400)

const place = () =>
  win.evaluate(() => {
    const l = window.__line
    if (!l || !l.node.isConnected) return { gone: true }
    const range = document.createRange()
    range.setStart(l.node, Math.min(l.offset, l.node.length))
    range.setEnd(l.node, Math.min(l.node.length, l.offset + 12))
    const rect = range.getBoundingClientRect()
    const t = [...document.querySelectorAll('.thought')].at(-1)
    const box = t // the block is the scroller: max-height by lines, overflow-y auto
    const list = t?.closest('.messages')
    return {
      lineTop: Math.round(rect.top),
      scrollTop: box ? Math.round(box.scrollTop) : null,
      scrollHeight: box ? Math.round(box.scrollHeight) : null,
      chars: box?.textContent?.length ?? 0,
      blockTop: t ? Math.round(t.getBoundingClientRect().top) : null,
      listTop: list ? Math.round(list.scrollTop) : null,
      working: !!document.querySelector('.steps__stop')
    }
  })

const first = await place()
const trail = [first]
for (let i = 0; i < 120; i++) {
  trail.push(await place())
  await win.waitForTimeout(100)
  if (i > 20 && !trail.at(-1).working) break
}
const lines = trail.map((x) => x.lineTop)
const drift = Math.max(...lines) - Math.min(...lines)
console.log('the line over time (screen y):', JSON.stringify(lines))
console.log('chars while reading:', JSON.stringify(trail.map((x) => x.chars)))
console.log('the line drifted:', drift, 'px over', trail.length, 'samples')
console.log('last:', JSON.stringify(trail.at(-1)))
console.log('errors:', JSON.stringify(errors))
await app.close()
