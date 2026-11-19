import assert from 'node:assert/strict'
import { join } from 'node:path'
import { measureCopy } from './copy-layout.mjs'
import { electronCopyViewport } from './electron-copy-viewport.mjs'

// Uses the private fixture port established by --skill-comparisons; never invokes the file manager.
export async function checkArtifactIngest(page, output, guard, resize) {
  await page.evaluate(async () => {
    const snapshot = await window.__skillQaCall('snapshot')
    const room = snapshot.conversations.find(room => room.kind === 'channel' && room.name === 'engineering')
    await window.__skillQaCall('sendMessage', { conversationId: room.id, text: 'Synthetic attachment compatibility check.', files: [{ name: 'qa-unsupported-attachment.dat', data: btoa('Synthetic unsupported attachment') }] })
  })
  await page.locator('.sidebar .nav-item').filter({ hasText: 'engineering' }).first().click()
  await page.locator('.artifact-card').filter({ hasText: 'qa-unsupported-attachment.dat' }).first().click()
  await page.locator('.side-panel__empty').waitFor()
  const viewport = await electronCopyViewport(page, resize)
  const measurements = []
  try {
    for (const width of [900, 1280]) {
      await viewport.set(width)
      const copy = await measureCopy(page, [{ selector: '.side-panel__empty .empty > p', maxLines: 2 }, { selector: '.side-panel__reveal', maxLines: 1 }])
      assert.ok(copy.passed, JSON.stringify(copy.failures))
      assert.equal(await page.getByRole('button', { name: 'Show in Explorer', exact: true }).count(), 1)
      await guard()
      await page.screenshot({ path: join(output, `artifact-no-preview-${width}.png`) })
      measurements.push({ width, deviceScaleFactor: viewport.native.deviceScaleFactor, ...copy })
    }
  } finally {
    await viewport.restore()
  }
  await page.locator('.side-panel__head').getByRole('button', { name: 'Close', exact: true }).click()
  return { passed: true, fileManagerInvoked: false, measurements }
}
