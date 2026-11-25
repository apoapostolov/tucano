// Frames and measurements for "every session in a channel keeps its own action buttons": a channel
// with three sessions and what each row offers, read from the built app.
//
//   node scripts/screens.mjs session-buttons
//   node scripts/screens.mjs session-buttons -- finished | mixed | running
//
// `shape` is one of:
//   finished  three sessions that ended: each one's ways on (Continue, Try again, Try with
//             instructions) has to be in sight and each has to act on its own row.
//   mixed     two ended and one at work: the ended pair keeps its ways on, the row at work carries
//             the steer instead.
//   running   three at work at once: each carries its own steer, and the note under the second goes
//             into the second and into no other.
//
// A reply that takes its time is stopped by hand ("finished" and "mixed"); "Try again" on an ended
// row starts a fresh reply beside whatever runs, which is how three are put to work at once.
import { close, measure, openApp, settle, shot, until, writeFrames } from './screens/lib.mjs'

export const title = 'Every session in a channel keeps its ways on'
// The size the frames in frames/ were taken at, kept so the old and the new pictures line up.
export const size = '1280x900'

export default async function story(context) {
  const t = await openApp()
  const { win } = t
  const shape = context.args[0] ?? 'finished'

  // Every agent row, by id: the row, its footer, each way on in that footer, and the steer a row at
  // work carries. A class name is not evidence, so nothing here asks an element what it is: the
  // computed style and the box say whether a control is in sight.
  const first = async (selector, data, props) => {
    const [row] = await measure(win, selector, props, { optional: true })
    return row ? { ...row, data } : null
  }
  const rowsOfRows = async (part) => {
    const ids = await win.locator('.msg--agent').evaluateAll((els) => els.map((el) => el.getAttribute('data-id')))
    const found = []
    for (const [index, id] of ids.entries()) {
      const scope = `.msg--agent[data-id="${id}"]`
      const where = { row: index + 1, id, part }
      found.push(await first(scope, { ...where, piece: 'row' }))
      found.push(await first(`${scope} .msg__meta`, { ...where, piece: 'footer' }))
      for (const [at, way] of (await measure(win, `${scope} .msg__meta button`, ['pointer-events'])).entries()) {
        found.push({ ...way, data: { ...where, piece: 'way', way: at + 1 } })
      }
      found.push(await first(`${scope} .steps__steer-pill`, { ...where, piece: 'steer' }))
    }
    return found.filter(Boolean)
  }
  const channel = async () => ({
    ...(await measure(win, '.main'))[0],
    data: { part: 'channel' }
  })

  await until(win, '.sidebar')
  await settle(win, 800)

  const waitIdle = async () => {
    await until(win, '.composer button:has-text("Stop")', { state: 'hidden', timeout: 90_000 }).catch(() => {})
    await settle(win, 700)
  }
  const started = async (ask) => {
    await win.fill('.composer textarea', ask)
    await win.keyboard.press('Enter')
    await until(win, '.composer button:has-text("Stop")', { timeout: 30_000 })
    await settle(win, 1800)
  }
  const stopOne = async (ask) => {
    await started(ask)
    await win.locator('.composer button:has-text("Stop")').click()
    await waitIdle()
  }

  await win.locator('.sidebar').getByText('engineering', { exact: false }).first().click()
  await settle(win, 500)

  await stopOne('Summarise what the last release changed for the sidebar. Demore 8 s.')
  await stopOne('Which of those changes can break a saved layout? Demore 8 s.')
  if (shape === 'finished') {
    await stopOne('Write the short note we send to the team about it. Demore 8 s.')
  } else {
    // The third one left at work. In "running", the two ended rows are put back to work beside it.
    await started('Write the short note we send to the team about it. Demore 14 s.')
    if (shape === 'running') {
      // By id, not by position: a reply that goes back to work moves to the end of the channel, so
      // the rows a person sees shift the moment the first retry starts.
      const ids = await win.locator('.msg--agent').evaluateAll((els) => els.map((el) => el.getAttribute('data-id')))
      for (const id of ids.slice(0, 2)) {
        const row = win.locator(`.msg--agent[data-id="${id}"]`)
        await row.scrollIntoViewIfNeeded()
        await row.hover()
        await settle(win, 250)
        await row.locator('button:has-text("Try again")').first().click()
        await settle(win, 1200)
      }
      await win
        .waitForFunction(
          () => [...document.querySelectorAll('.msg--agent')].filter((m) => m.querySelector('.steps.is-working')).length >= 3,
          null,
          { timeout: 30_000 }
        )
        .catch(() => {})
    }
  }

  // The pointer parked on the channel's title: no row is hovered, so what is measured is what the
  // channel shows on its own.
  await win.locator('.topbar__title').hover()
  await settle(win, 400)

  const rows = await rowsOfRows(shape)
  const reported = await channel()
  reported.frame = await shot(t, `channel-three-sessions-${shape}`, '.main')
  const data = { shape, agentRows: rows.filter((row) => row.data.piece === 'row').length }
  const all = [reported, ...rows]

  if (shape === 'running') {
    // The note under the second row, typed and sent: it has to land in that row's own chain.
    const target = rows.find((row) => row.data.piece === 'row' && row.data.row === 2)?.data.id
    const idsBefore = await win.locator('.msg--agent').evaluateAll((els) => els.map((el) => el.getAttribute('data-id')))
    await win.locator(`.msg--agent[data-id="${target}"]`).scrollIntoViewIfNeeded()
    await win.locator(`.msg--agent[data-id="${target}"]`).hover()
    await until(win, '.steps__steer-pill')
    await win.locator(`.msg--agent[data-id="${target}"] .steps__steer-pill`).click()
    await win.locator(`.msg--agent[data-id="${target}"] .retry-note textarea`).fill('Take the second layout and say why.')
    await win.locator(`.msg--agent[data-id="${target}"] .retry-note__row button`).first().click()
    await settle(win, 2500)
    const steered = await channel()
    steered.frame = await shot(t, `channel-three-sessions-${shape}-steered`, '.main')
    const after = await rowsOfRows(`${shape}-steered`)
    const idsAfter = await win.locator('.msg--agent').evaluateAll((els) => els.map((el) => el.getAttribute('data-id')))
    Object.assign(data, {
      steered: target,
      idsBefore,
      idsAfter,
      postedAsMessage: idsAfter.length > idsBefore.length
    })
    all.push(steered, ...after)
  }

  writeFrames(t.out, all, { data })
  await close(t)
}
