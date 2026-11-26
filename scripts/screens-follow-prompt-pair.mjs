// Worktree-built proof that a Follow carries its originating prompt down with it, also when the
// prompt was queued long before its answer, and that each round owns its own Thought container.
// Usage: npm run build && node scripts/screens-follow-prompt-pair.mjs [out-dir]
// Frames and frames.json are evidence only: they belong under C:/tmp/frames, never in the repo.
import { _electron as electron } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const out = process.argv[2] ?? 'C:/tmp/frames/follow-prompt-pair/driver'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-follow-pair-'))
const env = {
  ...process.env,
  TUCANO_DATA: data,
  TUCANO_SEED: '1',
  TUCANO_FAKE_ENGINES: '1',
  TUCANO_FAKE_THINKING: '1',
  TUCANO_LOCALE: 'en-US'
}
delete env.ELECTRON_RUN_AS_NODE
delete env.ELECTRON_RENDERER_URL
const profile = `--user-data-dir=${join(data, 'electron')}`
const errors = []
const FIRST_THOUGHT = 'ROUND ONE: I read the deploy file.'
const NEW_THOUGHT = 'Reading the request'

const launch = async () => {
  const app = await electron.launch({ args: ['.', profile], env })
  const win = await app.firstWindow()
  win.on('pageerror', (e) => errors.push(String(e)))
  win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await win.waitForSelector('.sidebar', { timeout: 60_000 })
  return { app, win }
}

// The seed owns the database. Close it before writing rows, then reopen on the same temp data.
const boot = await launch()
await boot.app.close()

const db = new DatabaseSync(join(data, 'tucano.db'))
const me = db.prepare("SELECT id FROM people WHERE role = 'owner' LIMIT 1").get()?.id
const lia = db.prepare("SELECT id FROM agents WHERE handle = 'lia' LIMIT 1").get()?.id
const theo = db.prepare("SELECT id FROM agents WHERE handle = 'theo' LIMIT 1").get()?.id
const engineering = db.prepare("SELECT id FROM conversations WHERE kind = 'channel' AND name IN ('engineering', 'engenharia') LIMIT 1").get()?.id
const dataChannel = db.prepare("SELECT id FROM conversations WHERE kind = 'channel' AND name IN ('data', 'dados') LIMIT 1").get()?.id
if (!me || !lia || !theo || !engineering || !dataChannel) throw new Error('seeded workspace lacks the owner, Lia, Theo, or the two channels')
db.prepare("INSERT INTO settings (key, value) VALUES ('showThinking', 'true') ON CONFLICT(key) DO UPDATE SET value = 'true'").run()
const now = Date.now()
const put = db.prepare('INSERT INTO messages (id, conversation_id, author_kind, author_id, text, at, run, thread_id, send_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
const steps = [{ id: 'fp-step', label: 'read the deploy file', status: 'done', ms: 12 }]
put.run('fp-origin', engineering, 'person', me, 'ORIGIN: check the deploy', now - 180_000, null, null, null)
put.run('fp-reply', engineering, 'agent', lia, 'First answer.', now - 170_000, JSON.stringify({
  status: 'done',
  steps,
  rounds: [{ id: 'fp-step', steps, text: 'First answer.', thought: FIRST_THOUGHT }],
  replyTo: 'fp-origin',
  endedAt: now - 160_000
}), null, null)
put.run('fp-later', engineering, 'person', me, 'LATER: written after the first answer', now - 60_000, null, null, null)
put.run('pq-origin', dataChannel, 'person', me, 'QUEUE: sent long before its turn', now - 240_000, null, null, 'queue')
put.run('pq-middle', dataChannel, 'person', me, 'MIDDLE: written while it waited', now - 120_000, null, null, null)
put.run('pq-reply', dataChannel, 'agent', theo, 'Answer to the queued request.', now - 110_000, JSON.stringify({ status: 'done', steps, replyTo: 'pq-origin', endedAt: now - 100_000 }), null, null)
db.close()

const { app, win } = await launch()
try {
  const report = {
    data,
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    errors,
    dimensions: [1440, 420],
    seed: { firstThought: FIRST_THOUGHT, newThought: NEW_THOUGHT, origin: now - 180_000, firstEnd: now - 160_000, later: now - 60_000, queued: now - 240_000, queuedEnd: now - 100_000 },
    samples: {}
  }

  // Read the drawing itself: row ids, each row's box, and each Thought box with the text it owns.
  const look = (prefix) => win.evaluate((p) => {
    const rows = [...document.querySelectorAll('.messages > [data-id]')].filter((el) => el.getAttribute('data-id')?.startsWith(p))
    const list = document.querySelector('.messages')
    const top = list?.getBoundingClientRect().top ?? 0
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { top: Math.round(r.top - top), bottom: Math.round(r.bottom - top), height: Math.round(r.height) }
    }
    return {
      ids: rows.map((el) => el.getAttribute('data-id')),
      positions: rows.map((el) => ({ id: el.getAttribute('data-id'), ...box(el) })),
      thoughts: rows.flatMap((el) => [...el.querySelectorAll('.thought')].map((el2) => {
        const steps = el2.parentElement?.querySelector('.steps__body')
        const t = box(el2)
        return {
          id: el.getAttribute('data-id'),
          round: el2.closest('[data-follow-round]')?.getAttribute('data-follow-round') ?? null,
          open: el2.classList.contains('is-open'),
          text: (el2.querySelector('.thought__text')?.textContent ?? el2.querySelector('.thought__last')?.textContent ?? '').trim(),
          ...t,
          afterSteps: t && steps ? Math.round(steps.getBoundingClientRect().bottom - top) <= t.top : null
        }
      })),
      scroller: { scrollTop: Math.round(list?.scrollTop ?? 0), height: Math.round(list?.clientHeight ?? 0) },
      viewport: { width: window.innerWidth, height: window.innerHeight }
    }
  }, prefix)

  const settle = async () => win.waitForTimeout(400)
  const go = async (name) => {
    // Navigate at the wide viewport: at 420 the sidebar is folded away.
    await win.setViewportSize({ width: 1440, height: 820 })
    await win.locator('.sidebar .nav-item', { hasText: name }).first().click()
    await win.waitForSelector('.composer textarea', { timeout: 30_000 })
    await settle()
  }
  const shoot = async (name, prefix) => {
    for (const width of report.dimensions) {
      await win.setViewportSize({ width, height: 820 })
      await settle()
      // The list follows the end on its own. Put the prompt rows back in view for the frame.
      await win.evaluate(() => { const list = document.querySelector('.messages'); if (list) list.scrollTop = 0 })
      await settle()
      await win.screenshot({ path: join(out, `${name}-${width}.png`) })
      report.samples[`${name}-${width}`] = await look(prefix)
    }
  }

  await go('engineering')
  await win.waitForSelector('[data-id="fp-reply"] .thought', { timeout: 30_000 })
  const before = await look('fp-')
  if (before.ids.join(',') !== 'fp-origin,fp-reply,fp-later') throw new Error(`unexpected before order: ${before.ids.join(',')}`)
  if (!before.thoughts.some((t) => t.text.includes(FIRST_THOUGHT))) throw new Error(`first round lost its reasoning: ${JSON.stringify(before.thoughts)}`)
  await shoot('timeline-before', 'fp-')

  // The real Follow pill: the same reply row, a steer note, and a later end time.
  await win.locator('[data-id="fp-reply"] button[aria-label="Follow"]').click()
  await win.locator('[data-id="fp-reply"] textarea').fill('also check staging')
  await win.locator('[data-id="fp-reply"] .retry-note .btn--primary').click()
  await win.waitForFunction((fragment) => {
    const el = document.querySelector('[data-id="fp-reply"] [data-follow-round="1"] .thought.is-working .thought__text')
    return !!el && (el.textContent ?? '').includes(fragment)
  }, NEW_THOUGHT, { timeout: 30_000 })
  const during = await look('fp-')
  const oldDuring = during.thoughts.find((t) => t.round === '0')
  const liveDuring = during.thoughts.find((t) => t.round === '1')
  if (!oldDuring?.text.includes(FIRST_THOUGHT) || !liveDuring?.text.includes(NEW_THOUGHT) || oldDuring.text.includes(NEW_THOUGHT)) throw new Error(`wrong live ownership: ${JSON.stringify(during.thoughts)}`)
  await shoot('timeline-during', 'fp-')

  await win.waitForFunction(() => {
    const row = document.querySelector('[data-id="fp-reply"]')
    return !!row && row.querySelectorAll('.msg__round').length === 2 && !row.querySelector('.thought.is-working')
  }, undefined, { timeout: 60_000 })
  // Open both finished containers so the frames show the two distinct reasonings.
  for (const head of await win.locator('[data-id="fp-reply"] .thought__head').all()) await head.click()
  await settle()
  const after = await look('fp-')
  if (after.ids.join(',') !== 'fp-later,fp-origin,fp-reply') throw new Error(`unexpected after order: ${after.ids.join(',')}`)
  const oldAfter = after.thoughts.find((t) => t.round === '0')
  const newAfter = after.thoughts.find((t) => t.round === '1')
  if (!oldAfter?.text.includes(FIRST_THOUGHT) || !newAfter?.text.includes(NEW_THOUGHT) || oldAfter.text.includes(NEW_THOUGHT) || newAfter.text.includes(FIRST_THOUGHT)) throw new Error(`reasoning was mixed between rounds: ${JSON.stringify(after.thoughts)}`)
  await shoot('timeline-after', 'fp-')

  await go('data')
  await win.waitForSelector('[data-id="pq-reply"]', { timeout: 30_000 })
  const queued = await look('pq-')
  if (queued.ids.join(',') !== 'pq-middle,pq-origin,pq-reply') throw new Error(`unexpected queued order: ${queued.ids.join(',')}`)
  await shoot('queued-prompt', 'pq-')

  const adjacent = (sample, first, second) => {
    const a = sample.positions.find((p) => p.id === first)
    const b = sample.positions.find((p) => p.id === second)
    return !!a && !!b && a.bottom <= b.top
  }
  for (const width of report.dimensions) {
    if (!adjacent(report.samples[`timeline-after-${width}`], 'fp-origin', 'fp-reply')) throw new Error(`prompt is not above the followed reply at ${width}`)
    if (!adjacent(report.samples[`queued-prompt-${width}`], 'pq-origin', 'pq-reply')) throw new Error(`queued prompt is not above its reply at ${width}`)
    for (const name of ['timeline-before', 'timeline-during', 'timeline-after']) {
      const sample = report.samples[`${name}-${width}`]
      if (!sample.thoughts.every((t) => t.afterSteps !== false)) throw new Error(`${name} thought sits before its steps at ${width}`)
    }
  }
  if (errors.length) throw new Error(`page errors: ${JSON.stringify(errors)}`)
  writeFileSync(join(out, 'frames.json'), `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify({ out, before: before.ids, during: during.thoughts, after: after.ids, queued: queued.ids, errors }, null, 2))
} finally {
  await app.close()
}
