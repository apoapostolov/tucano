import assert from 'node:assert/strict'
import { join } from 'node:path'
import { electronCopyViewport } from './electron-copy-viewport.mjs'
import { measureCopy } from './copy-layout.mjs'

// A second normal renderer port writes fixtures through authorized RPC. No database is edited.
export async function seedSectors(page) {
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
      const data = event.data
      const result = pending.get(data.id)
      if (!result) return
      pending.delete(data.id)
      if (data.error !== undefined) result.reject(new Error(data.error))
      else result.resolve(data.result)
    }
    const call = (method, params) => new Promise((resolve, reject) => {
      const id = ++sequence
      pending.set(id, { resolve, reject })
      port.postMessage({ id, method, params })
    })
    try {
      const snapshot = await call('snapshot')
      const lia = snapshot.agents.find(agent => agent.handle === 'lia')
      const theo = snapshot.agents.find(agent => agent.handle === 'theo')
      const nina = snapshot.agents.find(agent => agent.handle === 'nina')
      if (!lia || !theo || !nina) throw new Error('Missing synthetic seed agents')
      const save = agent => call('saveAgent', { agent, channelIds: snapshot.conversations.filter(conversation => conversation.members?.includes(agent.id)).map(conversation => conversation.id) })
      await save({ ...lia, sectorName: 'Engineering', sectorDoes: 'Build and verify the application' })
      await save({ ...theo, reportsTo: lia.id })
      await save({ ...nina, sectorName: 'Content', sectorDoes: 'Write and review documentation' })
      await save({ ...nina, id: crypto.randomUUID(), name: 'QA member', handle: 'qa-member', reportsTo: nina.id, sectorName: undefined, sectorDoes: undefined })
    } finally { port.close() }
  })
}

export async function checkSectors(page, output, guard, resize) {
  const viewport = await electronCopyViewport(page, resize)
  const measurements = []
  await page.locator('.sidebar .nav-item').filter({ hasText: 'Team' }).first().click()
  await page.locator('.org-zone').nth(1).waitFor()
  for (const width of [1280, 900]) {
    await viewport.set(width)
    const arrange = page.getByRole('button', { name: 'Tidy up', exact: true })
    if (await arrange.count()) await arrange.click()
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const zones = await page.locator('.org-zone').evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect()
      return { text: node.textContent, x: box.x, y: box.y, right: box.right, bottom: box.bottom }
    }))
    assert.equal(zones.length, 2)
    const [a, b] = zones
    assert.ok(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y, 'Sector zones overlap')
    await page.locator('.org-zone__name').first().click()
    await page.locator('.org-side input[maxlength="40"]').waitFor()
    await page.locator('.org-side').evaluate(async node => { await Promise.all(node.getAnimations({ subtree: true }).filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished)) })
    const copy = await measureCopy(page, [
      { selector: '.org-side .field__label:visible', maxLines: 1 },
      { selector: '.org-side .hint:visible', maxLines: 2 }
    ])
    assert.ok(copy.passed, JSON.stringify(copy.failures))
    await guard()
    await page.screenshot({ path: join(output, `sectors-${width}.png`) })
    measurements.push({ width, deviceScaleFactor: await page.evaluate(() => devicePixelRatio), zones, ...copy })
    await page.locator('.org-side button[title="Close (Esc)"]').click()
  }
  // Exercise the composed Team attachment entry point in the actual renderer.
  await page.locator('.org-ask input[type="file"]').setInputFiles({ name: 'sector-qa.txt', mimeType: 'text/plain', buffer: Buffer.from('Synthetic sector attachment') })
  await page.locator('.org-ask-wrap .composer__file-name').filter({ hasText: 'sector-qa.txt' }).waitFor()
  await guard()
  await page.screenshot({ path: join(output, 'sectors-attachment.png') })
  await page.locator('.org-ask-wrap .composer__file-x').click()
  await viewport.restore()
  return { measurements, attachment: 'Team composer reads and removes file', passed: true }
}
