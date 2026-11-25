// Proof story for the Danger zone row: where the backup and delete buttons sit at two widths.
// The buttons are read in DOM order, so the same story runs on the tree before and after the edit.
//   npm run build
//   node scripts/screens.mjs workspace-danger-row --out C:/tmp/frames/workspace-danger-row/before --tag before
//   node scripts/screens.mjs workspace-danger-row --out C:/tmp/frames/workspace-danger-row/after --tag after
import { close, measure, openApp, settle, shot, until, writeFrames } from './screens/lib.mjs'

export const title = 'Danger zone buttons on the right'
export const size = '1440x900'

const WIDTHS = [1440, 420]
const DANGER = '.workspace-danger'
// Inside Settings the Card component is a settings group, so its box is the card edge.
const CARD = '.workspace-danger .settings-group__box'
const BUTTONS = ['Back up now', 'Open folder', 'Wipe all conversations', 'Delete workspace and all data']
const HEADINGS = ['Backups', 'History', 'Delete workspace']

const edge = (box, side) => (side === 'right' ? box.x + box.w : side === 'bottom' ? box.y + box.h : side === 'left' ? box.x : box.y)
const overlap = (a, b) => a.x < edge(b, 'right') && edge(a, 'right') > b.x && a.y < edge(b, 'bottom') && edge(a, 'bottom') > b.y

async function readRow(win, width) {
  await win.setViewportSize({ width, height: 900 })
  await settle(win, 400)
  const card = win.locator(CARD).first()
  await card.scrollIntoViewIfNeeded()
  await settle(win, 250)

  const [cardBox] = await measure(win, CARD)
  const sections = await measure(win, '.workspace-danger__section')
  const headings = await measure(win, '.workspace-danger__section h3')
  const paragraphs = await measure(win, '.workspace-danger__section p')
  const buttons = await measure(win, '.workspace-danger button')
  const labels = (await win.locator('.workspace-danger button').allInnerTexts()).map((s) => s.trim())
  if (JSON.stringify(labels) !== JSON.stringify(BUTTONS)) throw new Error(`buttons changed: ${JSON.stringify(labels)}`)
  const titles = await win.locator('.workspace-danger__section h3').allInnerTexts()
  if (JSON.stringify(titles.map((s) => s.trim())) !== JSON.stringify(HEADINGS)) throw new Error(`headings changed: ${JSON.stringify(titles)}`)
  if (sections.length !== 3 || headings.length !== 3 || paragraphs.length !== 3 || buttons.length !== 4) {
    throw new Error(`unexpected counts: sections ${sections.length}, headings ${headings.length}, paragraphs ${paragraphs.length}, buttons ${buttons.length}`)
  }

  const cardRight = edge(cardBox.box, 'right')
  const groups = [
    { id: 'backups', heading: headings[0].box, words: [headings[0].box, paragraphs[0].box], buttons: [{ name: labels[0], box: buttons[0].box }, { name: labels[1], box: buttons[1].box }] },
    { id: 'delete', heading: headings[2].box, words: [headings[2].box, paragraphs[2].box], buttons: [{ name: labels[3], box: buttons[3].box }] }
  ].map((group) => ({
    ...group,
    buttons: group.buttons.map((button) => ({
      ...button,
      x: button.box.x,
      y: button.box.y,
      rightGap: cardRight - edge(button.box, 'right'),
      fromHeadingX: button.box.x - group.heading.x,
      fromHeadingY: button.box.y - group.heading.y,
      coversHeading: overlap(button.box, group.heading),
      coversWords: group.words.some((word) => overlap(button.box, word))
    }))
  }))

  return {
    width,
    card: cardBox.box,
    cardRight,
    sections: sections.map((s) => s.box),
    groups,
    backupRightEdges: groups[0].buttons.map((b) => edge(b.box, 'right')),
    deleteRightEdge: edge(groups[1].buttons[0].box, 'right'),
    // The delete button shares the right edge of the last backup button, which is the card edge.
    alignedRight: Math.abs(edge(groups[0].buttons.at(-1).box, 'right') - edge(groups[1].buttons[0].box, 'right')) <= 1,
    overflowsCard: buttons.some((b) => edge(b.box, 'right') > cardRight || b.box.x < cardBox.box.x),
    coversAnyWords: groups.some((g) => g.buttons.some((b) => b.coversWords))
  }
}

export default async function story(context) {
  const t = await openApp({ locale: 'en-US', seed: 1 })
  await until(t.win, '.sidebar')
  await t.win.locator('.sidebar__gear, button[aria-label="Settings"], button[aria-label="Configurações"]').first().click()
  await until(t.win, '.settings-groups')
  await t.win.locator('.settings-groups__bar button', { hasText: /^Workspace$/ }).first().click()
  await until(t.win, DANGER)
  await settle(t.win, 500)

  const rows = []
  for (const width of WIDTHS) {
    const data = await readRow(t.win, width)
    const windowFrame = await shot(t, `${width}-window`)
    const cardFrame = await shot(t, `${width}-card`, CARD)
    rows.push({
      selector: CARD,
      frame: windowFrame,
      props: { viewportWidth: String(width) },
      box: data.card,
      data: { ...data, shot: 'window' }
    })
    rows.push({
      selector: CARD,
      frame: cardFrame,
      props: { viewportWidth: String(width) },
      box: data.card,
      data: { ...data, shot: 'card' }
    })
  }

  writeFrames(t.out, rows, {
    data: {
      widths: WIDTHS,
      labels: BUTTONS,
      headings: HEADINGS,
      source: 'built renderer through seeded fake-engine Electron, no installed app'
    }
  })
  await close(t)
}
