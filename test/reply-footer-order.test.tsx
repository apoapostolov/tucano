// Where a working reply's footer sits: under everything the reply drew, the thinking block included,
// in the same row a reply that stopped ends with. The steer belongs there, not between the steps and
// what the agent is thinking, and this draws the real conversation to say so.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Agent, Conversation, Message, Person, Settings, Step } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'
import { setLang } from '../src/shared/lang'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) })
Object.assign(window, { tucano: {} })
Object.assign(globalThis, { ResizeObserver: class { observe(): void {} unobserve(): void {} disconnect(): void {} } })
vi.mock('open-bot-avatar/dom', () => ({ mountAvatar: () => new Proxy({}, { get: () => () => {} }) }))

let fake: State
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: State) => T): T => select(fake),
    getState: () => fake,
    useLiveThoughtState: () => ({ text: 'o pedido tem duas partes.', start: 0 }),
    setTab: vi.fn(),
    navigate: vi.fn(),
    voiceStatus: vi.fn(() => new Promise(() => {}))
  }
})
const realStore = await vi.importActual<typeof import('../src/renderer/src/store')>('../src/renderer/src/store')
const { createRoot } = await import('react-dom/client')
const { ConversationView } = await import('../src/renderer/src/components/Conversation')

const ana: Person = { id: 'ana', name: 'Ana', role: 'owner', about: '' }
const lia = (): Agent => ({ id: 'a1', name: 'Lia', handle: 'lia', role: 'Pesquisadora', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 0, used: 0, grants: {}, memory: 'auto', computer: false, archived: false })
const dm: Conversation = { id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] }
const step = (label: string, status: Step['status']): Step => ({ id: label, label, status })
const working: Message = {
  id: 'm1',
  conversationId: 'd1',
  author: { kind: 'agent', id: 'a1' },
  text: 'Vou começar pelo teste.',
  at: 2,
  run: { status: 'working', steps: [step('Read src/core/runs.ts', 'done'), step('Running the tests', 'running')] }
}

let root: Root | undefined
beforeEach(() => {
  setLang('en')
  const mount = document.getElementById('root')!
  mount.innerHTML = ''
  root = undefined
  fake = {
    ...realStore.getState(),
    ready: true,
    people: [ana],
    you: 'ana',
    agents: [lia()],
    conversations: [dm],
    messages: { d1: [working] },
    inbox: { approvals: [], questions: [] },
    settings: { ...realStore.getState().settings, showThinking: true } as Settings
  } as State
})

const render = async (): Promise<void> => {
  if (root) await act(async () => root!.unmount())
  const host = document.createElement('div')
  document.getElementById('root')!.append(host)
  root = createRoot(host)
  const mounted = root
  await act(async () => mounted.render(<ConversationView id="d1" />))
}

// The blocks of a reply, in the order the page holds them.
const order = (): string[] => [...document.querySelectorAll('.steps, .thought, .msg__meta')].map((el) => el.className.split(' ')[0]!)

describe("a working reply's footer", () => {
  it('sits under the chain and under the thinking block, not between them', async () => {
    await render()
    expect(order()).toEqual(['steps', 'thought', 'msg__meta'])
    // And the steer is in that footer, where the way on from a reply already sits.
    const foot = document.querySelector('.msg__meta')!
    expect(foot.querySelector('.steps__steer-pill')).not.toBeNull()
    expect(document.querySelector('.steps .steps__steer-pill')).toBeNull()
  })

  it('opens the footer note in place, with nothing above the thinking block moving', async () => {
    await render()
    const before = order()
    const pill = document.querySelector<HTMLElement>('.msg__meta .steps__steer-pill')!
    await act(async () => pill.click())
    const note = document.querySelector<HTMLElement>('.msg__meta .retry-note')
    expect(note?.querySelector('textarea')).not.toBeNull()
    // The note is the last thing in the footer, and the reply's blocks keep their order.
    expect(note?.parentElement?.className).toBe('msg__meta')
    expect(order()).toEqual(before)
  })
})
