// The section strip in the wiki's settings dialog, measured in the built app: the modal's own box
// scrolls, the strip sticks at its top, every group it names has its card, and a click parks that
// group 16 px under the strip with the section itself focused. Run after `npm run build`:
//   node scripts/qa-wiki-settings-strip.mjs [output dir]
// A scratch data directory, seeded content and the fake engines keep the daily instance untouched.
import { _electron as electron } from 'playwright'
import { mkdtempSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const WIDTHS = [1280, 900]
const output = process.argv[2] || join(tmpdir(), 'tucano-wiki-strip')
mkdirSync(output, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-qa-wiki-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en-US' }
const app = await electron.launch({ args: ['.'], env })
const win = await app.firstWindow()
await win.waitForSelector('.sidebar')
await win.locator('.sidebar >> text=Knowledge').first().click()
await win.getByRole('tab', { name: 'Wiki', exact: true }).click()
await win.waitForTimeout(1200)
await win.locator('[title="Wiki settings"]').click()
await win.waitForSelector('.wk-settings .settings-sections', { timeout: 10000 })

const failures = []
const measurements = []
for (const width of WIDTHS) {
  await win.setViewportSize({ width, height: 900 })
  await win.waitForTimeout(300)
  const row = await win.evaluate(() => {
    const modal = document.querySelector('.wk-settings')
    const strip = modal.querySelector('.settings-sections')
    const style = getComputedStyle(strip)
    return {
      links: [...strip.querySelectorAll('a')].map(link => link.getAttribute('href').replace('#settings-', '')),
      anchors: [...modal.querySelectorAll('[data-settings-section]')].map(card => card.dataset.settingsSection),
      clientW: strip.clientWidth,
      scrollW: strip.scrollWidth,
      position: style.position,
      modalScrolls: modal.scrollHeight > modal.clientHeight,
      hidden: [...strip.children].filter(child => child.offsetParent === null).length
    }
  })
  measurements.push({ width, ...row, links: row.links.length })
  const label = `${width}px`
  if (row.scrollW > row.clientW) failures.push(`${label}: the strip scrolls sideways (${row.scrollW} > ${row.clientW})`)
  if (row.position !== 'sticky') failures.push(`${label}: the strip is ${row.position}, not sticky`)
  if (row.hidden) failures.push(`${label}: ${row.hidden} links are not painted`)
  if (row.links.join('|') !== row.anchors.join('|')) failures.push(`${label}: links ${row.links.join(',')} do not match the groups ${row.anchors.join(',')}`)
  if (!row.modalScrolls) failures.push(`${label}: the dialog does not scroll, so its strip cannot take the box anywhere`)
  await win.screenshot({ path: join(output, `wiki-settings-${width}.png`) })
  if (width !== 1280) continue
  for (const id of row.links) {
    await win.locator(`.wk-settings .settings-sections a[href="#settings-${id}"]`).click()
    await win.waitForFunction(target => {
      const card = document.querySelector(`.wk-settings [data-settings-section="${target}"]`)
      const strip = document.querySelector('.wk-settings .settings-sections')
      if (!card || !strip) return false
      if (strip.hasAttribute('data-settings-scrolling')) return false
      const modal = document.querySelector('.wk-settings')
      const atEnd = modal.scrollTop >= modal.scrollHeight - modal.clientHeight - 2
      const atStart = modal.scrollTop <= 0
      const offset = card.getBoundingClientRect().top - strip.getBoundingClientRect().bottom
      // The first group cannot rise above the box's own top, and the last one is held by the tail.
      // 16 px is the promise; the strip's own position moves a few pixels between the move and the
      // measurement when the box is at either end of its own scroll.
      return (offset >= 4 && offset <= 22) || ((atStart || atEnd) && offset > 0)
    }, id, { timeout: 5000 })
    const state = await win.evaluate(target => ({
      active: document.activeElement.getAttribute('data-settings-section'),
      current: document.querySelector('.wk-settings .settings-sections [aria-current="location"]')?.getAttribute('href')?.replace('#settings-', ''),
      stripTop: document.querySelector('.wk-settings .settings-sections').getBoundingClientRect().top,
      boxTop: document.querySelector('.wk-settings').getBoundingClientRect().top + 1,
      target
    }), id)
    if (state.active !== id) failures.push(`${label}: ${id} is not the focused group after its link (${state.active})`)
    if (state.current !== id) failures.push(`${label}: the strip names ${state.current} after ${id}`)
    if (state.stripTop < state.boxTop - 1) failures.push(`${label}: the strip scrolled out of the dialog (${state.stripTop.toFixed(1)} above the box at ${state.boxTop.toFixed(1)})`)
  }
}

await app.close()
console.log(JSON.stringify({ failures, measurements }, null, 2))
console.log(failures.length ? `\n${failures.length} wiki strip problem(s)` : '\nthe wiki settings strip holds')
process.exit(failures.length ? 1 : 0)
