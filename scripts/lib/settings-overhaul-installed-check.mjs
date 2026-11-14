import assert from 'node:assert/strict'
import { join } from 'node:path'
import { measureCopy } from './copy-layout.mjs'
import { electronCopyViewport } from './electron-copy-viewport.mjs'

export async function checkSettingsOverhaul(page, output, guard, resize) {
  const viewport = await electronCopyViewport(page, resize)
  const measurements = []
  const failures = []
  for (const width of [null, 1280, 900]) {
    await viewport.set(width)
    for (const id of ['app', 'workspace', 'agents', 'models', 'knowledge', 'connections']) {
      const tab = page.locator('#settings-tab-' + id)
      if (!(await tab.count())) continue
      await tab.click()
      await page.evaluate(() => document.fonts.ready)
      const grouped = await page.locator('.settings-content .card').evaluateAll(nodes => nodes.every(node => {
        const style = getComputedStyle(node)
        return style.borderRadius !== '0px' && style.boxShadow === 'none'
      }))
      assert.ok(grouped, 'Settings groups must have restrained rounded borders without shadows')
      const copy = await measureCopy(page, [
        { selector: '.settings-pages button, .settings-sections a', maxLines: 1 },
        { selector: '.settings-content .hint:visible, .settings-content .card__head p:visible, .settings-content .key-row p.muted.small:visible, .settings-content .wk-setting small:visible, .settings-content .workspace-danger__section > p:visible' }
      ])
      const exceptions = copy.failures.filter(item => item.text?.startsWith('Export everything from Workspace'))
      copy.failures = copy.failures.filter(item => !exceptions.includes(item))
      copy.exceptions = exceptions.map(item => ({ ...item, reason: 'Full restore replacement consequences and database-only distinction must stay visible.' }))
      copy.passed = copy.failures.length === 0
      failures.push(...copy.failures.map(failure => ({ width: width ?? 'native', page: id, ...failure })))
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      const display = await page.evaluate(() => ({ devicePixelRatio, width: innerWidth, screenWidth: screen.width, screenHeight: screen.height }))
      const screenshot = `installed-settings-${width ?? 'native'}-${id}.png`
      await guard()
      await page.screenshot({ path: join(output, screenshot) })
      await guard()
      measurements.push({ ...copy, screenshot, display })
    }
  }
  await viewport.restore()
  assert.deepEqual(failures, [], JSON.stringify(failures))
  return measurements
}
