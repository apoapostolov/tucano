import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const server = await createServer({ configFile: false, server: { host: '127.0.0.1', port: 0 }, appType: 'spa' })
await server.listen()
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const report = { source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), errors: [], checks: [] }
try {
  for (const size of ['sm', 'md', 'lg']) {
    const page = await browser.newPage({ viewport: { width: 900, height: 700 } })
    page.on('pageerror', error => report.errors.push(String(error)))
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/scripts/qa-reasoning-retention-boundary.html`)
    await page.waitForFunction(() => window.emitThought)
    await page.evaluate(size => { window.setSize(size); window.emitThought('Original passage that will be evicted.\n'.repeat(400)) }, size)
    const block = page.locator('.thought')
    await block.waitFor()
    const hold = async () => {
      await block.evaluate(el => { el.scrollTop = 100; el.dispatchEvent(new Event('scroll', { bubbles: true })) })
      assert.equal(await page.evaluate(() => window.readingCalls.held), true)
    }
    await hold()
    // The old character cannot be preserved after it leaves the bounded cache. Keep a usable
    // viewport in the retained replacement, then permit normal reading and returning to the end.
    await page.evaluate(() => window.emitThought('Replacement retained reasoning.\n'.repeat(1000)))
    await page.waitForFunction(() => !document.querySelector('.thought__text')?.textContent.includes('Original passage'))
    const evicted = await block.evaluate(el => ({ top: el.scrollTop, max: el.scrollHeight - el.clientHeight, text: el.querySelector('.thought__text').textContent }))
    assert.equal(evicted.text.length, 20000)
    assert.ok(Number.isFinite(evicted.top) && evicted.top >= 0 && evicted.top <= evicted.max)
    assert.ok(evicted.top < evicted.max - 2, 'Eviction must not force a reader to the tail')
    await block.evaluate(el => { el.scrollTop = el.scrollHeight; el.dispatchEvent(new Event('scroll', { bubbles: true })) })
    assert.equal(await page.evaluate(() => window.readingCalls.held), false, 'Returning to the replacement end releases ownership')
    await hold()
    const forgotten = await page.evaluate(() => window.readingCalls.forgets)
    await page.evaluate(() => window.setThinking(false))
    await page.waitForFunction(() => !document.querySelector('.thought'))
    assert.equal(await page.evaluate(() => window.readingCalls.held), false)
    assert.ok(await page.evaluate(() => window.readingCalls.forgets) > forgotten, 'Cache clearing forgets active ownership')
    await page.evaluate(() => window.setThinking(true))
    await page.waitForTimeout(200)
    assert.equal(await block.count(), 0, 'Re-enable must not restore cleared reasoning')
    await page.evaluate(() => window.emitThought('Fresh reasoning after clearing'))
    await block.waitFor()
    assert.equal(await page.locator('.thought__text').textContent(), 'Fresh reasoning after clearing')
    report.checks.push({ size, evicted: { top: evicted.top, max: evicted.max, retained: evicted.text.length }, clearedHold: true, freshText: true })
    await page.close()
  }
  assert.deepEqual(report.errors, [])
  console.log(JSON.stringify({ passed: report.checks.length, errors: report.errors }))
} finally {
  writeFileSync('C:/tmp/tucano-245-eviction.json', JSON.stringify(report, null, 2))
  await browser.close(); await server.close()
}
