// Actual built/installed renderers, synthetic data, hidden native windows. No desktop input.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'node:net'
import { _electron as electron } from 'playwright'
import { measureCopy } from './lib/copy-layout.mjs'
import { supportsBackgroundCopyQA } from './lib/copy-runtime.mjs'

const output = resolve(process.argv[2] || '.tucano-local/local-settings-polish')
mkdirSync(output, { recursive: true })
const reservations = await Promise.all([0, 1].map(async () => {
  const server = createServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return { server, port: server.address().port }
}))
const data = mkdtempSync(join(tmpdir(), 'tucano-local-settings-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en-US', TUCANO_WEBHOOK_PORT: String(reservations[0].port), TUCANO_GIT_PORT: String(reservations[1].port) }
delete env.ELECTRON_RUN_AS_NODE
delete env.ELECTRON_RENDERER_URL
const report = { source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), dirty: !!execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim(), captures: [], copy: [], errors: [], passed: false }
let app
try {
  await Promise.all(reservations.map(({ server }) => new Promise(resolve => server.close(resolve))))
  assert.ok(supportsBackgroundCopyQA(env.TUCANO_ELECTRON), 'Refuse to launch a bundle without hidden QA support')
  app = await electron.launch({ args: [...(env.TUCANO_ELECTRON ? [] : ['.']), '--qa-background'], ...(env.TUCANO_ELECTRON ? { executablePath: env.TUCANO_ELECTRON } : {}), env })
  report.runtime = await app.evaluate(({ app, BrowserWindow }) => {
    globalThis.__copyExposure = []
    const watch = w => ['show', 'focus'].forEach(event => w.on(event, () => globalThis.__copyExposure.push(event)))
    BrowserWindow.getAllWindows().forEach(watch)
    app.on('browser-window-created', (_e, w) => watch(w))
    return { executable: process.execPath, version: app.getVersion(), electron: process.versions.electron }
  })
  const page = await app.firstWindow()
  const mainId = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].id)
  page.on('pageerror', error => report.errors.push(String(error)))
  page.setDefaultTimeout(15000)
  const guard = async () => {
    const state = await app.evaluate(({ BrowserWindow }) => ({ events: globalThis.__copyExposure, hidden: BrowserWindow.getAllWindows().every(w => !w.isVisible() && !w.isFocused() && !w.isFocusable()) }))
    assert.deepEqual(state.events, [])
    assert.ok(state.hidden, 'All QA windows must stay hidden and unfocusable')
  }
  const resize = async (id, width, height = 900) => {
    await guard()
    await app.evaluate(({ BrowserWindow }, { id, width, height }) => BrowserWindow.fromId(id).setContentSize(width, height), { id, width, height })
  }
  const capture = async (target, name, rules) => {
    await guard()
    const copy = await measureCopy(target, rules)
    const display = await target.evaluate(() => ({ width: innerWidth, height: innerHeight, deviceScaleFactor: devicePixelRatio }))
    const screenshot = `${name}-${display.width}.png`
    await target.screenshot({ path: join(output, screenshot) })
    report.captures.push(screenshot)
    report.copy.push({ name, display, ...copy })
    assert.ok(copy.passed, JSON.stringify(copy.failures))
  }
  await page.locator('.sidebar').waitFor()
  const startup = page.locator('#settings-app-startup')
  const login = startup.locator('.key-row').filter({ has: page.getByText('Launch at login', { exact: true }) }).getByRole('switch')
  const minimized = startup.locator('.key-row').filter({ has: page.getByText('Launch minimized', { exact: true }) }).getByRole('switch')
  const openSettings = async () => {
    await page.locator('.sidebar .nav-item').filter({ hasText: 'Settings' }).first().click()
    await page.locator('#settings-tab-app').click()
  }
  await openSettings()
  if (env.TUCANO_ELECTRON) {
    await minimized.scrollIntoViewIfNeeded()
    assert.ok(await minimized.isDisabled())
    await login.click()
    await minimized.waitFor({ state: 'visible' })
    await minimized.click()
    assert.equal(await minimized.getAttribute('aria-checked'), 'true')
    await page.reload()
    await openSettings()
    assert.equal(await minimized.getAttribute('aria-checked'), 'true', 'Startup setting survives reload')
  }
  for (const width of [1280, 900]) {
    await resize(mainId, width)
    await page.waitForFunction(width => innerWidth === width, width)
    await page.evaluate(() => document.fonts.ready)
    await page.locator('#settings-tab-app').click()
    const language = page.locator('#settings-app-appearance .lang-picker')
    assert.equal(await language.getByRole('radio').count(), 1)
    assert.equal(await language.getByRole('radio').innerText(), 'English')
    assert.equal(await language.locator('button').allTextContents().then(x => x.join(',')), 'English,Português')
    assert.equal(await language.getAttribute('aria-label'), 'Language')
    await language.scrollIntoViewIfNeeded()
    await capture(page, 'appearance', [
      { selector: '#settings-app-appearance .field__label:visible', maxLines: 1 }
    ])
    await page.locator('.settings-sections a[href="#settings-app-notifications"]').click()
    const preview = page.locator('#settings-app-notifications .key-row').filter({ has: page.getByText('Notification preview', { exact: true }) })
    await preview.scrollIntoViewIfNeeded()
    await capture(page, 'notification-preview', [
      { selector: '#settings-app-notifications .key-row strong:visible', maxLines: 1 },
      { selector: '#settings-app-notifications .key-row p:visible' }
    ])
    for (const row of await page.locator('.settings-content .key-row').all()) {
      assert.ok(await row.locator('strong, .field__label').count(), 'Settings row must have a title: ' + await row.innerText())
    }
    await page.locator('.settings-sections a[href="#settings-app-dictation"]').click()
    const choices = page.locator('#settings-app-dictation .voice-choice')
    assert.equal(await choices.count(), 2)
    const positions = await choices.evaluateAll(nodes => nodes.map(n => { const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width } }))
    assert.equal(positions[0].y, positions[1].y, 'Dictation choices share a row')
    const button = page.getByRole('button', { name: 'Turn dictation on', exact: true })
    const checkbox = page.getByLabel('Show microphone in composer', { exact: true })
    const action = await button.boundingBox()
    const check = await checkbox.boundingBox()
    assert.ok(check.x > action.x + action.width, 'Microphone checkbox follows the button')
    assert.ok(Math.abs((action.y + action.height / 2) - (check.y + check.height / 2)) < 3, 'Actions share a row')
    await capture(page, 'dictation', [
      { selector: '#settings-app-dictation .voice-choice b:visible, #settings-app-dictation .voice-setup__actions .btn:visible', maxLines: 1 },
      { selector: '#settings-app-dictation .voice-choice small:visible' }
    ])
    await checkbox.uncheck()
    await page.reload()
    await openSettings()
    await page.locator('.settings-sections a[href="#settings-app-dictation"]').click()
    assert.ok(!await checkbox.isChecked(), 'Microphone preference persists')
    await checkbox.check()
    await minimized.scrollIntoViewIfNeeded()
    await capture(page, 'startup', [
      { selector: '#settings-app-startup strong:visible', maxLines: 1 },
      { selector: '#settings-app-startup .key-row p:visible' }
    ])
    await page.locator('#settings-tab-workspace').click()
    const names = page.locator('.settings-context-names input')
    assert.equal(await names.count(), 2)
    const boxes = await names.evaluateAll(nodes => nodes.map(n => { const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width } }))
    assert.equal(boxes[0].y, boxes[1].y)
    assert.ok(Math.abs(boxes[0].width - boxes[1].width) < 1)
    await page.getByLabel('Workspace name', { exact: true }).fill('Synthetic Research Workspace')
    await page.getByLabel('Your name', { exact: true }).fill('Alexandra Synthetic')
    await names.first().scrollIntoViewIfNeeded()
    await capture(page, 'workspace-context', [
      { selector: '.settings-context-names .field__label:visible', maxLines: 1 }
    ])
  }
  await openSettings()
  if (env.TUCANO_ELECTRON) {
    await login.scrollIntoViewIfNeeded()
    await login.click()
    assert.ok(await minimized.isDisabled())
    assert.equal(await minimized.getAttribute('aria-checked'), 'true', 'Disabling login preserves minimized choice')
  }
  await guard()
  assert.deepEqual(report.errors, [])
  report.passed = true
} finally {
  if (app) await app.close()
  writeFileSync(join(output, 'report.json'), JSON.stringify(report, null, 2))
}
console.log(JSON.stringify({ passed: report.passed, output, captures: report.captures.length, errors: report.errors, runtime: report.runtime }))
