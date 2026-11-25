// Proof for PR 586: the thinking level on every model pick in the daily driver.
// One app, one pass, both widths. Each row records the select's own text, the options its menu
// showed and the four levels after Keep is set aside, so frames.json carries numbers, not a claim.
//
//   node scripts/screens.mjs thinking-levels --out C:/tmp/frames/thinking-levels
import { close, measure, openApp, settle, shot, until, writeFrames } from './screens/lib.mjs'

export const title = 'Thinking levels wherever a model is picked'
export const size = '1440x900'

const WIDE = { width: 1440, height: 900 }
const NARROW = { width: 420, height: 900 }
const LEVELS = ['Low', 'Medium', 'High', 'Max']

export default async function story(context) {
  const t = await openApp({ locale: 'en-US', seed: 1 })
  const { win } = t
  const rows = []

  // A select's own value and menu, read from the built page. The menu is portalled into the body, so
  // the options are read from the document after the trigger opens it, inside each surface's scope.
  const level = async (selector) => {
    const trigger = win.locator(selector).first()
    await trigger.waitFor({ state: 'visible' })
    await trigger.scrollIntoViewIfNeeded()
    const selected = (await trigger.locator('.select__trigger__value').innerText()).trim()
    await trigger.click()
    await until(win, '[role="listbox"]')
    const options = (await win.locator('[role="option"]').allInnerTexts()).map((s) => s.trim())
    // The menu is portalled: a DOM click on its trigger is the reliable close (Escape is not always
    // delivered to the listbox when a previous scroll moved focus).
    await trigger.evaluate((el) => el.click())
    await until(win, '[role="listbox"]', { state: 'hidden', timeout: 5_000 })
    const levels = options.filter((o) => o !== 'Keep')
    if (JSON.stringify(levels) !== JSON.stringify(LEVELS)) throw new Error(`${selector}: expected ${LEVELS.join(', ')}, got ${options.join(', ')}`)
    return { selected, options, levels }
  }

  const capture = async (name, surface, selector, shotSelector) => {
    // Measure where the person sees it, not the element's place before the page scrolls to it.
    await win.locator(selector).first().scrollIntoViewIfNeeded()
    const [box] = await measure(win, selector, ['width'])
    const read = await level(selector)
    box.frame = await shot(t, name, shotSelector)
    box.selector = selector
    box.data = { surface, width: win.viewportSize().width, ...read }
    rows.push(box)
  }

  await until(win, '.sidebar')
  await settle(win, 800)

  // An agent's own page: the level closes the harness/model row.
  // The row's own gear opens the agent's page; the row itself opens its DM.
  // The gear sits under the row's role text at this width; a DOM click still fires its React handler.
  await win.locator('button[aria-label="Lia\'s settings"]').first().evaluate((el) => el.click())
  await until(win, '.model-picker__effort')
  for (const [width, size] of [['1440', WIDE], ['420', NARROW]]) {
    await win.setViewportSize(size)
    await settle(win, 400)
    await capture(`agent-row-${width}`, 'agent-page', '.model-picker__effort [aria-label="Reasoning effort"]', '.lrow--wide')
  }

  // Settings → Models, reached at the wide width because the sidebar's tabs need the room.
  await win.setViewportSize(WIDE)
  await win.locator('.sidebar__gear, button[aria-label="Settings"], button[aria-label="Configurações"]').first().click()
  await until(win, '.settings-groups')
  await win.locator('.settings-groups__bar button', { hasText: /^Models$/ }).first().click()
  await until(win, '#settings-models-agents')

  for (const [width, size] of [['1440', WIDE], ['420', NARROW]]) {
    await win.setViewportSize(size)
    await settle(win, 400)
    await capture(`agent-models-bulk-${width}`, 'agent-models-bulk', '.agent-models__bulk [aria-label="Reasoning effort"]', '.agent-models__bulk')
    await capture(`agent-models-row-${width}`, 'agent-models-row', '.agent-models__row [aria-label="Reasoning effort"]', '.agent-models__row')
    await capture(`memory-model-${width}`, 'memory-model', '#settings-knowledge-memory [aria-label="Reasoning effort"]', '#settings-knowledge-memory')
  }

  writeFrames(context.out, rows, { data: { surfaces: ['agent-page', 'agent-models-bulk', 'agent-models-row', 'memory-model'], widths: [1440, 420] } })
  await close(t)
}
