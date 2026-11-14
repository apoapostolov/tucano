// The pause, beside the steer pill on a reply that is at work: the reply keeps its session and its
// text and starts its next step when it is let go (src/core/hold.ts). Not a stop: nothing it did is
// undone, which is what makes waiting out a quota window possible without another model taking over.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Message, Step } from '../src/shared/types'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
Object.assign(document, { oninput: null })
Object.assign(window, { innerWidth: 1280, innerHeight: 800 })
window.HTMLElement.prototype.scrollTo = () => {}
Object.assign(globalThis, {
  requestAnimationFrame: (f: () => void) => setTimeout(f, 0) as unknown as number,
  cancelAnimationFrame: (id: number) => clearTimeout(id),
  ResizeObserver: class {
    observe(): void {}
    disconnect(): void {}
  }
})

// What the two buttons call, and with which reply.
const called = vi.hoisted(() => [] as { what: string; messageId: string }[])
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: unknown) => T): T => select({ settings: {} }),
    useLiveThought: (): string => '',
    pauseRun: (messageId: string): void => {
      called.push({ what: 'pause', messageId })
    },
    resumeRun: (messageId: string): void => {
      called.push({ what: 'resume', messageId })
    },
    stopRun: (): void => {}
  }
})

const { createRoot } = await import('react-dom/client')
const { RunSteps } = await import('../src/renderer/src/components/Conversation')

const step = (id: string): Step => ({ id, label: `read ${id}.ts`, status: 'done', ms: 120 })
const reply = (run: NonNullable<Message['run']>): Message => ({ id: 'm1', conversationId: 'c1', author: { kind: 'agent', id: 'a1' }, text: 'pronto', at: Date.now(), run })
const withSteps = (run: Partial<NonNullable<Message['run']>>): Message => reply({ status: 'working', steps: [step('a')], ...run } as NonNullable<Message['run']>)

let root: Root
beforeEach(() => {
  called.length = 0
  root = createRoot(document.getElementById('root')!)
})
afterEach(() => act(() => root.unmount()))

const draw = async (message: Message): Promise<void> => {
  await act(async () => root.render(<RunSteps message={message} />))
}
const hold = (): HTMLElement | null => document.querySelector('.steps__hold')
const button = (): HTMLButtonElement | null => document.querySelector('.steps__hold .steps__ask-pill')

describe('the pause beside the steer pill', () => {
  it('is beside the steer pill on a reply that is at work, and asks for the pause', async () => {
    await draw(withSteps({}))
    expect(hold()).not.toBeNull()
    expect(document.querySelector('.steps__hold .steps__ask')).not.toBeNull() // the steer pill, in the same row
    const b = button()!
    expect(b.disabled).toBe(false)
    expect(b.textContent).toMatch(/Pausar|Pause/)
    await act(async () => b.click())
    expect(called).toEqual([{ what: 'pause', messageId: 'm1' }])
  })

  it('says it is pausing while it waits for the step it is in to end, and cannot be asked twice', async () => {
    await draw(withSteps({ held: true }))
    const b = button()!
    expect(b.disabled).toBe(true)
    expect(b.textContent).toMatch(/Pausando|Pausing/)
  })

  it('reads as resume once the reply is held, and lets it go on', async () => {
    await draw(withSteps({ status: 'paused', held: true }))
    const b = button()!
    expect(b.disabled).toBe(false)
    expect(b.textContent).toMatch(/Retomar|Resume/)
    await act(async () => b.click())
    expect(called).toEqual([{ what: 'resume', messageId: 'm1' }])
  })

  it('is nothing at all once the reply has ended', async () => {
    await draw(withSteps({ status: 'done' }))
    expect(hold()).toBeNull()
  })
})
