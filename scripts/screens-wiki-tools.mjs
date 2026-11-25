// Frames and numbers for the Knowledge › Wiki toolbar: where the taxonomy, search, settings and
// New page controls sit, and how far the canvas reaches. Run after `npm run build`:
//   node scripts/screens-wiki-tools.mjs <out-dir> [before|after]
// A scratch data dir, the seed and fake engines keep the real wiki untouched. Both flags are
// computed from bounding boxes and computed styles, never from a class name.
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const out = process.argv[2] ?? 'C:/tmp/wiki-tools'
const tag = process.argv[3] === 'before' ? 'before' : 'after'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-wiki-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en-US' }
delete env.ELECTRON_RUN_AS_NODE
delete env.ELECTRON_RENDERER_URL

const launch = async (width, height) => {
  const app = await electron.launch({ args: ['.'], cwd: process.cwd(), env })
  const win = await app.firstWindow()
  const errors = []
  win.on('pageerror', (e) => errors.push(String(e)))
  win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await win.setViewportSize({ width, height })
  await win.waitForSelector('.sidebar', { timeout: 30000 })
  await win.waitForTimeout(900)
  return { app, win, errors }
}

// The first start makes the workspace and the wiki file; then the graph is written the way the
// curator would, so the canvas has something to draw.
const first = await launch(1440, 900)
await first.app.close()

const PAGES = [
  ['release-discipline', 'Release discipline', 'Project', 'How a build reaches the person and what it owes them.'],
  ['settings-by-task', 'Settings by task', 'Decision', 'The settings page is arranged by what a person is trying to do.'],
  ['the-wiki-graph', 'The wiki graph', 'Topic', 'Pages are nodes, a link is an edge, and a page nobody links to still shows.'],
  ['lia-engineering', 'Lia', 'Person', 'Engineering, answers to nobody, owns the channels about code.'],
  ['theo-data', 'Theo', 'Person', 'Data, the numbers that move a decision.'],
  ['nina-content', 'Nina', 'Content', 'Content, the words that leave the workspace.'],
  ['delegation', 'Delegation', 'Topic', 'An agent hands part of a job to the agent that holds the part.'],
  ['correction-windows', 'Correction windows', 'Decision', 'Notes land in one build per window instead of one build per note.'],
  ['the-install-lock', 'The install lock', 'Project', 'One install at a time, with a lock that outlives a crashed session.'],
  ['read-only-wiki', 'The key only reads', 'Topic', 'A git-backed wiki shows what is in the repository and takes no writes.'],
  ['the-drawer', 'The work drawer', 'Project', 'The replies running now, above the field.'],
  ['first-start', 'First start', 'Topic', 'What a new workspace already has before anyone writes anything.']
]
const LINKS = [
  ['release-discipline', 'correction-windows'],
  ['correction-windows', 'the-install-lock'],
  ['settings-by-task', 'lia-engineering'],
  ['the-wiki-graph', 'read-only-wiki'],
  ['delegation', 'theo-data'],
  ['delegation', 'nina-content'],
  ['the-drawer', 'the-wiki-graph'],
  ['first-start', 'the-wiki-graph']
]
// The wiki folder is the truth, the index is derived from it. Write the seed the way Obsidian
// would, then let the app index it on the next start.
const pagesDir = join(data, 'wiki', 'pages')
mkdirSync(pagesDir, { recursive: true })
for (const [file, title, kind, summary] of PAGES) {
  const outgoing = LINKS.filter(([a]) => a === file).map(([, b]) => `[[${b}]]`).join(' · ')
  const body = `---\ntipo: ${kind}\n---\n\n# ${title}\n\n${summary}\n\nThis page exists so the graph has a shape: it links to other pages and other pages link back.${outgoing ? `\n\nLinks: ${outgoing}.` : ''}\n`
  writeFileSync(join(pagesDir, `${file}.md`), body)
}

const { app, win, errors } = await launch(1440, 900)
await win.locator('.sidebar button[data-hub="knowledge"]').first().click()
await win.waitForSelector('.hub', { timeout: 20000 })
await win.locator('.hub__tab[data-tab="wiki"]').click()
await win.waitForSelector('.wk-stage', { timeout: 20000 })
await win.waitForTimeout(1800)

const selectors = ['.hub__head', '.hub__tabs-row', '.hub__tabs', '.hub__tools', '.hub__tools-note', '.wk-kinds', '.wk-search-btn', '.wk-stage', '.wk-canvas', '.page-body--fill', '.phead__actions']
const props = ['display', 'visibility', 'opacity', 'alignItems', 'gap', 'marginTop', 'paddingBottom', 'overflowX', 'borderTopWidth', 'borderTopStyle', 'borderBottomWidth', 'borderBottomStyle']
const measure = () => win.evaluate(({ selectors, props }) => {
  const out = {}
  for (const sel of selectors) {
    const el = document.querySelector(sel)
    if (!el) { out[sel] = null; continue }
    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el)
    out[sel] = {
      box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) },
      style: Object.fromEntries(props.map((p) => [p, s[p] ?? null]))
    }
  }
  const label = (el) => el?.getAttribute('aria-label') || el?.getAttribute('title') || (el?.textContent ?? '').trim() || null
  const toolbar = document.querySelector('.hub__tools [role="toolbar"], .phead__actions [role="toolbar"]')
  out.accessible = {
    toolbarName: toolbar ? label(toolbar) : null,
    controls: [...document.querySelectorAll('.hub__tools [role="toolbar"] > *, .phead__actions [role="toolbar"] > *')].map((el) => ({ tag: el.tagName.toLowerCase(), name: label(el) })),
    tabs: [...document.querySelectorAll('.hub__tab')].map((el) => ({ tab: el.dataset.tab, name: label(el) }))
  }
  return out
}, { selectors, props })

const checksFor = (m) => {
  const head = m['.hub__head']?.box
  const search = m['.wk-search-btn']?.box
  const stage = m['.wk-stage']?.box
  const row = m['.hub__tabs-row']?.box
  const tools = m['.hub__tools']?.box
  const note = m['.hub__tools-note']
  return {
    tools_above_hairline: !!(head && search && search.y + search.h <= head.y + head.h + 1),
    canvas_starts_at_hairline: !!(head && stage && Math.abs(stage.y - (head.y + head.h)) <= 2),
    tools_in_hub_row: !!(row && tools && tools.y >= row.y && tools.bottom <= row.bottom + 1 && tools.right <= row.right + 1),
    search_in_hub_row: !!(head && search && search.bottom <= head.y + head.h + 1),
    count_note_hidden: note ? note.style.display === 'none' : null,
    stage_border_removed_in_hub: m['.wk-stage']?.style.borderTopWidth === '0px',
    named_toolbar: !!m.accessible?.toolbarName,
    named_controls: (m.accessible?.controls ?? []).filter((c) => c.name).length
  }
}

const rows = []
for (const [width, height, name] of [[1440, 900, '1440'], [420, 900, '420']]) {
  await win.setViewportSize({ width, height })
  await win.waitForTimeout(900)
  const measurements = await measure()
  const frame = `${tag}-${name}.png`
  await win.screenshot({ path: join(out, frame), animations: 'disabled' })
  rows.push({ size: `${width}x${height}`, frame, measurements, checks: checksFor(measurements) })
}

writeFileSync(join(out, 'frames.json'), JSON.stringify({
  story: 'wiki-tools',
  script: 'scripts/screens-wiki-tools.mjs',
  tag,
  tool: 'bounding boxes and computed styles from the rendered window',
  rows,
  errors: errors.slice(0, 10)
}, null, 2) + '\n')
console.log(JSON.stringify({ tag, rows: rows.map((r) => ({ size: r.size, frame: r.frame, checks: r.checks })), errors: errors.slice(0, 5) }, null, 2))
await app.close()
