// The drawer's finished row: the reply's own line says what it was, and the Follow Up pill sits at its
// end with the width its words need. A pill that shrinks gives way by wrapping "Follow Up" over two
// lines, which reads as two controls, so this measures the pill's height against one line and its box
// against the row at two widths.
//
//   node scripts/screens-drawer-follow.mjs [outDir]     (npx electron-vite build; TUCANO_ELECTRON=… for the installed app)
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const out = process.argv[2] ?? 'C:/tmp/drawer-follow'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-follow-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_FAKE_HOLD_MS: '1200' }
const errors = []

const app = await electron.launch({ args: env.TUCANO_ELECTRON ? [] : ['.'], ...(env.TUCANO_ELECTRON ? { executablePath: env.TUCANO_ELECTRON } : {}), env })
const win = await app.firstWindow()
await win.setViewportSize({ width: 1280, height: 900 })
await win.waitForSelector('.sidebar')
win.on('pageerror', (e) => errors.push(String(e)))
win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const shot = async (name) => {
  await win.screenshot({ path: join(out, `${name}.png`) })
  console.log(`  shot ${join(out, `${name}.png`)}`)
}

// A DM, because a reply of an agent's own is what the drawer lists.
await win.evaluate(() => {
  const row = [...document.querySelectorAll('.sidebar .nav-item')].find((n) => /Lia|Theo|Nina/.test(n.textContent ?? ''))
  row?.click()
})
await win.waitForSelector('.composer__field textarea', { timeout: 15000 })

// A request long enough that the row's own words have to be the thing that gives way.
const prompt = 'Check the release notes for 0.2.41 in the repository, list every bullet that changed the drawer, and tell me which of them still need a screenshot before I publish the release on GitHub today.'
await win.fill('.composer__field textarea', prompt)
await win.press('.composer__field textarea', 'Enter')

// The reply ends on its own (fake engine), and its row stays in the drawer's Finished group.
try {
  await win.waitForSelector('.work-row--done .steps__ask-pill', { timeout: 30000 })
} catch {
  // The drawer can be shut by the time the reply ends: its head opens it, and the finished row is there.
  await win.click('.work-drawer__head').catch(() => {})
  try {
    await win.waitForSelector('.work-row--done .steps__ask-pill', { timeout: 30000 })
  } catch (e) {
    console.log(JSON.stringify(await win.evaluate(() => ({
      messages: document.querySelectorAll('.msg').length,
      drawer: !!document.querySelector('.work-drawer'),
      rows: [...document.querySelectorAll('.work-row')].map((r) => r.className),
      head: document.querySelector('.work-drawer__head')?.textContent ?? null,
      pills: document.querySelectorAll('.steps__ask-pill').length,
      alerts: [...document.querySelectorAll('[role="alert"], .toast, .notice')].map((n) => n.textContent)
    })), null, 2))
    await shot('00-no-finished-row')
    console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no console errors')
    await app.close()
    throw e
  }
}
await win.waitForTimeout(600)

const measure = () => win.evaluate(() => {
  const row = document.querySelector('.work-row--done')
  const pill = row?.querySelector('.steps__ask-pill')
  const go = row?.querySelector('.work-row__go')
  const text = row?.querySelector('.work-row__text')
  const drawer = row?.closest('.work-drawer')
  if (!row || !pill) return null
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), right: Math.round(r.right), y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width) } }
  const cs = getComputedStyle(pill)
  return {
    row: box(row),
    drawer: drawer ? box(drawer) : null,
    go: go ? box(go) : null,
    text: text ? { ...box(text), ellipsized: text.scrollWidth > text.clientWidth } : null,
    word: (() => {
      const w = pill.querySelector('.steps__ask-pill__word')
      return w ? { display: getComputedStyle(w).display, text: (w.textContent ?? '').trim() } : null
    })(),
    name: pill.getAttribute('aria-label'),
    pill: {
      ...box(pill),
      lineHeight: cs.lineHeight,
      whiteSpace: cs.whiteSpace,
      // The pill's height is fixed at 22px, so a wrapped label spills inside it instead of growing it:
      // scrollHeight over clientHeight is the spill, whichever line the words went to.
      scrollH: pill.scrollHeight,
      clientH: pill.clientHeight,
      scrollW: pill.scrollWidth,
      clientW: pill.clientWidth,
      label: (pill.textContent ?? '').trim()
    }
  }
})

const wide = await measure()
console.log('1280:', JSON.stringify(wide, null, 2))
await shot('01-drawer-1280')

// Narrow enough that the pill has to be protected rather than merely lucky.
await win.setViewportSize({ width: 420, height: 860 })
await win.waitForTimeout(400)
const narrow = await measure()
console.log('420:', JSON.stringify(narrow, null, 2))
await shot('02-drawer-420')

const oneLine = (m) => !!m && m.pill.whiteSpace === 'nowrap' && m.pill.scrollH <= m.pill.clientH + 1 && m.pill.scrollW <= m.pill.clientW + 1
const inside = (m) => !!m && m.drawer && m.pill.right <= m.drawer.right && m.pill.x >= m.drawer.x
const givesWay = (m) => !m || m.text === null || m.text.ellipsized || m.text.w < 900
// A phone has no room for the word: the glyph alone, named for a screen reader, inside the same drawer.
const wordy = (m) => !!m && m.word?.display !== 'none' && m.pill.w > 55
const glyphOnly = (m) => !!m && m.word?.display === 'none' && m.pill.w < 45 && (m.name ?? '').length > 0
const ok = oneLine(wide) && inside(wide) && wordy(wide) && oneLine(narrow) && inside(narrow) && glyphOnly(narrow)
console.log(`label "${wide?.pill?.label}" fits ${wide?.pill?.scrollW}x${wide?.pill?.scrollH} in ${wide?.pill?.clientW}x${wide?.pill?.clientH} at 1280, ${narrow?.pill?.scrollW}x${narrow?.pill?.scrollH} in ${narrow?.pill?.clientW}x${narrow?.pill?.clientH} at 420`)
console.log(`the pill reads ${wide?.word?.text} (${wide?.pill?.w}px) at 1280 and ${narrow?.word === null ? 'no word' : narrow.word.display === 'none' ? 'the glyph alone' : narrow.word.text} (${narrow?.pill?.w}px) at 420, named "${narrow?.name ?? ''}"`)
console.log(`the row's words ${
  givesWay(wide) && givesWay(narrow) ? 'are the part that gives way' : 'keep their width while the pill is squeezed'
}`)
console.log(ok ? 'VERDICT: the Follow Up pill keeps one line and its box, both widths' : 'VERDICT: the pill still wraps or spills')
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no console errors')
await app.close()
process.exit(ok ? 0 : 1)
