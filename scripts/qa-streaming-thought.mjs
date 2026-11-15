// Measure a character's visible line, not just the scrollbar or the block's border.
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'node:net'
import { _electron as electron } from 'playwright'
import { execFileSync } from 'node:child_process'

const output = resolve(process.argv[2] ?? 'C:/tmp/tucano-scroll-evidence/thought')
mkdirSync(output, { recursive: true })
const ports = []
for (let i = 0; i < 2; i++) {
  const server = createServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  ports.push(server.address().port)
  await new Promise(resolve => server.close(resolve))
}
const env = { ...process.env, TUCANO_DATA: mkdtempSync(join(tmpdir(), 'tucano-thought-')), TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_FAKE_THINKING: '1', TUCANO_FAKE_THINKING_LONG: '1', TUCANO_LOCALE: 'en-US', TUCANO_WEBHOOK_PORT: String(ports[0]), TUCANO_GIT_PORT: String(ports[1]) }
delete env.ELECTRON_RUN_AS_NODE
delete env.ELECTRON_RENDERER_URL
const app = await electron.launch({ args: [...(env.TUCANO_ELECTRON ? [] : ['.']), '--qa-background'], ...(env.TUCANO_ELECTRON ? { executablePath: env.TUCANO_ELECTRON } : {}), env })
const report = { source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), checks: [], errors: [], passed: false }
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
try {
  const page = await app.firstWindow()
  report.runtime = await app.evaluate(({ app, screen }) => ({ executable: process.execPath, version: app.getVersion(), scale: screen.getPrimaryDisplay().scaleFactor }))
  page.on('pageerror', error => report.errors.push(String(error)))
  await page.waitForSelector('.sidebar')
  report.viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scale: devicePixelRatio }))
  // Use a normal authorized renderer connection, exclusively against this scratch workspace.
  await page.evaluate(async () => {
    const port = await new Promise(resolve => {
      const listener = event => {
        if (event.source !== window || event.data !== 'core:port') return
        window.removeEventListener('message', listener)
        resolve(event.ports[0])
      }
      window.addEventListener('message', listener)
      window.tucano.connect()
    })
    let id = 0
    const pending = new Map()
    port.onmessage = event => {
      const result = pending.get(event.data.id)
      if (!result) return
      pending.delete(event.data.id)
      if (event.data.error) result.reject(new Error(event.data.error))
      else result.resolve(event.data.result)
    }
    window.__qaCall = (method, params) => new Promise((resolve, reject) => {
      pending.set(++id, { resolve, reject })
      port.postMessage({ id, method, params })
    })
  })
  await page.locator('.section .nav-item', { hasText: 'engineering' }).first().click()
  for (const size of ['sm', 'md', 'lg']) {
    await page.evaluate(size => window.__qaCall('updateSettings', { patch: { showThinking: true, thinkingSize: size } }), size)
    await page.locator('.composer textarea').fill('Lia, inspect this synthetic streaming fixture.')
    await page.locator('.composer textarea').press('Enter')
    const block = page.locator('.thought').last()
    await block.waitFor()
    await page.waitForFunction(() => {
      const block = [...document.querySelectorAll('.thought')].at(-1)
      return block?.scrollHeight > block?.clientHeight * 4 && block?.querySelector('.thought__label')?.textContent === 'Thinking'
    }, null, { polling: 50 })
    const marked = await block.evaluate(block => {
      const list = block.closest('.messages')
      list.scrollTop += block.getBoundingClientRect().top - list.getBoundingClientRect().top - 25
      list.dispatchEvent(new Event('scroll'))
      block.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true }))
      block.scrollTop = Math.round((block.scrollHeight - block.clientHeight) / 2)
      block.dispatchEvent(new Event('scroll'))
      const text = block.querySelector('.thought__text').firstChild
      let offset = 0
      // Find a character fully visible in the upper half of the reasoning viewport.
      const range = document.createRange()
      for (; offset < text.length; offset++) {
        range.setStart(text, offset)
        range.setEnd(text, offset + 1)
        const rect = range.getBoundingClientRect()
        if (rect.top >= block.getBoundingClientRect().top + 30) break
      }
      window.__qaLine = { block, text, offset }
      return { top: range.getBoundingClientRect().top, scroll: block.scrollTop, chars: text.length }
    })
    // Finish the synthetic scroll gesture and its pre-paint layout before starting the reading
    // interval. Measurements below include every subsequent streamed update and completion.
    await page.screenshot()
    Object.assign(marked, await page.evaluate(() => {
      const { block, text, offset } = window.__qaLine
      const range = document.createRange()
      range.setStart(text, offset)
      range.setEnd(text, offset + 1)
      return { top: range.getBoundingClientRect().top, scroll: block.scrollTop, chars: text.length }
    }))
    const samples = []
    for (let i = 0; i < 45; i++) {
      if (i === 12 || i === 25) await block.evaluate((block, height) => {
        let spacer = block.parentElement.querySelector('.qa-growth')
        if (!spacer) {
          spacer = document.createElement('div')
          spacer.className = 'qa-growth'
          block.before(spacer)
        }
        spacer.style.height = `${height}px`
      }, i === 12 ? 80 : 40)
      // Read a rendered frame after the synthetic layout mutation, allowing the browser's
      // pre-paint ResizeObserver delivery rather than sampling its provisional layout.
      if (i === 12 || i === 25) await page.screenshot({ path: join(output, `growth-${size}-${i}.png`) })
      samples.push(await page.evaluate(() => {
        const { block, text, offset } = window.__qaLine
        const range = document.createRange()
        range.setStart(text, offset)
        range.setEnd(text, offset + 1)
        return { top: range.getBoundingClientRect().top, scroll: block.scrollTop, chars: text.length, connected: text.isConnected,
          blockTop: block.getBoundingClientRect().top, textTop: block.querySelector('.thought__text').getBoundingClientRect().top,
          listTop: block.closest('.messages').scrollTop, height: block.clientHeight,
          font: getComputedStyle(block).font, textFont: getComputedStyle(block.querySelector('.thought__text')).font }
      }))
      await pause(100)
    }
    report.checks.push({ size, marked, samples })
    await page.screenshot({ path: join(output, `reading-${size}.png`) })
    assert.ok(samples.at(-1).chars > marked.chars + 1000, 'Substantial reasoning must arrive while reading')
    assert.ok(samples.every(sample => sample.connected && Math.abs(sample.top - marked.top) < 2), JSON.stringify({ size, marked, samples }))
    // At the page's top limit a shrinking header can move the block itself. The inner offset
    // may compensate for that; the character's visible line is the invariant.
    // Returning to the end resumes following for subsequent chunks.
    await block.evaluate(block => {
      block.scrollTop = block.scrollHeight
      block.dispatchEvent(new Event('scroll'))
    })
    await pause(500)
    await page.screenshot()
    const resumed = await block.evaluate(block => ({ gap: block.scrollHeight - block.clientHeight - block.scrollTop }))
    report.checks.at(-1).resumed = resumed
    assert.ok(resumed.gap < 2, 'Returning to the end must resume following')
    // Read back again and stay there through the transition from reasoning to the answer.
    await block.evaluate((block, scroll) => {
      const list = block.closest('.messages')
      list.scrollTop += block.getBoundingClientRect().top - list.getBoundingClientRect().top - 25
      list.dispatchEvent(new Event('scroll'))
      block.scrollTop = scroll
      block.dispatchEvent(new Event('scroll'))
      const { text, offset } = window.__qaLine
      const range = document.createRange()
      range.setStart(text, offset)
      range.setEnd(text, offset + 1)
    }, marked.scroll)
    await page.screenshot()
    const finishingTop = await page.evaluate(() => {
      const { text, offset } = window.__qaLine
      const range = document.createRange()
      range.setStart(text, offset)
      range.setEnd(text, offset + 1)
      return range.getBoundingClientRect().top
    })
    const ending = []
    for (let i = 0; i < 200; i++) {
      const sample = await page.evaluate(() => {
        const { block, text, offset } = window.__qaLine
        const range = document.createRange()
        range.setStart(text, offset)
        range.setEnd(text, offset + 1)
        return { top: range.getBoundingClientRect().top, working: block.closest('.steps').classList.contains('is-working'), scroll: block.scrollTop, blockTop: block.getBoundingClientRect().top, listTop: block.closest('.messages').scrollTop, connected: text.isConnected }
      })
      ending.push(sample)
      if (!sample.working && i > 15) break
      await pause(100)
    }
    report.checks.at(-1).ending = { top: finishingTop, samples: ending }
    assert.ok(ending.every(sample => Math.abs(sample.top - finishingTop) < 2), JSON.stringify({ size, finishingTop, ending }))
    assert.equal(ending.at(-1).working, false, 'Keep measuring through completion')
  }
  assert.ok(await page.locator('.thought').count(), 'Completed reasoning remains available while enabled')
  await page.evaluate(() => window.__qaCall('updateSettings', { patch: { showThinking: false } }))
  await page.waitForFunction(() => !document.querySelector('.thought'))
  await page.evaluate(() => window.__qaCall('updateSettings', { patch: { showThinking: true } }))
  await page.screenshot({ path: join(output, 'after-reenable.png') })
  assert.equal(await page.locator('.thought').count(), 0, 'Turning reasoning back on must not revive discarded text')
  report.lifecycle = { disabled: 'removed', reenabled: 'not restored' }
  const windows = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().map(window => ({ visible: window.isVisible(), focusable: window.isFocusable() })))
  assert.ok(windows.every(window => !window.visible && !window.focusable))
  assert.deepEqual(report.errors, [])
  report.passed = true
} finally {
  writeFileSync(join(output, 'report.json'), JSON.stringify(report, null, 2))
  await app.close()
}
console.log(JSON.stringify({ passed: report.passed, sizes: report.checks.map(check => check.size) }))
