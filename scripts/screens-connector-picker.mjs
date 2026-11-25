// Proof for the connector image picker: the row and every visible control stay inside the modal at
// 1440 and 420 px, before and after a picture is set. Run after `npm run build`:
//   node scripts/screens.mjs connector-picker --size 1440x900 --out C:/tmp/frames/connector-icon/1440
//   node scripts/screens.mjs connector-picker --size 420x900 --out C:/tmp/frames/connector-icon/420
import { DatabaseSync } from 'node:sqlite'
import { close, measure, openApp, settle, shot, until, writeFrames } from './screens/lib.mjs'

export const title = 'The connector image picker stays inside its modal'
export const size = '1440x900'

const ICON = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="20" fill="#e11d48"/></svg>').toString('base64')

export default async function story(context) {
  const out = context.out ?? 'C:/tmp/frames/connector-icon/1440'
  const first = await openApp()
  await until(first.win, '.sidebar')
  await settle(first.win, 400)
  const data = first.data
  await close(first)

  const db = new DatabaseSync(`${data}/tucano.db`)
  db.prepare(`INSERT OR REPLACE INTO connectors (id, name, kind, url, command, args, env_keys, auth, created_at)
    VALUES ('qa', 'QA Connector', 'stdio', NULL, 'node', '[]', '[]', 'none', ?)`).run(Date.now())
  db.close()

  const openModal = async () => {
    const app = await openApp({ data })
    await until(app.win, '.sidebar')
    await app.win.evaluate(() => document.querySelector('.sidebar__tool--connectors')?.click())
    await until(app.win, '.catalog__card.is-mine')
    await app.win.evaluate(() => document.querySelector('.catalog__card.is-mine')?.click())
    await until(app.win, '.connector-modal__icon')
    await settle(app.win, 350)
    return app
  }

  const allRows = []
  const capture = async (tag, chosen) => {
    const app = await openModal()
    const bounds = await app.win.evaluate(() => {
      const el = document.querySelector('.connector-modal__icon')
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        left: r.left,
        right: r.right,
        visible: [...el.children].filter((c) => getComputedStyle(c).display !== 'none').length
      }
    })
    if (!bounds) throw new Error('the connector modal never showed its picker row')
    const overflow = bounds.scrollWidth - bounds.clientWidth
    if (overflow > 1) throw new Error(`picker row overflows by ${overflow} px`)

    const frame = await shot(app, `${tag}-picker`)
    const rows = [
      {
        ...(await measure(app, '.connector-modal__icon', ['flex-wrap', 'gap', 'align-items']))[0],
        frame,
        data: { ...bounds, overflow, chosen }
      }
    ]
    for (const child of (await measure(app, '.connector-modal__icon button')).entries()) {
      const [index, row] = child
      if (row.props.display === 'none') continue
      rows.push({ ...row, data: { chosen, piece: 'button', index } })
      if (row.box.x < bounds.left - 1 || row.box.x + row.box.w > bounds.right + 1) {
        throw new Error(`${tag}: button ${index + 1} is outside the picker row`)
      }
    }
    for (const [index, row] of (await measure(app, '.connector-modal__icon .grow')).entries()) {
      rows.push({ ...row, data: { chosen, piece: 'note', index } })
      if (row.box.x < bounds.left - 1 || row.box.x + row.box.w > bounds.right + 1) {
        throw new Error(`${tag}: note ${index + 1} is outside the picker row`)
      }
    }
    allRows.push(...rows)
    await close(app)
  }

  await capture('before', false)
  const again = new DatabaseSync(`${data}/tucano.db`)
  again.prepare('UPDATE connectors SET icon = ? WHERE id = ?').run(ICON, 'qa')
  again.close()
  await capture('after', true)
  writeFrames(out, allRows)
}
