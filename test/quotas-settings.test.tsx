// Settings › Quotas, wave 4: the way the quotas are drawn is a two-option switch that sits at the end
// of its row, not under the sentence; each provider's switch is one title with its line right beneath
// it; and the providers offered are the ones the quota reader found — Grok, Z.ai and DeepSeek included
// — instead of the installed harnesses.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProviderQuota, Settings } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
Object.assign(window, { tucano: {} })
vi.mock('open-bot-avatar/dom', () => ({ mountAvatar: () => new Proxy({}, { get: () => () => {} }) }))
vi.mock('../src/renderer/src/components/Conversation', () => ({
  ApprovalCard: () => null,
  QuestionCard: () => null,
  accountLabel: () => '',
  questionDrafts: () => ({}),
  toolWords: () => []
}))
vi.mock('../src/renderer/src/components/VoiceSetup', () => ({ VOICE_CHOICES: (): unknown[] => [], useVoice: () => null, VoiceSetup: () => null }))
vi.mock('../src/renderer/src/components/Update', () => ({ UpdateSettings: () => null }))

// The reader's answer, as the card asks for it on mount.
let reply: ProviderQuota[] = []
const loadQuotas = vi.fn(async () => ({ list: reply, at: 1 }))
let fake: State
const patch = vi.fn()
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: State) => T): T => select(fake),
    updateSettings: (p: Partial<Settings>) => patch(p),
    loadQuotas: () => loadQuotas(),
    refreshEngines: vi.fn(),
    navigate: vi.fn(),
    setTab: vi.fn()
  }
})
const { getState } = await import('../src/renderer/src/store')
const { setLang } = await import('../src/shared/lang')
const { createRoot } = await import('react-dom/client')
const { SettingsPage } = await import('../src/renderer/src/components/Pages')

const quota = (id: string, label: string, via: string): ProviderQuota => ({ id, label, via, at: 1 })

let root: Root
const flush = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}
const render = async (settings: Partial<Settings> = {}): Promise<void> => {
  fake = {
    ...getState(),
    ready: true,
    people: [{ id: 'ana', name: 'Ana', role: 'owner', about: '' }],
    you: 'ana',
    packaged: true,
    defaultWorkspace: true,
    tabs: { settings: 'geral' },
    settings: { ...getState().settings, ...settings }
  }
  await act(async () => root.render(<SettingsPage />))
  await flush()
}
const card = (): Element => document.querySelector('[data-settings-section="app-quotas"]')!
const rows = (): Element[] => [...card().querySelectorAll('.key-row')]
const row = (name: string): Element => rows().find((r) => r.querySelector('strong')?.textContent === name)!
const text = (el: Element): string => el.textContent ?? ''

beforeEach(async () => {
  patch.mockReset()
  loadQuotas.mockClear()
  reply = [quota('xai-oauth', 'Grok', 'Hermes'), quota('zai', 'Z.ai', 'Pi'), quota('deepseek', 'DeepSeek', 'OpenCode')]
  setLang('en')
  document.getElementById('root')!.innerHTML = ''
  root = createRoot(document.getElementById('root')!)
})
afterEach(async () => await act(async () => root.unmount()))

describe('how the quotas are drawn', () => {
  it('keeps the two-option switch on the entry’s row, at its right end', async () => {
    await render()
    const entry = row('How quotas are drawn')
    // It left the text column: the sentence and its subtitle hold the .grow, and nothing else does.
    expect(entry.querySelector('.grow .segmented')).toBeNull()
    expect(entry.querySelector('.grow')!.querySelectorAll('p')).toHaveLength(1)
    // Right of the entry, in the same row.
    expect(entry.querySelector(':scope > .segmented')).not.toBeNull()
    expect(entry.lastElementChild!.classList.contains('segmented')).toBe(true)
  })

  it('keeps the switch’s name and behaviour: two radios, the chosen one marked, and a click saves it', async () => {
    await render({ quotaView: 'rings' })
    const group = row('How quotas are drawn').querySelector(':scope > .segmented')!
    expect(group.getAttribute('role')).toBe('radiogroup')
    expect(group.getAttribute('aria-label')).toBe('How quotas are drawn')
    const radios = [...group.querySelectorAll('[role="radio"]')]
    expect(radios.map((r) => r.textContent)).toEqual(['Table', 'Rings'])
    expect(radios.filter((r) => r.getAttribute('aria-checked') === 'true').map((r) => r.textContent)).toEqual(['Rings'])
    await act(async () => radios[0]!.dispatchEvent(new window.Event('click', { bubbles: true })))
    expect(patch).toHaveBeenCalledWith({ quotaView: 'table' })
  })

  it('draws the provider switches the reader found, in its order, each with only its name', async () => {
    await render()
    expect(rows().slice(1).map((r) => r.querySelector('strong')!.textContent)).toEqual(['Grok', 'Z.ai', 'DeepSeek'])
    // Nothing under the provider name: the row is a switch, not a description.
    const zai = row('Z.ai')
    expect(zai.querySelector('p.muted.small')).toBeNull()
    // The switch itself: a checkbox, ticked unless the person put the provider away.
    expect((zai.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(true)
  })

  it('offers a switch for a provider no harness of its own reports, and saves the one unticked', async () => {
    await render()
    const grok = row('Grok').querySelector('input[type="checkbox"]') as HTMLInputElement
    const props = Object.entries(grok).find(([k]) => k.startsWith('__reactProps'))![1] as { onChange: (e: { target: { checked: boolean } }) => void }
    await act(async () => props.onChange({ target: { checked: false } }))
    expect(patch).toHaveBeenCalledWith({ quotaHidden: ['xai-oauth'] })
  })

  it('shows a provider the person put away as unticked, without dropping its row', async () => {
    await render({ quotaHidden: ['zai'] })
    expect(row('Z.ai')).toBeDefined()
    expect((row('Z.ai').querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(false)
    expect((row('Grok').querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(true)
  })

  it('asks the reader once, on mount', async () => {
    await render()
    expect(loadQuotas).toHaveBeenCalledTimes(1)
  })

  it('says nobody was found only after the read, and never invents a provider', async () => {
    reply = []
    await render()
    expect(rows().slice(1)).toEqual([])
    expect(card().querySelectorAll('input[type="checkbox"]')).toHaveLength(0)
    expect(text(card())).toMatch(/No provider found on this computer yet/)
    expect(text(card())).toMatch(/Pi or Hermes/)
  })

  it('keeps both languages', async () => {
    setLang('pt')
    await render()
    expect(rows().slice(1).map((r) => r.querySelector('strong')!.textContent)).toEqual(['Grok', 'Z.ai', 'DeepSeek'])
    expect(text(row('Como mostrar as cotas').querySelector('.segmented')!)).toBe('TabelaAnéis')
    expect(row('Z.ai').querySelector('p.muted.small')).toBeNull()
  })
})
