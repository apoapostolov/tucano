// Frames for the model's thinking (#235 / PR #245): off unless the person turns it on, then dim and
// small under the steps, live as it arrives, and kept after the turn so it can be read back.
// TUCANO_FAKE_THINKING=1 makes the fake engine think out loud (see src/core/engines/fake.ts).
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const out = process.argv[2] ?? 'C:/tmp/frames/245'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_FAKE_THINKING: '1', TUCANO_LOCALE: 'en-US' }

const app = await electron.launch({ args: ['.'], env })
const win = await app.firstWindow()
await win.setViewportSize({ width: 1280, height: 880 })
await win.waitForSelector('.sidebar')
const errors = []
win.on('pageerror', (e) => errors.push(String(e)))
win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const shot = (name) => win.screenshot({ path: `${out}/${name}.png` })

// The switch and the size sit in the Conversation section's own rows, each row naming itself, so
// neither depends on how the page groups its cards.
const switchRow = '.key-row:has-text("Show reasoning")'
const sizeRow = '.key-row:has-text("Reasoning panel height")'
const settings = async () => {
  await win.locator('.nav-item:has-text("Settings")').first().click()
  await win.waitForSelector('.page')
  await win.locator(switchRow).scrollIntoViewIfNeeded()
}
const switchState = () =>
  win.evaluate(() => {
    const row = [...document.querySelectorAll('.key-row')].find((r) => r.textContent?.includes('Show reasoning'))
    const t = row?.querySelector('.toggle')
    return { found: !!row, on: t?.classList.contains('is-on') ?? null, aria: t?.getAttribute('aria-checked') ?? null }
  })
const channel = async () => {
  await win.locator('.section .nav-item', { hasText: 'engineering' }).first().click()
  await win.waitForSelector('.composer textarea')
}
const ask = async () => {
  await channel()
  await win.locator('.composer textarea').fill('Lia, o test/wiki-git.test.ts falha aqui. É do build ou da máquina?')
  await win.keyboard.press('Enter')
}
// The state of the thinking block, and whether the reply is still at work.
const look = () =>
  win.evaluate(() => {
    const t = document.querySelector('.thought')
    const box = t?.querySelector('.thought__text')
    const b = t?.getBoundingClientRect()
    return {
      blocks: document.querySelectorAll('.thought').length,
      label: t?.querySelector('.thought__label')?.textContent ?? null,
      chars: box?.textContent?.length ?? 0,
      text: box?.textContent?.slice(0, 120) ?? null,
      height: b ? Math.round(b.height) : 0,
      fontPx: box ? getComputedStyle(box).fontSize : null,
      opacity: box ? getComputedStyle(box).opacity : null,
      atTheBottom: b ? Math.round(b.bottom) <= Math.round(document.querySelector('.messages').getBoundingClientRect().bottom) : null,
      working: !!document.querySelector('.steps__stop')
    }
  })

// 1. Out of the box the switch is off, and it is a switch like any other.
await settings()
console.log('the switch before:', JSON.stringify(await switchState()))
await shot('01-the-switch-off')

await win.locator(`${switchRow} .toggle`).click()
await win.waitForTimeout(400)
console.log('the switch after:', JSON.stringify(await switchState()))
await shot('02-the-switch-on')

// 2. Turned on: the reasoning arrives under the steps, live.
await ask()
let live = await look()
for (let i = 0; i < 150; i++) {
  live = await look()
  if (live.label === 'Thinking' && live.chars > 20 && live.chars < 320) break
  await win.waitForTimeout(100)
}
console.log('while thinking:', JSON.stringify(live, null, 1))
await shot('03-thinking-as-it-arrives')

// 3. And it stays after the turn, said in the past.
for (let i = 0; i < 120 && (await look()).working; i++) await win.waitForTimeout(250)
const kept = await look()
console.log('after the turn:', JSON.stringify({ label: kept.label, chars: kept.chars, blocks: kept.blocks }))
await shot('04-kept-after-the-turn')

// 4. Turned off again: the same turn shows the steps and the answer, and nothing of the reasoning.
await settings()
await win.locator(`${switchRow} .toggle`).click()
await win.waitForTimeout(400)
console.log('the switch again:', JSON.stringify(await switchState()))
await ask()
let seenOff = 0
let finished = false
for (let i = 0; i < 80 && !finished; i++) {
  const s = await look()
  seenOff = Math.max(seenOff, s.blocks)
  finished = i > 12 && !s.working
  await win.waitForTimeout(250)
}
console.log('off again:', JSON.stringify({ thoughtBlocksSeen: seenOff, finished }))
await win.waitForTimeout(1000)
await shot('05-off-again-nothing-shown')

// 5. Reading further up while the rest arrives: the block keeps the place the person is reading,
// instead of pulling them to the end with every piece that lands, and it takes the stream up again
// once they are back at the end. Small, the shortest block, so a turn's reasoning already scrolls.
// The block's own scroller, in the shape this branch draws it: the whole block in next, the text
// alone on the branch that folds it.
// The block of the turn running now: the only one that says "Thinking", since every block of an
// earlier turn says "Thought". The list unmounts rows that scroll out of view, so counting blocks
// is not a place to stand.
const RUNNING = '.thought:has(.thought__label:text-is("Thinking"))'
const block = () =>
  win.evaluate(() => {
    const t = [...document.querySelectorAll('.thought')].filter((b) => b.querySelector('.thought__label')?.textContent === 'Thinking').at(-1)
    if (!t) return null
    const box = [t.querySelector('.thought__text'), t].find((el) => el && el.scrollHeight - el.clientHeight > 20) ?? t.querySelector('.thought__text') ?? t
    const scrollable = box.scrollHeight - box.clientHeight > 20
    return {
      label: t.querySelector('.thought__label')?.textContent ?? null,
      chars: t.querySelector('.thought__text')?.textContent?.length ?? 0,
      top: Math.round(box.scrollTop),
      hidden: box.scrollHeight - box.clientHeight,
      atTheEnd: !scrollable || box.scrollHeight - box.scrollTop - box.clientHeight < 24,
      scrollable,
      working: !!document.querySelector('.steps__stop')
    }
  })
const grew = async (from) => {
  for (let i = 0; i < 40; i++) {
    const s = await block()
    if (s && s.chars > from) return s
    await win.waitForTimeout(100)
  }
  return block()
}
const scrollBlock = (where) =>
  win.evaluate((w) => {
    const t = [...document.querySelectorAll('.thought')].filter((b) => b.querySelector('.thought__label')?.textContent === 'Thinking').at(-1)
    const box = [t.querySelector('.thought__text'), t].find((el) => el && el.scrollHeight - el.clientHeight > 20) ?? t.querySelector('.thought__text') ?? t
    box.scrollTop = w === 'end' ? box.scrollHeight : 0
  }, where)

await win.setViewportSize({ width: 900, height: 880 })
await settings()
await win.locator(`${switchRow} .toggle`).click()
await win.locator(`${sizeRow} .segmented button`, { hasText: 'Small' }).click()
await win.waitForTimeout(300)
await ask()
let arrived = null
for (let i = 0; i < 120; i++) {
  arrived = await block()
  if (arrived?.label === 'Thinking' && arrived.scrollable) break
  await win.waitForTimeout(100)
}
console.log('following, at the end:', JSON.stringify(arrived))

// A wheel up over the block, the way a person reads back into it.
const box2 = await win.locator(RUNNING).last().boundingBox()
await win.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2)
await win.mouse.wheel(0, -260)
await win.waitForTimeout(120)
const reading = await block()
const landing = await grew(reading.chars)
const held = await block()
console.log('reading above the stream:', JSON.stringify({ reading, landing, held }))
await shot('06-reading-above-the-stream')

// Back at the end by hand: the block follows the rest of what arrives.
await scrollBlock('end')
await win.waitForTimeout(120)
const back = await block()
const after = await grew(back.chars)
await win.waitForTimeout(200)
const following = await block()
console.log('back at the end:', JSON.stringify({ back, after, following }))
await shot('07-back-at-the-end')

const fails = []
if (!arrived?.scrollable) fails.push('the block never scrolled, so there was nothing to hold')
if (!arrived?.atTheEnd) fails.push('the block did not open at the end of the reasoning')
if (reading.top === 0 && reading.hidden === 0) fails.push('the wheel over the block moved nothing')
if (held.chars <= reading.chars) fails.push('no reasoning arrived while the block was read further up')
if (held.top !== reading.top) fails.push(`the block moved from ${reading.top} to ${held.top} while it was read further up`)
if (!back.atTheEnd) fails.push('the block did not take the end back when scrolled there')
if (following.chars <= back.chars) fails.push('no reasoning arrived after the block was back at the end')
if (!following.atTheEnd) fails.push('the block stopped following after it was taken back to the end')
console.log('scroll check:', fails.length === 0 ? 'ok' : JSON.stringify(fails))
if (fails.length > 0) process.exitCode = 1

console.log('errors:', JSON.stringify(errors))
await app.close()
rmSync(data, { recursive: true, force: true })
