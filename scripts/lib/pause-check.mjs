import assert from 'node:assert/strict'
import { join } from 'node:path'
import { electronCopyViewport } from './electron-copy-viewport.mjs'

export async function checkPause(page, output, guard, resize) {
  const viewport = await electronCopyViewport(page, resize)
  await viewport.set(1280)
  const states = []
  const row = () => page.evaluate(() => {
    const footer = document.querySelector('.steps__hold')
    return {
      pills: [...(footer?.querySelectorAll('.steps__ask-pill') ?? [])].map(button => ({ text: button.textContent.trim(), disabled: button.disabled })),
      steer: !!footer?.querySelector('.steps__ask'),
      questions: document.querySelectorAll('.ask, .question').length,
      ceiling: [...document.querySelectorAll('.note')].some(node => /ceiling|teto/i.test(node.textContent))
    }
  })
  const capture = async name => {
    await guard()
    const state = await row()
    await page.screenshot({ path: join(output, `pause-${name}.png`) })
    await guard()
    states.push({ name, ...state })
    return state
  }
  await page.locator('.section .nav-item').filter({ hasText: 'engineering' }).first().click()
  await page.locator('.composer textarea').fill('Lia, pergunte em 4 s quando isso precisa estar pronto')
  await page.locator('.composer textarea').press('Enter')
  const first = page.locator('.steps__hold .steps__ask-pill').first()
  await first.waitFor()
  const before = await capture('working')
  assert.equal(before.pills[0].text, 'Pause')
  assert.ok(before.steer, 'Pause must coexist with steering')
  await first.click()
  await page.waitForFunction(() => document.querySelector('.steps__hold .steps__ask-pill')?.textContent.includes('Pausing'))
  const requested = await capture('requested')
  assert.ok(requested.pills[0].disabled)
  await page.waitForFunction(() => document.querySelector('.steps__hold .steps__ask-pill')?.textContent.includes('Resume'))
  const held = await capture('held')
  assert.equal(held.questions, 0, 'The held tool call must not ask its question')
  assert.equal(held.ceiling, false, 'A hold must not be shown as a spending pause')
  await first.click()
  await page.waitForFunction(() => document.querySelectorAll('.ask, .question').length > 0)
  await capture('resumed')
  const stop = page.locator('.steps__stop')
  if (await stop.count()) await stop.last().click()
  await viewport.restore()
  await guard()
  return { states, passed: true }
}
