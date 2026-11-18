import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { measureCopy } from './lib/copy-layout.mjs'

const output = 'C:/tmp/tucano-245-fold'
mkdirSync(output, { recursive: true })
const server = await createServer({ configFile: false, server: { host: '127.0.0.1', port: 0 }, appType: 'spa' })
await server.listen()
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const report = { source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), checks: [] }
try {
  for (const width of [360, 900, 1280]) for (const size of ['sm', 'md', 'lg']) {
    const page = await browser.newPage({ viewport: { width, height: 700 } })
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/scripts/qa-reasoning-retention-boundary.html`)
    await page.waitForFunction(() => window.emitThought)
    await page.evaluate(size => { window.setSize(size); window.emitThought('A synthetic reasoning passage.\n'.repeat(400)) }, size)
    const head = page.locator('.thought__head')
    await head.waitFor()
    assert.equal(await head.getAttribute('aria-expanded'), 'true')
    const height = await page.locator('.thought').evaluate(el => el.clientHeight)
    await page.locator('.thought').evaluate(el => {
      el.scrollTop = 100
      el.dispatchEvent(new Event('scroll', { bubbles: true }))
    })
    assert.equal(await page.evaluate(() => window.readingCalls.held), true)
    // The default follows working state and folds on completion without removing the control.
    await page.evaluate(() => window.setWorking(false))
    await page.waitForFunction(() => document.querySelector('.thought__head')?.getAttribute('aria-expanded') === 'false')
    assert.equal(await page.locator('.thought__text').count(), 0)
    assert.equal(await page.evaluate(() => window.readingCalls.held), false, 'Automatic fold forgets its reading hold')
    await head.focus(); await page.keyboard.press('Enter')
    await page.waitForSelector('.thought__text')
    await page.evaluate(() => window.setWorking(true))
    await head.press('Space')
    await page.evaluate(() => window.emitThought('more reasoning'))
    assert.equal(await head.getAttribute('aria-expanded'), 'false', 'Manual fold survives a streamed delta')
    await head.press('Enter')
    await page.waitForSelector('.thought__text')
    const hold = async () => {
      await page.locator('.thought').evaluate(el => {
        el.scrollTop = 100
        el.dispatchEvent(new Event('scroll', { bubbles: true }))
      })
      assert.equal(await page.evaluate(() => window.readingCalls.held), true)
    }
    await hold()
    await page.evaluate(() => window.setWorking(false))
    assert.equal(await head.getAttribute('aria-expanded'), 'true', 'Explicit open survives completion')
    assert.equal(await page.evaluate(() => window.readingCalls.held), true, 'Completion preserves explicit reading ownership')
    await head.press('Enter')
    assert.equal(await page.evaluate(() => window.readingCalls.held), false, 'Folding releases the reading hold')
    const copy = await measureCopy(page, [{ selector: '.thought__label', maxLines: 1 }])
    assert.ok(copy.passed, JSON.stringify(copy.failures))
    await page.screenshot({ path: `${output}/${width}-${size}.png` })
    await head.press('Enter'); await hold()
    await page.evaluate(() => window.setVisible(false))
    await page.waitForFunction(() => !document.querySelector('.thought'))
    assert.equal(await page.evaluate(() => window.readingCalls.held), false, 'Removal forgets the reading hold')
    report.checks.push({ width, size, height, copy, keyboard: true, manualFold: true, automaticFold: true, holdReleased: true })
    await page.close()
  }
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passed: report.checks.length, sizes: ['sm', 'md', 'lg'], widths: [360, 900, 1280] }))
} finally { await browser.close(); await server.close() }
