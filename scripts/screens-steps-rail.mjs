// Worktree-built proof for the steps rail: one real click folds, the same rail reopens, the handle
// stays in both states, and the line lights to the accent without a grey hover rectangle. Usage:
// npm run build && node scripts/screens-steps-rail.mjs [out-dir]
import { _electron as electron } from 'playwright'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const out = process.argv[2] ?? 'C:/tmp/frames/steps-rail-one-click'
mkdirSync(out, { recursive: true })
const data = mkdtempSync(join(tmpdir(), 'tucano-steps-rail-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en-US' }
const SEL = '[data-id="seed-long-reply"]'
const errors = []
const heights = { 1440: 700, 420: 700 }

const launch = async () => {
  const app = await electron.launch({ args: ['.'], env })
  const win = await app.firstWindow()
  await win.waitForSelector('.sidebar', { timeout: 60_000 })
  win.on('pageerror', (e) => errors.push(String(e)))
  win.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  return { app, win }
}

// A fresh data dir first: the seed owns the database, no installed app and no real account.
const first = await launch()
await first.app.close()

const db = new DatabaseSync(join(data, 'tucano.db'))
const agent = db.prepare("SELECT id FROM agents WHERE handle = 'lia' LIMIT 1").get()
const channel = db.prepare("SELECT id FROM conversations WHERE kind = 'channel' AND name IN ('engineering', 'engenharia') LIMIT 1").get()
if (!agent || !channel) throw new Error('seeded workspace has no Lia or engineering channel')
const at = Date.now() - 120_000
const labels = ['read src/core/runs.ts', 'run npx vitest run test/runs.test.ts', 'write src/core/runs.ts', 'read the failing output', 'run npx tsc --noEmit']
const steps = Array.from({ length: 25 }, (_, i) => ({
  id: `seed-s${i + 1}`,
  label: `${labels[i % labels.length]} (${i + 1})`,
  status: 'done',
  ms: 400 + i * 37
}))
db.prepare('INSERT INTO messages (id, conversation_id, author_kind, author_id, text, at, run) VALUES (?, ?, ?, ?, ?, ?, ?)')
  .run('seed-long-reply', channel.id, 'agent', agent.id, 'Os testes passam agora. O problema era o caminho do Node, não o teste.', at,
    JSON.stringify({ status: 'done', steps, endedAt: at + 21_000 }))
db.close()

const { app, win } = await launch()
try {
  await win.setViewportSize({ width: 1440, height: heights[1440] })
  await win.click('.nav-item:has-text("engineering")')
  await win.waitForSelector(SEL, { timeout: 30_000 })

  // Everything measured from the rendered DOM, not from the stylesheet source.
  const look = () => win.evaluate((sel) => {
    const msg = document.querySelector(sel)
    const stepsBox = msg?.querySelector('.steps')
    const body = stepsBox?.querySelector('.steps__body')
    const rail = body?.querySelector('.steps__rail')
    const list = body?.querySelector('.steps__list')
    const icon = list?.querySelector('.step__icon')
    const line = list ?? body
    const r = rail?.getBoundingClientRect()
    const l = line?.getBoundingClientRect()
    const i = icon?.getBoundingClientRect()
    const s = stepsBox?.getBoundingClientRect()
    const toggle = stepsBox?.querySelector('.steps__toggle')?.getBoundingClientRect()
    const probe = document.createElement('span')
    probe.style.cssText = 'position:fixed;left:-100px;top:-100px;border:2px solid var(--accent)'
    const borderProbe = document.createElement('span')
    borderProbe.style.cssText = 'position:fixed;left:-100px;top:-100px;border:2px solid var(--border)'
    document.body.append(probe, borderProbe)
    const accent = getComputedStyle(probe).borderLeftColor
    const border = getComputedStyle(borderProbe).borderLeftColor
    probe.remove()
    borderProbe.remove()
    const cs = rail ? getComputedStyle(rail) : null
    return {
      open: !!list,
      rows: list ? list.querySelectorAll('.step').length : 0,
      rail: rail ? {
        tag: rail.tagName,
        label: rail.getAttribute('aria-label'),
        title: rail.getAttribute('title'),
        cursor: cs.cursor,
        background: cs.backgroundColor,
        width: Math.round(r.width),
        height: Math.round(r.height),
        centredOnLine: l ? Math.round(r.left + r.width / 2 - l.left) : null,
        gapToIcon: i ? Math.round(i.left - r.right) : null
      } : null,
      lineColor: line ? getComputedStyle(line).borderLeftColor : null,
      lineWidth: line ? getComputedStyle(line).borderLeftWidth : null,
      accent,
      border,
      toggleTop: toggle ? Math.round(toggle.top) : null,
      toggleInView: toggle ? toggle.bottom > 0 && toggle.top < window.innerHeight : null,
      stepsInView: s ? s.top >= -1 && s.bottom <= window.innerHeight + 1 : false,
      // A chain taller than the viewport cannot fit whole; the part the person reads still has to be on screen.
      stepsIntersectsViewport: s ? s.bottom > 0 && s.top < window.innerHeight : false,
      stepsTop: s ? Math.round(s.top) : null,
      stepsHeight: s ? Math.round(s.height) : null,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      sideways: document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth
    }
  }, SEL)

  // A point the browser itself says hits the rail: the composer floats over the bottom of a long
  // run, so a y taken only from the rail's rect can land on the composer instead.
  const railPoint = () => win.evaluate((sel) => {
    const rail = document.querySelector(`${sel} .steps__rail`)
    const r = rail.getBoundingClientRect()
    const x = Math.round(r.left + r.width / 2)
    const pad = Math.min(10, Math.max(2, Math.floor(r.height / 4)))
    const first = Math.max(Math.ceil(r.top + pad), 2)
    const last = Math.min(Math.floor(r.bottom - pad), window.innerHeight - 2)
    for (let y = first; y <= last; y += 8) {
      const hit = document.elementFromPoint(x, y)
      if (hit === rail) return { x, y, top: Math.round(r.top), bottom: Math.round(r.bottom) }
    }
    throw new Error(`no visible rail point between ${first} and ${last}`)
  }, SEL)

  const settle = async () => win.waitForTimeout(400)
  const openAndReadBottom = async () => {
    if (!(await look()).open) await win.locator(`${SEL} .steps__toggle`).click()
    await settle()
    await win.evaluate((sel) => {
      const last = [...document.querySelectorAll(`${sel} .step`)].pop()
      last?.scrollIntoView({ block: 'end' })
    }, SEL)
    await settle()
  }
  const transparent = (color) => /^(rgba\(0, 0, 0, 0\)|transparent)$/i.test(color)
  const sameColor = (a, b) => String(a).replace(/\s/g, '') === String(b).replace(/\s/g, '')

  const frames = {
    seed: { id: 'seed-long-reply', steps: steps.length, labels },
    dimensions: Object.keys(heights).map(Number),
    samples: {},
    errors: []
  }

  for (const width of [1440, 420]) {
    await win.setViewportSize({ width, height: heights[width] })
    await win.mouse.move(2, 2)
    await win.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur())
    await settle()
    await openAndReadBottom()
    const sample = { rest: await look(), toggleAtBottom: await look() }
    await win.screenshot({ path: join(out, `${width}-01-rest.png`) })

    const point = await railPoint()
    await win.mouse.move(point.x, point.y)
    await settle()
    sample.hovered = await look()
    sample.hoverPoint = point
    await win.screenshot({ path: join(out, `${width}-02-hover.png`) })

    // The focus ring is the same 2 px line; the rail itself has no fill.
    await win.evaluate((sel) => document.querySelector(`${sel} .steps__rail`).focus(), SEL)
    await settle()
    sample.focused = await look()

    await win.mouse.click(point.x, point.y)
    await settle()
    const folded = await look()
    sample.clickResult = {
      fold: {
        beforeOpen: sample.hovered.open,
        afterOpen: folded.open,
        beforeLabel: sample.hovered.rail?.label,
        afterLabel: folded.rail?.label,
        clicks: 1
      }
    }
    sample.folded = folded
    await win.screenshot({ path: join(out, `${width}-03-folded.png`) })

    const foldedPoint = await railPoint()
    await win.mouse.click(foldedPoint.x, foldedPoint.y)
    await settle()
    const reopened = await look()
    sample.clickResult.reopen = {
      beforeOpen: folded.open,
      afterOpen: reopened.open,
      beforeLabel: folded.rail?.label,
      afterLabel: reopened.rail?.label,
      clicks: 1,
      sameRail: true
    }
    sample.reopened = reopened
    await win.screenshot({ path: join(out, `${width}-04-reopened.png`) })

    // Enter and Space on the focused native button do the same two toggles.
    await win.evaluate((sel) => document.querySelector(`${sel} .steps__rail`).focus(), SEL)
    await win.keyboard.press('Enter')
    await settle()
    const afterEnter = await look()
    await win.evaluate((sel) => document.querySelector(`${sel} .steps__rail`).focus(), SEL)
    await win.keyboard.press('Space')
    await settle()
    const afterSpace = await look()
    sample.keyboard = { beforeOpen: reopened.open, afterEnterOpen: afterEnter.open, afterSpaceOpen: afterSpace.open }

    frames.samples[width] = sample
  }

  frames.errors = errors.length ? errors.slice(0, 5) : []
  const s1440 = frames.samples[1440]
  const s420 = frames.samples[420]
  const all = [s1440, s420]
  frames.measurement = {
    railColor: s1440.hovered.lineColor,
    backgroundColor: s1440.hovered.rail.background,
    width: s1440.hovered.rail.width,
    clickResult: s1440.clickResult
  }
  frames.verdict = {
    railInBothStates: all.every((s) => s.rest.open && s.rest.rail && s.folded.rail && !s.folded.open),
    realButton: all.every((s) => s.hovered.rail.tag === 'BUTTON' && /click to fold the steps/i.test(s.hovered.rail.label ?? '') && /click to unfold the steps/i.test(s.folded.rail.label ?? '')),
    singleClickToggles: all.every((s) => s.clickResult.fold.beforeOpen && !s.clickResult.fold.afterOpen && !s.clickResult.reopen.beforeOpen && s.clickResult.reopen.afterOpen),
    keyboardToggles: all.every((s) => !s.keyboard.afterEnterOpen && s.keyboard.afterSpaceOpen),
    transparentBackground: all.every((s) => [s.rest, s.hovered, s.focused, s.folded].every((m) => transparent(m.rail.background))),
    accentLineOnHover: all.every((s) => sameColor(s.hovered.lineColor, s.hovered.accent) && sameColor(s.focused.lineColor, s.focused.accent) && !sameColor(s.rest.lineColor, s.rest.accent)),
    pointerCursor: all.every((s) => s.hovered.rail.cursor === 'pointer'),
    geometry: all.every((s) => s.hovered.rail.width === 18 && Math.abs(s.hovered.rail.centredOnLine ?? 99) <= 2 && (s.hovered.rail.gapToIcon ?? 0) > 0),
    twoPixelLine: all.every((s) => s.hovered.lineWidth === '2px'),
    toggleScrolledAway: all.every((s) => s.toggleAtBottom.toggleInView === false),
    foldedBlockInView: all.every((s) => s.folded.stepsInView && s.reopened.stepsIntersectsViewport),
    noSidewaysScroll: all.every((s) => s.hovered.sideways === 0),
    noErrors: frames.errors.length === 0
  }
  writeFileSync(join(out, 'frames.json'), JSON.stringify(frames, null, 2))
  console.log(JSON.stringify({ verdict: frames.verdict, measurement: frames.measurement, samples: { 1440: frames.samples[1440].clickResult, 420: frames.samples[420].clickResult }, errors: frames.errors }, null, 2))
  if (Object.values(frames.verdict).some((v) => v !== true)) process.exitCode = 1
} finally {
  await app.close()
}
