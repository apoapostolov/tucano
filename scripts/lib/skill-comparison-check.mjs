import assert from 'node:assert/strict'
import { join } from 'node:path'
import { measureCopy } from './copy-layout.mjs'
import { electronCopyViewport } from './electron-copy-viewport.mjs'

// Only called by scratch-data/fake-engine drivers. Use the normal core port and proposal tool.
export async function seedSkillComparisons(page) {
  return page.evaluate(async () => {
    const port = await new Promise(resolve => {
      const receive = event => {
        if (event.source !== window || event.data !== 'core:port' || !event.ports[0]) return
        window.removeEventListener('message', receive)
        resolve(event.ports[0])
      }
      window.addEventListener('message', receive)
      window.tucano.connect()
    })
    let sequence = 0
    const pending = new Map()
    port.onmessage = event => {
      const reply = pending.get(event.data.id)
      if (!reply) return
      pending.delete(event.data.id)
      if (event.data.error !== undefined) reply.reject(Error(event.data.error))
      else reply.resolve(event.data.result)
    }
    window.__skillQaCall = (method, params) => new Promise((resolve, reject) => {
      const id = ++sequence
      pending.set(id, { resolve, reject })
      port.postMessage({ id, method, params })
    })
    const call = window.__skillQaCall
    await call('setMyName', { name: 'Review user' })
    const snapshot = await call('snapshot')
    const agent = snapshot.agents.find(agent => agent.handle === 'lia')
    const conversation = snapshot.conversations.find(conversation => conversation.name === 'engineering')
    if (!agent || !conversation) throw Error('Missing synthetic team')
    const description = 'Review comparison changes'
    const before = 'BEFORE_START\n' + 'a\n'.repeat(6000) + 'BEFORE_END'
    const after = 'AFTER_START\n' + 'b\n'.repeat(6000) + 'AFTER_END'
    const create = (name, body) => call('saveSkill', { skill: { name, description, body, agents: [agent.id] } })
    const history = await create('qa-history', before)
    await call('saveSkill', { skill: { ...history, body: after } })
    const proposal = await create('qa-proposal', before)
    await call('sendMessage', { conversationId: conversation.id, text: `@lia proponha a skill \`qa-proposal\` (quando: ${description}): ${after}` })
    window.__skillQaFixture = { historyId: history.id, proposalId: proposal.id, description, before, after }
    return { historyId: history.id, proposalId: proposal.id, characters: [before.length, after.length] }
  })
}

export async function checkSkillComparisons(page, output, guard, resize, widths = [1280, 900]) {
  const viewport = await electronCopyViewport(page, resize)
  const measurements = []
  const capture = async (name, scope) => {
    for (const width of widths) {
      await viewport.set(width)
      await page.evaluate(async () => { await Promise.allSettled(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished)) })
      const copy = await measureCopy(page, [{ selector: `${scope} .diff-full .hint`, maxLines: 2 }, { selector: `${scope} .diff-full .field__label`, maxLines: 1 }])
      assert.ok(copy.passed, JSON.stringify(copy.failures))
      const complete = await page.locator(`${scope} .diff-full pre`).evaluateAll(nodes => {
        const fixture = window.__skillQaFixture
        return nodes.length === 2 && nodes[0].textContent === fixture.description + '\n\n' + fixture.before && nodes[1].textContent === fixture.description + '\n\n' + fixture.after && nodes.every(node => node.childNodes.length === 1)
      })
      assert.ok(complete, 'Both complete versions must remain selectable without per-line nodes')
      await guard()
      await page.screenshot({ path: join(output, `${name}-${width}.png`) })
      measurements.push({ name, width, deviceScaleFactor: await page.evaluate(() => devicePixelRatio), ...copy })
    }
  }
  await page.waitForFunction(async () => (await window.__skillQaCall('snapshot')).skills.some(skill => skill.state === 'pending' && skill.name === 'qa-proposal'))
  await page.locator('.sidebar .nav-item').filter({ hasText: 'Skills' }).first().click()
  const modal = page.locator('.modal').filter({ hasText: 'What should the agents call you' })
  if (await modal.count()) {
    await modal.locator('input').first().fill('Review user')
    await modal.getByRole('button', { name: 'Save', exact: true }).click()
  }
  await page.locator('.notice-line button').filter({ hasText: /Review/ }).click()
  await page.locator('.proposal .diff-full').waitFor()
  await capture('proposal', '.proposal')
  await viewport.set(1280)
  await page.locator('.proposal').getByRole('button', { name: 'Approve', exact: true }).click()
  await page.waitForFunction(async () => {
    const fixture = window.__skillQaFixture
    return (await window.__skillQaCall('snapshot')).skills.find(skill => skill.id === fixture.proposalId)?.body === fixture.after
  })
  await page.locator('.skill-line').filter({ hasText: 'qa-history' }).click()
  await page.locator('.skill__history .link').first().click()
  await page.locator('.skill__history .diff-full').waitFor()
  await capture('history', '.skill__history')
  await viewport.set(1280)
  await page.locator('.skill__history button').filter({ hasText: /Restore/ }).first().click()
  await page.waitForFunction(async () => {
    const fixture = window.__skillQaFixture
    return (await window.__skillQaCall('snapshot')).skills.find(skill => skill.id === fixture.historyId)?.body === fixture.before
  })
  await viewport.restore()
  await guard()
  return { passed: true, measurements, checks: ['fake-engine proposal creates comparison', 'proposal approval keeps complete replacement', 'history comparison keeps both complete versions', 'restore recovers complete old body'] }
}
