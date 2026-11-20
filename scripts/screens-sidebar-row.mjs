// One agent's row in the sidebar, as the app draws it: the right click opens the row's own menu inside
// a sector (where the agents list is grouped), and what sits at the row's end stays put — the monthly
// limit dot first, then what comes and goes while the agent works, and the machine badge last.
//
//   node scripts/screens-sidebar-row.mjs [outDir]     (npm run build first; TUCANO_ELECTRON=… for the installed app)
//
// A sector is seeded between two launches (Theo answers to Lia), because a fresh workspace has none and
// the grouping is the whole point: with no sector the row is drawn by another code path.
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { _electron as electron } from 'playwright'

const output = process.argv[2] ?? 'frames/sidebar-row'
mkdirSync(output, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-sidebar-row-'))
const installed = process.env.TUCANO_ELECTRON
const profile = `--user-data-dir=${join(data, 'electron')}`
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en-US', TUCANO_FAKE_HOLD_MS: '15000' }
const errors = []

const launch = async () => {
  const app = await electron.launch({
    args: installed ? [profile] : ['.', profile],
    ...(installed ? { executablePath: installed } : {}),
    env
  })
  const win = await app.firstWindow()
  win.on('pageerror', (e) => errors.push(String(e)))
  win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await win.setViewportSize({ width: 1280, height: 880 })
  await win.waitForSelector('.sidebar')
  await win.waitForTimeout(500)
  return { app, win }
}

// The menu a right click opens: its entries, in order, read as text.
const rightClick = async (win, target, name) => {
  const box = await target.boundingBox()
  assert.ok(box, `${name}: it is on screen`)
  await win.mouse.click(box.x + Math.min(60, box.width / 2), box.y + box.height / 2, { button: 'right' })
  await win.waitForTimeout(300)
  const items = await win.evaluate(() => [...document.querySelectorAll('.menu [role="menuitem"], .menu .menu__item')].map((e) => (e.textContent ?? '').trim()))
  await win.keyboard.press('Escape')
  await win.waitForTimeout(200)
  return items
}

// The row's own cells, left to right, with the box each one drew.
const rowCells = (win, name) =>
  win.evaluate((name) => {
    const row = [...document.querySelectorAll('.sidebar .nav-item')].find((n) => n.querySelector('.nav-item__label')?.textContent === name)
    if (!row) return null
    const box = row.getBoundingClientRect()
    return {
      wrapper: row.parentElement?.className?.trim(),
      row: { x: Math.round(box.x), right: Math.round(box.right) },
      cells: [...row.children].map((c) => {
        const b = c.getBoundingClientRect()
        return { cls: (c.className.baseVal ?? c.className).trim(), x: Math.round(b.x), right: Math.round(b.right) }
      })
    }
  }, name)

const first = await launch()
await first.app.close()
await new Promise((r) => setTimeout(r, 2500))

// A sector, a machine badge, and 90% of the month spent: every cell the row can carry, all at once.
const db = new DatabaseSync(join(data, 'tucano.db'))
const lia = db.prepare("SELECT id FROM agents WHERE name = 'Lia'").get()
const theo = db.prepare("SELECT id FROM agents WHERE name = 'Theo'").get()
db.prepare('UPDATE agents SET reports_to = ?, computer = 1, computer_kind = ?, limit_tokens = 1000 WHERE id = ?').run(lia.id, 'mac', theo.id)
db.prepare('INSERT INTO receipts (message_id, agent_id, engine, model, input_tokens, cache_read_tokens, output_tokens, ms, at) VALUES (?, ?, ?, ?, 0, 0, ?, 10, ?)').run('screens-receipt', theo.id, 'fake', 'fake', 900, Date.now())
db.close()

const { app, win } = await launch()
try {
  // Grouped: the agents list is drawn by sector, so each row comes from the group.
  assert.ok((await win.locator('.sidebar .agent-sector').count()) >= 1, 'the agents list is grouped by sector')
  await win.screenshot({ path: join(output, '01-sector-list.png') })

  // A channel above it answers the right click, and so does the agent's row.
  const channelItems = await rightClick(win, win.locator('.sidebar .channel-row .nav-item').first(), 'channel row')
  console.log(`channel row: ${channelItems.length} entries — ${channelItems.join(' | ')}`)
  assert.ok(channelItems.length > 0, 'a right click on a channel opens its menu')

  const theoRow = win.locator('.sidebar .agent-row', { has: win.locator('.nav-item__label', { hasText: 'Theo' }) }).first()
  const agentItems = await rightClick(win, theoRow, "an agent's row")
  console.log(`agent row: ${agentItems.length} entries — ${agentItems.join(' | ')}`)
  await win.screenshot({ path: join(output, '02-agent-menu.png') })
  assert.equal(agentItems.length, 3, "the agent's row opens its menu: message, edit, archive")

  // The end of the row, with the agent at work: the limit dot, then the dots (or the shield), then the
  // machine badge, which never moves.
  await win.evaluate(() => {
    const row = [...document.querySelectorAll('.sidebar .nav-item')].find((n) => /Theo/.test(n.textContent ?? ''))
    row?.click()
  })
  await win.waitForSelector('.composer__field textarea', { timeout: 20000 })
  await win.fill('.composer__field textarea', 'Liste três métricas que valem acompanhar num time pequeno.')
  await win.press('.composer__field textarea', 'Enter')
  const deadline = Date.now() + 20000
  let cells = null
  for (; Date.now() < deadline; ) {
    cells = await rowCells(win, 'Theo')
    if (cells?.cells.some((c) => c.cls.includes('working-dots') || c.cls.includes('waiting-pill'))) break
    await win.waitForTimeout(250)
  }
  console.log(JSON.stringify(cells, null, 1))
  assert.ok(cells, 'the row is on screen')
  const at = (needle) => cells.cells.findIndex((c) => c.cls.includes(needle))
  assert.ok(at('dot dot--') > -1, 'the monthly limit dot is drawn')
  assert.ok(at('working-dots') > -1, 'the working dots are drawn while it works')
  assert.ok(at('dot dot--') < at('working-dots'), 'the limit dot comes before what comes and goes')
  assert.ok(at('working-dots') < at('nav-item__mac'), 'the working dots come before the machine badge')
  assert.equal(at('nav-item__mac'), cells.cells.length - 1, 'the machine badge is the row’s last cell')
  await win.screenshot({ path: join(output, '03-row-end.png') })
  assert.deepEqual(errors, [], 'no renderer errors in the run')
  console.log('SIDEBAR_ROW_OK')
} finally {
  await app.close()
}
