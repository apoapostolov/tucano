// Frames for the pause beside the steer pill (#455): a working reply can be held at its next step and
// let go again, instead of stopped, so a limit that has to pass costs nothing. TUCANO_FAKE_ENGINES=1
// makes the fake engine ask a question through the gateway "in N s", which is the tool call a held
// reply stops in front of.
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const out = process.argv[2] ?? 'C:/tmp/frames/pause'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en-US' }

const app = await electron.launch({ args: ['.'], env })
const win = await app.firstWindow()
await win.setViewportSize({ width: 1280, height: 880 })
await win.waitForSelector('.sidebar')
const errors = []
win.on('pageerror', (e) => errors.push(String(e)))
win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const shot = (name) => win.screenshot({ path: `${out}/${name}.png` })

const channel = async () => {
  await win.locator('.section .nav-item', { hasText: 'engineering' }).first().click()
  await win.waitForSelector('.composer textarea')
}
// The row the pause lives in: the two pills it holds, in order, and whether the reply is still working.
const row = () =>
  win.evaluate(() => {
    const r = document.querySelector('.steps__hold')
    const pills = [...(r?.querySelectorAll('.steps__ask-pill') ?? [])]
    return {
      row: !!r,
      pills: pills.map((p) => ({ text: p.textContent?.trim() ?? '', disabled: p.hasAttribute('disabled') })),
      steer: !!r?.querySelector('.steps__ask'),
      question: document.querySelectorAll('.ask, .question').length,
      // A reply put on hold is not a reply that hit its ceiling: no budget note under it.
      ceilingNote: [...document.querySelectorAll('.note')].some((n) => /ceiling|teto/i.test(n.textContent ?? '')),
      working: !!document.querySelector('.steps__stop')
    }
  })
const first = () => win.locator('.steps__hold .steps__ask-pill').first()

await channel()
await win.locator('.composer textarea').fill('Lia, pergunte em 4 s quando isso precisa estar pronto')
await win.keyboard.press('Enter')
await win.waitForSelector('.steps__hold .steps__ask-pill')
const before = await row()
console.log('the row while it works:', JSON.stringify(before))
await shot('01-pause-beside-steer')

// Asked to pause: it says so at once, and waits for the step the reply is in.
await first().click()
await win.waitForTimeout(250)
const asked = await row()
console.log('after asking to pause:', JSON.stringify(asked))
await shot('02-pausing')

// The hold lands where nothing of the model's is in flight: before the tool call it was about to make.
let held = asked
for (let i = 0; i < 80 && !held.pills.some((p) => /Resume/i.test(p.text)); i++) {
  await win.waitForTimeout(150)
  held = await row()
}
console.log('held:', JSON.stringify(held))
await shot('03-held')

// Let go: the tool call goes through, and the question arrives.
await first().click()
let after = held
for (let i = 0; i < 80 && after.question === 0; i++) {
  await win.waitForTimeout(150)
  after = await row()
}
console.log('let go:', JSON.stringify(after))
await shot('04-let-go')

const fails = []
if (!before.row) fails.push('no pause row on a working reply')
if (!before.steer) fails.push('the steer pill is not beside the pause')
if (before.pills[0]?.text !== 'Pause') fails.push(`the first pill reads ${before.pills[0]?.text}`)
if (asked.pills[0]?.text !== 'Pausing…' || !asked.pills[0]?.disabled) fails.push('asking to pause did not say so')
if (!held.pills.some((p) => /Resume/i.test(p.text))) fails.push('the reply was never held')
if (held.question > 0) fails.push('the question was asked while the reply was held')
if (held.ceilingNote) fails.push('a held reply read as one that hit its ceiling')
if (after.question === 0) fails.push('letting it go did not let the tool call through')
console.log('pause check:', fails.length === 0 ? 'ok' : JSON.stringify(fails))
if (fails.length > 0) process.exitCode = 1
console.log('errors:', JSON.stringify(errors))
await app.close()
