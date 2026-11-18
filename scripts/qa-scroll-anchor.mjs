// A single layout change above the reader must cause one correction, then settle.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'node:net'
import { _electron as electron } from 'playwright'

const output = resolve(process.argv[2] ?? 'C:/tmp/tucano-scroll-evidence/runtime')
mkdirSync(output, { recursive: true })
const reservations = await Promise.all([0, 1].map(async () => {
  const server = createServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return { server, port: server.address().port }
}))
const env = { ...process.env, TUCANO_DATA: mkdtempSync(join(tmpdir(), 'tucano-scroll-')), TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en-US', TUCANO_WEBHOOK_PORT: String(reservations[0].port), TUCANO_GIT_PORT: String(reservations[1].port) }
delete env.ELECTRON_RUN_AS_NODE
delete env.ELECTRON_RENDERER_URL
await Promise.all(reservations.map(({ server }) => new Promise(resolve => server.close(resolve))))
const app = await electron.launch({ args: [...(env.TUCANO_ELECTRON ? [] : ['.']), '--qa-background'], ...(env.TUCANO_ELECTRON ? { executablePath: env.TUCANO_ELECTRON } : {}), env })
const report = { source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), checks: [], errors: [] }
try {
  const page = await app.firstWindow()
  page.on('pageerror', error => report.errors.push(String(error)))
  await page.waitForSelector('.sidebar')
  await page.locator('.section .nav-item', { hasText: 'engineering' }).first().click()
  await page.locator('.composer textarea').fill('A synthetic scroll regression fixture.')
  await page.locator('.composer textarea').press('Enter')
  await page.waitForSelector('.messages .msg')
  for (const anchoring of ['none', 'auto']) {
  for (const delta of [80, -40]) {
    const result = await page.evaluate(async ({ delta, anchoring }) => {
      const list = document.querySelector('.messages')
      // Real MessageList, with deterministic layout changes in synthetic rows.
      list.style.overflowAnchor = anchoring
      const row = list.querySelector('.msg')
      row.innerHTML = '<div id="qa-above" style="height:1200px;flex-shrink:0"></div><div id="qa-line" style="height:100px">Reading this line</div><div style="height:2400px;flex-shrink:0"></div>'
      row.style.display = 'block'
      const above = row.querySelector('#qa-above')
      const line = row.querySelector('#qa-line')
      const frame = () => new Promise(resolve => requestAnimationFrame(resolve))
      await frame()
      await frame()
      list.scrollTop += line.getBoundingClientRect().top - list.getBoundingClientRect().top - 10
      list.dispatchEvent(new Event('scroll'))
      await frame()
      await frame()
      const before = { scroll: list.scrollTop, line: line.getBoundingClientRect().top }
      above.style.height = `${1200 + delta}px`
      const samples = []
      for (let i = 0; i < 30; i++) {
        await frame()
        samples.push({ scroll: list.scrollTop, line: line.getBoundingClientRect().top })
      }
      return { delta, anchoring, before, samples }
    }, { delta, anchoring })
    report.checks.push(result)
    await page.screenshot({ path: join(output, `scroll-${anchoring}-${delta}.png`) })
    const settled = result.samples.slice(3)
    assert.ok(settled.every(sample => Math.abs(sample.line - result.before.line) < 2), JSON.stringify(result))
    assert.ok(settled.every(sample => Math.abs(sample.scroll - result.before.scroll - delta) < 2), 'Each growth or shrink must be applied once')
  }
  }
  const windows = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().map(window => ({ visible: window.isVisible(), focused: window.isFocused(), focusable: window.isFocusable() })))
  assert.ok(windows.every(window => !window.visible && !window.focused && !window.focusable))
  assert.deepEqual(report.errors, [])
  report.passed = true
} finally {
  writeFileSync(join(output, 'report.json'), JSON.stringify(report, null, 2))
  await app.close()
}
console.log(JSON.stringify(report))
