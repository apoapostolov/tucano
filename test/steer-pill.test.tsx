// The steer pill, in the row a working reply keeps under its chain beside Pause: it opens a field,
// and what the person writes goes to that reply (send mode `steer`) instead of becoming a message of
// its own. The chain then says so in their words — as what it is, not as a tool call.
// The row is `steps__hold` and both pills in it are `steps__ask-pill`; the steer one is the only one
// that opens a field, so it is the one carrying `aria-expanded`.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Message, Step } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
Object.assign(document, { oninput: null })
Object.assign(window, { innerWidth: 1280, innerHeight: 800 })
Object.assign(globalThis, {
  requestAnimationFrame: (f: () => void) => setTimeout(f, 0) as unknown as number,
  cancelAnimationFrame: (id: number) => clearTimeout(id),
  ResizeObserver: class {
    observe(): void {}
    disconnect(): void {}
  }
})

// What the sub-button sends: the composer's call, with the mode and the run it was written for.
const sent = vi.hoisted(() => [] as { conversationId: string; text: string; mode?: string; replyId?: string }[])
const stopped = vi.hoisted(() => [] as string[])
// The app's own state, so a selector that reads a setting reads the one the app ships with.
let fake: State
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: State) => T): T => select(fake),
    // The app's own order (store.ts): reply, then the mode, then the reply the steer belongs to.
    sendMessage: (conversationId: string, text: string, _images?: unknown, _threadId?: string, _files?: unknown, _reply?: unknown, mode?: string, steerTo?: string): void => {
      sent.push({ conversationId, text, mode, replyId: steerTo })
    },
    stopRun: (id: string): void => {
      stopped.push(id)
    }
  }
})

const { createRoot } = await import('react-dom/client')
const { getState } = await import('../src/renderer/src/store')
const { RunBlock } = await import('../src/renderer/src/components/Conversation')

const step = (id: string, extra: Partial<Step> = {}): Step => ({ id, label: `read ${id}.ts`, status: 'done', ms: 120, ...extra })

const reply = (status: Message['run'] extends undefined ? never : NonNullable<Message['run']>['status'], steps: Step[] = [step('a'), step('b')]): Message => ({
  id: 'm1',
  conversationId: 'c1',
  author: { kind: 'agent', id: 'a1' },
  text: 'pronto',
  at: Date.now(),
  run: { status, steps } as NonNullable<Message['run']>
})

let root: Root
beforeEach(() => {
  sent.length = 0
  stopped.length = 0
  fake = { ...getState() }
  root = createRoot(document.getElementById('root')!)
})
afterEach(() => act(() => root.unmount()))

const draw = async (message: Message): Promise<void> => {
  await act(async () => root.render(<RunBlock message={message} />))
}
const pill = (): HTMLElement | null => document.querySelector('.steps__ask-pill[aria-expanded]')
const field = (): HTMLTextAreaElement | null => document.querySelector('.steps__ask-note textarea')
const buttons = (): HTMLElement[] => [...document.querySelectorAll('.steps__ask-row button')] as HTMLElement[]
// Typing as React sees it: the value set past React's own tracker, then the input event.
const type = async (text: string): Promise<void> => {
  const ta = field()!
  let proto: object | null = Object.getPrototypeOf(ta)
  let set: ((v: string) => void) | undefined
  while (proto && !set) {
    set = Object.getOwnPropertyDescriptor(proto, 'value')?.set
    proto = Object.getPrototypeOf(proto)
  }
  await act(async () => {
    set!.call(ta, text)
    ta.dispatchEvent(new window.Event('input', { bubbles: true }))
  })
}
// linkedom has no KeyboardEvent: a keydown with the fields React reads, on the event itself.
const key = async (k: string, extra: { ctrlKey?: boolean } = {}): Promise<void> => {
  const ev = new window.Event('keydown', { bubbles: true }) as unknown as KeyboardEvent
  Object.defineProperty(ev, 'key', { value: k })
  Object.defineProperty(ev, 'ctrlKey', { value: !!extra.ctrlKey })
  await act(async () => void field()!.dispatchEvent(ev))
}

describe('the steer pill', () => {
  it('is one pill in the row under the chain of a reply at work, not a control inside its header', async () => {
    await draw(reply('working'))
    const hold = document.querySelector('.steps__hold')!
    const steer = pill()!
    expect(hold.contains(steer)).toBe(true) // beside Pause, in the row the reply keeps for itself
    expect(steer.textContent?.trim()).toBe('Orientar')
    expect(steer.getAttribute('title')).toMatch(/Dizer como seguir|Say how to go on/)
    expect(document.querySelectorAll('.steps__hold')).toHaveLength(1) // one row, not one row per control
    expect(document.querySelectorAll('.steps__ask-pill[aria-expanded]')).toHaveLength(1) // not a second steer control
    expect(document.querySelectorAll('.steps__stop')).toHaveLength(1) // Stop stays the stop action
    // The header keeps Stop alone: a pill inside it would also fire the header's own toggle.
    expect(document.querySelector('.steps__toggle')!.querySelector('.steps__ask-pill')).toBeNull()
    expect(document.querySelector('.steps__list')).not.toBeNull()
    expect(document.querySelector('.steps__ask-note')).toBeNull() // no field until it is opened
    // The row sits inside the block, under the reasoning and above the reply's own footer.
    expect(hold.parentElement!.className).toContain('steps')
    await act(async () => steer.click())
    expect(document.querySelector('.steps__ask')).not.toBeNull() // the field, in its own box
    expect(stopped).toHaveLength(0) // steering did not stop the reply
    expect(document.querySelector('.steps__list')).not.toBeNull() // and did not toggle the steps
    await draw(reply('done'))
    expect(pill()).toBeNull()
  })

  it('opens a field, and sends nothing until something is written', async () => {
    await draw(reply('working'))
    await act(async () => pill()!.click())
    expect(field()).not.toBeNull()
    expect(buttons()[0]!.hasAttribute('disabled')).toBe(true) // empty: nothing to send
    expect(sent).toHaveLength(0) // and opening it sent nothing
    await type('   ')
    expect(buttons()[0]!.hasAttribute('disabled')).toBe(true) // only spaces is still nothing
    expect(sent).toHaveLength(0)
  })

  it('sends what was written as a steer of the reply that is running, and closes the field', async () => {
    await draw(reply('working'))
    await act(async () => pill()!.click())
    await type('só as abertas, não mexa no resto')
    await act(async () => buttons()[0]!.click())
    expect(sent).toEqual([{ conversationId: 'c1', text: 'só as abertas, não mexa no resto', mode: 'steer', replyId: 'm1' }])
    expect(field()).toBeNull() // closed on sending
  })

  it('Ctrl+Enter sends it too, and Escape closes it without sending', async () => {
    await draw(reply('working'))
    await act(async () => pill()!.click())
    await type('pelo caminho mais curto')
    await key('Enter', { ctrlKey: true })
    expect(sent).toEqual([{ conversationId: 'c1', text: 'pelo caminho mais curto', mode: 'steer', replyId: 'm1' }])
    expect(field()).toBeNull()
    await act(async () => pill()!.click())
    await type('isto não vai')
    await key('Escape')
    expect(field()).toBeNull()
    expect(sent).toHaveLength(1) // the escape sent nothing
  })

  it("a steer in the chain is a row of its own, carrying the person's words whole", async () => {
    // What `steerIn` puts in the chain the moment the person sends it; the words are the row's content.
    const steer: Step = { id: 's1', kind: 'steer', label: 'Orientação', input: 'só as abertas, e o resto como está', status: 'running' }
    await draw(reply('working', [step('a'), steer])) // open while it works: the rows are there to read
    const rows = [...document.querySelectorAll('.step')]
    expect(rows).toHaveLength(2)
    const row = rows[1]!
    expect(row.className).toBe('step step--steer step--why step--running')
    expect(row.querySelector('.step__label')?.textContent).toBe('Orientação')
    // The row a call gets: its content sits in the call's own argument box, and the whole of it is a
    // click away, so what the person steered is readable in the chain without becoming a prompt.
    const said = row.querySelector('.step__input')
    expect(said?.textContent).toContain('só as abertas')
    expect(row.querySelector('.step__icon .spinner')).not.toBeNull() // still waiting for its next call
    await act(async () => said!.dispatchEvent(new window.Event('click', { bubbles: true })))
    expect(row.querySelector('.step__input')?.className).toContain('is-whole')
  })

  it('a steer the reply never read says so, in its own row', async () => {
    const steer: Step = { id: 's1', kind: 'steer', label: 'Orientação', input: 'só as abertas', error: 'A resposta terminou antes de ler isto', status: 'error' }
    await draw(reply('done', [step('a'), steer]))
    await act(async () => document.querySelector<HTMLElement>('.steps__toggle')!.click())
    const row = [...document.querySelectorAll('.step')][1]!
    expect(row.className).toContain('step--error')
    expect(row.textContent).toContain('só as abertas')
    expect(row.textContent).toContain('A resposta terminou antes de ler isto')
  })
})
