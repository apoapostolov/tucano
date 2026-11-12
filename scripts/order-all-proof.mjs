// The three of them together, on the real app: the steer pill (#332) under the run's box, the
// thinking block (#245) inside that box above it, folded once the reply is over — and, from #261,
// Shift+Enter still a line break and Ctrl+Enter the queue. Seeds its own data and uses fake engines:
// nothing real is touched. Run after `npm run build`: node scripts/order-all-proof.mjs [outDir]
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const out = process.argv[2] ?? 'C:/tmp/frames/order'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-order-'))
const HOLD = 15_000
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_FAKE_THINKING: '1', TUCANO_FAKE_HOLD_MS: String(HOLD), TUCANO_LOCALE: 'en-US' }
const errors = []
let app
let win

const launch = async () => {
  app = await electron.launch({ args: ['.'], env })
  win = await app.firstWindow()
  await win.setViewportSize({ width: 1280, height: 880 })
  await win.waitForSelector('.sidebar')
  win.on('pageerror', (e) => errors.push(String(e)))
  win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
}

const seedSkill = () => {
  const db = new DatabaseSync(join(data, 'tucano.db'))
  const now = Date.now()
  db.prepare(
    `INSERT INTO skills (id, name, description, body, agents, state, created_at, updated_at)
     VALUES (?, ?, ?, ?, '[]', 'active', ?, ?)
     ON CONFLICT (id) DO UPDATE SET updated_at = excluded.updated_at`
  ).run('demo-skill', 'steer-demo', 'A skill that exists so a reply has something to read', 'Read this, then go on.', now, now)
  db.close()
}

// What the three of them say about where they are: the thought inside the run's box, the pill
// outside it and under it, and the reply still at work.
const geometry = () =>
  win.evaluate(() => {
    const msgs = [...document.querySelectorAll('.msg--agent')]
    const msg = msgs[msgs.length - 1]
    const steps = msg?.querySelector('.steps')
    const thought = msg?.querySelector('.thought')
    const holder = msg?.querySelector('.steps__steer')
    const pill = holder?.querySelector('.steps__steer-pill')
    const stop = steps?.querySelector('.steps__stop')
    const R = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), height: Math.round(r.height) }
    }
    const s = R(steps)
    const t = R(thought)
    const p = R(pill)
    const st = R(stop)
    return {
      box: s,
      thought: t,
      pill: p,
      thoughtOpen: thought?.classList.contains('is-open') ?? null,
      thoughtLabel: thought?.querySelector('.thought__label')?.textContent ?? null,
      thoughtChars: thought?.querySelector('.thought__text')?.textContent?.length ?? 0,
      thoughtHasText: !!thought?.querySelector('.thought__text'),
      thoughtInTheBox: !!(thought && steps && steps.contains(thought)),
      thoughtUnderTheList: (() => {
        const l = R(steps?.querySelector('.steps__list'))
        return l && t ? t.top >= l.bottom - 1 : null
      })(),
      pillOutsideTheBox: pill ? !steps.contains(pill) : null,
      pillUnderTheBox: pill && s ? p.top >= s.bottom - 1 : null,
      pillGapBelowTheBox: pill && s ? p.top - s.bottom : null,
      thoughtAboveThePill: pill && t ? p.top - t.bottom : null,
      thoughtBelowTheStop: thought && st ? t.top >= st.top : null,
      rows: steps?.querySelectorAll('.step').length ?? 0,
      working: !!stop,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    }
  })

const say = (k, v) => console.log(k, '=', JSON.stringify(v))

await launch()
await win.waitForSelector('.sidebar')
seedSkill()
await app.close()
await launch()

// The switch: the thinking block has to be on for any of this to mean anything.
const card = '.card:has-text("The conversation")'
await win.locator('.nav-item:has-text("Settings")').first().click()
await win.waitForSelector('.page')
await win.locator(card).scrollIntoViewIfNeeded()
await win.locator(`${card} .toggle`).click()
await win.waitForTimeout(300)

// 1. A reply at work, thinking: the thought inside the run's box, the pill under it and outside it.
// The fake engine thinks after its tool calls, so the pill and the thought are there together only
// near the end of the run — which is exactly the moment the ordering has to survive.
const ask = async (text) => {
  await win.locator('.composer textarea').fill(text)
  await win.keyboard.press('Enter')
}
await win.locator('.section .nav-item', { hasText: 'engineering' }).first().click()
await win.waitForSelector('.composer textarea')
await ask('Lia, sem pressa com a skill `steer-demo`: leia e faça o trabalho')
let g = await geometry()
for (let i = 0; i < 240; i++) {
  g = await geometry()
  if (g.pill && g.thoughtChars > 20) break
  await win.waitForTimeout(250)
}
say('1 while it works', g)
await win.screenshot({ path: `${out}/01-thinking-inside-the-box-pill-under-it.png` })
for (let i = 0; i < 240 && (await geometry()).working; i++) await win.waitForTimeout(250)

// 2. A second reply, steered while it holds between two calls: the steer lands in the chain, the
// thinking arrives under it, and the pill still hangs under the box.
await ask('Lia, sem pressa com a skill `steer-demo`: leia e faça o trabalho de novo')
let held = await geometry()
for (let i = 0; i < 240; i++) {
  held = await geometry()
  if (held.pill && held.rows >= 2) break
  await win.waitForTimeout(200)
}
say('2 the moment it can be steered', { pill: held.pill, rows: held.rows, working: held.working })
await win.locator('.steps__steer-pill').first().click()
await win.waitForTimeout(250)
await win.locator('.steps__steer-note textarea').fill('Skip the history and only look at the two last commits')
const send = win.locator('.steps__steer-note button.btn--primary')
for (let i = 0; i < 40 && (await send.isDisabled()); i++) await win.waitForTimeout(50)
await send.click()
await win.waitForTimeout(400)
say('2b the message it left', await win.evaluate(() => {
  const mine = [...document.querySelectorAll('.msg--me')].pop()
  return { notesLeft: document.querySelectorAll('.steps__steer-note').length, lastMine: mine?.textContent?.replace(/\s+/g, ' ').trim().slice(-60) ?? null }
}))
const t0 = Date.now()
for (let i = 0; i < 320; i++) {
  if (await win.evaluate(() => !!document.querySelector('.step--steer'))) break
  await win.waitForTimeout(250)
}
console.log('the steer took', Math.round((Date.now() - t0) / 1000), 's to reach the chain')
for (let i = 0; i < 120; i++) {
  if ((await geometry()).thoughtChars > 20) break
  await win.waitForTimeout(200)
}
const steered = await win.evaluate(() => {
  const chain = [...document.querySelectorAll('.steps')].filter((s) => s.querySelector('.step--steer')).pop()
  if (!chain) return { found: false }
  const rows = [...chain.querySelectorAll('.step')]
  const at = rows.findIndex((r) => r.classList.contains('step--steer'))
  const thought = chain.querySelector('.thought')
  return {
    found: true,
    steerAt: at,
    rows: rows.length,
    labels: rows.map((r) => r.querySelector('.step__label')?.textContent ?? ''),
    steerText: rows[at]?.querySelector('.step__steer')?.textContent ?? null,
    steerAboveTheThinking: thought ? rows[at].getBoundingClientRect().top < thought.getBoundingClientRect().top : null,
    working: !!chain.querySelector('.steps__stop')
  }
})
say('2c the steer in the chain', steered)
const mid = await geometry()
say('2d the geometry meanwhile', mid)
await win.screenshot({ path: `${out}/02-the-steer-in-the-chain-thinking-under-it.png` })

// 3. Over: the thinking folded to the line it ended on, the pill gone, the answer there.
for (let i = 0; i < 240 && (await geometry()).working; i++) await win.waitForTimeout(250)
await win.waitForTimeout(800)
say('3 when it is over', await geometry())
await win.screenshot({ path: `${out}/03-over-folded-and-no-pill.png` })

// 4. And the keys from #261, in this same build.
say('4 keys', {
  note: 'run scripts/verify-enter-keys.mjs against this build for the four keys'
})

say('page errors', errors.slice(0, 6))
await app.close()
