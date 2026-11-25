// The curator's change card: what leaves a page and what comes in, both shown in full.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setLang } from '../src/shared/lang'
import type { State, WikiChange } from '../src/renderer/src/store'

let fake: State
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return { ...real, useStore: <T,>(select: (s: State) => T): T => select(fake) }
})
vi.mock('../src/renderer/src/rpc', () => ({
  connect: vi.fn(async () => {}),
  disconnect: vi.fn(async () => {}),
  call: vi.fn(async (method: string) => {
    if (method === 'wiki')
      return {
        pages: [{ kind: 'Project' }, { kind: 'Topic' }],
        kinds: ['Project', 'Topic'],
        graph: { nodes: [], edges: [] },
        findings: 0,
        sources: 0
      }
    return []
  })
}))

// A real DOM for the portal: the controls have to land in the hub's row, not just carry a class.
const { window, document } = parseHTML('<html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Element: window.Element, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
Object.assign(window, { innerWidth: 1440, innerHeight: 900 })
window.HTMLElement.prototype.getBoundingClientRect = () => ({ top: 100, bottom: 136, left: 100, right: 300, width: 200, height: 36, x: 100, y: 100, toJSON: () => ({}) })
Object.assign(globalThis, {
  requestAnimationFrame: (f: () => void) => setTimeout(f, 0) as unknown as number,
  cancelAnimationFrame: (id: number) => clearTimeout(id),
  ResizeObserver: class {
    observe(): void {}
    disconnect(): void {}
  }
})

const { getState } = await import('../src/renderer/src/store')
const { ChangeCard, WikiView } = await import('../src/renderer/src/components/Wiki')
const { Hub } = await import('../src/renderer/src/components/Hubs')
const { createRoot } = await import('react-dom/client')

const change = (ops: WikiChange['ops']): WikiChange => ({ id: 'c1', at: Date.now(), by: 'auto', state: 'pending', ops, reason: 'O Marcos aceitou o orçamento.' })
const card = (ops: WikiChange['ops']): string => renderToStaticMarkup(<ChangeCard change={change(ops)} />)

beforeEach(() => {
  fake = { ...getState(), ready: true }
})

describe("the curator's change card", () => {
  it('shows a swap as what leaves and what comes in, each labelled, Markdown and all', () => {
    const html = card([{ op: 'replace', page: 'Marcos Lima', section: 'Situação', old: 'Aguarda a visita.', new: 'Visita em **10/11**.\n\n- obra em janeiro\n- três parcelas' }])
    expect(html).toMatch(/wiki-diff__old.*Sai.*Aguarda a visita\./s)
    expect(html).toMatch(/wiki-diff__new.*Entra.*Visita em <strong>10\/11<\/strong>.*<li>obra em janeiro<\/li>.*<li>três parcelas<\/li>/s)
    expect(html).not.toContain('wiki-diff__new--none')
  })

  it('says so when a swap puts nothing in place, instead of an empty bar', () => {
    const html = card([{ op: 'replace', page: 'Marcos Lima', old: 'Aguarda a visita.', new: '' }])
    expect(html).toContain('wiki-diff__new--none')
    expect(html).toContain('o trecho só sai da página')
  })

  it('shows an addition and a new page without a "leaves" side', () => {
    const html = card([{ op: 'append', page: 'Marcos Lima', section: 'Histórico', text: '- 03/11: aceitou.' }, { op: 'create', page: 'Reforma', text: 'Do [[Marcos Lima]].' }])
    expect(html).not.toContain('wiki-diff__old')
    expect(html).toContain('03/11: aceitou.')
    expect(html).toContain('Reforma')
  })
})

describe('the wiki controls in the hub', () => {
  let root: Root

  beforeEach(async () => {
    setLang('en')
    document.getElementById('root')!.innerHTML = ''
    const base = getState()
    fake = {
      ...base,
      view: { kind: 'wiki' },
      wikiRev: 0,
      settings: { ...base.settings, onboarding: { ...(base.settings.onboarding ?? {}), fresh: false, showAll: true } }
    } as State
    root = createRoot(document.getElementById('root')!)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
  })

  it('names the toolbar and its controls and puts them in the hub tab row', async () => {
    await act(async () => root.render(<Hub tab="wiki"><WikiView /></Hub>))
    const row = document.querySelector<HTMLElement>('.hub__tabs-row')!
    const slot = row.querySelector<HTMLElement>('.hub__tools')!
    const toolbar = slot.querySelector<HTMLElement>('[role="toolbar"]')!
    expect(toolbar).toBeTruthy()
    expect(toolbar.getAttribute('aria-label')).toBe('Wiki tools')
    expect(slot.contains(toolbar)).toBe(true)
    expect(toolbar.closest('.hub__tabs-row')).toBe(row)
    expect(document.querySelector('.page-body--fill')).toBeNull() // headless: no empty band under the hairline
    const names = [...toolbar.querySelectorAll<HTMLElement>('button, [role="group"]')].map((el) => el.getAttribute('aria-label') || (el.textContent ?? '').trim()).filter(Boolean)
    expect(names).toContain('Show only one kind')
    expect(names).toContain('Search the wiki (Ctrl K)')
    expect(names).toContain('Wiki settings')
    expect(names).toContain('New page')
    expect([...toolbar.querySelectorAll<HTMLElement>('button')].every((b) => !!(b.getAttribute('aria-label') || (b.textContent ?? '').trim()))).toBe(true)
  })
})
