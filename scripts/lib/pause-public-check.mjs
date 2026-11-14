import assert from 'node:assert/strict'
import { join } from 'node:path'
import { measureCopy } from './copy-layout.mjs'

export async function checkPublicPause(page, output) {
  const report = { states: [], captures: [], measurements: [] }
  const row = () => page.evaluate(() => ({
    text: document.querySelector('.steps__hold-pill')?.textContent.trim(),
    disabled: document.querySelector('.steps__hold-pill')?.disabled,
    questions: document.querySelectorAll('.ask, .question').length
  }))
  const shot = async name => {
    await page.screenshot({ path: join(output, name + '.png') })
    report.captures.push(name + '.png')
    report.states.push({ name, ...await row() })
  }
  await page.locator('.section .nav-item').filter({ hasText: 'engineering' }).first().click()
  await page.locator('.composer textarea').fill('Lia, pergunte em 4 s quando isso precisa estar pronto')
  await page.locator('.composer textarea').press('Enter')
  const button = page.locator('.steps__hold-pill').first()
  await button.waitFor()
  assert.equal((await row()).text, 'Pause')
  await shot('working-1280')
  await button.click()
  await page.waitForFunction(() => document.querySelector('.steps__hold-pill')?.textContent.includes('Pausing'))
  assert.equal((await row()).disabled, true)
  await shot('pausing-1280')
  await page.waitForFunction(() => document.querySelector('.steps__hold-pill')?.textContent.includes('Resume'))
  assert.equal((await row()).questions, 0)
  for (const width of [1280, 900, 420]) {
    await page.setViewportSize({ width, height: 900 })
    const copy = await measureCopy(page, [{ selector: '.steps__hold-pill', maxLines: 1 }])
    assert.ok(copy.passed, JSON.stringify(copy.failures))
    report.measurements.push(copy)
    await shot(`held-${width}`)
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  await button.click()
  await page.waitForFunction(() => document.querySelectorAll('.ask, .question').length > 0)
  await shot('resumed-1280')
  const stop = page.locator('.steps__stop')
  if (await stop.count()) await stop.last().click()
  return report
}
