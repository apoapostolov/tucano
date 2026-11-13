// Wiki settings, the resolver section: a bot can be named to read a finding instead of the app's own
// resolver, and the fields that belong to the app's resolver leave the card while a bot has the job.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Agent } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Element: window.Element, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
// The Select measures its trigger and follows resize: linkedom lays nothing out.
Object.assign(window, { innerWidth: 1280, innerHeight: 800 })
// The card offers the folder picker the preload injects: nothing to pick here, and nothing to watch.
Object.assign(window, { tucano: {} })
window.HTMLElement.prototype.getBoundingClientRect = () => ({ top: 100, bottom: 136, left: 100, right: 300, width: 200, height: 36, x: 100, y: 100, toJSON: () => ({}) })
Object.assign(globalThis, {
  requestAnimationFrame: (f: () => void) => setTimeout(f, 0) as unknown as number,
  cancelAnimationFrame: (id: number) => clearTimeout(id),
  ResizeObserver: class {
    observe(): void {}
    disconnect(): void {}
  }
})

const asked: { method: string; params: unknown }[] = []
vi.mock('../src/renderer/src/rpc', () => ({
  call: (method: string, params?: unknown) => {
    asked.push({ method, params })
    return Promise.resolve(undefined)
  }
}))

let fake: State
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return { ...real, useStore: <T,>(select: (s: State) => T): T => select(fake) }
})
const { getState } = await import('../src/renderer/src/store')
const { createRoot } = await import('react-dom/client')
const { WikiSettingsDialog } = await import('../src/renderer/src/components/Wiki')

const lia = { id: 'a1', name: 'Lia', handle: 'lia', role: 'Wiki', instructions: 'Prefira a fonte mais nova.', effort: 'medium', modelId: 'x', archived: false, kind: 'agent' } as unknown as Agent

let root: Root
const open = async (): Promise<void> => {
  await act(async () => {
    root = createRoot(document.getElementById('root')!)
    root.render(<WikiSettingsDialog data={null} onClose={() => {}} onImport={() => {}} />)
  })
}
const html = (): string => document.getElementById('root')!.innerHTML
const clickText = async (label: string): Promise<void> => {
  const el = [...document.querySelectorAll('button')].find((b) => (b.textContent ?? '').trim().includes(label))
  if (!el) throw new Error(`no button ${label}: ${[...document.querySelectorAll('button')].map((b) => (b.textContent ?? '').trim()).join(' | ')}`)
  await act(async () => el.dispatchEvent(new window.Event('click', { bubbles: true })))
}

beforeEach(() => {
  const base = getState()
  fake = { ...base, ready: true, agents: [lia], settings: { ...base.settings, wikiResolve: true, wikiResolveModel: '', wikiResolveBot: '' } }
  asked.length = 0
})

afterEach(async () => {
  await act(async () => root.unmount())
  document.getElementById('root')!.innerHTML = ''
})

describe('the resolver section of Wiki settings', () => {
  it("offers the app's resolver and the team's bots, with the model field under it", async () => {
    await open()
    expect(html()).toContain('Quem resolve')
    expect(html()).toContain('O resolvedor do app')
    expect(html()).toContain('O modelo dele')
  })

  it('hides the model field once a bot has the job, and says whose instructions it reads', async () => {
    fake = { ...fake, settings: { ...fake.settings, wikiResolveBot: 'a1' } }
    await open()
    expect(html()).toContain('Lê como Lia')
    expect(html()).not.toContain('O modelo dele')
  })

  it('takes the bot out of the card again when the app resolver is chosen', async () => {
    fake = { ...fake, settings: { ...fake.settings, wikiResolveBot: 'a1' } }
    await open()
    await clickText('Lia')
    await clickText('O resolvedor do app')
    expect(asked.some((a) => a.method === 'updateSettings' && (a.params as { patch: { wikiResolveBot?: string } }).patch.wikiResolveBot === '')).toBe(true)
  })

  it('shows neither the picker nor the model while the resolver is off', async () => {
    fake = { ...fake, settings: { ...fake.settings, wikiResolve: false } }
    await open()
    expect(html()).not.toContain('Quem resolve')
    expect(html()).not.toContain('O modelo dele')
  })

  it('leaves an archived bot out of the list', async () => {
    fake = { ...fake, agents: [{ ...lia, archived: true } as Agent] }
    await open()
    await clickText('O resolvedor do app')
    expect(html()).not.toContain('Lia')
  })
})
