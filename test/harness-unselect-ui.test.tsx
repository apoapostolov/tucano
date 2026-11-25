// A saved harness that was later uninstalled stays in settings with its checkbox disabled, so
// nobody can turn it off. The screen itself must clear that pick and keep the ones that can run.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { EngineId, EngineStatus, Settings } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true, matchMedia: () => ({ matches: true }) })
Object.assign(window, { tucano: {} })
Object.assign(globalThis, { ResizeObserver: class { observe(): void {} unobserve(): void {} disconnect(): void {} } })
Object.assign(globalThis, { requestAnimationFrame: (cb: () => void) => setTimeout(cb, 0) as unknown as number, cancelAnimationFrame: (id: number) => clearTimeout(id) })
Object.assign(document, { oninput: null })

let fake: State
const save = vi.fn((patch: Partial<Settings>) => {
  fake = { ...fake, settings: { ...fake.settings, ...patch } }
})
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: State) => T): T => select(fake),
    getState: () => fake,
    updateSettings: (patch: Partial<Settings>) => save(patch),
    engineModels: vi.fn(async () => ({ models: [] })),
    testEngine: vi.fn(async () => ({ ok: true, message: 'ok' })),
    rememberModels: vi.fn(),
    navigate: vi.fn(),
    setTab: vi.fn(),
    openExternal: vi.fn(),
    installEngine: vi.fn(async () => ({ opened: false })),
    loginEngine: vi.fn(async () => ({ opened: true, command: '' })),
    probeEndpoint: vi.fn(async () => ({ models: [] })),
    setEndpoint: vi.fn(async () => {}),
    harnessMcps: vi.fn(async () => []),
    importHarnessMcp: vi.fn(async () => ''),
    addAccount: vi.fn(async () => ({})),
    loginAccount: vi.fn(async () => ({}))
  }
})

const { createRoot } = await import('react-dom/client')
const { HarnessList } = await import('../src/renderer/src/components/Harness')
const base = (await vi.importActual<typeof import('../src/renderer/src/store')>('../src/renderer/src/store')).getState()

const ready: EngineStatus = { installed: true, loggedIn: true, route: 'providers' }
const notInstalled = (more: Partial<EngineStatus> = {}): EngineStatus => ({ installed: false, loggedIn: false, ...more })
const engines = (more: Partial<Record<EngineId, EngineStatus>> = {}): Settings['engines'] => ({
  claude: ready,
  codex: ready,
  opencode: ready,
  pi: notInstalled(),
  antigravity: notInstalled(),
  cursor: notInstalled(),
  grok: notInstalled(),
  cline: notInstalled(),
  hermes: notInstalled(),
  endpoint: notInstalled(),
  ...more
})
const state = (harnesses: EngineId[] | undefined, status: Settings['engines']): State =>
  ({ ...base, ready: true, platform: 'windows', settings: { ...base.settings, harnesses, engines: status } }) as State

let root: ReturnType<typeof createRoot>
const render = async (): Promise<void> => {
  await act(async () => root.render(<HarnessList />))
  await act(async () => new Promise((resolve) => setTimeout(resolve, 0)))
}
const row = (label: string): Element => {
  const found = [...document.querySelectorAll('.harness')].find((el) => el.querySelector('.harness__name strong')?.textContent === label)
  if (!found) throw new Error(`no harness row ${label}: ${[...document.querySelectorAll('.harness__name strong')].map((el) => el.textContent).join(' | ')}`)
  return found
}
const isPicked = (label: string): boolean => row(label).classList.contains('is-picked') && !!row(label).querySelector('.harness__check.is-on')

beforeEach(() => {
  root = createRoot(document.getElementById('root')!)
  save.mockClear()
})
afterEach(async () => {
  await act(async () => root.unmount())
})

describe('the harness list', () => {
  it('clears a saved pick the check says is not installed, and the row stops looking picked', async () => {
    fake = state(['claude', 'pi'], engines({ pi: notInstalled() }))
    await render()
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith({ harnesses: ['claude'] })
    await render()
    expect(isPicked('Pi')).toBe(false)
    expect(isPicked('Claude Code')).toBe(true)
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('keeps an installed saved pick selected', async () => {
    fake = state(['claude', 'pi'], engines({ pi: ready }))
    await render()
    expect(save).not.toHaveBeenCalled()
    expect(isPicked('Claude Code')).toBe(true)
    expect(isPicked('Pi')).toBe(true)
  })

  it('keeps a saved pick while that harness is still being checked', async () => {
    fake = state(['claude', 'pi'], engines({ pi: notInstalled({ checking: true }) }))
    await render()
    expect(save).not.toHaveBeenCalled()
    expect(isPicked('Pi')).toBe(true)
  })

  it('uses the same rule for the endpoint row: a configured endpoint stays, a missing one clears', async () => {
    fake = state(['claude', 'endpoint'], engines({ endpoint: { installed: true, loggedIn: true, route: 'endpoint' } }))
    await render()
    expect(save).not.toHaveBeenCalled()
    expect(isPicked('Endpoint próprio')).toBe(true)

    fake = state(['claude', 'endpoint'], engines({ endpoint: notInstalled() }))
    await render()
    expect(save).toHaveBeenCalledWith({ harnesses: ['claude'] })
    await render()
    expect(isPicked('Endpoint próprio')).toBe(false)
  })
})
