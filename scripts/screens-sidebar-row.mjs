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

  // At rest the row's own cells end where a channel's do: the machine badge is the row's last cell, not
  // parked a gear's width short of its end. Read before the pointer comes near, or the hover state
  // measured is the hover state.
  const padRight = await theoRow.evaluate((row) => parseFloat(getComputedStyle(row.querySelector('.nav-item')).paddingRight))
  const channelPad = await win.locator('.sidebar .channel-row .nav-item').first().evaluate((n) => parseFloat(getComputedStyle(n).paddingRight))
  const rest = await rowCells(win, 'Theo')
  console.log(`at rest: ${rest.cells.map((c) => `${c.cls} ${c.x}–${c.right}`).join(' | ')}`)
  const mac = rest.cells.find((c) => c.cls.includes('nav-item__mac'))
  assert.ok(mac, 'the machine badge is on the row')
  assert.equal(mac.right, rest.row.right - padRight, "the machine badge ends at the row's own edge")
  assert.equal(rest.cells[rest.cells.length - 1].cls.includes('nav-item__mac'), true, 'the machine badge is the last cell')
  assert.equal(padRight, channelPad, 'at rest the row keeps no room for the gear, where a channel keeps none either')
  await theoRow.screenshot({ path: join(output, '04-row-rest.png') })

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

  // With the pointer on the row, the gear's room opens and both icons sit in it: the machine badge moves
  // left with the rest of the row's cells and the gear is drawn after it, no cell on top of another.
  await theoRow.hover()
  await win.waitForTimeout(300)
  const hover = await rowCells(win, 'Theo')
  const hoverMac = hover.cells.find((c) => c.cls.includes('nav-item__mac'))
  const hoverGear = await theoRow.evaluate((row) => {
    const g = row.querySelector(':scope > .agent-row__gear').getBoundingClientRect()
    return { x: Math.round(g.x), opacity: getComputedStyle(row.querySelector(':scope > .agent-row__gear')).opacity }
  })
  const hoverPad = await theoRow.evaluate((row) => parseFloat(getComputedStyle(row.querySelector('.nav-item')).paddingRight))
  console.log(`on hover: badge ${hoverMac?.x}–${hoverMac?.right}, gear ${hoverGear.x}–${hoverGear.x + 20}, opacity ${hoverGear.opacity}, padding ${hoverPad}`)
  assert.equal(hoverGear.opacity, '1', 'the gear is drawn on hover')
  assert.ok(hoverPad > padRight, 'the gear takes room on hover')
  assert.equal(hoverMac?.right, hover.row.right - hoverPad, "the badge ends where the row's cells make way")
  assert.ok(hoverMac.right < rest.row.right - padRight, 'the badge moved left of where it sits at rest')
  assert.ok(hoverMac.right <= hoverGear.x, 'the badge makes room for the gear instead of sitting under it')
  // Last, because a screenshot brings the row into view and that drops the pointer off it.
  await theoRow.screenshot({ path: join(output, '05-row-hover.png') })
  await win.mouse.move(0, 0)
  // The fake engine answers this at once, so the row carries the dots only while the reply runs and then
  // for the 1500 ms they stay green and fade. A first read taken after that fade says "the row never
  // worked" about a row that did, which is a slow harness, not a defect: sample every 80 ms from the
  // moment the press lands, and send once more if the press itself never started a reply.
  const sendOnce = async () => {
    await win.fill('.composer__field textarea', 'Liste três métricas que valem acompanhar num time pequeno.')
    await win.press('.composer__field textarea', 'Enter')
  }
  const rowAtWork = async (ms) => {
    const until = Date.now() + ms
    for (; Date.now() < until; ) {
      const drawn = await rowCells(win, 'Theo')
      if (drawn?.cells.some((c) => c.cls.includes('working-dots') || c.cls.includes('waiting-pill'))) return drawn
      await win.waitForTimeout(80)
    }
    return null
  }
  let cells = null
  for (let attempt = 0; attempt < 2 && !cells; attempt++) {
    await sendOnce()
    cells = await rowAtWork(15000)
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
