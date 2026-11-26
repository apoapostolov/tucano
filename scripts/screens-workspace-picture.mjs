// Proof story for the picture in Manage workspaces: the row thumbnail, its hover/focus edit glyph,
// and the picture window's empty and set states at 1440 and 420. Same story runs before and after;
// `--tag before` reads the baseline rows, `--tag after` also drives the new controls.
//   npm run build
//   node scripts/screens.mjs workspace-picture --tag before --out C:/tmp/frames/workspace-picture/driver/before
//   node scripts/screens.mjs workspace-picture --tag after  --out C:/tmp/frames/workspace-picture/driver/after
import assert from 'node:assert/strict'
import { close, measure, openApp, settle, shot, until, writeFrames } from './screens/lib.mjs'

export const size = '1440x900'
const WIDTHS = [1440, 420]
const MANAGER = '.modal__card.workspace-manager'
const PICTURE = '.modal__card.workspace-picture'
const ROW = '.workspace-manager__row'
const CONTROLS = '.workspace-manager__row .icon-btn'
const THUMB = '.workspace-picture__thumb'
const GLYPH = '.workspace-picture__edit'

const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
const inside = (inner, outer, slack = 1) => inner.x >= outer.x - slack && inner.x + inner.w <= outer.x + outer.w + slack && inner.y >= outer.y - slack && inner.y + inner.h <= outer.y + outer.h + slack

async function readRows(t, width) {
  await t.win.setViewportSize({ width, height: 900 })
  await settle(t.win, 400)
  const [card] = await measure(t, MANAGER)
  const rows = await measure(t, ROW)
  const buttons = await measure(t, CONTROLS)
  const identity = await measure(t, '.workspace-manager__identity')
  const names = await measure(t, '.workspace-manager__name')
  assert.ok(rows.length >= 1, `no workspace rows at ${width}`)
  assert.ok(buttons.length >= 4, `expected four row controls at ${width}, saw ${buttons.length}`)
  return {
    width,
    card: card.box,
    rows: rows.map((r) => r.box),
    identity: identity.map((i) => i.box),
    names: names.map((n) => n.box),
    controls: buttons.map((b) => b.box),
    controlsInsideCard: buttons.every((b) => inside(b.box, card.box)),
    controlsOverlapWords: rows.some((row) => buttons.some((b) => overlaps(b.box, row.box) && b.box.x < row.box.x + 100))
  }
}

async function readPicture(t, width, state) {
  const [card] = await measure(t, PICTURE)
  const [placeholder] = await measure(t, `${PICTURE} .workspace-picture__placeholder`, ['borderStyle', 'borderWidth', 'minHeight'])
  const actions = await measure(t, `${PICTURE} .workspace-picture__actions button`)
  const [url] = await measure(t, `${PICTURE} .workspace-picture__url`)
  const [urlButton] = await measure(t, `${PICTURE} .workspace-picture__url button`)
  const picture = await t.win.evaluate((selector) => {
    const root = document.querySelector(selector)
    const image = root?.querySelector('.workspace-picture__placeholder img')
    return {
      state: root?.querySelector('.workspace-picture__placeholder.has-picture') ? 'set' : 'empty',
      drawn: image ? `${image.naturalWidth}x${image.naturalHeight}` : null,
      clear: [...(root?.querySelectorAll('button') ?? [])].some((b) => /Use the default/.test(b.textContent ?? '')),
      viewport: window.innerWidth
    }
  }, PICTURE)
  assert.equal(picture.state, state)
  assert.equal(picture.viewport, width)
  assert.equal(placeholder.props.borderStyle, 'dashed')
  assert.ok(Number.parseInt(String(placeholder.props.borderWidth), 10) >= 1)
  assert.ok(actions.every((a) => a.box.w >= 32 && a.box.h >= 32), `small action target at ${width}`)
  assert.ok(urlButton.box.w >= 32 && urlButton.box.h >= 32, `small address action at ${width}`)
  assert.ok(inside(actions[0].box, card.box) && inside(url.box, card.box), `control outside the picture window at ${width}`)
  assert.ok(!overlaps(actions[0].box, url.box), `picture controls overlap at ${width}`)
  return {
    width,
    state,
    card: card.box,
    placeholder: placeholder.box,
    placeholderStyle: placeholder.props,
    actions: actions.map((a) => a.box),
    url: url.box,
    urlButton: urlButton.box,
    picture,
    controlsInsideCard: actions.every((a) => inside(a.box, card.box)) && inside(urlButton.box, card.box)
  }
}

async function openManager(t) {
  await until(t.win, '.sidebar')
  await t.win.locator('.workspace-picker__button').first().click()
  await until(t.win, '.menu__item')
  await t.win.locator('.menu__item', { hasText: 'Manage workspaces' }).first().click()
  await until(t.win, MANAGER)
  await settle(t.win, 400)
}

export default async function story(t) {
  const after = t.tag === 'after'
  const app = await openApp({ locale: 'en-US', seed: 1 })
  await openManager(app)
  const rows = []

  for (const width of WIDTHS) {
    const baseline = await readRows(app, width)
    const frame = await shot(app, `${t.tag ?? 'after'}-${width}-manager`, MANAGER)
    rows.push({ selector: MANAGER, frame, props: { viewportWidth: String(width) }, box: baseline.card, data: { shot: 'manager', ...baseline } })

    if (!after) continue

    const thumbs = await measure(app, THUMB, ['opacity'])
    assert.equal(thumbs.length, baseline.rows.length)
    assert.ok(thumbs.every((x) => x.box.w >= 32 && x.box.h >= 32), `thumbnail hit target under 32 px at ${width}`)
    const face = await measure(app, '.workspace-picture__face')
    const nameGap = baseline.names[0].x - (thumbs[0].box.x + thumbs[0].box.w)
    assert.ok(nameGap >= 8 && nameGap <= 16, `name not directly beside the thumbnail at ${width}: ${nameGap}px`)
    assert.ok(face.every((f) => inside(f.box, baseline.card)), `thumbnail cut by the card at ${width}`)
    rows[rows.length - 1].data.thumbnail = thumbs[0].box
    rows[rows.length - 1].data.face = face[0].box
    rows[rows.length - 1].data.nameGap = nameGap
    await app.win.locator(THUMB).first().hover()
    await settle(app, 200)
    const hover = await measure(app, GLYPH, ['opacity'])
    assert.ok(Number(hover[0].props.opacity) > 0.9, `edit glyph stayed hidden on hover at ${width}`)
    rows[rows.length - 1].data.hoverGlyphOpacity = hover[0].props.opacity
    // Leave the pointer, then reach the thumbnail again by keyboard for focus-visible.
    await app.win.mouse.move(0, 0)
    await app.win.locator(THUMB).first().focus()
    await app.win.keyboard.press('Shift+Tab')
    await app.win.keyboard.press('Tab')
    await settle(app, 200)
    const focus = await measure(app, GLYPH, ['opacity'])
    rows[rows.length - 1].data.focusGlyphOpacity = focus[0].props.opacity
    await app.win.locator(THUMB).first().click()
    await until(app.win, PICTURE)
    await settle(app, 250)

    // Empty: the dotted placeholder is what a workspace without a picture shows.
    const empty = await readPicture(app, width, 'empty')
    const emptyFrame = await shot(app, `after-${width}-empty`, PICTURE)
    rows.push({ selector: `${PICTURE} .workspace-picture__placeholder`, frame: emptyFrame, props: { viewportWidth: String(width) }, box: empty.placeholder, data: { shot: 'empty', ...empty } })

    // Set: the same window after a bitmap was picked from this computer.
    await app.win.setInputFiles(`${PICTURE} input[type=file]`, 'build/icon.png')
    await app.win.waitForSelector(`${PICTURE} .workspace-picture__placeholder.has-picture img`, { timeout: 15_000 })
    await settle(app, 400)
    const set = await readPicture(app, width, 'set')
    const setFrame = await shot(app, `after-${width}-set`, PICTURE)
    rows.push({ selector: `${PICTURE} .workspace-picture__placeholder`, frame: setFrame, props: { viewportWidth: String(width) }, box: set.placeholder, data: { shot: 'set', ...set } })

    await app.win.locator(`${PICTURE} .modal__head button`).click()
    await until(app.win, PICTURE, { state: 'hidden' })
    const rowWithPicture = await measure(app, THUMB)
    assert.ok(rowWithPicture.length >= 1, 'no thumbnail after the picture was set')
    const afterRow = await readRows(app, width)
    const rowFrame = await shot(app, `after-${width}-row-set`, MANAGER)
    rows.push({ selector: MANAGER, frame: rowFrame, props: { viewportWidth: String(width) }, box: afterRow.card, data: { shot: 'row-set', ...afterRow, thumbnail: rowWithPicture[0].box } })
    // Clear for the next width so both frames start from the empty state.
    if (width !== WIDTHS.at(-1)) {
      await app.win.locator(THUMB).first().click()
      await until(app.win, PICTURE)
      await app.win.locator(`${PICTURE} button`, { hasText: 'Use the default' }).first().click()
      await app.win.waitForFunction(() => !!document.querySelector('.workspace-picture__placeholder:not(.has-picture)'))
      await app.win.locator(`${PICTURE} .modal__head button`).click()
      await until(app.win, PICTURE, { state: 'hidden' })
    }
  }

  writeFrames(app.out, rows, {
    data: {
      widths: WIDTHS,
      tag: t.tag ?? 'after',
      source: 'worktree-local build, fake engines, temp data, no installed app',
      emptyAndSet: after,
      pageErrors: app.errors
    }
  })
  await close(app)
}
