// The two Git sweep schedules from the daily-driver profile, seeded into a throwaway fake-engine
// Electron: one at 09:00 and 21:00, one at 15:00 and 21:00. Both must sit at their own grid hours
// and read as different times with a 12-hour clock. Run after `npm run build`:
//   node scripts/screens.mjs routine-12hour --out C:/tmp/frames/routine-12hour/1440 --size 1440x900
import { DatabaseSync } from 'node:sqlite'
import { join } from 'node:path'
import assert from 'node:assert/strict'
import { close, openApp, settle, shot, until, writeFrames } from './screens/lib.mjs'

const SWEEPS = [
  { id: '5dfa8565-744b-4b2a-90b0-327ad4e79a0b', name: 'Git sweep 09', times: ['09:00', '21:00'], hours: [9, 21], labels: ['9:00 AM', '9:00 PM'] },
  { id: '21fae9a1-aef9-4edd-b687-60bbd200dc48', name: 'Git sweep 15', times: ['15:00', '21:00'], hours: [15, 21], labels: ['3:00 PM', '9:00 PM'] }
]

export const size = '1440x900'

export default async function story(t) {
  // First boot makes the database; seed it the way the driver's profile has it, off with a run behind.
  const first = await openApp({ size: '1440x900', out: t.out, locale: 'en-US' })
  await until(first.win, '.sidebar')
  await close(first)

  const db = new DatabaseSync(join(first.data, 'tucano.db'))
  const agent = db.prepare("SELECT id FROM agents WHERE handle = 'lia' LIMIT 1").get()
  if (!agent) throw new Error('seeded workspace has no Lia')
  const conversation = 'rt-dm-git-sweep'
  db.prepare('INSERT OR IGNORE INTO conversations (id, kind, name, created_at) VALUES (?, ?, ?, ?)').run(conversation, 'dm', agent.id, Date.now())
  const put = db.prepare(`INSERT INTO routines
    (id, name, agent_id, conversation_id, prompt, days, time, times, enabled, next_at, last_at, created_at, once, scope)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?, 0, 'me')`)
  for (const sweep of SWEEPS)
    put.run(sweep.id, sweep.name, agent.id, conversation, `${sweep.name} from the driver profile.`, '[0,1,2,3,4,5,6]', sweep.times[0], JSON.stringify(sweep.times), Date.now() - 3_600_000, Date.now())
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('clock', ?)").run(JSON.stringify('12'))
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('language', ?)").run(JSON.stringify('en'))
  db.close()

  const app = await openApp({ data: first.data, size: t.size, out: t.out, locale: 'en-US' })
  await until(app.win, '.sidebar')
  await app.win.locator('.sidebar button[data-hub="operations"]').first().click()
  await until(app.win, '.hub')
  await app.win.locator('.hub__tab[data-tab="routines"]').click()
  await until(app.win, '.cal__ev')

  const readGrid = () => app.win.evaluate(() => {
    const rows = [...document.querySelectorAll('.cal__hours span')].map((el) => ({ label: el.textContent.trim(), top: Math.round(Number.parseFloat(el.style.top) || 0) }))
    const cols = [...document.querySelectorAll('.cal__col')]
    return [...document.querySelectorAll('.cal__ev')].map((el) => {
      const top = Math.round(Number.parseFloat(el.style.top) || 0)
      // Two routines at 21:00 stack inside the same hour, so a block's top can sit below the
      // hour line. Read the row whose band contains it, not only an exact match.
      const row = rows.find((r, i) => top >= r.top && top < (rows[i + 1]?.top ?? Infinity))
      const box = el.getBoundingClientRect()
      return {
        name: el.querySelector('strong')?.textContent?.trim() ?? '',
        label: (el.getAttribute('title') ?? '').split(' · ')[0] ?? '',
        top,
        computedHour: row ? Number(row.label.slice(0, 2)) : null,
        col: cols.indexOf(el.closest('.cal__col')),
        off: el.className.includes('is-off'),
        box: { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) }
      }
    })
  })

  const rows = []
  const facts = { clock: '12', language: 'en', sweeps: SWEEPS.map(({ id, name, times }) => ({ id, name, times })), widths: {} }
  for (const width of [1440, 420]) {
    await app.win.setViewportSize({ width, height: 900 })
    await settle(app.win, 600)
    const all = await readGrid()
    const morning = await shot(app, `routines-grid-${width}-morning`)
    // The hour grid is taller than the window: a second frame scrolls to the 21:00 row.
    await app.win.locator('.cal__scroll').evaluate((el) => { el.scrollTop = el.scrollHeight })
    await settle(app.win, 300)
    const evening = await shot(app, `routines-grid-${width}-evening`)
    await app.win.locator('.cal__scroll').evaluate((el) => { el.scrollTop = 0 })
    facts.widths[width] = { blocks: all.length, found: [] }
    for (const sweep of SWEEPS) {
      const cols = [...new Set(all.filter((b) => b.name === sweep.name).map((b) => b.col))]
      const day = cols.map((c) => all.filter((b) => b.col === c && b.name === sweep.name).sort((a, b) => a.top - b.top)).find((list) => list.length >= 2)
      assert.ok(day, `no day with both times for ${sweep.name} at ${width}: ${JSON.stringify(all)}`)
      assert.deepEqual(day.map((b) => b.computedHour), sweep.hours, `grid hours for ${sweep.name} at ${width}`)
      assert.deepEqual(day.map((b) => b.label), sweep.labels, `block labels for ${sweep.name} at ${width}`)
      assert.ok(day[0].top < day[1].top, `top positions for ${sweep.name} at ${width}`)
      facts.widths[width].found.push({ name: sweep.name, hours: day.map((b) => b.computedHour), labels: day.map((b) => b.label), tops: day.map((b) => b.top) })
      for (const block of day)
        rows.push({
          selector: '.cal__ev',
          box: block.box,
          frame: block.computedHour >= 18 ? evening : morning,
          data: { width, routine: sweep.name, label: block.label, computedHour: block.computedHour, top: block.top, off: block.off },
          note: `${sweep.name} at ${block.label}, grid row ${block.computedHour}:00`
        })
    }
  }
  facts.errors = app.errors.length ? app.errors : 'none'
  assert.deepEqual(app.errors, [], 'page errors')
  writeFrames(t.out, rows, { data: facts })
  console.log('grid hours and tops:', JSON.stringify(facts.widths))
  await close(app)
}
