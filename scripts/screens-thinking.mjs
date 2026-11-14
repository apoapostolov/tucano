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

// TUCANO_ELECTRON runs the installed app instead of this checkout's build: the same flow, in the
// package Apo actually opens.
const installed = env.TUCANO_ELECTRON
const app = await electron.launch({
  ...(installed ? { executablePath: installed } : {}),
  args: [...(installed ? [] : ['.']), `--user-data-dir=${join(data, 'electron')}`],
  env
})
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

// 5. Reading further up while the rest arrives: the block keeps the place the person is reading, and
// so does its place on the page. Two things pulled it away before: the block scrolled itself to the end
// on every piece (fixed by `followsTheEnd`), and the list underneath kept following the end of the
// reply, carrying the whole block up out of view as the answer streamed in below.
// The block's own scroller, in the shape this branch draws it: the whole block in next, the text alone
// on the branch that folds it.
const turn = () =>
  win.evaluate(() => {
    const blocks = [...document.querySelectorAll('.thought')]
    const running = blocks.filter((b) => b.querySelector('.thought__label')?.textContent === 'Thinking')
    const t = running.at(-1) ?? blocks.at(-1)
    // The list this block is in, not simply the first one in the page: a thread panel has its own.
    const list = t ? t.closest('.messages') : document.querySelector('.messages')
    const box = t
      ? ([t.querySelector('.thought__text'), t].find((el) => el && el.scrollHeight - el.clientHeight > 20) ?? t.querySelector('.thought__text') ?? t)
      : null
    return {
      label: t?.querySelector('.thought__label')?.textContent ?? null,
      chars: t?.querySelector('.thought__text')?.textContent?.length ?? 0,
      top: box ? Math.round(box.scrollTop) : null,
      hidden: box ? box.scrollHeight - box.clientHeight : 0,
      atTheEnd: box ? box.scrollHeight - box.scrollTop - box.clientHeight < 24 : null,
      onScreen: t ? Math.round(t.getBoundingClientRect().top) : null,
      listTop: list ? Math.round(list.scrollTop) : null,
      bottom: list ? Math.round(list.scrollHeight - list.clientHeight) : null,
      lists: document.querySelectorAll('.messages').length,
      working: !!document.querySelector('.steps__stop')
    }
  })
const readable = (s) => s?.label === 'Thinking' && s.hidden > 70
// The block's own scroll, moved the way a wheel moves it: the scroll event is what the block reads, so
// setting the position drives the path a gesture drives. The app's own QA covered the wheel itself.
const scrollBlock = (where) =>
  win.evaluate((w) => {
    const blocks = [...document.querySelectorAll('.thought')]
    const t = blocks.filter((b) => b.querySelector('.thought__label')?.textContent === 'Thinking').at(-1) ?? blocks.at(-1)
    if (!t) return false
    const box = [t.querySelector('.thought__text'), t].find((el) => el && el.scrollHeight - el.clientHeight > 20) ?? t.querySelector('.thought__text') ?? t
    box.scrollTop = w === 'end' ? box.scrollHeight : 0
    return true
  }, where)
const readInto = async () => {
  // The scroll is the block's own, but a piece of reasoning can land between the wheel and the block
  // reading the scroll, which puts the place back. In the app the wheel's own handling stops that; here
  // the gesture is a scroll event, so it is repeated until it stays.
  for (let attempt = 0; attempt < 8; attempt++) {
    await scrollBlock('up')
    await win.waitForTimeout(120)
    const s = await turn()
    if (s && s.top === 0) return s
  }
  return turn()
}
const untilReadable = async () => {
  let s = null
  for (let i = 0; i < 120; i++) {
    s = await turn()
    if (readable(s)) return s
    await win.waitForTimeout(100)
  }
  return s
}
const throughTheTurn = async () => {
  const seen = []
  for (let i = 0; i < 240; i++) {
    const s = await turn()
    seen.push(s)
    if (!s?.working && i > 8) break
    await win.waitForTimeout(150)
  }
  await win.waitForTimeout(400)
  seen.push(await turn())
  return seen
}

await win.setViewportSize({ width: 900, height: 880 })
await settings()
await win.locator(`${switchRow} .toggle`).click()
await win.locator(`${sizeRow} .segmented button`, { hasText: 'Small' }).click()
await win.waitForTimeout(300)
await ask()
const arrived = await untilReadable()
console.log('following, at the end:', JSON.stringify(arrived))

// Reading back into it: the next piece of reasoning must leave the place alone.
const reading = await readInto()
let held = reading
for (let i = 0; i < 40 && held.chars <= reading.chars; i++) {
  await win.waitForTimeout(100)
  held = await turn()
}
console.log('reading above the stream:', JSON.stringify({ reading, held }))
await shot('06-reading-above-the-stream')

// Back at the end by hand: the block follows the rest of what arrives.
await scrollBlock('end')
await win.waitForTimeout(150)
const back = await turn()
let following = back
for (let i = 0; i < 40 && following.chars <= back.chars; i++) {
  await win.waitForTimeout(100)
  following = await turn()
}
console.log('back at the end:', JSON.stringify({ back, following }))
await shot('07-back-at-the-end')

// 6. The same reading carried through to the answer. The block's own scroll is held by then, but the
// list underneath kept following the end of the reply, so as the answer streamed in below, the block
// was carried up the page and out of the reading. A wheel inside the block holds the list too.
await ask()
const arrived2 = await untilReadable()
const reading2 = await readInto()
const seen2 = await throughTheTurn()
const worst = seen2.reduce(
  (w, s) => ({ listTop: Math.max(w.listTop, s?.listTop ?? 0), blockTop: Math.min(w.blockTop, s?.onScreen ?? 0) }),
  { listTop: reading2.listTop, blockTop: reading2.onScreen }
)
console.log('through the answer:', JSON.stringify({ arrived2, reading2, worst, settled: seen2.at(-1) }))
await shot('08-through-the-answer')

// 7. Back at the end of the reasoning, on another turn: the list follows the reply again, so the answer
// arriving below is in view, the way it was before anyone read back into the block.
await ask()
const arrived3 = await untilReadable()
// The page at the reply's end first: a block follows its own stream only while the page does, so the
// person watching the answer arrive is looking at the block's end, which is what reading back from it
// needs. Then read up into the reasoning, and come back to its end.
await win.evaluate(() => {
  const l = document.querySelector('.messages')
  if (l) l.scrollTop = l.scrollHeight
})
await win.waitForTimeout(400)
const following3 = await turn()
const reading3 = await readInto()
await scrollBlock('end')
await win.waitForTimeout(200)
const released = await turn()
await throughTheTurn()
const afterRelease = await turn()
console.log('the list takes the end back:', JSON.stringify({ arrived3, following3, reading3, released, afterRelease }))
await shot('09-the-list-follows-again')

const fails = []
// Phase 5: the block's own scroll, while the reasoning streams.
if (!arrived?.atTheEnd) fails.push('the block did not open at the end of the reasoning')
if (reading.top !== 0) fails.push(`the block was not put at the top of its reasoning (${reading.top})`)
if (held.chars <= reading.chars) fails.push('no reasoning arrived while the block was read further up')
if (held.top !== reading.top) fails.push(`the block moved from ${reading.top} to ${held.top} while it was read further up`)
if (held.onScreen !== reading.onScreen) fails.push(`the block moved up the page from ${reading.onScreen} to ${held.onScreen} while it was read`)
// The list may scroll only to give back the height that grew above the reading line: what must not
// move is the line itself, which the block's place on the page measures.
if (Math.abs(held.onScreen - reading.onScreen) > 2) fails.push(`the block moved on the page from ${reading.onScreen} to ${held.onScreen} while it was read further up`)
if (!back.atTheEnd) fails.push('the block did not take the end back when scrolled there')
if (following.chars <= back.chars) fails.push('no reasoning arrived after the block was back at the end')
if (!following.atTheEnd) fails.push('the block stopped following after it was taken back to the end')
// Phase 6: the place on the page, through the answer arriving below.
if (!readable(arrived2)) fails.push('the block never scrolled on the second turn')
if (reading2.top !== 0) fails.push(`the block was not put at the top of its reasoning on the second turn (${reading2.top})`)
// A list that scrolls itself to keep the line is the rule working, not the fault: the fault is the line leaving the place it was read at, which the next check measures.
if (worst.blockTop < reading2.onScreen - 2) fails.push(`the block was carried up the page from ${reading2.onScreen} to ${worst.blockTop} while it was being read`)
// Phase 7: the list follows again once the reasoning is read to its end.
if (!readable(arrived3)) fails.push('the block never scrolled on the third turn')
if (released.atTheEnd !== true) fails.push('the block did not take the end back after the reasoning was read to its end again')
if (!afterRelease || afterRelease.listTop < afterRelease.bottom - 4) fails.push(`the list did not take the end back (${afterRelease?.listTop} of ${afterRelease?.bottom})`)
console.log('scroll check:', fails.length === 0 ? 'ok' : JSON.stringify(fails))
if (fails.length > 0) process.exitCode = 1

console.log('errors:', JSON.stringify(errors))
await app.close()
rmSync(data, { recursive: true, force: true })
