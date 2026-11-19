// QA: the reasoning block's height setting (6 / 12 / 18 lines), its width against the steps' chain,
// and the order of the two buttons on a running row of the work drawer (Steer before the x).
// TUCANO_FAKE_THINKING=1 makes the fake engine think out loud; TUCANO_FAKE_HOLD_MS keeps a reply at
// work long enough to read the drawer.
import { _electron as electron } from 'playwright'
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const out = 'C:/tmp/frames/thought-size'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_FAKE_THINKING: '1', TUCANO_FAKE_HOLD_MS: '9000', TUCANO_LOCALE: 'en-US' }
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

const switchRow = '.key-row:has-text("Show reasoning")'
const sizeRow = '.key-row:has-text("Reasoning panel height")'
const settings = async () => {
  await win.locator('.sidebar__gear').click()
  await win.waitForSelector('.page')
  await win.locator(switchRow).scrollIntoViewIfNeeded()
}
const channel = async () => {
  await win.locator('.section .nav-item', { hasText: 'engineering' }).first().click()
  await win.waitForSelector('.composer textarea')
}
const look = () =>
  win.evaluate(() => {
    const blocks = [...document.querySelectorAll('.thought')]
    const t = blocks.at(-1)
    const text = t?.querySelector('.thought__text')
    const steps = t?.closest('.steps')
    const list = steps?.querySelector('.steps__list')
    const r = (el) => (el ? { l: Math.round(el.getBoundingClientRect().left), r: Math.round(el.getBoundingClientRect().right), w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) } : null)
    const cs = t ? getComputedStyle(t) : null
    const ts = text ? getComputedStyle(text) : null
    return {
      size: t?.getAttribute('data-size') ?? null,
      open: t?.classList.contains('is-open') ?? null,
      label: t?.querySelector('.thought__label')?.textContent ?? null,
      chars: text?.textContent?.length ?? 0,
      block: r(t),
      text: r(text),
      list: r(list),
      blockMaxHeight: cs?.maxHeight ?? null,
      blockLines: cs?.getPropertyValue('--thought-lines')?.trim() ?? null,
      textMaxHeight: ts?.maxHeight ?? null,
      textOverflowY: ts?.overflowY ?? null,
      textScroll: text ? { sh: text.scrollHeight, ch: text.clientHeight } : null,
      working: !!document.querySelector('.steps__stop')
    }
  })
const drawer = () =>
  win.evaluate(() => {
    const head = document.querySelector('.work-drawer__head')
    if (!head) return { drawer: false }
    const rows = [...document.querySelectorAll('.work-row')]
    return {
      drawer: true,
      open: document.querySelector('.work-drawer')?.classList.contains('is-open') ?? false,
      count: head.textContent?.trim() ?? null,
      rows: rows.map((row) => ({
        steer: row.querySelector('.work-row__steer') ? Math.round(row.querySelector('.work-row__steer').getBoundingClientRect().left) : null,
        stop: row.querySelector('.work-row__stop') ? Math.round(row.querySelector('.work-row__stop').getBoundingClientRect().left) : null,
        order: [...row.children].map((c) => c.className.split(' ')[0])
      }))
    }
  })

await settings()
await win.locator(`${switchRow} .toggle`).click()
await win.waitForTimeout(300)

const results = {}
for (const size of ['Small', 'Medium', 'Large']) {
  await settings()
  await win.locator(sizeRow).scrollIntoViewIfNeeded()
  await win.locator(`${sizeRow} [role=radio]:has-text("${size}")`).click()
  await win.waitForTimeout(200)
  await channel()
  await win.locator('.composer textarea').fill('Lia, o test/wiki-git.test.ts falha aqui. É do build ou da máquina?')
  await win.keyboard.press('Enter')
  let m = await look()
  for (let i = 0; i < 200; i++) {
    m = await look()
    if (m.chars > 1300 && m.label === 'Thinking') break
    await win.waitForTimeout(100)
  }
  results[size] = m
  await win.screenshot({ path: `${out}/${size}.png` })
  // The drawer, while the reply is at work.
  const d = await drawer()
  results[`${size} drawer`] = d
  if (d.drawer && !d.open) {
    await win.locator('.work-drawer__head').click()
    await win.waitForTimeout(300)
    results[`${size} drawer`] = await drawer()
  }
  await win.waitForTimeout(500)
}
console.log(JSON.stringify(results, null, 1))
console.log('page errors:', JSON.stringify(errors.slice(0, 4)))
await app.close()
rmSync(data, { recursive: true, force: true })
