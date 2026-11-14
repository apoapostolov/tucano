import assert from 'node:assert/strict'
import { join } from 'node:path'
import { measureCopy } from './copy-layout.mjs'

// Reuse the hidden Electron session, including the installed executable and its display scaling.
export async function checkSettingsCopy(page, output, guard) {
  const originalViewport = page.viewportSize() ?? { width: 1280, height: 900 }
  const measurements = []
  for (const width of [1280, 900, 760]) {
    await page.setViewportSize({ width, height: 900 })
    await page.locator('#settings-tab-app').click()
    await page.locator('.settings-sections a[href="#settings-app-conversation"]').click()
    const copy = await measureCopy(page, [
      { selector: '#settings-app-conversation .key-row strong', maxLines: 1 },
      { selector: '#settings-app-conversation .key-row p.muted.small' }
    ])
    assert.ok(copy.passed, JSON.stringify(copy.failures))
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    await guard()
    const screenshot = `installed-conversation-${width}.png`
    await page.screenshot({ path: join(output, screenshot) })
    measurements.push({ ...copy, screenshot, display: await page.evaluate(() => ({ devicePixelRatio, screenWidth: screen.width, screenHeight: screen.height })) })
  }
  await page.setViewportSize(originalViewport)
  return measurements
}
