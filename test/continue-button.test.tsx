// A reply the app cut with work behind it is worth more than a restart of the same work, so it offers
// "Continue" before "Try again"; one that never got a tool call back offers "Try again" alone (#390).
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { ReactNode } from 'react'
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
const continueRun = vi.fn(async () => {})
const retryRun = vi.fn(async () => {})
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: State) => T): T => select(fake),
    getState: () => fake,
    continueRun,
    retryRun,
    setTab: vi.fn(),
    navigate: vi.fn(),
    voiceStatus: vi.fn(() => new Promise(() => {}))
  }
})
const real = await vi.importActual<typeof import('../src/renderer/src/store')>('../src/renderer/src/store')
const { createRoot } = await import('react-dom/client')
const { ConversationView } = await import('../src/renderer/src/components/Conversation')

const ana: Person = { id: 'ana', name: 'Ana', role: 'owner', about: '' }
const agent = (): Agent => ({ id: 'a1', name: 'Lia', handle: 'lia', role: 'Pesquisadora', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 0, used: 0, grants: {}, memory: 'auto', computer: false, archived: false })
const dm: Conversation = { id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] }
const step = (label: string, status: Step['status'], detail?: string): Step => ({ id: label, label, status, ...(detail ? { detail } : {}) })
const cut = (steps: Step[]): Message => ({
  id: 'm1', conversationId: 'd1', author: { kind: 'agent', id: 'a1' }, text: 'Comecei.', at: 2,
  run: { status: 'interrupted', task: 'conserte o teste', steps }
})

let root: Root | undefined
beforeEach(() => {
  setLang('en')
  continueRun.mockClear()
  retryRun.mockClear()
  const mount = document.getElementById('root')!
  mount.innerHTML = ''
  root = undefined
  fake = {
    ...real.getState(),
    ready: true,
    people: [ana],
    you: 'ana',
    agents: [agent()],
    conversations: [dm],
    messages: {},
    inbox: { approvals: [], questions: [] },
    settings: { ...real.getState().settings } as Settings
  } as State
})

const render = async (node: ReactNode): Promise<void> => {
  if (root) await act(async () => root!.unmount())
  const host = document.createElement('div')
  document.getElementById('root')!.append(host)
  root = createRoot(host)
  const mounted = root
  await act(async () => mounted.render(node))
}
const buttons = (): string[] => [...document.querySelectorAll('button.retry')].map((b) => b.textContent?.trim() ?? '')

describe('a reply the app cut', () => {
  it('offers Continue before Try again once a tool call came back', async () => {
    fake = { ...fake, messages: { d1: [cut([step('Thought', 'done'), step('Read src/core/runs.ts', 'done', 'src/core/runs.ts')])] } }
    await render(<ConversationView id="d1" />)
    expect(buttons()[0]).toBe('Continue')
    expect(buttons()).toContain('Try again')
  })

  // Cut while it was still thinking, with no tool call behind it: the person's call, not the app's.
  // It used to be Try again alone, which buried every reply the app closed in the middle of before it
  // had read anything.
  it('offers Continue even when all it did was think', async () => {
    fake = { ...fake, messages: { d1: [cut([step('Thinking', 'done')])] } }
    await render(<ConversationView id="d1" />)
    expect(buttons()[0]).toBe('Continue')
    expect(buttons()).toContain('Try again')
  })

  // A dead reply owes three ways on, and they are one line under it: Continue first, then Try again,
  // then Follow Up. Try again used to sit on a band of its own above that line, which made the reply
  // read as a banner with two buttons below it instead of one row of choices.
  it('puts Continue, Try again and Follow Up on the row under the reply, in that order', async () => {
    fake = { ...fake, messages: { d1: [cut([step('Thought', 'done'), step('Ran npx vitest run', 'done')])] } }
    await render(<ConversationView id="d1" />)
    const meta = document.querySelector('.msg__meta')
    expect(meta).not.toBeNull()
    const inMeta = meta ? [...meta.querySelectorAll('button')].map((b) => b.textContent?.trim() ?? '') : []
    const at = (label: string): number => inMeta.findIndex((t) => t.includes(label))
    expect(at('Continue')).toBeGreaterThanOrEqual(0)
    expect(at('Continue')).toBeLessThan(at('Try again'))
    expect(at('Try again')).toBeLessThan(at('Follow'))
    // One row: the three of them are the only pills of the reply, and none is left outside the line.
    expect(document.querySelectorAll('.msg__meta').length).toBe(1)
    expect([...document.querySelectorAll('button.retry')].every((b) => meta!.contains(b))).toBe(true)
  })

  // A session left with no answer: the app cut it, a continuation was started from the row (so the row
  // is `done`, its `cutAt` still there) and the words never came. It showed a chain, a Follow up and no
  // way on at all: an install every ten minutes filled a whole channel with those.
  it('offers Continue on a session that ended without a word, before Follow up', async () => {
    const silent: Message = {
      id: 'm3', conversationId: 'd1', author: { kind: 'agent', id: 'a1' }, text: '', at: 4,
      run: { status: 'done', task: 'conserta o teste', cutAt: 3, steps: [step('Thought', 'done'), step('Ran npx vitest run', 'done')] }
    }
    fake = { ...fake, messages: { d1: [silent] } }
    await render(<ConversationView id="d1" />)
    const meta = document.querySelector('.msg__meta')
    const inMeta = meta ? [...meta.querySelectorAll('button')].map((b) => b.textContent?.trim() ?? '') : []
    expect(inMeta).toContain('Continue')
    expect(inMeta.indexOf('Continue')).toBeLessThan(inMeta.findIndex((t) => t === 'Follow' || t === 'Seguir'))
    const button = [...document.querySelectorAll('button.retry')].find((b) => b.textContent?.trim() === 'Continue')
    await act(async () => (button as unknown as { click: () => void }).click())
    expect(continueRun).toHaveBeenCalledWith('m3')
  })

  // A routine that stayed silent on purpose is not owed a nudge, and a row whose continuation is
  // already on its way has spent its pill: a second press would start a second reply beside the first.
  it('keeps it off a routine that stayed silent, and off a row already continued', async () => {
    const quiet: Message = { id: 'm4', conversationId: 'd1', author: { kind: 'agent', id: 'a1' }, text: '', at: 5, run: { status: 'done', noNews: true, steps: [step('Thought', 'done')] } }
    fake = { ...fake, messages: { d1: [quiet] } }
    await render(<ConversationView id="d1" />)
    expect(buttons()).not.toContain('Continue')
    const spent: Message = { id: 'm5', conversationId: 'd1', author: { kind: 'agent', id: 'a1' }, text: '', at: 6, run: { status: 'done', cutAt: 3, continuedAt: 7, steps: [step('Thought', 'done'), step('Went on by itself', 'done')] } }
    fake = { ...fake, messages: { d1: [spent] } }
    await render(<ConversationView id="d1" />)
    expect(buttons()).not.toContain('Continue')
  })

  it('keeps a finished reply without one', async () => {
    const done: Message = { id: 'm2', conversationId: 'd1', author: { kind: 'agent', id: 'a1' }, text: 'Pronto.', at: 3, run: { status: 'done', task: 'x', steps: [step('Ran', 'done')] } }
    fake = { ...fake, messages: { d1: [done] } }
    await render(<ConversationView id="d1" />)
    expect(buttons()).not.toContain('Continue')
  })

  it('goes on with the reply that was cut when Continue is pressed', async () => {
    fake = { ...fake, messages: { d1: [cut([step('Thought', 'done'), step('Ran npx vitest run', 'error', 'exit 1')])] } }
    await render(<ConversationView id="d1" />)
    const button = [...document.querySelectorAll('button.retry')].find((b) => b.textContent?.trim() === 'Continue')
    await act(async () => (button as unknown as { click: () => void }).click())
    expect(continueRun).toHaveBeenCalledWith('m1')
    // And it is not the same thing as trying again from the beginning.
    expect(retryRun).not.toHaveBeenCalled()
  })

  // A row that ended badly is its words and its numbers until the pointer goes near it: the way on
  // wears Follow Up's pill, in its dim colour, and the row reveals it on hover (styles.css .msg__hire).
  it('wears the Follow Up pill, dim, and the row shows it on hover', async () => {
    fake = { ...fake, messages: { d1: [cut([step('Thought', 'done'), step('Ran npx vitest run', 'done')])] } }
    await render(<ConversationView id="d1" />)
    const pills = [...document.querySelectorAll('button.retry')]
    expect(pills.length).toBeGreaterThan(1)
    for (const pill of pills) {
      expect(pill.classList.contains('steps__ask-pill')).toBe(true)
      expect(pill.classList.contains('msg__hire')).toBe(true)
      // and none of them still the old square button it was
      expect(pill.className).not.toContain('btn--xs')
    }
  })
})
