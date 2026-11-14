// Capture reviewed text that is reachable in actual Settings, agent editors, and Wiki.
// Use feature-specific flows as well for conditional/error/dialog states this walk cannot reach.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'node:net'
import { _electron as electron } from 'playwright'
import { measureCopy } from './lib/copy-layout.mjs'
const review = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const rows = review.strings.filter(row => row.decision === 'replace')
const output = resolve(process.argv[3])
mkdirSync(output, { recursive: true })
const reservations = await Promise.all([0, 1].map(async () => {
  const server = createServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return { server, port: server.address().port }
}))
const env = { ...process.env, TUCANO_DATA: mkdtempSync(join(tmpdir(), 'tucano-reviewed-copy-')), TUCANO_FAKE_ENGINES: '1', TUCANO_SEED: '1', TUCANO_LOCALE: 'en-US', TUCANO_WEBHOOK_PORT: String(reservations[0].port), TUCANO_GIT_PORT: String(reservations[1].port) }
delete env.ELECTRON_RUN_AS_NODE
delete env.ELECTRON_RENDERER_URL
const report = { source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), dirty: !!execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim(), copy: [], errors: [], passed: false }
let app
try {
  await Promise.all(reservations.map(({ server }) => new Promise(resolve => server.close(resolve))))
  app = await electron.launch({ args: [...(env.TUCANO_ELECTRON ? [] : ['.']), '--qa-background'], ...(env.TUCANO_ELECTRON ? { executablePath: env.TUCANO_ELECTRON } : {}), env })
  const page = await app.firstWindow()
  page.setDefaultTimeout(15000)
  page.on('pageerror', error => report.errors.push(String(error)))
  const id = await app.evaluate(({ BrowserWindow }) => {
    globalThis.__reviewExposure = []
    const watch = w => ['show', 'focus'].forEach(event => w.on(event, () => globalThis.__reviewExposure.push(event)))
    BrowserWindow.getAllWindows().forEach(watch)
    return BrowserWindow.getAllWindows()[0].id
  })
  const guard = async () => assert.ok(await app.evaluate(({ BrowserWindow }) => globalThis.__reviewExposure.length === 0 && BrowserWindow.getAllWindows().every(w => !w.isVisible() && !w.isFocusable() && !w.isFocused())))
  await page.locator('.sidebar').waitFor()
  const capture = async (surface, width) => {
    await guard()
    const matches = await page.evaluate(rows => {
      document.querySelectorAll('[data-copy-review]').forEach(el => el.removeAttribute('data-copy-review'))
      const found = []
      const elements = [...document.querySelectorAll('p, small, strong, h2, .hint, .field__label, button')]
      for (const row of rows) {
        if (row.replacement.includes('${')) continue // variable states need the feature's explicit fixture
        for (const el of elements) {
          const box = el.getBoundingClientRect()
          if (!box.width || !box.height || getComputedStyle(el).visibility === 'hidden' || el.textContent.trim() !== row.replacement) continue
          if (found.some(item => item.element === el)) continue
          const index = found.length
          el.setAttribute('data-copy-review', String(index))
          found.push({ element: el, index, id: row.id, label: el.matches('button,strong,h2,.field__label'), warning: !!el.closest('.modal__lead') })
        }
      }
      return found.map(({ element, ...item }) => item)
    }, rows)
    for (const item of matches) {
      const selector = `[data-copy-review="${item.index}"]`
      const copy = await measureCopy(page, [{ selector, maxLines: item.label ? 1 : item.warning ? 8 : 2, ...(item.warning ? { reason: 'Explicit destructive confirmation retains its full consequences.' } : {}) }])
      const element = page.locator(selector)
      await element.scrollIntoViewIfNeeded()
      const screenshot = `${surface}-${width}-${item.id}-${item.index}.png`
      await page.screenshot({ path: join(output, screenshot) })
      report.copy.push({ surface, width, id: item.id, screenshot, deviceScaleFactor: await page.evaluate(() => devicePixelRatio), ...copy })
      assert.ok(copy.passed, JSON.stringify(copy.failures))
    }
  }
  for (const width of [1280, 900]) {
    await guard()
    await app.evaluate(({ BrowserWindow }, { id, width }) => BrowserWindow.fromId(id).setContentSize(width, 900), { id, width })
    await page.locator('.sidebar .nav-item').filter({ hasText: 'Settings' }).first().click()
    const tabs = await page.locator('.settings-pages button, .page .tabs button').allTextContents()
    for (const tab of tabs) {
      await page.locator('.settings-pages button, .page .tabs button').filter({ hasText: new RegExp('^' + tab.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }).first().click()
      await capture('settings-' + tab.trim().replace(/[^a-z0-9]/gi, '-'), width)
    }
    await page.locator('.nav-item', { has: page.locator('.nav-item__role') }).filter({ hasText: 'Lia' }).first().click()
    await page.locator('.agent-form').waitFor()
    const custom = page.getByRole('radio', { name: 'Custom', exact: true })
    if (await custom.count()) await custom.click()
    await capture('agent', width)
  }
  await guard()
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = String(error.stack || error)
  process.exitCode = 1
} finally {
  writeFileSync(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n')
  await app?.close()
  console.log(JSON.stringify({ passed: report.passed, measured: report.copy.length, failure: report.failure }))
}
