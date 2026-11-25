// Proof that the Router card is gone from Settings › Models while routing itself is untouched.
// The data seeds a routing classifier, so the old card had a static key row and no control at all.
// Run after `npm run build`:
//   node scripts/screens.mjs router-section --tag before --size 1440x900 --out C:/tmp/frames/router-section-removed/1440/before
//   node scripts/screens.mjs router-section --tag after  --size 1440x900 --out C:/tmp/frames/router-section-removed/1440/after
//   node scripts/screens.mjs router-section --tag before --size 420x900  --out C:/tmp/frames/router-section-removed/420/before
//   node scripts/screens.mjs router-section --tag after  --size 420x900  --out C:/tmp/frames/router-section-removed/420/after
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { close, measure, openApp, settle, shot, until, writeFrames } from './screens/lib.mjs'

export const title = 'The choiceless Router section is gone from Settings'
export const size = '1440x900'

const JEV = [{ id: 'jev', name: 'Jev', provider: 'typesafe', model: 'jev-latest' }]

export default async function story(context) {
  const tag = context.tag ?? 'after'
  const locale = 'pt-BR'

  // The first boot makes the database and the seeded team. A routing classifier is seeded after
  // that, then the same database is reopened, so the card under test is the one a classifier user
  // actually saw: a static key row with no model picker.
  const first = await openApp({ locale })
  await until(first.win, '.sidebar')
  await settle(first.win, 400)
  const data = first.data
  await close(first)
  const db = new DatabaseSync(join(data, 'tucano.db'))
  const put = (key, value) => db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value').run(key, JSON.stringify(value))
  put('classifiers', JEV)
  put('classifierJobs', { routing: 'jev' })
  put('routerModel', 'jev')
  db.close()

  const app = await openApp({ data, locale })
  const { win } = app
  await until(win, '.sidebar')
  // The gear works at both widths; a locator click would fight the narrow sidebar's layout.
  await win.evaluate(() => document.querySelector('.sidebar__gear')?.click())
  await until(win, '.settings-groups')
  await win.evaluate(() => {
    const tab = [...document.querySelectorAll('.settings-groups [role="tab"]')].find((el) => ['Modelos', 'Models'].includes(el.textContent.trim()))
    if (!tab) throw new Error('the Models tab never appeared')
    tab.click()
  })
  await until(win, '[data-settings-section="models-classifiers"]')
  await settle(win, 500)

  // What the built page actually holds, read in the browser: the subject anchors, the card's
  // `section`, the jump row's labels and the viewport. A class name alone is not evidence.
  const probe = await win.evaluate(() => {
    const links = [...document.querySelectorAll('.settings-jumps a')]
    const navLabels = links.map((link) => link.textContent.trim())
    return {
      url: location.href,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      activeGroup: document.querySelector('.settings-groups [role="tab"][aria-selected="true"]')?.textContent.trim() ?? null,
      idHits: [...document.querySelectorAll('[id]')].filter((el) => el.id === 'models-router' || el.id === 'settings-models-router').map((el) => el.id),
      sectionHits: [...document.querySelectorAll('[data-settings-section], [section]')]
        .filter((el) => el.getAttribute('data-settings-section') === 'models-router' || el.getAttribute('section') === 'models-router')
        .map((el) => `${el.tagName.toLowerCase()}[${el.getAttribute('data-settings-section') ?? el.getAttribute('section')}]`),
      navLabels,
      navRouterLabels: navLabels.filter((label) => /^(Roteador|Router)$/i.test(label)),
      navRouterHrefs: links.map((link) => link.getAttribute('href') ?? '').filter((href) => href.includes('models-router')),
      subjectHeadings: [...document.querySelectorAll('.settings-subject h2')].map((el) => el.textContent.trim())
    }
  })

  // Park the page where the Router used to sit: before, on the Router subject; after, on Memory,
  // which now follows Classifiers directly. The frame then shows the absence in place.
  await win.evaluate((which) => {
    const scroller = document.querySelector('.page__scroll')
    const selector = which === 'before' ? '[data-settings-section="models-router"]' : '[data-settings-section="knowledge-memory"]'
    const target = document.querySelector(selector)
    if (!scroller || !target) throw new Error(`no scroll target for ${which}`)
    scroller.scrollTop += target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 120
  }, tag)
  await settle(win, 300)

  const expectedWidth = Number(String(context.size ?? size).split('x')[0])
  assert.equal(probe.viewport.width, expectedWidth, 'the harness must capture at the requested width')
  assert.equal(probe.activeGroup, 'Modelos', 'the Models group must be open')
  if (tag === 'before') {
    assert.ok(probe.sectionHits.length > 0, 'the parent build must still draw the Router subject')
    assert.equal(probe.navRouterLabels.length, 1, 'the parent build must still link to Router')
  } else {
    assert.deepEqual(probe.idHits, [], 'no element may keep the models-router id')
    assert.deepEqual(probe.sectionHits, [], 'no element may keep the models-router section')
    assert.deepEqual(probe.navRouterLabels, [], 'the Models jump row has no Router entry')
    assert.deepEqual(probe.navRouterHrefs, [], 'the Models jump row has no models-router link')
  }

  const rows = []
  const page = (await measure(app, '.page__scroll'))[0]
  page.frame = await shot(app, `01-models-${tag}`, '.page__scroll')
  page.data = { tag, piece: 'Models page', probe }
  rows.push(page)

  if (tag === 'before') {
    const selector = '[data-settings-section="models-router"]'
    const card = (await measure(app, selector))[0]
    card.frame = await shot(app, '02-router-card-before', selector)
    card.data = { tag, piece: 'Router subject', note: 'A classifier is set, so the card shows only its static key row.' }
    rows.push(card)
  } else {
    const nav = (await measure(app, '.settings-jumps', ['pointer-events']))[0]
    nav.frame = await shot(app, '02-nav-after', '.settings-jumps')
    nav.data = { tag, piece: 'Models jump row', navLabels: probe.navLabels, navRouterLabels: probe.navRouterLabels }
    rows.push(nav)
  }

  writeFrames(context.out, rows, {
    data: {
      tag,
      seed: { classifiers: JEV, classifierJobs: { routing: 'jev' }, routerModel: 'jev' },
      beforeSource: tag === 'before'
        ? 'parent commit c086eed2 built in this worktree; no in-page injection'
        : 'current worktree build with the Router section removed',
      viewport: probe.viewport
    }
  })
  await close(app)
}
