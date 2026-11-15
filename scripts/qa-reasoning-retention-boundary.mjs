import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const server = await createServer({ configFile: false, server: { host: '127.0.0.1', port: 0 }, appType: 'spa' })
await server.listen()
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: Number(process.argv[4] ?? 900), height: 700 } })
  page.on('pageerror', e => console.error(e))
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/scripts/qa-reasoning-retention-boundary.html`)
  await page.waitForFunction(() => window.emitThought)
  await page.evaluate(size => window.setSize(size), process.argv[3] ?? 'md')
  const lines = Array.from({ length: 250 }, (_, i) => `Line ${String(i).padStart(4, '0')} ${'x'.repeat(65)}\n`).join('')
  await page.evaluate(text => window.emitThought(text), lines)
  const block = page.locator('.thought')
  await block.waitFor()
  await page.waitForTimeout(250)
  const before = await block.evaluate(el => {
    el.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true }))
    el.scrollTop = Math.floor((el.scrollHeight - el.clientHeight) / 2)
    el.dispatchEvent(new Event('scroll', { bubbles: true }))
    const text = el.querySelector('.thought__text').firstChild
    const target = el.getBoundingClientRect().top + 30
    const range = document.createRange()
    let offset = 0
    for (; offset < text.length; offset++) { range.setStart(text, offset); range.setEnd(text, offset + 1); if (range.getBoundingClientRect().top >= target) break }
    window.mark = text.textContent.slice(offset - 100, offset + 100)
    const style = getComputedStyle(text.parentElement)
    return { mark: window.mark, top: range.getBoundingClientRect().top, length: text.length, font: { family: style.fontFamily, size: style.fontSize, lineHeight: style.lineHeight } }
  })
  await page.waitForTimeout(100)
  const amount = process.argv[2] === 'control' ? 100 : 400
  await page.evaluate(amount => window.emitThought('tail '.repeat(amount)), amount)
  await page.waitForTimeout(250)
  const after = await block.evaluate(el => {
    const text = el.querySelector('.thought__text').firstChild
    const offset = text.textContent.indexOf(window.mark) + 100
    const range = document.createRange(); range.setStart(text, offset); range.setEnd(text, offset + 1)
    return { mark: text.textContent.slice(offset, offset + 20), offset, top: range.getBoundingClientRect().top, length: text.length }
  })
  const report = { source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), viewport: page.viewportSize(), appended: amount * 5, trimmed: before.length + amount * 5 - after.length, before, after, drift: after.top - before.top }
  writeFileSync(`C:/tmp/qa-reasoning-retention-${amount === 100 ? 'control' : 'boundary'}.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  assert.ok(Math.abs(after.top - before.top) <= 1, 'The retained passage must remain on its reading line')
} finally { await browser.close(); await server.close() }
