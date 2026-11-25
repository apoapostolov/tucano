// The steer: a pill in the working reply's footer, the row a reply that stopped carries Continue and
// Try again in, under everything the reply drew. It opens the same field "Try with instructions"
// opens, and what the person writes goes to that reply (send mode `steer`) instead of becoming a
// message of its own. The chain then says so in their words — as what it is, not as a tool call.
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
    sendMessage: (conversationId: string, text: string, _images?: unknown, _threadId?: string, _files?: unknown, mode?: string, replyId?: string): void => {
      sent.push({ conversationId, text, mode, replyId })
    },
    stopRun: (id: string): void => {
      stopped.push(id)
    }
  }
})

const { createRoot } = await import('react-dom/client')
const { getState } = await import('../src/renderer/src/store')
const { RunBlock, ReplyFooter } = await import('../src/renderer/src/components/Conversation')

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

// The reply's body as the app draws it: what it did, then its footer.
const draw = async (message: Message): Promise<void> => {
  await act(async () =>
    root.render(
      <>
        <RunBlock message={message} />
        <ReplyFooter message={message} />
      </>
    )
  )
}
const footer = async (message: Message): Promise<void> => {
  await act(async () => root.render(<ReplyFooter message={message} />))
}
const pill = (): HTMLElement | null => document.querySelector('.steps__steer-pill')
const field = (): HTMLTextAreaElement | null => document.querySelector('.retry-note textarea')
const buttons = (): HTMLElement[] => [...document.querySelectorAll('.retry-note__row button')] as HTMLElement[]
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
  it('is the working reply’s footer, in the one row every reply ends with', async () => {
    await draw(reply('working'))
    const row = document.querySelector('.msg__meta')!
    const steer = row.querySelector<HTMLElement>('.steps__steer-pill')!
    expect(steer.textContent?.trim()).toBe('Orientar')
    expect(steer.getAttribute('title')).toMatch(/Dizer como seguir|Say how to go on/)
    expect(document.querySelectorAll('.msg__meta')).toHaveLength(1) // one footer, not one row per control
    expect(document.querySelectorAll('.steps__steer-pill')).toHaveLength(1) // not a second steer control
    expect(document.querySelectorAll('.steps__stop')).toHaveLength(1) // Stop stays the stop action
    // It carries the footer's pill, and it is not part of the chain: the chain keeps Stop alone, and
    // the steer is not drawn between the steps and what the reply thought.
    expect(steer.className).toContain('steps__ask-pill')
    expect(document.querySelector('.steps .steps__steer-pill')).toBeNull()
    expect(document.querySelector('.steps__list')).not.toBeNull()
    expect(field()).toBeNull() // no field until it is opened
    await act(async () => steer.click())
    // Opened, the field takes the line under the pill, in the same footer row.
    expect(document.querySelector('.msg__meta .retry-note')).not.toBeNull()
    expect(field()!.parentElement!.className).toBe('retry-note')
    expect(stopped).toHaveLength(0) // steering did not stop the reply
    expect(document.querySelector('.steps__list')).not.toBeNull() // and did not toggle the steps
    // Once the reply has ended the chain carries no pill: on this head the pill is drawn in the reply's
    // footer, where it reads Follow (follow-pill.test.tsx: what it does there, and what it sends).
    await draw(reply('done'))
    expect(document.querySelector('.steps .steps__steer-pill')).toBeNull()
    expect(pill()!.textContent?.trim()).toMatch(/^(Seguir|Follow)$/)
  })

  it('is the same row and the same field a reply that stopped opens its ways back in', async () => {
    // One footer for every reply: the pill, the row, and the note under it are the ones Continue and
    // Try with instructions use, so the two states read as the same band under the reply.
    await footer(reply('stopped'))
    const row = document.querySelector('.msg__meta')!
    const pills = [...row.querySelectorAll<HTMLElement>('button.retry')]
    expect(pills.length).toBeGreaterThanOrEqual(2) // Continue and the two ways back, in this one row
    for (const p of pills) expect(p.className).toContain('steps__ask-pill')
    const withNote = pills[pills.length - 1]! // "Try with instructions": the one that opens a note
    await act(async () => withNote.click())
    const note = document.querySelector('.msg__meta .retry-note')!
    expect(note.querySelector('textarea')).not.toBeNull()
    expect(note.querySelector('.retry-note__row')).not.toBeNull()
    // The same note the steer opens, in the same place in the same row.
    await footer(reply('working'))
    await act(async () => pill()!.click())
    expect(document.querySelector('.msg__meta .retry-note')).not.toBeNull()
  })

  it('is there from the first second, before the reply has written a word', async () => {
    // A reply that just started has nothing to say yet and a whole run ahead of it: the way to direct
    // it is in its footer from the start, not after the first sentence arrives.
    const started: Message = { ...reply('working'), text: '' }
    await footer(started)
    expect(pill()).not.toBeNull()
    expect(document.querySelectorAll('.msg__meta')).toHaveLength(1)
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
