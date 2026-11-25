// Proof story for the driver polish: the effort select on the model row.
// Reads geometry and option text from the built page, at both widths, before and after the edit.
//   node scripts/screens.mjs agent-models-effort-row --out C:/tmp/frames/agent-models-effort-row/before --tag before
//   node scripts/screens.mjs agent-models-effort-row --out C:/tmp/frames/agent-models-effort-row/after --tag after
import { close, measure, openApp, settle, shot, until, writeFrames } from './screens/lib.mjs'

export const title = 'Reasoning effort on the model row'
export const size = '1440x900'

const WIDE = { width: 1440, height: 900 }
const NARROW = { width: 420, height: 900 }
const SURFACES = [
  { id: 'bulk', section: '.agent-models__bulk', effort: '.agent-models__bulk [aria-label="Reasoning effort"]' },
  { id: 'row', section: '.agent-models__row', effort: '.agent-models__row [aria-label="Reasoning effort"]' },
  { id: 'memory', section: '#settings-knowledge-memory', effort: '#settings-knowledge-memory [aria-label="Reasoning effort"]' }
]
// Both languages, and Keep for the bulk picker: the width has to fit the longest name either way.
const CANDIDATES = ['Low', 'Medium', 'High', 'Max', 'Keep', 'Baixo', 'Médio', 'Alto', 'Máximo', 'Manter']

// The menu's option texts come from the built page; the text width uses the trigger's own resolved
// font, and the room is the value span the real select gives its label.
async function readText(win, selector) {
  const trigger = win.locator(selector).first()
  await trigger.scrollIntoViewIfNeeded()
  await trigger.click()
  await until(win, '[role="listbox"]')
  const labels = (await win.locator('[role="option"]').allInnerTexts()).map((s) => s.trim())
  await trigger.evaluate((el) => el.click())
  await until(win, '[role="listbox"]', { state: 'hidden', timeout: 5_000 })
  return win.evaluate(({ selector, labels, candidates }) => {
    const button = document.querySelector(selector)
    const span = button.querySelector('.select__trigger__value')
    const style = getComputedStyle(span)
    const context = document.createElement('canvas').getContext('2d')
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    const measure = (label) => ({ label, width: Math.round(context.measureText(label).width * 10) / 10 })
    const widths = [...new Set([...labels, ...candidates])].map(measure)
    const visible = labels.map(measure)
    const longest = widths.reduce((a, b) => (b.width > a.width ? b : a))
    const longestVisible = visible.reduce((a, b) => (b.width > a.width ? b : a))
    return {
      labels,
      font: context.font,
      widths,
      longest: longest.label,
      longestTextWidth: longest.width,
      longestVisible: longestVisible.label,
      longestVisibleTextWidth: longestVisible.width,
      valueRoom: span.clientWidth,
      slack: Math.round((span.clientWidth - longest.width) * 10) / 10,
      fits: longest.width <= span.clientWidth
    }
  }, { selector, labels, candidates: CANDIDATES })
}

// The model's trigger stays narrow with an ellipsis; its menu is wider, but clamped to the screen.
async function readMenu(win, selector, t, name) {
  const trigger = win.locator(selector).first()
  await trigger.scrollIntoViewIfNeeded()
  await trigger.click()
  await until(win, '.select__menu [role="listbox"]')
  const data = await win.evaluate(() => {
    const menu = document.querySelector('.select__menu')
    const box = menu.getBoundingClientRect()
    const labels = [...menu.querySelectorAll('.select__option .select__label')].map((el) => ({
      text: el.textContent.trim(),
      room: el.clientWidth,
      textWidth: el.scrollWidth
    }))
    const longest = labels.reduce((a, b) => (b.textWidth > a.textWidth ? b : a), { text: '', room: 0, textWidth: 0 })
    return {
      frame: null,
      menu: { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) },
      viewportWidth: window.innerWidth,
      withinScreen: box.left >= 0 && box.right <= window.innerWidth,
      options: labels.length,
      longest: longest.text,
      longestTextWidth: longest.textWidth,
      labelRoom: longest.room,
      clipped: labels.some((l) => l.textWidth > l.clientWidth)
    }
  })
  data.frame = await shot(t, name)
  await trigger.evaluate((el) => el.click())
  await until(win, '.select__menu', { state: 'hidden', timeout: 5_000 })
  return data
}

export default async function story(context) {
  const t = await openApp({ locale: 'en-US', seed: 1 })
  const { win } = t
  const rows = []
  await until(win, '.sidebar')
  await win.locator('.sidebar__gear, button[aria-label="Settings"], button[aria-label="Configurações"]').first().click()
  await until(win, '.settings-groups')
  await win.locator('.settings-groups__bar button', { hasText: /^Models$/ }).first().click()
  await until(win, '#settings-models-agents')
  await settle(win, 500)

  for (const size of [WIDE, NARROW]) {
    await win.setViewportSize(size)
    await settle(win, 400)
    for (const surface of SURFACES) {
      const scope = win.locator(surface.section).first()
      await scope.scrollIntoViewIfNeeded()
      await settle(win, 150)
      const selectors = {
        harness: `${surface.section} .model-picker__engine .select__trigger`,
        model: `${surface.section} .model-picker .select.grow .select__trigger`,
        effort: `${surface.effort}`
      }
      const boxes = {}
      for (const [part, selector] of Object.entries(selectors)) {
        const [row] = await measure(win, selector, ['font-size'])
        boxes[part] = { selector, box: row.box, fontSize: row.props['font-size'] }
      }
      const menu = await readMenu(win, selectors.model, t, `model-menu-${surface.id}-${size.width}`)
      const text = await readText(win, surface.effort)
      const sameRow = boxes.harness.box.y === boxes.effort.box.y && boxes.model.box.y === boxes.effort.box.y
      const row = {
        selector: surface.effort,
        box: boxes.effort.box,
        props: { sameRow },
        frame: await shot(t, `${surface.id}-${size.width}`, surface.section),
        data: {
          surface: surface.id,
          width: size.width,
          sameRow,
          textFits: text.fits,
          longest: text.longest,
          longestTextWidth: text.longestTextWidth,
          longestVisible: text.longestVisible,
          longestVisibleTextWidth: text.longestVisibleTextWidth,
          valueRoom: text.valueRoom,
          slack: text.slack,
          labels: text.labels,
          font: text.font,
          menu,
          boxes
        }
      }
      rows.push(row)
    }
  }

  writeFrames(context.out, rows, {
    data: { surfaces: SURFACES.map((s) => s.id), widths: [1440, 420], source: 'built renderer through seeded fake-engine Electron' }
  })
  await close(t)
}
