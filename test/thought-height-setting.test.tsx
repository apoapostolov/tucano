// The reasoning block reads the height setting. Settings › Conversations › Reasoning panel height
// writes `thinkingSize` ('sm' | 'md' | 'lg'); the block the conversation draws has to carry it as
// `data-size`, or the control moves and nothing changes — which is what upstream 0.2.45 left behind
// when its rewritten surface took the block and kept only the fork's sheet and its CSS.
// The height itself (6, 12, 18 lines) is measured in thought-height.test.ts.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Message } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
Object.assign(globalThis, { ResizeObserver: class { observe(): void {} unobserve(): void {} disconnect(): void {} } })

let fake: State
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return { ...real, useStore: <T,>(select: (s: State) => T): T => select(fake), getState: () => fake }
})
const { createRoot } = await import('react-dom/client')
const store = await vi.importActual<typeof import('../src/renderer/src/store')>('../src/renderer/src/store')
const { Thought } = await import('../src/renderer/src/components/Conversation')

const base = store.getState()
const message = { id: 'm1', conversationId: 'dm', author: { kind: 'agent', id: 'a1' }, text: 'Pronto.', at: 1 } as unknown as Message

let root: Root
const draw = async (size?: 'sm' | 'md' | 'lg'): Promise<string | null> => {
  fake = { ...base, settings: { ...base.settings, showThinking: true, thinkingSize: size } } as unknown as State
  await act(async () => root.render(<Thought message={message} working={false} />))
  return document.querySelector('.thought')?.getAttribute('data-size') ?? null
}

beforeEach(() => {
  // The window keeps a reply's reasoning in memory, not in the database: it is seeded the way a run
  // seeds it, while it thinks.
  store.streamThought('m1', 'First I read the two commits, then I answer.')
  root = createRoot(document.getElementById('root')!)
})
afterEach(async () => act(async () => root.unmount()))

it('carries the height the person picked onto the block', async () => {
  expect(await draw('sm')).toBe('sm')
  expect(await draw('lg')).toBe('lg')
  // Medium is what a person who never touched the control gets.
  expect(await draw(undefined)).toBe('md')
})

it('draws nothing at all while the reasoning is off', async () => {
  fake = { ...base, settings: { ...base.settings, showThinking: false, thinkingSize: 'lg' } } as unknown as State
  await act(async () => root.render(<Thought message={message} working={false} />))
  expect(document.querySelector('.thought')).toBeNull()
})
