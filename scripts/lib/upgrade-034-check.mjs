import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { measureCopy } from './copy-layout.mjs'
import { electronCopyViewport } from './electron-copy-viewport.mjs'

// Set before launch: even the modal's initial automatic read stays inside scratch data.
export function seedUpgrade034(data) {
  return { HERMES_HOME: join(data, 'qa-hermes-source') }
}

function populateHermes(root) {
  for (const profile of ['', 'profiles/research-review']) {
    const folder = join(root, profile)
    mkdirSync(join(folder, 'memories'), { recursive: true })
    writeFileSync(join(folder, 'SOUL.md'), '# Synthetic research review assistant\nUse only synthetic QA material.\n')
    writeFileSync(join(folder, 'memories', 'MEMORY.md'), 'Synthetic project context\n§\nSynthetic review preference\n')
    writeFileSync(join(folder, 'memories', 'USER.md'), 'Synthetic user preference\n')
    writeFileSync(join(folder, 'config.yaml'), 'model:\n  provider: synthetic-provider\n  default: synthetic-long-context-research-model\nmcp_servers:\n  synthetic-research-index: {}\n')
  }
}

export async function checkUpgrade034(page, output, guard, resize, data, source) {
  const viewport = await electronCopyViewport(page, resize)
  const measurements = []
  const failures = []
  const capture = async (name, rules, widths = [900, 1280]) => {
    for (const width of widths) {
      await viewport.set(width)
      const copy = await measureCopy(page, rules)
      failures.push(...copy.failures.map(item => ({ name, width, ...item })))
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Document must not overflow')
      const screenshot = `upgrade-034-${name}-${width}.png`
      await guard()
      await page.screenshot({ path: join(output, screenshot), animations: 'disabled' })
      await guard()
      measurements.push({ name, source, width, screenshot, display: await page.evaluate(() => ({ devicePixelRatio, width: innerWidth, height: innerHeight })), ...copy })
      writeFileSync(join(output, 'upgrade-034-copy.json'), JSON.stringify({ source, measurements, failures }, null, 2) + '\n')
    }
  }
  const settings = async (tab, section) => {
    await page.locator('.sidebar .nav-item').filter({ hasText: 'Settings' }).first().click()
    await page.locator(`#settings-tab-${tab}`).click()
    await page.locator(`.settings-sections a[href="#settings-${section}"]`).click()
  }
  try {
    await page.locator('.section').filter({ has: page.locator('.section__head').getByText('Agents', { exact: true }) }).locator('.nav-item').filter({ has: page.locator('.nav-item__role'), hasText: 'Lia' }).first().click()
    await page.locator('.agent-form').waitFor()
    await page.locator('.initiative-setting').getByRole('button', { name: /^(Set up initiative|Open initiative)$/ }).click()
    await page.locator('.initiative-modal select').first().waitFor()
    const originalTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    const caretStates = []
    try {
      for (const theme of ['light', 'dark']) {
        await page.evaluate(theme => { document.documentElement.dataset.theme = theme }, theme)
        for (const width of [900, 1280]) {
          await viewport.set(width)
          await page.locator('.initiative__grid').scrollIntoViewIfNeeded()
          const controls = await page.locator('.initiative-modal select').evaluateAll(nodes => nodes.map(node => {
            const style = getComputedStyle(node)
            const rect = node.getBoundingClientRect()
            return { tag: node.tagName, value: node.value, appearance: style.appearance, backgroundImage: style.backgroundImage, backgroundPositionX: style.backgroundPositionX, backgroundPositionY: style.backgroundPositionY, backgroundSize: style.backgroundSize, backgroundRepeat: style.backgroundRepeat, paddingRight: style.paddingRight, width: rect.width, height: rect.height, visible: rect.width > 0 && rect.height > 0 }
          }))
          assert.equal(controls.length, 2, 'Measure the actual native initiative selects')
          for (const control of controls) {
            assert.equal(control.tag, 'SELECT')
            assert.ok(control.visible)
            assert.equal(control.appearance, 'none')
            assert.match(control.backgroundImage, /data:image\/svg\+xml/)
            assert.equal(control.paddingRight, '30px')
            assert.match(control.backgroundPositionX, /(?:100% - 10px|right 10px)/)
            assert.equal(control.backgroundPositionY, '50%')
            assert.match(control.backgroundSize, /^14px(?: auto)?$/)
            assert.equal(control.backgroundRepeat, 'no-repeat')
          }
          await capture(`native-select-${theme}`, [{ selector: '.initiative__grid .field__label', maxLines: 1 }], [width])
          caretStates.push({ theme, width, controls })
          writeFileSync(join(output, 'upgrade-034-native-select.json'), JSON.stringify({ source, caretStates }, null, 2) + '\n')
        }
      }
      assert.notEqual(caretStates[0].controls[0].backgroundImage, caretStates[2].controls[0].backgroundImage, 'Caret ink must follow the theme')
    } finally {
      await page.evaluate(theme => {
        if (theme === null) document.documentElement.removeAttribute('data-theme')
        else document.documentElement.setAttribute('data-theme', theme)
      }, originalTheme)
      await page.locator('.initiative-modal .modal__head').getByRole('button', { name: 'Close', exact: true }).click()
    }
    await settings('models', 'models-runtimes')
    const endpoint = page.locator('#settings-models-runtimes .harness').filter({ hasText: 'Your own endpoint' })
    assert.equal(await endpoint.count(), 1, 'Endpoint has one canonical card')
    await endpoint.getByRole('button', { name: /^(Set up|Edit)$/ }).click()
    await endpoint.locator('.endpoint input').first().fill('http://127.0.0.1:1/synthetic-long-endpoint-path/v1')
    assert.equal(await endpoint.locator('input[type="password"]').inputValue(), '', 'Scratch endpoint has no key')
    await capture('endpoint-expanded', [
      { selector: '#settings-models-runtimes .harness:has(.endpoint) .harness__name strong, #settings-models-runtimes .endpoint .field__label, #settings-models-runtimes .endpoint button', maxLines: 1 },
      { selector: '#settings-models-runtimes .harness:has(.endpoint) .harness__account, #settings-models-runtimes .endpoint .hint', maxLines: 2 }
    ])
    await endpoint.getByRole('button', { name: 'Cancel', exact: true }).click()
    await settings('workspace', 'workspace-transfer')
    const open = () => page.getByRole('button', { name: 'Import from Hermes…', exact: true }).click()
    await open()
    await page.locator('.hermes-import .hint--warn').waitFor()
    assert.equal(await page.locator('.hermes-import').getByRole('button', { name: 'Import', exact: true }).isEnabled(), false)
    await capture('hermes-missing-source', [
      { selector: '.hermes-import .modal__head > strong, .hermes-import button.btn', maxLines: 1 },
      { selector: '.hermes-import .hint--warn', maxLines: 2 }
    ])
    await page.locator('.hermes-import').getByRole('button', { name: 'Cancel', exact: true }).click()
    populateHermes(seedUpgrade034(data).HERMES_HOME)
    await open()
    await page.locator('.hermes-import__body').waitFor()
    assert.equal(await page.locator('.hermes-import input[type="checkbox"]').count(), 2)
    await capture('hermes-preview', [
      { selector: '.hermes-import .modal__head > strong, .hermes-import h4, .hermes-import button.btn, .hermes-import .check strong, .hermes-import dt', maxLines: 1 },
      { selector: '.hermes-import .skill__desc, .hermes-import li, .hermes-import dd', maxLines: 2 }
    ])
    for (const box of await page.locator('.hermes-import input[type="checkbox"]').all()) await box.uncheck()
    assert.equal(await page.locator('.hermes-import').getByRole('button', { name: 'Import', exact: true }).isEnabled(), false)
    await capture('hermes-no-selection', [
      { selector: '.hermes-import .modal__foot button', maxLines: 1 },
      { selector: '.hermes-import .modal__foot > span', maxLines: 2 }
    ])
    await page.locator('.hermes-import').getByRole('button', { name: 'Cancel', exact: true }).click()
  } finally {
    await viewport.restore()
  }
  assert.deepEqual(failures, [], JSON.stringify(failures))
  return { passed: true, measurements, networkInvoked: false, pickerInvoked: false, imported: false, exceptions: [], uncovered: ['Endpoint probe, fetched models, save and connection test', 'Hermes import mutation and real source formats'] }
}
