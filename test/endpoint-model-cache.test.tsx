import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
Object.assign(window, { tucano: {} })
let models = ['provider/a']
vi.mock('../src/renderer/src/store', async (original) => ({
  ...await original<typeof import('../src/renderer/src/store')>(),
  useStore: <T,>(select: (state: State) => T): T => select({ settings: {
    endpoint: { baseUrl: 'https://example.test/v1', models },
    engines: { endpoint: { installed: true, loggedIn: true, route: 'endpoint', gateway: 'example.test', account: 'example.test · 1 model' } }
  } } as State),
  engineModels: vi.fn(async () => ({ models: [...models] }))
}))
let root: Root | undefined
async function draw(): Promise<void> {
  const { createRoot } = await import('react-dom/client')
  const { useEngineModels } = await import('../src/renderer/src/components/Harness')
  function Options() {
    return <div>{useEngineModels('endpoint').options.map((o) => o.value).join(',')}</div>
  }
  await act(async () => {
    root ??= createRoot(document.getElementById('root')!)
    root.render(<Options />)
  })
}
afterEach(async () => { await act(async () => root?.unmount()); root = undefined })
it('refreshes endpoint models when the selection changes without changing its count', async () => {
  await draw()
  expect(document.body.textContent).toContain('endpoint:provider/a')
  models = ['provider/b']
  await draw()
  expect(document.body.textContent).toContain('endpoint:provider/b')
  expect(document.body.textContent).not.toContain('endpoint:provider/a')
})
