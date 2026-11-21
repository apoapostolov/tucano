// Settings › Conversations, on the 0.2.37 hierarchy: the fork's display controls (time format,
// steps, reasoning, reasoning height) sit in the one card that owns how a reply reads, as rows of
// the new screens — the label, the hint and the control at the row's end, not the old appearance
// screen. Startup's "open minimized" sits beside "open when the computer starts" in Agents › Routines.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Settings } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
Object.assign(window, { tucano: {} })
vi.mock('open-bot-avatar/dom', () => ({ mountAvatar: () => new Proxy({}, { get: () => () => {} }) }))
// The settings pane is what this file is about. The conversation and dictation modules pull in the
// live app (a reply's reasoning, an RPC for the voice model) that a settings render never uses.
vi.mock('../src/renderer/src/components/Conversation', () => ({
  ApprovalCard: () => null,
  QuestionCard: () => null,
  accountLabel: () => '',
  questionDrafts: () => ({}),
  toolWords: () => []
}))
vi.mock('../src/renderer/src/components/VoiceSetup', () => ({ VOICE_CHOICES: (): unknown[] => [], VOICE_WHERE: (): string => '', useVoice: () => null, VoiceSetup: () => null }))
vi.mock('../src/renderer/src/components/Update', () => ({ UpdateSettings: () => null }))

let fake: State
const patch = vi.fn()
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: State) => T): T => select(fake),
    updateSettings: (p: Partial<Settings>) => patch(p),
    refreshEngines: vi.fn(),
    navigate: vi.fn(),
    setTab: vi.fn()
  }
})
const { getState } = await import('../src/renderer/src/store')
const { setLang } = await import('../src/shared/lang')
const { createRoot } = await import('react-dom/client')
const { SettingsPage } = await import('../src/renderer/src/components/Pages')

let root: Root
const render = async (settings: Partial<Settings>, tab = 'geral'): Promise<void> => {
  fake = { ...getState(), ready: true, people: [{ id: 'ana', name: 'Ana', role: 'owner', about: '' }], you: 'ana', packaged: true, defaultWorkspace: true, tabs: { settings: tab }, settings: { ...getState().settings, ...settings } }
  await act(async () => root.render(<SettingsPage />))
}
const card = (title: string): Element => [...document.querySelectorAll('.card')].find((c) => c.querySelector('h2')?.textContent?.trim() === title)!
const row = (cardTitle: string, name: string): Element => [...card(cardTitle).querySelectorAll('.key-row')].find((r) => r.querySelector('strong')?.textContent === name)!
const text = (el: Element): string => el.textContent ?? ''
const click = async (el: Element): Promise<void> => act(async () => { el.dispatchEvent(new window.Event('click', { bubbles: true })) })
// Typing, as the field's own handler gets it.
const type = async (input: HTMLInputElement, value: string): Promise<void> => {
  const props = Object.entries(input).find(([k]) => k.startsWith('__reactProps'))![1] as { onChange: (e: { target: { value: string } }) => void }
  await act(async () => props.onChange({ target: { value } }))
}
const choose = (cardTitle: string, name: string, label: string): Element => [...row(cardTitle, name).querySelectorAll('button')].find((b) => b.textContent === label)!
const picked = (cardTitle: string, name: string): string => [...row(cardTitle, name).querySelectorAll('[role="radio"]')].filter((b) => b.getAttribute('aria-checked') === 'true').map((b) => b.textContent).join()
// The switch is the new screens' own Toggle: a button with role=switch and aria-checked.
const switchOf = (cardTitle: string, name: string): HTMLButtonElement => row(cardTitle, name).querySelector('[role="switch"]')!
const isOn = (cardTitle: string, name: string): boolean => switchOf(cardTitle, name).getAttribute('aria-checked') === 'true'

beforeEach(async () => {
  patch.mockReset()
  setLang('en')
  root = createRoot(document.getElementById('root')!)
})
afterEach(async () => { await act(async () => root.unmount()) })

describe('the conversation card', () => {
  it('carries the clock, the steps, the reasoning and its height, in the new row shape', async () => {
    await render({})
    const conversations = card('Conversations')
    expect(text(conversations)).toContain('Time format')
    expect(text(conversations)).toContain('Show the steps while the agent works')
    expect(text(conversations)).toContain('Reply steps')
    expect(text(conversations)).toContain('Show reasoning')
    expect(text(conversations)).toContain('Reasoning panel height')
    // Each is a key row: icon, growing text with a hint, and the control at the end.
    for (const name of ['Time format', 'Show the steps while the agent works', 'Reply steps', 'Show reasoning', 'Reasoning panel height']) {
      expect(row('Conversations', name).querySelector('svg'), name).not.toBeNull()
      expect(row('Conversations', name).querySelector('.grow .muted'), name).not.toBeNull()
    }
    // English reads 12-hour until someone chooses otherwise.
    expect(picked('Conversations', 'Time format')).toBe('12 h')
    expect(picked('Conversations', 'Reply steps')).toBe('All steps')
  })

  it('writes the clock the person picks, and keeps 24 h for Portuguese', async () => {
    await render({})
    expect(picked('Conversations', 'Time format')).toBe('12 h')
    await click(choose('Conversations', 'Time format', '24 h'))
    expect(patch).toHaveBeenLastCalledWith({ clock: '24' })

    setLang('pt')
    await render({})
    expect(picked('Conversas', 'Relógio')).toBe('24 h')
    expect(text(card('Conversas'))).toContain('Relógio')
    expect(choose('Conversas', 'Relógio', '12 h')).not.toBeNull()

    // A saved choice wins over the language's own reading.
    await render({ clock: '12' })
    expect(picked('Conversas', 'Relógio')).toBe('12 h')
  })

  it('offers the three step readings, names the kept number, and clamps it', async () => {
    await render({ steps: 'latest', stepsLatest: 30 })
    expect(picked('Conversations', 'Reply steps')).toBe('Last 30')
    const input = row('Conversations', 'Reply steps').querySelector('input') as HTMLInputElement
    expect(input.value).toBe('30')
    await type(input, '500')
    // 500 is past what a window can keep: the fork's bounds still hold.
    expect(patch).toHaveBeenLastCalledWith({ stepsLatest: 100 })
    await click(choose('Conversations', 'Reply steps', 'One line'))
    expect(patch).toHaveBeenLastCalledWith({ steps: 'one-line' })
  })

  it('hides the kept number while every step shows, and shows it again for the latest few', async () => {
    await render({ steps: 'all' })
    expect(row('Conversations', 'Reply steps').querySelector('input')).toBeNull()
    await render({ steps: 'latest', stepsLatest: 8 })
    expect(row('Conversations', 'Reply steps').querySelector('input')).not.toBeNull()
  })

  it('turns reasoning on and picks its height, the labels following the language', async () => {
    await render({})
    expect(isOn('Conversations', 'Show reasoning')).toBe(false)
    await act(async () => { switchOf('Conversations', 'Show reasoning').click() })
    expect(patch).toHaveBeenLastCalledWith({ showThinking: true })

    await render({ showThinking: true, thinkingSize: 'md' })
    expect(isOn('Conversations', 'Show reasoning')).toBe(true)
    expect(picked('Conversations', 'Reasoning panel height')).toBe('Medium')
    await click(choose('Conversations', 'Reasoning panel height', 'Large'))
    expect(patch).toHaveBeenLastCalledWith({ thinkingSize: 'lg' })

    setLang('pt')
    await render({ showThinking: true, thinkingSize: 'sm' })
    expect(picked('Conversas', 'O tamanho do raciocínio')).toBe('Pequeno')
  })
})

describe('startup', () => {
  it('puts open minimized right after open at login, off until login start is on', async () => {
    await render({ openAtLogin: false }, 'agentes')
    const minimized = row('Routines', 'Open minimized')
    expect(minimized.previousElementSibling?.querySelector('strong')?.textContent).toBe('Launch at login')
    expect(switchOf('Routines', 'Open minimized').disabled).toBe(true)

    await render({ openAtLogin: true, launchMinimized: true }, 'agentes')
    expect(isOn('Routines', 'Open minimized')).toBe(true)
    expect(switchOf('Routines', 'Open minimized').disabled).toBe(false)
    await act(async () => { switchOf('Routines', 'Open minimized').click() })
    expect(patch).toHaveBeenLastCalledWith({ launchMinimized: false })
  })
})
