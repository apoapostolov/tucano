// Follow Up from a finished row of the drawer (Conversation.tsx, WorkDrawer): a reply that ended keeps
// the pill a working row carries, in the same place, and pressing it opens one line under that row —
// not a textarea, not a dialog. What it sends is a follow up of that reply, not a message of its own
// (src/core/runs.ts, `followUp`), so the row goes on where it stopped.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Message, RunStatus } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Element: window.Element, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
Object.assign(document, { oninput: null }) // what makes React read a typed field in this DOM
Object.assign(window, { innerWidth: 1280, innerHeight: 800 })

const seen: string[] = []
let fake: State
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: State) => T): T => select(fake),
    followUpRun: (id: string, text: string): void => void seen.push(`follow:${id}:${text}`)
  }
})
const { getState } = await import('../src/renderer/src/store')
const { WorkDrawer } = await import('../src/renderer/src/components/Conversation')
const { createRoot } = await import('react-dom/client')

const said = (id: string, text: string, at = 1): Message => ({ id, conversationId: 'dm', author: { kind: 'person', id: 'ana' }, text, at })
const reply = (id: string, replyTo: string, status: RunStatus, text = ''): Message => ({
  id,
  conversationId: 'dm',
  author: { kind: 'agent', id: 'a1' },
  text,
  at: 2,
  run: { status, steps: [], replyTo }
})

let n = 0
const nextConv = (): string => `conv${++n}`

let root: Root
const mount = async (conversationId: string, messages: Message[]): Promise<void> => {
  fake = { ...getState(), ready: true, you: 'ana', people: [{ id: 'ana', name: 'Ana', role: 'owner', about: '' }], messages: { [conversationId]: messages } } as State
  // One component per conversation across both renders: the drawer notices a reply leaving the working
  // list in an effect, and a remount would miss it.
  await act(async () => root.render(<WorkDrawer key={conversationId} conversationId={conversationId} />))
}
// The drawer keeps a row only once the reply has left the working list, so a finished row arrives the
// way it does in the app: running first, ended after.
const finish = async (asked: string, status: RunStatus): Promise<void> => {
  const conv = nextConv()
  await mount(conv, [said('m1', asked, 1), reply('r1', 'm1', 'working')])
  await mount(conv, [said('m1', asked, 1), reply('r1', 'm1', status, 'feito')])
  await act(async () => button('1 terminada').click())
}
const text = (): string => document.body.textContent ?? ''
const button = (label: string): HTMLElement => {
  const hit = [...document.querySelectorAll('button')].find(
    (b) => b.getAttribute('title') === label || b.textContent?.trim() === label || (b.classList.contains('work-drawer__head') && !!b.textContent?.includes(label))
  )
  if (!hit) throw new Error(`no button "${label}": ${[...document.querySelectorAll('button')].map((b) => b.getAttribute('title') ?? b.textContent).join(' | ')}`)
  return hit as HTMLElement
}
const pill = (): HTMLButtonElement | null => document.querySelector('.work-row__follow .steps__ask-pill') as HTMLButtonElement | null
const field = (): HTMLInputElement | null => document.querySelector('.steps__ask-note--row input') as HTMLInputElement | null
// Typing as React sees it: the value set past React's own tracker, then the input event.
const type = async (el: HTMLInputElement, value: string): Promise<void> => {
  let proto: object | null = Object.getPrototypeOf(el)
  let set: ((v: string) => void) | undefined
  while (proto && !set) (set = Object.getOwnPropertyDescriptor(proto, 'value')?.set), (proto = Object.getPrototypeOf(proto))
  await act(async () => {
    set!.call(el, value)
    el.dispatchEvent(new window.Event('input', { bubbles: true }))
  })
}
// linkedom has no KeyboardEvent: a keydown with the fields React reads, on the event itself.
const key = async (el: HTMLElement, name: string): Promise<void> => {
  const ev = new window.Event('keydown', { bubbles: true, cancelable: true }) as unknown as KeyboardEvent
  Object.defineProperty(ev, 'key', { value: name })
  await act(async () => void el.dispatchEvent(ev))
}

beforeEach(() => {
  seen.length = 0
  root = createRoot(document.getElementById('root')!)
})
afterEach(() => act(() => root.unmount()))

describe('the finished row’s Follow Up', () => {
  it('carries the pill between the numbers and the thread glyph, where a working row carries its steer', async () => {
    await finish('corrige o login', 'done')
    const row = document.querySelector('.work-row--done')!
    const order = [...row.querySelectorAll('button')].map((b) => b.className)
    expect(order).toEqual(['work-row__go', 'steps__ask-pill', 'icon-btn icon-btn--sm work-row__thread-btn', 'icon-btn icon-btn--sm work-row__remove'])
    expect(pill()!.textContent).toContain('Seguir') // the workspace is in Portuguese
  })

  it('opens one line under the row — a field, not a textarea and not a dialog — and nothing is sent yet', async () => {
    await finish('corrige o login', 'done')
    expect(field()).toBeNull()
    await act(async () => pill()!.click())
    expect(field()).not.toBeNull()
    expect(document.querySelector('.steps__ask-note--row textarea')).toBeNull()
    expect(document.querySelector('.steps__ask-row')).toBeNull() // no Cancel row: the glyph at the end sends
    expect(document.querySelector('.work-row .steps__ask-send')).not.toBeNull()
    expect((document.querySelector('.work-row .steps__ask-send') as HTMLButtonElement).disabled).toBe(true)
    expect(seen).toEqual([])
  })

  it('sends what is typed with Enter, as a follow up of this reply, and closes the field', async () => {
    await finish('corrige o login', 'done')
    await act(async () => pill()!.click())
    await type(field()!, 'agora o teste do login')
    expect((document.querySelector('.work-row .steps__ask-send') as HTMLButtonElement).disabled).toBe(false)
    await key(field()!, 'Enter')
    expect(seen).toEqual(['follow:r1:agora o teste do login'])
    expect(field()).toBeNull()
  })

  it('sends from the glyph too, and Escape closes without sending anything', async () => {
    await finish('corrige o login', 'done')
    await act(async () => pill()!.click())
    await type(field()!, 'segue')
    await act(async () => (document.querySelector('.work-row .steps__ask-send') as HTMLButtonElement).click())
    expect(seen).toEqual(['follow:r1:segue'])
    await act(async () => pill()!.click())
    await type(field()!, 'não era isto')
    await key(field()!, 'Escape')
    expect(seen).toEqual(['follow:r1:segue'])
    expect(field()).toBeNull()
  })

  it('is there for every way a reply ends that has somewhere to go on', async () => {
    for (const status of ['done', 'stopped', 'interrupted', 'failed', 'paused'] as RunStatus[]) {
      await finish('corrige o login', status)
      expect(pill(), status).not.toBeNull()
      expect(text()).toContain('Terminadas')
      await act(() => root.unmount())
      root = createRoot(document.getElementById('root')!)
    }
  })

  it('is not there on a reply stopped at the limit, which has nothing to go on with', async () => {
    await finish('corrige o login', 'limit_reached')
    expect(pill()).toBeNull()
    expect(document.querySelector('.work-row--done')).not.toBeNull()
  })
})
