import assert from 'node:assert/strict'
import { join } from 'node:path'
import { measureCopy } from './copy-layout.mjs'
import { electronCopyViewport } from './electron-copy-viewport.mjs'

// Reuse the hidden Electron session, including the installed executable and its display scaling.
export async function checkSettingsCopy(page, output, guard, resize) {
  const viewport = await electronCopyViewport(page, resize)
  const measurements = []
  for (const width of [null, 1280, 900]) {
    await viewport.set(width)
    await page.locator('#settings-tab-app').click()
    await page.locator('.settings-sections a[href="#settings-app-conversation"]').click()
    const copy = await measureCopy(page, [
      { selector: '#settings-app-conversation .key-row strong', maxLines: 1 },
      { selector: '#settings-app-conversation .key-row p.muted.small' }
    ])
    assert.ok(copy.passed, JSON.stringify(copy.failures))
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    await guard()
    const screenshot = `installed-conversation-${width ?? "native"}.png`
    await page.screenshot({ path: join(output, screenshot) })
    measurements.push({ ...copy, screenshot, display: await page.evaluate(() => ({ devicePixelRatio, screenWidth: screen.width, screenHeight: screen.height })) })
  }
  await viewport.restore()
  const preference = page.locator('#settings-app-conversation .key-row').filter({ has: page.getByText('Expand steps while working', { exact: true }) }).getByRole('switch')
  assert.equal(await preference.getAttribute('aria-checked'), 'true')
  await preference.click()
  await page.waitForFunction(() => document.querySelector('#settings-app-conversation .toggle')?.getAttribute('aria-checked') === 'false')
  await page.reload()
  await page.locator('.sidebar .nav-item').filter({ hasText: 'Settings' }).first().click()
  await page.locator('#settings-tab-app').click()
  await page.locator('.settings-sections a[href="#settings-app-conversation"]').click()
  assert.equal(await preference.getAttribute('aria-checked'), 'false', 'Personal step preference must survive reload')
  return measurements
}
