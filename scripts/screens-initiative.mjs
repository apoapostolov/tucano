// Screenshots and checks of a bot's initiative, in the built app: the line in a DM, the window that
// sets it up, one check-in that reports, one that stays quiet, and the switch that stops it.
//
// Scratch data, fake engines, reserved ports, and a window that never shows or takes focus
// (src/main/background-qa.ts). Writes report.json beside the captures with the source SHA.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { _electron as electron } from 'playwright'

const output = resolve(process.argv[2] ?? '.tucano-local/initiative/screens')
mkdirSync(output, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-initiative-'))
const reserve = async () => {
  const server = createServer()
  await new Promise((yes, no) => {
    server.once('error', no)
    server.listen(0, '127.0.0.1', yes)
  })
  return { server, port: server.address().port }
}
const ports = await Promise.all([reserve(), reserve()])
const env = {
  ...process.env,
  TUCANO_DATA: data,
  TUCANO_SEED: '1',
  TUCANO_FAKE_ENGINES: '1',
  TUCANO_WEBHOOK_PORT: String(ports[0].port),
  TUCANO_GIT_PORT: String(ports[1].port)
}
delete env.ELECTRON_RUN_AS_NODE
delete env.ELECTRON_RENDERER_URL

const report = {
  source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  dirty: !!execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim(),
  data,
  ports: ports.map((p) => p.port),
  checks: [],
  errors: [],
  passed: false
}

let app
try {
  await Promise.all(ports.map(({ server }) => new Promise((yes, no) => server.close((e) => (e ? no(e) : yes())))))
  // TUCANO_ELECTRON runs the installed app instead of this checkout's build: the same flow, against the
  // bundle a person would actually have.
  const installed = env.TUCANO_ELECTRON
  app = await electron.launch({ args: [...(installed ? [] : ['.']), '--qa-background'], ...(installed ? { executablePath: installed } : {}), env })
  report.runtime = await app.evaluate(({ app }) => ({ version: app.getVersion(), electron: process.versions.electron, executable: process.execPath, data: app.getPath('userData') }))

  // Nothing this script does may show or focus a window: every capture proves it again.
  await app.evaluate(({ BrowserWindow, app }) => {
    globalThis.__qaExposure = []
    const watch = (w) => {
      for (const event of ['show', 'focus']) w.on(event, () => globalThis.__qaExposure.push({ id: w.id, event }))
    }
    BrowserWindow.getAllWindows().forEach(watch)
    app.on('browser-window-created', (_e, w) => watch(w))
  })
  const window = await app.firstWindow()
  window.setDefaultTimeout(30_000)
  window.on('pageerror', (e) => report.errors.push(String(e)))
  const guard = async () => {
    const state = await app.evaluate(({ BrowserWindow }) => ({
      events: globalThis.__qaExposure,
      windows: BrowserWindow.getAllWindows().map((w) => ({ visible: w.isVisible(), focused: w.isFocused(), focusable: w.isFocusable() }))
    }))
    assert.deepEqual(state.events, [], 'the initiative run exposed or focused a window')
    assert.ok(state.windows.length && state.windows.every((w) => !w.visible && !w.focused && !w.focusable), 'the window must stay hidden and unfocusable')
  }
  const capture = async (name) => {
    await guard()
    await window.screenshot({ path: join(output, `${name}.png`) })
    await guard()
    report.checks.push(name)
  }
  const messages = () => window.locator('.msg').count()
  const runs = () => window.locator('.initiative__run').count()

  await window.waitForSelector('.sidebar')
  await capture('01-workspace')

  // A bot's DM, where a coordinator would live.
  const agents = window.locator('.nav-item', { has: window.locator('.nav-item__role') })
  assert.ok((await agents.count()) >= 2, 'seeded agents must load')
  await agents.filter({ hasText: 'Lia' }).first().click()
  await window.waitForSelector('.agent-form')
  await window.getByRole('button', { name: /Abrir DM|Open DM/ }).click()
  await window.locator('.topbar__name').filter({ hasText: 'Lia' }).waitFor()

  // Nobody has one yet, so the DM offers the way in.
  const off = window.locator('.initiative-line.is-off')
  await off.waitFor()
  await capture('02-line-off')
  await off.click()
  await window.waitForSelector('.initiative')
  await capture('03-window-new')

  // Set it up: a brief in the person's words, and what it may do.
  const brief = window.locator('.initiative textarea').first()
  await brief.fill('Watch whether the client answered about the invoice, and tell me what changed.')
  await window.locator('.initiative').getByRole('button', { name: /^Salvar$|^Save$/ }).click()
  // A window nobody had saved opens with the switch off, so the brief is written before it is turned on:
  // the switch is the state, and it refuses to go up with nothing to look after.
  await window.locator('.initiative').getByRole('switch').click()
  await window.locator('.initiative__state').filter({ hasText: /Próxima conferida|Next check-in/ }).waitFor()
  await capture('04-window-saved')

  // One check-in that reports: the fake engine answers with what it found, and it reaches the DM.
  const before = await messages()
  await window.locator('.initiative').getByRole('button', { name: /Conferir agora|Check now/ }).click()
  await window.locator('.initiative__run').first().waitFor()
  await window.waitForFunction(() => !document.querySelector('.initiative__run.outcome-interrupted'), null, { timeout: 60_000 })
  await capture('05-window-reported')
  const after = await messages()
  assert.ok(after > before, 'a report must reach the conversation')

  // The line in the DM now says what it is doing, and the report is in the conversation.
  await window.locator('.initiative').getByRole('button', { name: /^Fechar$|^Close$/ }).click()
  await window.waitForSelector('.initiative-line')
  await capture('06-dm-line')
  const said = await window.locator('.msg').last().innerText()
  assert.match(said, /Conferi|Checked/, 'the last message is the report')
  report.report = said.split('\n').slice(0, 3).join(' ')

  // Now one that stays quiet: the brief asks not to be warned, so nothing appears in the conversation.
  await window.locator('.initiative-line').click()
  await window.locator('.initiative textarea').first().fill('Watch whether the client answered about the invoice. If nothing changed, don\u2019t tell me.')
  await window.locator('.initiative').getByRole('button', { name: /^Salvar$|^Save$/ }).click()
  await window.locator('.initiative__state').filter({ hasText: /Próxima conferida|Next check-in/ }).waitFor()
  const quietBefore = await messages()
  await window.locator('.initiative').getByRole('button', { name: /Conferir agora|Check now/ }).click()
  await window.waitForFunction((n) => document.querySelectorAll('.initiative__run.outcome-quiet').length > n, 0, { timeout: 60_000 })
  await capture('07-window-quiet')
  assert.equal(await messages(), quietBefore, 'a quiet check-in leaves nothing in the conversation')
  const quiet = await window.locator('.initiative__run.outcome-quiet').first().innerText()
  assert.match(quiet, /nada a avisar|nothing to report/)
  assert.ok((await runs()) >= 2, 'both check-ins are on the record')

  // A narrow window: the record folds to one column and nothing overflows sideways, measured not guessed.
  await window.setViewportSize({ width: 520, height: 900 })
  await window.waitForTimeout(300)
  const narrow = await window.evaluate(() => {
    const list = document.querySelector('.initiative')
    const run = document.querySelector('.initiative__run')
    return {
      overflow: list ? list.scrollWidth - list.clientWidth : -1,
      page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      columns: run ? getComputedStyle(run).gridTemplateColumns.split(' ').length : -1
    }
  })
  report.narrow = narrow
  assert.ok(narrow.overflow <= 0, `the window overflows by ${narrow.overflow}px at 520px wide`)
  assert.ok(narrow.page <= 0, `the page overflows by ${narrow.page}px at 520px wide`)
  assert.equal(narrow.columns, 2, 'the record folds to one column and its cost')
  await capture('09-narrow')
  await window.setViewportSize({ width: 1360, height: 900 })
  await window.waitForTimeout(300)

  // And the switch stops it.
  await window.locator('.initiative').getByRole('button', { name: /Desligar|Turn off/ }).click()
  await window.locator('.initiative__state').filter({ hasText: /Desligada|Off:/ }).waitFor()
  await capture('08-off')
  await window.locator('.initiative').getByRole('button', { name: /^Fechar$|^Close$/ }).click()
  await window.locator('.initiative-line').waitFor()
  const lineOff = await window.locator('.initiative-line').innerText()
  assert.match(lineOff, /desligada|off/)

  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = String(error.stack ?? error)
  if (app) {
    const window = app.windows()[0]
    if (window) {
      report.visibleText = await window.locator('body').innerText().catch(() => '')
      await window.screenshot({ path: join(output, 'failure.png') }).catch(() => {})
    }
  }
  process.exitCode = 1
} finally {
  if (app) {
    const window = app.windows()[0]
    if (window) await window.context().tracing.stop({ path: join(output, 'trace.zip') }).catch(() => {})
    await app.close()
  }
  for (const { server } of ports) if (server.listening) server.close()
  writeFileSync(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
}
