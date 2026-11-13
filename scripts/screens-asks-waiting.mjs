// The Asks page after the "Waiting for you" work: the agents' questions, and the three prompts that
// used to exist only where they were made — a card an admin has to apply, a memory waiting to be
// kept, and a change the curator wants to make to a page. Seeded workspace, fake engines, temp data
// dir: nothing here touches the real database.
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const out = process.argv[2] ?? 'C:/tmp/asks-waiting'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1' }
const errors = []

const launch = async () => {
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1280, height: 900 })
  await win.waitForSelector('.sidebar')
  win.on('pageerror', (e) => errors.push(String(e)))
  win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  return { app, win }
}

// ---------- 1. make the workspace ----------
{
  const { app } = await launch()
  await app.close()
}

// ---------- 2. plant the three kinds that take a while to make by hand ----------
const ids = (() => {
  const db = new DatabaseSync(join(data, 'tucano.db'))
  const now = Date.now()
  // The screens read as English, like Apo reads the app.
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('language', JSON.stringify('en'))
  // Lia asks before keeping: a "remember this" then waits for the person instead of saving itself.
  db.prepare("UPDATE agents SET memory_mode = 'ask' WHERE handle = 'lia'").run()
  const theo = db.prepare("SELECT id FROM agents WHERE handle = 'theo'").get()
  const lia = db.prepare("SELECT id FROM agents WHERE handle = 'lia'").get()
  // A channel the two of them are in: a fresh workspace has no DM until someone opens one.
  const room = db.prepare("SELECT id FROM conversations WHERE kind = 'channel' ORDER BY rowid LIMIT 1").get()
  const owner = db.prepare("SELECT id, name FROM people ORDER BY rowid LIMIT 1").get()

  // A card the agents proposed and nobody has applied: Theo suggests a channel, Lia asked for it.
  const messageId = 'asks-demo-proposal'
  db.prepare('INSERT OR REPLACE INTO messages (id, conversation_id, author_kind, author_id, text, at, run) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    messageId,
    room.id,
    'agent',
    theo.id,
    'Abrir um canal só para o fechamento resolve as idas e voltas.',
    now - 90_000,
    JSON.stringify({ status: 'done', proposals: [{ kind: 'channel', name: 'financeiro', members: [theo.id, lia.id], needs: [] }] })
  )
  db.prepare('INSERT OR REPLACE INTO activity (id, at, person_id, kind, target, detail) VALUES (?, ?, ?, ?, ?, ?)').run(
    'asks-demo-forwarded',
    now - 90_000,
    owner.id,
    'proposal.forwarded',
    messageId,
    JSON.stringify({ index: 0 })
  )
  db.close()

  // The curator wants to change a page that already exists: it waits in the wiki tab, and now here.
  const wiki = new DatabaseSync(join(data, 'wiki.db'))
  wiki
    .prepare('INSERT OR REPLACE INTO changes (id, source_id, at, by, state, ops, base, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(
      'asks-demo-change',
      null,
      now - 240_000,
      'auto',
      'pending',
      JSON.stringify([
        { op: 'replace', page: 'Reforma', section: 'Situação', old: 'Obra começa em janeiro.', new: 'Obra começa em **fevereiro**: a visita do Marcos ficou para 10/11.' }
      ]),
      JSON.stringify({}),
      'No Marcos: the visit moved to 10/11 and the work starts in February.'
    )
  wiki.close()
  return { liaison: lia.id, theo: theo.id, owner: owner.name }
})()

// ---------- 3. a question and a memory, both by asking an agent ----------
const { app, win } = await launch()
const shot = (name, opts = {}) => win.screenshot({ path: `${out}/${name}.png`, ...opts })

try {
  // Opening Lia's DM from the sidebar the way a person does.
  await win.click(`.section:has-text("Agents") .nav-item:has-text("Lia")`)
  await win.click('button:has-text("Open DM")')
  await win.waitForSelector('.composer textarea', { timeout: 20_000 })
  await win.fill('.composer textarea', 'me pergunte pra quando eu preciso do relatório')
  await win.keyboard.press('Enter')
  await win.waitForSelector('text=Pra quando você precisa disso?', { timeout: 25_000 })
  await win.waitForTimeout(400)

  await win.fill('.composer textarea', 'lembre que eu prefiro PRs pequenos')
  await win.keyboard.press('Enter')
  await win.waitForTimeout(2500)
  console.log(`memory rows in the store: ${await win.evaluate(() => window.tucano?.debugMemories?.() ?? 'n/a')}`)

  // ---------- 4. the page ----------
  await win.click('.nav-item:has-text("Asks")')
  await win.waitForSelector('.page', { timeout: 10_000 })
  await win.waitForTimeout(900)
  await shot('01-asks-everything')

  const sections = await win.locator('.section-title').allTextContents()
  console.log(`sections: ${JSON.stringify(sections)}`)
  const badge = await win.locator('.nav-item:has-text("Asks") .nav-badge, .nav-item:has-text("Asks") [class*=badge]').first().textContent().catch(() => null)
  console.log(`Asks badge: ${badge}`)
  console.log(`rest screen: ${await win.locator('text=Nothing waiting on you').count()}`)

  // The memory's own buttons, in place: the same page decides it.
  console.log(`Keep buttons: ${await win.locator('.page button:has-text("Keep")').count()}`)
  console.log(`Approve buttons: ${await win.locator('.page button:has-text("Approve")').count()}`)

  // Scrolled to the three new sections, so the frame shows them rather than the questions alone.
  await win.locator('.section-title:has-text("Memories waiting for you")').scrollIntoViewIfNeeded()
  await win.waitForTimeout(400)
  await shot('02-memories-and-wiki')
  await win.locator('.section-title:has-text("Cards waiting for an admin to apply")').scrollIntoViewIfNeeded()
  await win.waitForTimeout(400)
  await shot('03-cards-to-apply')

  // 420 px: the narrowest window the app allows, nothing clipped.
  await win.setViewportSize({ width: 420, height: 900 })
  await win.waitForTimeout(600)
  await win.evaluate(() => window.scrollTo(0, 0))
  await shot('04-narrow')
  const wide = await win.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  console.log(`narrow: overflow ${wide}px`)
} catch (e) {
  errors.push(`run: ${String(e).split('\n')[0]}`)
  await shot('erro')
} finally {
  console.log(`console errors: ${errors.length ? JSON.stringify(errors.slice(0, 5)) : 'none'}`)
  await app.close()
}
console.log(`data dir: ${data}`)
