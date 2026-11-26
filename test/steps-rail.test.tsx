// The line beside a run's steps stays a real button in both states: one click folds or reopens from
// wherever the person has scrolled, with no double-click and no way for the handle to disappear.
// Layout and computed colour belong to the built-app frames; here the behaviour is driven as a user
// would drive it, with real click events on the button.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { setLang } from '../src/shared/lang'
import type { Message, RunRound, Step } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Element: window.Element, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) })
Object.assign(document, { oninput: null })
Object.assign(window, { innerWidth: 1280, innerHeight: 800, tucano: {} })

const scrolled: { className: string; options?: unknown }[] = []
window.HTMLElement.prototype.scrollIntoView = function scrollIntoView(this: HTMLElement, options?: unknown) {
  scrolled.push({ className: this.className, options })
}
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
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: State) => T): T => select(fake),
    getState: () => fake,
    useLiveThoughtState: () => undefined,
    useLiveText: (m: Message) => m.text,
    stopRun: () => {},
    sendMessage: () => {}
  }
})

const { createRoot } = await import('react-dom/client')
const realStore = await vi.importActual<typeof import('../src/renderer/src/store')>('../src/renderer/src/store')
const { RunSteps } = await import('../src/renderer/src/components/Conversation')

const steps: Step[] = [
  { id: 's1', label: 'Read the skill', status: 'done', ms: 120 },
  { id: 's2', label: 'Ran the query', status: 'done', ms: 400 },
  { id: 's3', label: 'Wrote the file', status: 'done', ms: 90 }
]
const reply = (status: 'done' | 'working' = 'done'): Message => ({
  id: 'm1',
  conversationId: 'dm',
  author: { kind: 'agent', id: 'a1' },
  text: 'feito',
  at: Date.now() - 5000,
  run: { status, steps: status === 'working' ? steps.map((s, i) => (i === 2 ? { ...s, status: 'running' as const } : s)) : steps }
})
const round = (id: string): RunRound => ({ id, steps: [{ id: `${id}-s`, label: `read ${id}`, status: 'done', ms: 20 }], text: `${id} said` })

let root: Root
beforeAll(() => setLang('en'))
beforeEach(() => {
  scrolled.length = 0
  fake = { ...realStore.getState(), ready: true, settings: { ...realStore.getState().settings, stepsOpen: false } } as State
  document.getElementById('root')!.innerHTML = ''
  root = createRoot(document.getElementById('root')!)
})
afterEach(() => act(() => root.unmount()))

const mount = async (message: Message): Promise<void> => {
  await act(async () => void root.render(<RunSteps message={message} />))
}
const el = (sel: string): HTMLElement | null => document.querySelector(sel) as HTMLElement | null
const rails = (): HTMLElement[] => [...document.querySelectorAll('.steps__rail')] as HTMLElement[]
const openWithToggle = async (): Promise<void> => {
  await act(async () => el('.steps__toggle')!.click())
}
// A real mouse click carries detail 1; Enter and Space on a native button carry detail 0. linkedom
// has no MouseEvent, so the detail is set on a plain event, which is what React reads from it.
const fire = async (node: HTMLElement, type: string, detail: number): Promise<void> => {
  await act(async () => {
    const ev = new window.Event(type, { bubbles: true, cancelable: true })
    Object.defineProperty(ev, 'detail', { value: detail })
    node.dispatchEvent(ev)
  })
}
const mouse = (node: HTMLElement): Promise<void> => fire(node, 'click', 1)
const keyboard = (node: HTMLElement): Promise<void> => fire(node, 'click', 0)
const settled = async (): Promise<void> => {
  await act(async () => new Promise((ok) => setTimeout(ok, 5)))
}

describe('the rail beside a run’s steps', () => {
  it('is a real button on the line in both states, saying that a click folds or unfolds', async () => {
    await mount(reply())
    const folded = rails()[0]!
    expect(el('.steps__list')).toBeNull()
    expect(el('.steps__body')!.className).toContain('is-folded')
    expect(folded.tagName).toBe('BUTTON')
    expect(folded.getAttribute('aria-label')).toMatch(/click to unfold the steps/i)
    expect(folded.getAttribute('title')).toMatch(/click to unfold the steps/i)

    await openWithToggle()
    expect(el('.steps__list')).not.toBeNull()
    expect(rails()).toHaveLength(1)
    const open = rails()[0]!
    expect(open.tagName).toBe('BUTTON')
    expect(open.getAttribute('aria-label')).toMatch(/click to fold the steps/i)
    expect(open.getAttribute('title')).toMatch(/click to fold the steps/i)
    expect(el('.steps__body')!.contains(open)).toBe(true)
    expect(el('.steps__body')!.contains(el('.steps__list'))).toBe(true)
  })

  it('folds on one mouse click and reopens on the next, with no double-click', async () => {
    await mount(reply())
    await openWithToggle()
    await mouse(rails()[0]!)
    expect(el('.steps__list')).toBeNull()
    expect(rails()[0]!.getAttribute('aria-label')).toMatch(/unfold/i)

    await mouse(rails()[0]!)
    expect(el('.steps__list')).not.toBeNull()
    expect(el('.steps__list')!.querySelectorAll('.step')).toHaveLength(3)
    expect(rails()[0]!.getAttribute('aria-label')).toMatch(/fold the steps/i)
  })

  it('does not wait for a double-click', async () => {
    await mount(reply())
    await openWithToggle()
    await fire(rails()[0]!, 'dblclick', 2)
    expect(el('.steps__list')).not.toBeNull() // a dblclick by itself is not the activation
    await mouse(rails()[0]!)
    expect(el('.steps__list')).toBeNull() // one click is enough
  })

  it('toggles from the keyboard as well, because the handle is a button', async () => {
    await mount(reply())
    await openWithToggle()
    expect(rails()[0]!.tagName).toBe('BUTTON')
    await keyboard(rails()[0]!)
    expect(el('.steps__list')).toBeNull()
    await keyboard(rails()[0]!)
    expect(el('.steps__list')).not.toBeNull()
  })

  it('brings the folded and the reopened block into view, nearest', async () => {
    await mount(reply())
    await openWithToggle()
    await settled()
    scrolled.length = 0
    await mouse(rails()[0]!)
    await settled()
    expect(scrolled.at(-1)).toEqual({ className: expect.stringContaining('steps'), options: { block: 'nearest' } })

    await mouse(rails()[0]!)
    await settled()
    expect(scrolled.at(-1)).toEqual({ className: expect.stringContaining('steps'), options: { block: 'nearest' } })
  })

  it('still toggles when the DOM shim has no scrollIntoView', async () => {
    const proto = window.HTMLElement.prototype as unknown as { scrollIntoView?: (options?: unknown) => void }
    const original = proto.scrollIntoView
    delete proto.scrollIntoView
    try {
      await mount(reply())
      await openWithToggle()
      await settled()
      expect(el('.steps__list')).not.toBeNull()
      await mouse(rails()[0]!)
      expect(el('.steps__list')).toBeNull()
    } finally {
      proto.scrollIntoView = original
    }
  })

  it('gives each Follow round its own rail and its own fold', async () => {
    const m = reply()
    await act(async () => void root.render(
      <>
        <RunSteps message={m} round={round('first')} />
        <RunSteps message={m} round={round('second')} />
      </>
    ))
    expect(rails()).toHaveLength(2)
    await act(async () => {
      const toggles = [...document.querySelectorAll('.steps__toggle')] as HTMLElement[]
      toggles[0]!.click()
      toggles[1]!.click()
    })
    expect(document.querySelectorAll('.steps__list')).toHaveLength(2)

    await mouse(rails()[0]!)
    expect(rails()).toHaveLength(2) // the folded round keeps its handle
    expect(document.querySelectorAll('.steps__list')).toHaveLength(1)
    const first = document.querySelectorAll('.steps')[0]!
    const second = document.querySelectorAll('.steps')[1]!
    expect(first.className).not.toContain('is-open')
    expect(second.className).toContain('is-open')

    await mouse(rails()[1]!)
    expect(document.querySelectorAll('.steps__list')).toHaveLength(0)
  })

  it('lets a still-working run fold without losing its line or its live summary', async () => {
    fake = { ...fake, settings: { ...fake.settings, stepsOpen: true } } as State
    await mount(reply('working'))
    expect(el('.steps__list')).not.toBeNull()
    expect(rails()[0]!.getAttribute('aria-label')).toMatch(/fold the steps/i)
    await mouse(rails()[0]!)
    expect(el('.steps__list')).toBeNull()
    expect(rails()[0]!).not.toBeNull()
    expect(el('.steps__toggle')!.textContent).toContain('Wrote the file')
  })
})
