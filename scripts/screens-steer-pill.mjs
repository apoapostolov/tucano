// Frames for the steer pill (#330 / this PR): at the bottom of a reply's steps while the agent
// works, a small dim pill opens a field, and what the person writes goes to the running reply —
// which says so in the chain, in their words, and carries on.
// The fake engine holds between two tool calls (TUCANO_FAKE_HOLD_MS) because a real one answers in
// milliseconds: that pause is the only way to shoot a reply that is still working.
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const out = process.argv[2] ?? 'C:/tmp/frames/330'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-'))
const HOLD = 15_000
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_FAKE_HOLD_MS: String(HOLD), TUCANO_LOCALE: 'en-US' }
const errors = []

// TUCANO_ELECTRON runs the installed app instead of this checkout's build: the same flow, in the
// window the person actually opens.
const launch = async () => {
  const installed = env.TUCANO_ELECTRON
  const app = await electron.launch({ args: installed ? [] : ['.'], ...(installed ? { executablePath: installed } : {}), env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1280, height: 880 })
  await win.waitForSelector('.sidebar')
  win.on('pageerror', (e) => errors.push(String(e)))
  win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  return { app, win }
}

// The skill the fake turn reads, so the chain has two real steps around the pause. A workspace made
// from scratch has whatever the harness folders on this computer hold; inserting one keeps the run
// off a skill that may not be there.
const SEED_SKILL = 'steer-demo'
const seedSkill = () => {
  const db = new DatabaseSync(join(data, 'tucano.db'))
  const now = Date.now()
  db.prepare(
    `INSERT INTO skills (id, name, description, body, agents, state, created_at, updated_at)
     VALUES (?, ?, ?, ?, '[]', 'active', ?, ?)
     ON CONFLICT (id) DO UPDATE SET updated_at = excluded.updated_at`
  ).run('demo-skill', SEED_SKILL, 'A skill that exists so a reply has something to read', 'Read this, then go on.', now, now)
  db.close()
}

const channel = async (win, name) => {
  await win.locator('.section .nav-item', { hasText: name }).first().click()
  await win.waitForSelector('.composer textarea')
}
const ask = async (win, text) => {
  await win.locator('.composer textarea').fill(text)
  await win.keyboard.press('Enter')
}
const waitWorking = async (win, want = true) => {
  for (let i = 0; i < 240; i++) {
    const working = await win.evaluate(() => !!document.querySelector('.steps__stop'))
    if (working === want) return true
    await win.waitForTimeout(250)
  }
  return false
}

// Where the pill sits and what it looks like: the question is whether it is under the chain, dim and
// small, and out of the steps' way.
const pillLook = (win) =>
  win.evaluate(() => {
    const steps = [...document.querySelectorAll('.steps')].filter((s) => s.querySelector('.steps__toggle')).pop()
    const pill = steps?.querySelector('.steps__ask-pill')
    const list = steps?.querySelector('.steps__list')
    if (!steps || !pill) return { pill: false }
    const p = pill.getBoundingClientRect()
    const l = list?.getBoundingClientRect()
    const st = getComputedStyle(pill)
    return {
      pill: true,
      tag: pill.tagName,
      text: pill.textContent?.replace(/\s+/g, ' ').trim(),
      height: Math.round(p.height),
      width: Math.round(p.width),
      radius: st.borderRadius,
      fontSize: st.fontSize,
      color: st.color,
      chainAbove: l ? Math.round(p.top - l.bottom) : null,
      under: l ? p.top >= l.bottom - 1 : null,
      rows: steps.querySelectorAll('.step').length,
      working: !!steps.querySelector('.steps__stop'),
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    }
  })

const fieldLook = (win) =>
  win.evaluate(() => {
    const note = document.querySelector('.steps__ask-note')
    if (!note) return { open: false }
    const ta = note.querySelector('textarea')
    const send = [...note.querySelectorAll('button')].find((b) => b.className.includes('btn--primary'))
    const t = ta.getBoundingClientRect()
    return {
      open: true,
      placeholder: ta.getAttribute('placeholder'),
      labelled: ta.getAttribute('aria-label'),
      width: Math.round(t.width),
      height: Math.round(t.height),
      sendDisabled: !!send?.disabled,
      sendText: send?.textContent?.trim(),
      sendUnderField: send ? Math.round(send.getBoundingClientRect().top - t.bottom) : null,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      insidePanel: (() => {
        const panel = note.closest('.conversation, .panel, main') ?? document.body
        return Math.round(panel.getBoundingClientRect().width) >= Math.round(t.right)
      })()
    }
  })

// The steer as it lands in the chain: which row it is, what it says, and that the reply carried on.
const chainLook = (win) =>
  win.evaluate(() => {
    const steps = [...document.querySelectorAll('.steps')].filter((s) => s.querySelector('.steps__toggle')).pop()
    const rows = [...(steps?.querySelectorAll('.step') ?? [])]
    const steer = rows.findIndex((r) => r.classList.contains('step--steer'))
    const row = rows[steer]
    return {
      rows: rows.length,
      steerAt: steer,
      labels: rows.map((r) => r.querySelector('.step__label')?.textContent ?? ''),
      steerText: row?.querySelector('.step__input')?.textContent ?? null,
      steerLabel: row?.querySelector('.step__label')?.textContent ?? null,
      steerClass: row?.className ?? null,
      steerRows: rows.filter((r) => r.classList.contains('step--steer')).length,
      // The words as they are drawn: two lines clamped, and the row clicked open shows all of them.
      clamp: row?.querySelector('.step__clamp')?.getBoundingClientRect().height ?? null,
      summary: steps?.querySelector('.steps__summary')?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
      working: !!steps?.querySelector('.steps__stop')
    }
  })

const lastReply = (win) =>
  win.evaluate(() => {
    const bodies = [...document.querySelectorAll('.msg--agent .md')]
    return bodies.length ? bodies[bodies.length - 1].textContent?.replace(/\s+/g, ' ').trim().slice(0, 120) : null
  })

// The replies in the conversation, so "the same row, not a second one" can be said with a number.
const replies = (win) => win.evaluate(() => document.querySelectorAll('.msg--agent').length)
// What the person's side of the conversation holds: a steer must not add anything to it.
const mineCount = (win) => win.evaluate(() => document.querySelectorAll('.msg--me').length)
const steerRows = (win) => win.evaluate(() => document.querySelectorAll('.step--steer').length)

let { app, win } = await launch()
await win.waitForSelector('.sidebar')
seedSkill()
await app.close()
;({ app, win } = await launch())

await channel(win, 'engineering')
await ask(win, "Lia, sem pressa com a skill `steer-demo`: leia e faça o trabalho")
await win.waitForTimeout(1200)
console.log('while it works, the pill:', JSON.stringify(await pillLook(win)))
await win.screenshot({ path: `${out}/01-the-pill-under-the-chain.png` })

// Opening it: a field, nothing sent, the send asleep while it's empty.
await win.locator('.steps__ask-pill').click()
await win.waitForTimeout(200)
console.log('the field it opens:', JSON.stringify(await fieldLook(win)))
await win.screenshot({ path: `${out}/02-the-field-it-opens.png` })

// What the person writes, and sending it.
await win.locator('.steps__ask-note textarea').fill('Skip the history and only look at the two last commits')
await win.waitForTimeout(150)
console.log('typed:', JSON.stringify(await fieldLook(win)))
await win.screenshot({ path: `${out}/03-what-they-write.png` })
const repliesBefore = await replies(win)
const mineBefore = await mineCount(win)
await win.locator('.steps__ask-note button.btn--primary').click()
await win.waitForTimeout(400)
console.log('after sending, the field is', JSON.stringify(await fieldLook(win)))

// It is the reply's own row from the moment it is given: nothing of it is posted in the conversation.
console.log(
  'straight after sending:',
  JSON.stringify({ steerRows: await steerRows(win), personMessages: { before: mineBefore, after: await mineCount(win) }, replies: { before: repliesBefore, after: await replies(win) }, chain: await chainLook(win) })
)
await win.screenshot({ path: `${out}/04-the-steer-in-the-chain.png` })

// The words as they are drawn: the part in two lines, and all of it once the row is clicked.
const saidBefore = await win.evaluate(() => {
  const box = document.querySelector('.step--steer .step__clamp')
  return { px: box ? Math.round(box.getBoundingClientRect().height) : null, whole: !!document.querySelector('.step--steer .step__input.is-whole') }
})
await win.locator('.step--steer .step__input').first().click()
await win.waitForTimeout(200)
const saidAfter = await win.evaluate(() => {
  const box = document.querySelector('.step--steer .step__clamp')
  return { px: box ? Math.round(box.getBoundingClientRect().height) : null, whole: !!document.querySelector('.step--steer .step__input.is-whole') }
})
console.log('the words, clamped and whole:', JSON.stringify({ before: saidBefore, after: saidAfter }))

// A second steer while it still works: two rows, and still no message of the person's.
await win.locator('.steps__ask-pill').last().click()
await win.locator('.steps__ask-note textarea').fill('segunda orientação: só o último commit')
await win.locator('.steps__ask-note button.btn--primary').click()
await win.waitForTimeout(300)
console.log('two steers, before the next call:', JSON.stringify({ steerRows: await steerRows(win), personMessages: await mineCount(win), replies: await replies(win), chain: await chainLook(win) }))

// Both turn read at the tool call that follows them, and the reply goes on.
for (let i = 0; i < 140; i++) {
  const done = await win.evaluate(() => {
    const rows = [...document.querySelectorAll('.step--steer')]
    return rows.length > 0 && rows.every((r) => r.classList.contains('step--done'))
  })
  if (done) break
  await win.waitForTimeout(250)
}
console.log('the steers in the chain:', JSON.stringify(await chainLook(win)))
await win.screenshot({ path: `${out}/05-the-steers-read.png` })

await waitWorking(win, false)
console.log('when it is done:', JSON.stringify({ ...(await chainLook(win)), pillsLeft: await win.evaluate(() => document.querySelectorAll('.steps__ask-pill').length) }))
console.log('the reply it kept:', JSON.stringify({ before: repliesBefore, after: await replies(win), text: await lastReply(win), personMessages: { before: mineBefore, after: await mineCount(win) } }))
await win.screenshot({ path: `${out}/06-done-after-the-steer.png` })

// 420 px: the pill and the field inside the column, nothing sideways.
await win.setViewportSize({ width: 420, height: 880 })
await win.waitForTimeout(400)
await ask(win, "Lia, sem pressa com a skill `steer-demo`: leia e faça o trabalho")
await win.waitForTimeout(1200)
await win.locator('.steps__ask-pill').last().click()
await win.waitForTimeout(300)
console.log('at 420, the pill and the field:', JSON.stringify({ pill: await pillLook(win), field: await fieldLook(win) }))
await win.screenshot({ path: `${out}/07-at-420.png` })

console.log('page errors:', JSON.stringify(errors.slice(0, 6)))
await app.close()
