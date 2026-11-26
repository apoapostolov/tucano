// Proof story for the avatar-picture polish: a noisy bitmap that fits under the raw 4 MiB guard but
// not at 96 px, the resized picture in the manager row and the sidebar header, the initial fallback,
// and the refused-address toast as a control. Both widths run against this worktree's own build.
//   npm run build
//   node scripts/screens.mjs avatar-image-polish --out C:/tmp/frames/avatar-image-polish
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { close, measure, openApp, settle, shot, until, writeFrames } from './screens/lib.mjs'

const WIDTHS = [1440, 420]
const MANAGER = '.modal__card.workspace-manager'
const PICTURE = '.modal__card.workspace-picture'
const THUMB = '.workspace-picture__thumb'

async function viewport(t, width) {
  await t.win.setViewportSize({ width, height: 900 })
  await settle(t.win, 400)
}

async function header(t, width) {
  await viewport(t, width)
  // Below 760 the sidebar is a drawer; open it so its header is actually on screen.
  if (width <= 760 && !(await t.win.locator('.app.is-nav-open').count())) {
    await t.win.locator('.mobile-nav').click()
    await settle(t.win, 350)
  }
  const [logo] = await measure(t, '.workspace__logo')
  const detail = await t.win.evaluate(() => {
    const box = document.querySelector('.workspace__logo')
    const img = box?.querySelector('img')
    const name = box?.nextElementSibling
    const rect = img?.getBoundingClientRect()
    return {
      src: img?.getAttribute('src') ?? '',
      imageBox: rect ? { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) } : null,
      naturalWidth: img?.naturalWidth ?? 0,
      initial: img ? '' : (box?.textContent ?? '').trim(),
      beforeName: !!img && !!name && !!(box?.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING),
      nameClass: name?.className ?? '',
      name: name?.textContent ?? '',
      borderRadius: img ? getComputedStyle(img).borderRadius : '',
      toasts: [...document.querySelectorAll('.toast__text')].map((x) => x.textContent ?? '')
    }
  })
  assert.equal(logo.box.w, 26, `header box width at ${width}`)
  assert.equal(logo.box.h, 26, `header box height at ${width}`)
  if (detail.src) {
    assert.ok(detail.imageBox, `no measured header image at ${width}`)
    assert.equal(detail.imageBox.w, 26, `header image width at ${width}`)
    assert.equal(detail.imageBox.h, 26, `header image height at ${width}`)
    assert.ok(detail.naturalWidth > 0, `header image did not decode at ${width}`)
    assert.equal(detail.beforeName, true, `picture is not before the name at ${width}`)
    assert.ok(detail.nameClass.includes('workspace__name'), `no name beside the picture at ${width}`)
  }
  return { width, box: logo.box, ...detail }
}

async function noisyBitmap(t) {
  // 96 px of independent pixels: the PNG is comfortably over 32 000 characters as a data URL, while
  // the file itself stays far below the raw 4 MiB guard. Redrawing at 80 pixels averages the noise.
  const data = await t.win.evaluate(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 96
    canvas.height = 96
    const ctx = canvas.getContext('2d')
    const pixels = ctx.createImageData(96, 96)
    const noise = crypto.getRandomValues(new Uint8Array(pixels.data.length))
    for (let i = 0; i < pixels.data.length; i += 4) {
      pixels.data[i] = noise[i]
      pixels.data[i + 1] = noise[i + 1]
      pixels.data[i + 2] = noise[i + 2]
      pixels.data[i + 3] = 255
    }
    ctx.putImageData(pixels, 0, 0)
    return canvas.toDataURL('image/png')
  })
  const path = join(t.data, 'noisy.png')
  writeFileSync(path, Buffer.from(data.split(',')[1], 'base64'))
  return path
}

async function openManager(t) {
  if (await t.win.locator(MANAGER).isVisible()) return
  await t.win.locator('.workspace-picker__button').first().click()
  await until(t.win, '.menu__item')
  await t.win.locator('.menu__item', { hasText: 'Manage workspaces' }).first().click()
  await until(t.win, MANAGER)
  await settle(t.win, 300)
}

async function clearToasts(t) {
  const closes = t.win.locator('.toast__close')
  for (let n = await closes.count(); n > 0; n -= 1) {
    await closes.first().click()
    await settle(t.win, 200)
  }
}

async function closeManager(t) {
  await t.win.locator(`${MANAGER} .modal__head .modal__actions button`).last().click()
  await until(t.win, MANAGER, { state: 'hidden' })
}

async function openPicture(t) {
  await t.win.locator(THUMB).first().click()
  await until(t.win, PICTURE)
  await settle(t.win, 250)
}

async function closePicture(t) {
  await t.win.locator(`${PICTURE} .modal__head button`).first().click()
  await until(t.win, PICTURE, { state: 'hidden' })
}

async function resized(t, width, path) {
  await viewport(t, width)
  await openManager(t)
  await openPicture(t)
  await t.win.setInputFiles(`${PICTURE} input[type=file]`, path)
  await t.win.waitForSelector(`${PICTURE} .workspace-picture__placeholder.has-picture img`, { timeout: 15_000 })
  await settle(t.win, 400)
  const detail = await t.win.evaluate(async () => {
    const img = document.querySelector('.workspace-picture__placeholder img')
    const list = await window.tucano.workspaces.list()
    const saved = list.workspaces.find((w) => w.id === list.selected)?.picture ?? ''
    return {
      drawn: `${img?.naturalWidth ?? 0}x${img?.naturalHeight ?? 0}`,
      savedChars: saved.length,
      savedPng: saved.startsWith('data:image/png;base64,'),
      toasts: [...document.querySelectorAll('.toast__text')].map((x) => x.textContent ?? '')
    }
  })
  assert.ok(detail.savedPng, `stored value is not a PNG at ${width}`)
  assert.ok(detail.savedChars <= 32_000, `stored data URL is ${detail.savedChars} chars at ${width}`)
  assert.ok(Number(detail.drawn.split('x')[0]) < 96, `bitmap was not redrawn smaller at ${width}: ${detail.drawn}`)
  assert.deepEqual(detail.toasts, [], `toast after a successful resize at ${width}`)
  const frame = await shot(t, `${width}-resized`)
  return { width, frame, ...detail }
}

export default async function story(t) {
  const app = await openApp({ locale: 'en-US', seed: 1 })
  await until(app.win, '.sidebar')
  assert.equal(await app.win.locator('.sidebar').isVisible(), true, 'the test app opened without a visible window')
  const title = await app.win.title()
  assert.ok(title, 'the test app window has no title')
  const rows = []
  const data = { title, visible: true, widths: WIDTHS, dataDir: app.data, userDataDir: join(app.data, 'electron'), source: 'worktree-local build, fake engines, temp data and profile', pageErrors: app.errors }

  for (const width of WIDTHS) {
    await viewport(app, width)
    const initial = await header(app, width)
    assert.ok(initial.initial, `no initial in the header at ${width}`)
    assert.equal(initial.src, '', `picture appeared before one was set at ${width}`)
    const frame = await shot(app, `${width}-initial`)
    rows.push({ selector: '.workspace__logo', frame, props: { viewportWidth: String(width) }, box: initial.box, data: { shot: 'initial', ...initial } })
  }

  await viewport(app, 1440)
  const path = await noisyBitmap(app)
  const first = await resized(app, 1440, path)
  rows.push({ selector: PICTURE, frame: first.frame, props: { viewportWidth: '1440' }, box: null, data: { shot: 'resized', ...first } })
  await closePicture(app)
  await closeManager(app)

  for (const width of WIDTHS) {
    if (width !== 1440) await clearToasts(app) // the wide control toast belongs to its own frame
    const where = await header(app, width)
    assert.equal(where.src.startsWith('data:image/png;base64,'), true, `no saved header picture at ${width}`)
    const frame = await shot(app, `${width}-header`)
    rows.push({ selector: '.workspace__logo', frame, props: { viewportWidth: String(width) }, box: where.box, data: { shot: 'header', ...where } })

    // The sidebar button sits off-screen at 420 px, so open the manager while wide, then narrow.
    await viewport(app, 1440)
    await openManager(app)
    await viewport(app, width)
    const [row] = await measure(app, THUMB)
    const [rowImage] = await measure(app, `${THUMB} img`)
    assert.ok(rowImage, `manager row has no thumbnail at ${width}`)
    assert.equal(rowImage.box.w > 0 && rowImage.box.h > 0, true, `manager thumbnail is empty at ${width}`)
    const managerFrame = await shot(app, `${width}-manager`)
    rows.push({ selector: THUMB, frame: managerFrame, props: { viewportWidth: String(width) }, box: row.box, data: { shot: 'manager', width, row: row.box, image: rowImage.box } })
    if (width !== 1440) {
      // The same resized picture, at the narrow width, with the earlier control toast cleared.
      await clearToasts(app)
      await openPicture(app)
      const narrow = await app.win.evaluate(async () => {
        const img = document.querySelector('.workspace-picture__placeholder img')
        const list = await window.tucano.workspaces.list()
        const saved = list.workspaces.find((w) => w.id === list.selected)?.picture ?? ''
        return { drawn: `${img?.naturalWidth ?? 0}x${img?.naturalHeight ?? 0}`, savedChars: saved.length, toasts: [...document.querySelectorAll('.toast__text')].map((x) => x.textContent ?? '') }
      })
      assert.ok(narrow.savedChars <= 32_000, `stored data URL too long at ${width}`)
      assert.deepEqual(narrow.toasts, [], `toast after a successful resize at ${width}`)
      const narrowFrame = await shot(app, `${width}-resized`)
      rows.push({ selector: PICTURE, frame: narrowFrame, props: { viewportWidth: String(width) }, box: null, data: { shot: 'resized', width, ...narrow } })
    }
    // The rejected address is reached from the same manager row, and its toast is the control.
    if (!(await app.win.locator(PICTURE).isVisible())) await openPicture(app)
    await tFillBadAddress(app)
    const bad = await toastFrame(app, width)
    rows.push({ selector: '.toast__text', frame: bad.frame, props: { viewportWidth: String(width) }, box: null, data: { shot: 'rejected-address', ...bad } })
    await closePicture(app)
    await closeManager(app)
  }

  writeFrames(app.out, rows, { data })
  await close(app)
}

async function tFillBadAddress(app) {
  await app.win.locator(`${PICTURE} input[type=url]`).fill('http://example.com/logo.png')
  await app.win.locator(`${PICTURE} button`, { hasText: 'Add' }).first().click()
  await app.win.locator('.toast__text', { hasText: 'https' }).last().waitFor({ timeout: 10_000 })
  await settle(app.win, 300)
}

async function toastFrame(app, width) {
  const text = await app.win.locator('.toast__text').last().innerText()
  assert.match(text, /https/)
  const frame = await shot(app, `${width}-rejected-address`)
  return { width, frame, toast: text }
}
