// Frames for "every session in a channel keeps its own action buttons": a channel with three
// sessions, each of them ended, and what each row offers to go on with — read from the built app,
// with the geometry the frame's callout needs.
//
//   node scripts/screens-session-buttons.mjs <out dir> [app dir]
//
// One run: seeded workspace, fake engines, English window. Rows 1 and 2 are stopped by hand, row 3
// is waited out, so the channel holds three finished sessions. `frames.json` carries, per row, the
// controls it holds, whether each one is on screen, and the box the ways on occupy.
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const out = process.argv[2] ?? 'C:/tmp/frames/session-buttons'
const appDir = process.argv[3] ?? 'C:/Users/theap/orca/workspaces/tucano/session-buttons'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en-US' }
const errors = []
const app = await electron.launch({ args: ['.'], cwd: appDir, env })
const win = await app.firstWindow()
win.on('pageerror', (e) => errors.push(String(e)))
win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await win.setViewportSize({ width: 1280, height: 900 })
await win.waitForSelector('.sidebar')
await win.waitForTimeout(800)

const WAIT_IDLE = () => ![...document.querySelectorAll('.composer button')].some((b) => b.textContent?.trim() === 'Stop')
const waitIdle = async () => {
  await win.waitForFunction(WAIT_IDLE, null, { timeout: 90_000 }).catch(() => {})
  await win.waitForTimeout(700)
}

await win.locator('.sidebar').getByText('engineering', { exact: false }).first().click()
await win.waitForTimeout(500)

// A reply that takes its time, stopped by hand: one that ended early is the one that needs its ways on.
const stopOne = async (ask) => {
  await win.fill('.composer textarea', ask)
  await win.keyboard.press('Enter')
  await win.waitForSelector('.composer button:has-text("Stop")', { timeout: 30_000 })
  await win.waitForTimeout(1800)
  await win.locator('.composer button:has-text("Stop")').click()
  await waitIdle()
}
await stopOne('Summarise what the last release changed for the sidebar. Demore 8 s.')
await stopOne('Which of those changes can break a saved layout? Demore 8 s.')
await stopOne('Write the short note we send to the team about it. Demore 8 s.')

// The pointer parked on the channel's title: no row is hovered, so what is measured is what the
// channel shows on its own.
await win.locator('.topbar__title').hover()
await win.waitForTimeout(400)

const report = await win.evaluate(() => {
  const rows = [...document.querySelectorAll('.msg--agent')].map((m, i) => {
    const foot = m.querySelector('.msg__meta')
    const onScreen = (el) => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0
    }
    const box = foot?.getBoundingClientRect()
    return {
      row: i + 1,
      id: m.getAttribute('data-id'),
      author: m.querySelector('.msg__author')?.textContent?.trim(),
      footer: !!foot,
      note: m.querySelector('.msg__body > .note')?.textContent?.trim().slice(0, 60) ?? null,
      // The row's own footer band, for the frame's callout.
      box: box ? { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) } : null,
      controls: [...(foot?.querySelectorAll('button') ?? [])].map((b) => ({
        label: b.getAttribute('aria-label') ?? b.textContent?.trim(),
        // `msg__hire` was the class that kept a way on hidden until the pointer reached the row.
        hoverOnly: b.classList.contains('msg__hire'),
        opacity: getComputedStyle(b).opacity,
        onScreen: onScreen(b)
      }))
    }
  })
  return { rows, pageErrors: 0 }
})

// The same rows with the pointer over each of them: what the hover reveals, which is what a person
// finds only by sweeping the channel.
for (const r of report.rows) {
  await win.locator('.msg--agent').nth(r.row - 1).hover()
  await win.waitForTimeout(300)
  r.onHover = await win.evaluate(
    (n) =>
      [...document.querySelectorAll('.msg--agent')[n].querySelectorAll('.msg__meta button')].map((b) => ({
        label: b.getAttribute('aria-label') ?? b.textContent?.trim(),
        onScreen: Number(getComputedStyle(b).opacity) > 0
      })),
    r.row - 1
  )
}
await win.locator('.topbar__title').hover()
await win.waitForTimeout(400)

report.pageErrors = errors.length
report.errors = errors.slice(0, 4)
// The frame is the content column, so the callout coordinates (viewport space) are shifted by this.
const main = await win.locator('.main').boundingBox()
report.main = main && { x: Math.round(main.x), y: Math.round(main.y) }
writeFileSync(join(out, 'frames.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 1))
await win.locator('.main').screenshot({ path: join(out, 'channel-three-sessions.png') })

await app.close()
rmSync(data, { recursive: true, force: true })
