// Proof that each Classifier Uses notice sits under the dropdown it explains.
// The seed gives routing Jev and browser Luna, with neither key saved, so both notices and both
// missing-key lines are on screen. Run after `npm run build`, once on the parent build and once on
// the ported build, at both widths:
//   node scripts/screens.mjs classifier-notice-order --tag before --size 1440x900 --out C:/tmp/frames/pr-670-notice-order/1440/before
//   node scripts/screens.mjs classifier-notice-order --tag after  --size 1440x900 --out C:/tmp/frames/pr-670-notice-order/1440/after
//   node scripts/screens.mjs classifier-notice-order --tag before --size 420x900  --out C:/tmp/frames/pr-670-notice-order/420/before
//   node scripts/screens.mjs classifier-notice-order --tag after  --size 420x900  --out C:/tmp/frames/pr-670-notice-order/420/after
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { close, measure, openApp, settle, shot, until, writeFrames } from './screens/lib.mjs'

export const title = 'Each classifier notice follows its own dropdown'
export const size = '1440x900'

const JEV = { id: 'jev', name: 'Jev', provider: 'typesafe', model: 'jev-latest' }
const LUNA = { id: 'luna-01', name: 'Luna', provider: 'openai', model: 'gpt-6-luna' }
const SEED = { classifiers: [JEV, LUNA], classifierJobs: { routing: JEV.id, browser: LUNA.id } }

const AFTER_ORDER = ['dropdown(routing)', 'notice(routing)', 'warning(routing)', 'dropdown(browser)', 'notice(browser)', 'warning(browser)']
const BEFORE_ORDER = ['dropdown(routing)', 'dropdown(browser)', 'notice(routing)', 'warning(routing)', 'notice(browser)', 'warning(browser)']

export default async function story(context) {
  const tag = context.tag ?? 'after'
  const locale = 'en-US'

  // The first boot makes the database; seed the two jobs there, then reopen so the card is the one
  // a classifier user sees. No key secret is written, so both warning lines are real app output.
  const first = await openApp({ locale })
  await until(first.win, '.sidebar')
  await settle(first.win, 400)
  const data = first.data
  await close(first)
  const db = new DatabaseSync(join(data, 'tucano.db'))
  const put = (key, value) => db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value').run(key, JSON.stringify(value))
  put('classifiers', SEED.classifiers)
  put('classifierJobs', SEED.classifierJobs)
  db.close()

  const t = await openApp({ data, locale })
  const { win } = t
  await until(win, '.sidebar')
  await win.evaluate(() => document.querySelector('.sidebar__gear')?.click())
  await until(win, '.settings-groups')
  await win.evaluate(() => {
    const tab = [...document.querySelectorAll('.settings-groups [role="tab"]')].find((el) => ['Modelos', 'Models'].includes(el.textContent.trim()))
    if (!tab) throw new Error('the Models tab never appeared')
    tab.click()
  })
  await until(win, '[data-settings-section="models-classifiers"]')
  await win.evaluate(() => {
    const group = [...document.querySelectorAll('.settings-group')].find((el) => el.querySelector('h3')?.textContent.trim() === 'Classifier Uses')
    if (!group) throw new Error('the Classifier Uses group never appeared')
    group.setAttribute('data-probe-group', 'classifier-uses')
  })
  await until(win, '[data-probe-group="classifier-uses"]')
  const group = win.locator('[data-probe-group="classifier-uses"]')
  await group.scrollIntoViewIfNeeded()
  await settle(win, 500)

  // Read the built page, not the stylesheet: document order and the boxes of each part.
  const probe = await win.evaluate(() => {
    const root = document.querySelector('[data-probe-group="classifier-uses"]')
    if (!root) throw new Error('no probe group')
    const all = [...document.querySelectorAll('*')]
    const indexOf = (el) => all.indexOf(el)
    const field = (label) => [...root.querySelectorAll('label.field')].find((el) => el.querySelector('.field__label')?.textContent.trim() === label)
    const dropdown = (label) => field(label)?.querySelector('[role="combobox"]') ?? undefined
    const notice = (fragment) => [...root.querySelectorAll('p.hint')].find((el) => (el.textContent ?? '').includes(fragment)) ?? undefined
    const warning = (fragment) => [...root.querySelectorAll('p.hint--warn')].find((el) => (el.textContent ?? '').includes(fragment)) ?? undefined
    const parts = {
      'dropdown(routing)': dropdown('Who replies in a channel'),
      'notice(routing)': notice('Every message without an @mention sends'),
      'warning(routing)': warning('Who replies in a channel: Jev has no key yet'),
      'dropdown(browser)': dropdown('What an agent clicks in a page'),
      'notice(browser)': notice('Every click text can’t resolve sends'),
      'warning(browser)': warning('What an agent clicks in a page: Luna has no key yet')
    }
    const geometry = {}
    const order = []
    for (const [name, el] of Object.entries(parts)) {
      if (!el) continue
      const box = el.getBoundingClientRect()
      geometry[name] = {
        index: indexOf(el),
        y: Math.round(box.y),
        bottom: Math.round(box.bottom),
        h: Math.round(box.height),
        borderTop: getComputedStyle(el).borderTopWidth
      }
      order.push([name, indexOf(el)])
    }
    return {
      width: window.innerWidth,
      order: order.sort((a, b) => a[1] - b[1]).map(([name]) => name),
      geometry,
      texts: [...root.querySelectorAll('p.hint')].map((el) => el.textContent.trim())
    }
  })

  const expectedWidth = Number(String(context.size ?? size).split('x')[0])
  assert.equal(probe.width, expectedWidth, 'the harness must capture at the requested width')
  assert.deepEqual(probe.order, tag === 'after' ? AFTER_ORDER : BEFORE_ORDER, 'the DOM order must match the build under test')
  const box = (name) => probe.geometry[name]
  for (const suffix of ['routing', 'browser']) {
    assert.ok(box(`notice(${suffix})`).y >= box(`dropdown(${suffix})`).bottom - 2, `${suffix}'s notice must sit below its dropdown`)
    assert.ok(box(`warning(${suffix})`).y >= box(`notice(${suffix})`).bottom - 2, `${suffix}'s warning must sit below its notice`)
  }
  if (tag === 'after') {
    assert.ok(box('notice(routing)').bottom <= box('dropdown(browser)').y + 2, 'the routing notice must sit above the browser dropdown')
    assert.ok(box('warning(routing)').bottom <= box('dropdown(browser)').y + 2, 'the routing warning must sit above the browser dropdown')
    for (const suffix of ['routing', 'browser']) {
      assert.ok(parseFloat(box(`notice(${suffix})`).borderTop) > 0, `${suffix}'s notice keeps the rule above the subline pair`)
      assert.equal(box(`warning(${suffix})`).borderTop, '0px', `${suffix}'s warning must not draw a hairline under its notice`)
    }
  } else {
    for (const suffix of ['routing', 'browser']) assert.equal(box(`warning(${suffix})`).borderTop, '0px', 'the parent build kept its notice and warning in one nested block')
    assert.ok(box('dropdown(browser)').bottom <= box('notice(routing)').y + 2, 'the parent build must draw both dropdowns before the notices')
  }

  const [row] = await measure(t, '[data-probe-group="classifier-uses"]')
  row.frame = await shot(t, `classifier-uses-${probe.width}-${tag}`, '[data-probe-group="classifier-uses"]')
  row.data = { tag, order: probe.order, geometry: probe.geometry, texts: probe.texts }
  writeFrames(context.out, [row], {
    data: {
      tag,
      seed: SEED,
      keySecrets: 'none written, so both jobs show their missing-key line',
      source: tag === 'after' ? 'current worktree build with the interleaved Fragment' : 'parent build 0f7dccb36 in this worktree, no in-page injection',
      expectedOrder: tag === 'after' ? AFTER_ORDER : BEFORE_ORDER
    }
  })
  await close(t)
}
