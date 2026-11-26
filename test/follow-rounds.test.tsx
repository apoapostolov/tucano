// A reply that followed up keeps a round per turn: toolchain, reasoning and words, newest last.
// The renderer reads the reasoning kept on the run, so starting another Follow cannot erase an
// earlier round's thinking block. Cards under the reply do not add or take away rounds.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Message, RunRound, Settings, Step } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) })
Object.assign(document, { oninput: null })
Object.assign(window, { innerWidth: 1280, innerHeight: 800, tucano: {} })
Object.assign(globalThis, {
  requestAnimationFrame: (f: () => void) => setTimeout(f, 0) as unknown as number,
  cancelAnimationFrame: (id: number) => clearTimeout(id),
  ResizeObserver: class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
})

let fake: State
let live: string | undefined
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: State) => T): T => select(fake),
    getState: () => fake,
    useLiveThoughtState: () => (live ? { text: live, start: 0 } : undefined),
    useLiveText: (m: Message) => m.text,
    stopRun: () => {},
    sendMessage: () => {}
  }
})

const { createRoot } = await import('react-dom/client')
const realStore = await vi.importActual<typeof import('../src/renderer/src/store')>('../src/renderer/src/store')
const { MessageRow, Rounds } = await import('../src/renderer/src/components/Conversation')

const ana = { id: 'ana', name: 'Ana', role: 'owner', about: '' }
const lia = () => ({ id: 'a1', name: 'Lia', handle: 'lia', role: 'Engineering', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 0, used: 0, grants: {}, memory: 'auto', computer: false, archived: false })
const channel = { id: 'c1', kind: 'channel' as const, name: 'engineering', members: ['a1'] }
const step = (id: string): Step => ({ id, label: `read ${id}.ts`, status: 'done', ms: 20 })
const round = (name: string, text: string, thought: string): RunRound => ({ id: `${name}-follow`, steps: [step(`${name}-step`)], text, thought })

const rounds = [
  round('first', 'The first answer.', 'First round: read the file.'),
  round('second', 'The second answer.', 'Second round: check the test.'),
  round('third', 'The third answer.', 'Third round: write the result.')
]
const message = (status: 'done' | 'working' = 'done', extra: Partial<NonNullable<Message['run']>> = {}): Message => ({
  id: 'm1',
  conversationId: 'c1',
  author: { kind: 'agent', id: 'a1' },
  text: rounds.map((r) => r.text).join('\n\n'),
  at: 1,
  run: { status, steps: rounds.flatMap((r) => r.steps), rounds, ...extra }
})

let root: ReturnType<typeof createRoot>
beforeEach(() => {
  fake = {
    ...realStore.getState(),
    ready: true,
    people: [ana],
    you: 'ana',
    agents: [lia()],
    conversations: [channel],
    messages: { c1: [] },
    inbox: { approvals: [], questions: [] },
    settings: { ...realStore.getState().settings, showThinking: true, proceedButton: true } as Settings
  } as State
  live = undefined
  document.getElementById('root')!.innerHTML = ''
  root = createRoot(document.getElementById('root')!)
})
afterEach(() => act(() => root.unmount()))

const draw = async (m: Message): Promise<void> => {
  await act(async () => void root.render(<Rounds message={m} said={m.text} components={{}} />))
}

describe('Follow rounds in the conversation', () => {
  it('draws each round’s toolchain, thinking block and words under the one before it', async () => {
    await draw(message())
    const blocks = [...document.querySelectorAll('.msg__round')]
    expect(blocks).toHaveLength(3)
    expect(blocks.map((b) => [...b.children].map((c) => c.className.split(' ')[0]))).toEqual([
      ['steps', 'md'],
      ['steps', 'md'],
      ['steps', 'md']
    ])
    const thoughts = [...document.querySelectorAll('.thought__last')].map((el) => el.textContent)
    expect(thoughts).toEqual(['First round: read the file.', 'Second round: check the test.', 'Third round: write the result.'])
    expect([...document.querySelectorAll('.msg__text')].map((el) => el.textContent)).toEqual(['The first answer.', 'The second answer.', 'The third answer.'])
    expect([...document.querySelectorAll('.steps')].every((el) => el.querySelectorAll('.steps__toggle').length === 1)).toBe(true)
  })

  it('keeps the first thinking block when a later Follow starts and clears the live cache', async () => {
    // One Follow: the first round is done, the second streams with live reasoning.
    const streaming = [rounds[0]!, { ...rounds[1]!, thought: undefined }]
    live = 'Second round: still writing.'
    await draw(message('working', { rounds: streaming }))
    const thoughts = (): string[] => [...document.querySelectorAll('.thought__last, .thought__text')].map((el) => el.textContent ?? '')
    expect(thoughts()).toContain('First round: read the file.')
    expect(thoughts()).toContain('Second round: still writing.')

    // A second Follow starts: the same message clears its live reasoning cache, but the durable
    // thinking of the earlier rounds stays where it was.
    live = undefined
    await draw(message('working', { rounds: streaming }))
    expect(thoughts()).toContain('First round: read the file.')
    expect(thoughts()).not.toContain('Second round: still writing.')
    await draw(message('done'))
    expect(thoughts()).toEqual(['First round: read the file.', 'Second round: check the test.', 'Third round: write the result.'])
  })

  it('gives each round its own Thought after its steps, and lets only the newest read the live stream', async () => {
    const first = { ...rounds[0]!, thought: 'Round one reasoning: read the file.' }
    const second = { ...rounds[1]!, thought: undefined }
    live = 'Round two reasoning: check the test.'
    fake.settings.stepsOpen = true
    await draw(message('working', { rounds: [first, second] }))

    const blocks = [...document.querySelectorAll('.msg__round')]
    expect(blocks.map((b) => b.getAttribute('data-follow-round'))).toEqual(['0', '1'])
    const thoughtText = (b: Element): string[] => [...b.querySelectorAll('.thought__last, .thought__text')].map((el) => el.textContent ?? '')
    expect(thoughtText(blocks[0]!)).toEqual(['Round one reasoning: read the file.'])
    expect(thoughtText(blocks[1]!)).toEqual(['Round two reasoning: check the test.'])
    expect(thoughtText(blocks[0]!).join(' ')).not.toContain('Round two reasoning')
    const order = (block: Element): string[] =>
      [...block.querySelectorAll('.steps__body, .steps__list, .thought')].map((el) => el.getAttribute('class')?.split(' ')[0] ?? '')
    for (const block of blocks) {
      const drawn = order(block)
      expect(drawn).toContain('thought')
      expect(drawn.indexOf('thought')).toBeGreaterThan(drawn.indexOf('steps__body'))
      // The working round's list is open, the old one's folded.
      if (drawn.includes('steps__list')) expect(drawn.indexOf('thought')).toBeGreaterThan(drawn.indexOf('steps__list'))
    }
    expect(order(blocks[1]!)).toContain('steps__list')

    // Once it ends, that reasoning is stored on its own round; the older round keeps its own.
    live = undefined
    await draw(message('done', { rounds: [first, { ...second, thought: 'Round two reasoning: check the test.' }] }))
    const done = [...document.querySelectorAll('.msg__round')]
    expect(thoughtText(done[0]!)).toEqual(['Round one reasoning: read the file.'])
    expect(thoughtText(done[1]!)).toEqual(['Round two reasoning: check the test.'])
  })

  it('hides every round’s thought container when thinking is off', async () => {
    fake.settings.showThinking = false
    live = 'Reasoning nobody asked to see.'
    await draw(message('working', { rounds: [rounds[0]!, rounds[1]!] }))
    expect(document.querySelectorAll('.thought')).toHaveLength(0)
  })

  it('does not make or remove a round when a Proceed or steps card is drawn', async () => {
    const m = message('done', { questions: [{ question: 'Go ahead', kind: 'text', proceed: true }], proceedOpen: true })
    await act(async () => void root.render(<MessageRow message={m} grouped={false} />))
    expect(document.querySelectorAll('.msg__round')).toHaveLength(3)
    expect(document.querySelector('.proceed')).not.toBeNull()
    expect(document.querySelectorAll('.steps__steer-pill')).toHaveLength(1)

    const steps = message('done', { questions: [{ question: 'What next?', kind: 'text' }], stepsOpen: true })
    await act(async () => void root.render(<MessageRow message={steps} grouped={false} />))
    expect(document.querySelectorAll('.msg__round')).toHaveLength(3)
    expect(document.querySelector('.proceed')).toBeNull()
    expect(document.querySelector('.steps__steer-pill')).not.toBeNull()
  })
})
