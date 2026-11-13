// Deleting a session from the room: the trash under the thread button takes two presses — the first
// arms it (the glyph goes red and says what the next press does), the second deletes the reply and
// the thread it started. A reply still at work goes too, saying that the press stops it first.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Agent, Message } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Element: window.Element, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
Object.assign(window, { innerWidth: 1280, innerHeight: 800 })
Object.assign(globalThis, { ResizeObserver: class { observe(): void {} unobserve(): void {} disconnect(): void {} } })

const deleted: string[] = []
let closed = 0
let fake: State
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: State) => T): T => select(fake),
    deleteMessage: (id: string): void => void deleted.push(id),
    openPanel: (): void => void (closed += 1),
    stopRun: (): void => {}
  }
})
const { getState } = await import('../src/renderer/src/store')
const { MessageList, DeleteSession } = await import('../src/renderer/src/components/Conversation')
const { createRoot } = await import('react-dom/client')

const said = (id: string, text: string, at = 1): Message => ({ id, conversationId: 'dm', author: { kind: 'person', id: 'ana' }, text, at })
const reply = (id: string, status: 'working' | 'done' = 'done'): Message => ({
  id,
  conversationId: 'dm',
  author: { kind: 'agent', id: 'a1' },
  text: status === 'working' ? '' : 'corrigido',
  at: 2,
  run: { status, steps: [], replyTo: 'm1' }
})

let root: Root
const paint = async (messages: Message[], replies?: Map<string, Message[]>): Promise<void> => {
  fake = {
    ...getState(),
    ready: true,
    you: 'ana',
    people: [{ id: 'ana', name: 'Ana', role: 'owner', about: '' }],
    agents: [{ id: 'a1', name: 'Lia', handle: 'lia', role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 1_000_000, used: 0, grants: {}, archived: false } as Agent],
    messages: { dm: messages }
  } as State
  await act(async () => root.render(<MessageList messages={messages} replies={replies} conversationId="dm" />))
}
// A timeline with threads: the thread button rides the top of the run.
const render = (messages: Message[]): Promise<void> => paint(messages, new Map())
// The same conversation where nothing is threaded, so nothing is pinned.
const renderFlat = (messages: Message[]): Promise<void> => paint(messages, undefined)
const trash = (): HTMLElement | null => document.querySelector('.msg__delete')

beforeEach(() => {
  deleted.length = 0
  closed = 0
  root = createRoot(document.getElementById('root')!)
})
afterEach(() => act(() => root.unmount()))

describe('the trash that deletes a session', () => {
  it('sits under the thread button on a reply, and one press only arms it', async () => {
    await render([said('m1', 'corrige o login'), reply('r1')])
    const button = trash()!
    expect(button).toBeTruthy()
    expect(button.getAttribute('title')).toBe('Apagar esta sessão')
    await act(async () => button.click())
    expect(deleted).toEqual([]) // nothing goes on the first press
    expect(button.className).toContain('is-armed')
    expect(button.getAttribute('title')).toBe('Clique de novo para apagar a sessão')
  })

  it('the second press deletes the reply', async () => {
    await render([said('m1', 'corrige o login'), reply('r1')])
    const button = trash()!
    await act(async () => button.click())
    await act(async () => button.click())
    expect(deleted).toEqual(['r1'])
  })

  it('a press anywhere else takes the red off, so the next press arms again', async () => {
    await render([said('m1', 'corrige o login'), reply('r1')])
    const button = trash()!
    await act(async () => button.click())
    await act(async () => {
      document.body.dispatchEvent(new window.Event('mousedown', { bubbles: true }))
    })
    expect(button.className).not.toContain('is-armed')
    await act(async () => button.click())
    expect(deleted).toEqual([]) // armed again, not deleted
  })

  it('a reply still at work has one too, and the second press is said to stop it first', async () => {
    await render([said('m1', 'corrige o login'), reply('r1', 'working')])
    const button = trash()!
    expect(button).toBeTruthy()
    await act(async () => button.click())
    expect(button.getAttribute('title')).toBe('Clique de novo para parar e apagar a sessão')
    expect(deleted).toEqual([])
    await act(async () => button.click())
    expect(deleted).toEqual(['r1'])
  })

  it('a prompt of mine has none either: only a reply is a session', async () => {
    await render([said('m1', 'corrige o login')])
    expect(trash()).toBeNull()
  })

  it('rides the corner the thread button took, so a long reply never has one glyph over the other', async () => {
    // In a timeline with threads the thread button is pinned to the top of the run, not left at the
    // message's corner: the trash goes in that same pin, under it, or the two would share one 20px spot.
    await render([said('m1', 'corrige o login'), reply('r1')])
    const pin = trash()!.closest('.msg__anchor-pin')
    expect(pin).toBeTruthy()
    expect(pin!.querySelector('.msg__reply')).toBeTruthy() // the pinned thread button, above it
    // Without threads nothing is pinned, and the trash stays at the message's own corner.
    await renderFlat([said('m1', 'corrige o login'), reply('r1')])
    expect(trash()!.closest('.msg__anchor-pin')).toBeNull()
    expect(trash()!.closest('.msg')).toBeTruthy()
  })

  it("sits in the thread's own header, beside close, and takes the panel away with the session", async () => {
    await act(async () => root.render(<DeleteSession message={reply('r1')} where="head" />))
    const button = trash()!
    expect(button.className).toContain('msg__delete--head')
    expect(button.className).not.toContain('icon-btn--sm') // the header's own size, beside close
    expect(button.getAttribute('title')).toBe('Apagar esta sessão')
    await act(async () => button.click())
    expect(deleted).toEqual([]) // the first press only arms it
    expect(closed).toBe(0)
    await act(async () => button.click())
    expect(deleted).toEqual(['r1'])
    expect(closed).toBe(1) // nothing is left to read in the panel
  })
})
