// Settings, 0.2.37: the page keeps its own tabs (SETTINGS_TABS), and under them each tab shows the
// sections that tab actually renders, from settings-structure.ts — #446's organization, mounted
// inside the new tabs instead of replacing them. The strip names each card, scrolls to it, follows
// the reading as the page scrolls, and never offers a link to a section whose card isn't there.
// Every control each tab had is still in place.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Settings } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
// Servers is a desktop bridge: with it, Settings › Servidores exists and the strip follows.
Object.assign(window, {
  tucano: {
    servers: {
      list: async (): Promise<unknown[]> => [],
      onChanged: () => () => {},
      open: () => {},
      local: () => {},
      forget: async () => {},
      pair: async () => ({ id: 'srv', name: 'Server', origin: 'http://srv', open: false, node: false }),
      setNode: () => {}
    }
  }
})
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

// Scroll geometry, the same shape the settings-navigation test drives the layout with: the page
// scroller at 40, each anchored card 600 px tall, the strip 88.
let focused: HTMLElement | null = null
let sequence = 0
const frames = new Map<number, FrameRequestCallback>()
window.HTMLElement.prototype.focus = function () { focused = this as unknown as HTMLElement }
window.HTMLElement.prototype.getBoundingClientRect = function () {
  const element = this as unknown as HTMLElement
  const scroller = document.querySelector<HTMLElement>('.page__scroll')
  const index = [...document.querySelectorAll('[data-settings-section]')].indexOf(element)
  const top = index >= 0 ? 140 + index * 600 - (scroller?.scrollTop || 0) : 40
  const height = element.classList.contains('settings-navigation') ? 88 : element.classList.contains('tabs') ? 44 : 500
  return { top, bottom: top + height, left: 0, right: 720, width: 720, height, x: 0, y: top, toJSON: () => ({}) }
}
Object.defineProperty(window.HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return 500 } })
Object.defineProperty(window.HTMLElement.prototype, 'scrollHeight', { configurable: true, get() { return 5000 } })
// Reduced motion on: a click parks the card at once, so the assertions don't race an animation.
Object.assign(window, { matchMedia: () => ({ matches: true }) })
Object.assign(globalThis, {
  requestAnimationFrame: (callback: FrameRequestCallback) => { frames.set(++sequence, callback); return sequence },
  cancelAnimationFrame: (id: number) => { frames.delete(id) },
  ResizeObserver: class { observe(): void {} disconnect(): void {} }
})

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

type Person = State['people'][number]
const OWNER: Person = { id: 'ana', name: 'Ana', role: 'owner', about: '' }
const ADMIN: Person = { id: 'caio', name: 'Caio', role: 'admin', about: '' }
const MEMBER: Person = { id: 'bia', name: 'Bia', role: 'member', about: '' }

let root: Root
const render = async (tab: string, people: Person[] = [OWNER, ADMIN, MEMBER], you = 'ana', settings: Partial<Settings> = {}): Promise<void> => {
  fake = {
    ...getState(),
    ready: true,
    people,
    you,
    packaged: true,
    defaultWorkspace: true,
    tabs: { settings: tab },
    settings: { ...getState().settings, ...settings }
  }
  await act(async () => root.render(<SettingsPage />))
}
// The strip, its links, and where the page says the person is.
const strip = (): HTMLElement | null => document.querySelector('.settings-sections')
const links = (): HTMLAnchorElement[] => [...document.querySelectorAll<HTMLAnchorElement>('.settings-sections a')]
const labels = (): string[] => links().map((a) => a.textContent ?? '')
const anchors = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[data-settings-section]')]
const current = (): string | null => strip()?.querySelector('[aria-current="location"]')?.textContent ?? null
const card = (title: string): Element | undefined => [...document.querySelectorAll('.card')].find((c) => c.querySelector('h2')?.textContent?.trim() === title)
const cards = (): string[] => [...document.querySelectorAll('.card > .card__head h2')].map((h) => h.textContent?.trim() ?? '')
const scroller = (): HTMLElement => document.querySelector('.page__scroll')!
const tick = async (at = 0): Promise<void> => {
  await act(async () => { const pending = [...frames.values()]; frames.clear(); pending.forEach((callback) => callback(at)) })
}
const clickLink = async (label: string): Promise<void> => {
  const link = links().find((a) => a.textContent === label)!
  const event = new window.Event('click', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'button', { value: 0 })
  Object.defineProperty(event, 'detail', { value: 1 })
  await act(async () => link.dispatchEvent(event))
}

beforeEach(() => {
  patch.mockReset()
  setLang('en')
  focused = null
  frames.clear()
  document.getElementById('root')!.innerHTML = ''
  root = createRoot(document.getElementById('root')!)
})
afterEach(async () => { await act(async () => root.unmount()); frames.clear() })

describe('settings sections inside the 0.2.37 tabs', () => {
  it('keeps the page tab bar as the only tablist, and puts the strip under it, above the cards', async () => {
    await render('geral')
    expect(document.querySelectorAll('[role="tablist"]')).toHaveLength(1)
    expect(document.querySelectorAll('[role="tab"]')).toHaveLength(7)
    expect(strip()).not.toBeNull()
    // The strip sits between the tab bar and the cards, so it spans the same width as the tabs.
    const tabBar = document.querySelector('.tabs')!
    expect(tabBar.nextElementSibling?.querySelector('.settings-sections')).toBe(strip())
    expect(document.querySelector('.agent-form')!.contains(strip())).toBe(false)
  })

  it('lists the sections each tab renders, in reading order, and nothing else', async () => {
    await render('geral')
    // An admin has no Appearance card (a member's own), so no Appearance link.
    expect(labels()).toEqual(['Context', 'Quotas', 'Dictation', 'Notifications', 'Conversation', 'Updates', 'Import and export', 'Backups', 'Data and deletion'])

    await render('modelos')
    expect(labels()).toEqual(['Agent models', 'Runtimes', 'Accounts', 'Classifiers', 'Router', 'Classifier Uses', 'Memory'])

    await render('agentes')
    // Recovery, Replies, Collaboration and Skills have no card on this tab: no links to nothing.
    expect(labels()).toEqual(['Permissions', 'Automation', 'Limits'])

    await render('integracoes')
    expect(labels()).toEqual(['Phone and Telegram'])

    await render('pessoas')
    expect(labels()).toEqual(['People'])

    await render('atividade')
    expect(labels()).toEqual(['Activity'])

    await render('servidores')
    expect(labels()).toEqual(['Servers'])
  })

  it('points every link at a card that is on the page, and marks the first one as the reading', async () => {
    for (const tab of ['geral', 'modelos', 'agentes', 'integracoes', 'pessoas', 'atividade', 'servidores']) {
      await render(tab)
      const list = links()
      expect(list.length, tab).toBeGreaterThan(0)
      for (const link of list) {
        const target = document.getElementById(link.getAttribute('href')!.slice(1))
        expect(target?.dataset.settingsSection, `${tab} ${link.textContent}`).toBeTruthy()
      }
      // No link without a card, and no card left out of the strip.
      expect(list).toHaveLength(anchors().length)
      // One anchor per section: no card is two sections, and no id repeats in the pane.
      const ids = anchors().map((element) => element.id)
      expect(new Set(ids).size, tab).toBe(ids.length)
      expect(current(), tab).toBe(list[0]!.textContent)
    }
    // The strip is a named landmark, not another tab bar.
    expect(strip()!.tagName).toBe('NAV')
    expect(strip()!.getAttribute('aria-label')).toBe('Settings sections')
  })

  it('walks to a card and focuses it when the person picks it', async () => {
    await render('geral')
    await clickLink('Data and deletion')
    expect(focused?.id).toBe('settings-workspace-danger')
    expect(focused?.dataset.settingsSection).toBe('workspace-danger')
    // The card lands just under the tabs and the strip, not under them.
    expect(scroller().scrollTop).toBe(4500)
    expect(current()).toBe('Data and deletion')
  })

  it('follows the reading while the page scrolls, one section at a time', async () => {
    await render('geral')
    for (const [top, label] of [[2344, 'Conversation'], [2944, 'Updates'], [3544, 'Import and export']] as const) {
      scroller().scrollTop = top
      await act(async () => scroller().dispatchEvent(new window.Event('scroll')))
      await tick()
      expect(current()).toBe(label)
    }
    // At the very end, the last section is the one being read.
    scroller().scrollTop = 4500
    await act(async () => scroller().dispatchEvent(new window.Event('scroll')))
    await tick()
    expect(current()).toBe('Data and deletion')
  })

  it('shows a member only the sections they have, and their own controls', async () => {
    await render('geral', [MEMBER], 'bia')
    expect(document.querySelectorAll('[role="tab"]')).toHaveLength(1)
    // No workspace, dictation, updates, team, backups or danger for a member: their own card, then
    // the two everyone shares.
    expect(labels()).toEqual(['Appearance', 'Notifications', 'Conversation'])
    expect(card('Yours')).toBeDefined()
    expect(anchors()[0]!.getAttribute('data-settings-section')).toBe('app-appearance')
  })

  it('keeps every control the tabs had', async () => {
    await render('geral')
    expect(cards()).toEqual(['Workspace', 'Quotas', 'Dictation', 'Notifications', 'Conversations', 'Talk to the people who make Tucano', 'Sidebar', 'Updates', 'Team', 'Full backup', 'Danger area'])
    expect(card('Conversations')!.querySelectorAll('.key-row')).toHaveLength(5)
    // The ones written in this page carry the anchor on the card itself.
    for (const id of ['workspace-context', 'app-quotas', 'app-notifications', 'app-conversation', 'app-updates', 'workspace-transfer', 'workspace-danger']) {
      expect(document.getElementById(`settings-${id}`)?.classList.contains('card'), id).toBe(true)
    }
    // Backups comes from another file: its section wraps the card, and the card keeps its controls.
    expect(card('Full backup')!.closest('[data-settings-section]')?.id).toBe('settings-workspace-backups')
    expect(document.getElementById('settings-workspace-backups')?.getAttribute('aria-label')).toBe('Backups')

    await render('modelos')
    expect(cards()).toEqual(expect.arrayContaining(['Agent models', 'Harnesses', 'Accounts', 'Router', 'Memory']))
    expect(card('Agent models')!.closest('[data-settings-section]')?.getAttribute('id')).toBe('settings-models-agents')

    await render('agentes')
    expect(cards()).toEqual(expect.arrayContaining(['Autonomy', 'Agents’ browser', 'Routines', 'Limits']))
    // The browser card has no section of its own; it stays, without a link.
    expect(card('Agents’ browser')!.closest('[data-settings-section]')).toBeNull()

    await render('integracoes')
    expect(card('Phone (Telegram)')!.closest('[data-settings-section]')?.getAttribute('data-settings-section')).toBe('connections-phone')

    await render('pessoas')
    expect([...document.querySelectorAll('button')].some((b) => b.textContent?.includes('Invite'))).toBe(true)

    await render('atividade')
    expect(card('Activity')).toBeDefined()

    await render('servidores')
    expect(card('Servers')).toBeDefined()
    expect(card('Servers')!.closest('[data-settings-section]')?.getAttribute('data-settings-section')).toBe('connections-servers')
  })
})
