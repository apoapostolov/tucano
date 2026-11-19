// The strip that keeps a waiting question next to the field (AskStrip): it has to read as one line of
// its own above the composer, never as loose words in the column. The 0.2.39 rebase kept the wrapper
// and dropped the pill's rules, so the strip rendered as an unstyled button and its parts ran together
// ("Shipper1. Install ... 1 choiceAnswer"). This measures the box, not the class list.
//
//   node scripts/screens-ask-strip.mjs [outDir]     (after npx electron-vite build)
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const out = process.argv[2] ?? 'C:/tmp/ask-strip'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-strip-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1' }
const errors = []

const launch = async () => {
  const app = await electron.launch({ args: env.TUCANO_ELECTRON ? [] : ['.'], ...(env.TUCANO_ELECTRON ? { executablePath: env.TUCANO_ELECTRON } : {}), env })
  const win = await app.firstWindow()
  await win.setViewportSize({ width: 1280, height: 900 })
  await win.waitForSelector('.sidebar')
  win.on('pageerror', (e) => errors.push(String(e)))
  win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  return { app, win }
}

// ---------- 1. a workspace to plant the question in ----------
{
  const { app } = await launch()
  await app.close()
}

// ---------- 2. a reply that asked and waits ----------
const question = '1. Install the packed 29a650ab build now, to get today’s five off your screen’s 0.2.37? (Install now | Wait for 01:41)'
const asked = (() => {
  const db = new DatabaseSync(join(data, 'tucano.db'))
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('language', JSON.stringify('en'))
  const conv = db.prepare("SELECT id FROM conversations WHERE kind = 'dm' LIMIT 1").get()
  if (!conv) throw new Error('the seed made no DM to ask in')
  const agent = db.prepare('SELECT id, name FROM agents WHERE id = (SELECT agent_id FROM members WHERE conversation_id = ?) LIMIT 1').get(conv.id)
    ?? db.prepare("SELECT id, name FROM agents WHERE handle = 'lia'").get()
  const run = {
    status: 'waiting_input',
    steps: [],
    question,
    questions: [{ question: 'Install now, or wait for the window at 01:41?', kind: 'single', options: [{ label: 'Install now' }, { label: 'Wait for 01:41' }] }]
  }
  db.prepare('INSERT OR REPLACE INTO messages (id, conversation_id, author_kind, author_id, text, at, run) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('strip-ask', conv.id, 'agent', agent?.id ?? null, '', Date.now(), JSON.stringify(run))
  db.close()
  return { conv: conv.id, agent: agent?.name ?? 'Lia' }
})()

// ---------- 3. the strip as it is drawn ----------
const { app, win } = await launch()
const shot = async (name) => {
  await win.screenshot({ path: join(out, `${name}.png`) })
  console.log(`  shot ${join(out, `${name}.png`)}`)
}

// The DM's row in the sidebar, by the agent's name.
await win.click(`.nav-item:has-text("${asked.agent}")`)
await win.waitForSelector('.ask-strip', { timeout: 15000 })
await shot('01-strip')

const strip = await win.evaluate(() => {
  const el = document.querySelector('.ask-strip')
  if (!el) return null
  const s = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  const parts = [...el.children].map((c) => {
    const cs = getComputedStyle(c)
    const cr = c.getBoundingClientRect()
    return { cls: c.className, text: (c.textContent ?? '').slice(0, 40), x: Math.round(cr.x), w: Math.round(cr.width), display: cs.display, overflow: cs.overflow }
  })
  const text = el.querySelector('.ask-strip__text')
  const ts = text ? getComputedStyle(text) : null
  return {
    display: s.display,
    gap: s.gap,
    padding: s.padding,
    borderRadius: s.borderRadius,
    borderWidth: s.borderTopWidth,
    box: { w: Math.round(r.width), h: Math.round(r.height) },
    textEllipsis: ts ? { overflow: ts.overflowX, whiteSpace: ts.whiteSpace, textOverflow: ts.textOverflow } : null,
    parts
  }
})

console.log(JSON.stringify(strip, null, 2))

const ok = strip && strip.display === 'flex' && strip.box.h >= 30 && strip.borderRadius !== '0px' && strip.textEllipsis?.textOverflow === 'ellipsis'
console.log(ok ? 'VERDICT: the strip is drawn as its own boxed line' : 'VERDICT: the strip is unstyled (rules missing from styles.css)')
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no console errors')
await app.close()
process.exit(ok ? 0 : 1)
