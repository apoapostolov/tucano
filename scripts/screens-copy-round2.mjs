// Actual built/installed renderers, synthetic data, hidden native windows. No desktop input.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'node:net'
import { _electron as electron } from 'playwright'
import { measureCopy } from './lib/copy-layout.mjs'

const output = resolve(process.argv[2] || '.tucano-local/copy-round2/surfaces')
mkdirSync(output, { recursive: true })
const reservations = await Promise.all([0, 1].map(async () => {
  const server = createServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return { server, port: server.address().port }
}))
const data = mkdtempSync(join(tmpdir(), 'tucano-copy-round2-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en-US', TUCANO_WEBHOOK_PORT: String(reservations[0].port), TUCANO_GIT_PORT: String(reservations[1].port) }
delete env.ELECTRON_RUN_AS_NODE
delete env.ELECTRON_RENDERER_URL
const report = { source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), dirty: !!execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim(), captures: [], copy: [], errors: [], passed: false }
let app
try {
  await Promise.all(reservations.map(({ server }) => new Promise(resolve => server.close(resolve))))
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
  for (const width of [1280, 900]) {
    await resize(mainId, width)
    await page.locator('.sidebar .nav-item').filter({ hasText: 'Settings' }).first().click()
    await page.locator('#settings-tab-app').click()
    await page.locator('.settings-sections a[href="#settings-app-notifications"]').click()
    await page.waitForFunction(() => !document.querySelector('[data-settings-scrolling]'))
    const notices = page.locator('#settings-app-notifications')
    await notices.scrollIntoViewIfNeeded()
    await capture(page, 'notifications', [
      { selector: '#settings-app-notifications .key-row strong:visible', maxLines: 1 },
      { selector: '#settings-app-notifications .key-row p:visible' },
      { selector: '#settings-app-notifications .btn:visible, #settings-app-notifications .segmented button:visible', maxLines: 1 }
    ])
    await page.locator('#settings-tab-workspace').click()
    await page.locator('.settings-sections a[href="#settings-workspace-danger"]').click()
    await page.waitForFunction(() => !document.querySelector('[data-settings-scrolling]'))
    await page.getByRole('button', { name: 'Delete all message history', exact: true }).click()
    await capture(page, 'workspace-delete', [
      { selector: '.modal__head strong:visible, .modal__foot .btn:visible', maxLines: 1 },
      { selector: '.modal__lead:visible', maxLines: 8, reason: 'Destructive confirmation must state message scope, retained records, and irreversibility.' }
    ])
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await page.locator('.nav-item', { has: page.locator('.nav-item__role') }).filter({ hasText: 'Lia' }).first().click()
    const agent = page.locator('.agent-form')
    await agent.waitFor()
    await agent.getByRole('radio', { name: 'Custom', exact: true }).click()
    await agent.getByRole('spinbutton', { name: 'Days', exact: true }).fill('3650')
    await agent.getByText('Agent history', { exact: true }).scrollIntoViewIfNeeded()
    await capture(page, 'agent-retention', [
      { selector: '.agent-form .field__label:visible, .agent-form .card--danger button:visible', maxLines: 1 },
      { selector: '.agent-form .hint:visible, .agent-form .card__head p:visible' }
    ])
    await agent.getByRole('button', { name: 'Delete agent history', exact: true }).click()
    await capture(page, 'agent-delete', [
      { selector: '.modal__head strong:visible, .modal__foot .btn:visible', maxLines: 1 },
      { selector: '.modal__lead:visible', maxLines: 8, reason: 'Destructive confirmation must identify deleted agent replies and DMs, retained records, and irreversibility.' }
    ])
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  }
  // A separately loaded built notification renderer uses a synthetic RPC feed. The normal
  // application's notification windows remain disabled in background QA.
  for (const pick of [false, true]) {
    const id = await app.evaluate(async ({ app, BrowserWindow }, pick) => {
      const w = new BrowserWindow({ width: pick ? 900 : 372, height: 900, show: false, focusable: false, webPreferences: { preload: app.getAppPath() + '/out/preload/index.cjs', contextIsolation: true, nodeIntegration: false } })
      await w.loadFile(app.getAppPath() + '/out/renderer/notice.html', pick ? { query: { pick: '1' } } : {})
      return w.id
    }, pick)
    const target = app.windows().find(w => w.url().includes('notice.html') && w.url().includes('pick=1') === pick)
    assert.ok(target)
    target.on('pageerror', error => report.errors.push(String(error)))
    await target.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await target.evaluate(() => {
      const { port1, port2 } = new MessageChannel()
      port1.onmessage = ({ data: request }) => port1.postMessage({ id: request.id, result: request.method === 'noticeFeed' ? { rules: { on: true, act: true, seconds: 30, hover: true, skin: 'light', stack: false }, language: 'en', agents: [], conversations: [], inbox: { approvals: [], questions: [] } } : {} })
      window.postMessage('core:port', '*', [port2])
    })
    await app.evaluate(({ BrowserWindow }, { id, pick }) => {
      BrowserWindow.fromId(id).webContents.send(pick ? 'notice:pick' : 'notice:demo', ...(pick ? [{ x: 480, y: 160, w: 372, h: 600, up: true }] : []))
    }, { id, pick })
    await target.locator(pick ? '.pick' : '.nc').first().waitFor()
    for (const width of pick ? [1280, 900] : [372, 280]) {
      await resize(id, width)
      if (pick) {
        await capture(target, 'notification-area', [{ selector: '.pick button:visible', maxLines: 1 }, { selector: '.pick__bar p:visible, .pick__label:visible' }])
      } else {
        await capture(target, 'notification-cards', [{ selector: '.nc__actions .btn:visible, .ask__badge:visible, .tag--danger:visible', maxLines: 1 }])
      }
    }
    await app.evaluate(({ BrowserWindow }, id) => BrowserWindow.fromId(id).destroy(), id)
  }
  await guard()
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = String(error.stack || error)
  if (app) for (const [i, page] of app.windows().entries()) {
    if (!page.isClosed()) {
      await page.screenshot({ path: join(output, `failure-${i}.png`) }).catch(() => {})
      report.lastText = await page.locator('body').innerText().catch(() => '')
    }
  }
  process.exitCode = 1
} finally {
  writeFileSync(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n')
  await app?.close()
  console.log(JSON.stringify({ passed: report.passed, captures: report.captures.length, failure: report.failure }))
}
