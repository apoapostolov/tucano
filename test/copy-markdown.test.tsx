// A finished agent reply's own Markdown, on the clipboard: the glyph in its footer, immediately left
// of the reply-to glyph, copies message.text itself, not the words the screen drew from it.
import { readFileSync } from 'node:fs'
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Agent, Conversation, Message, Person } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'
import { setLang } from '../src/shared/lang'

setLang('en')

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, {
  window,
  document,
  HTMLElement: window.HTMLElement,
  Node: window.Node,
  IS_REACT_ACT_ENVIRONMENT: true,
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  requestAnimationFrame: (f: () => void) => setTimeout(f, 0) as unknown as number,
  cancelAnimationFrame: (id: number) => clearTimeout(id),
  ResizeObserver: class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
})
Object.assign(window, { innerWidth: 1280, innerHeight: 800, tucano: {} })

const written = vi.hoisted(() => [] as string[])
const toastText = vi.hoisted(() => [] as string[])
let fake: State
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: State) => T): T => select(fake),
    getState: () => fake,
    setTab: vi.fn(),
    navigate: vi.fn(),
    voiceStatus: vi.fn(() => new Promise(() => {})),
    toast: (text: string): void => void toastText.push(text),
    setReplyTo: vi.fn()
  }
})
vi.mock('open-bot-avatar/dom', () => ({ mountAvatar: () => new Proxy({}, { get: () => () => {} }) }))

let failWrite = false
Object.defineProperty(globalThis.navigator, 'clipboard', {
  configurable: true,
  value: {
    writeText: (text: string): Promise<void> => {
      written.push(text)
      return failWrite ? Promise.reject(new Error('clipboard refused')) : Promise.resolve()
    }
  }
})

const realStore = await vi.importActual<typeof import('../src/renderer/src/store')>('../src/renderer/src/store')
const { createRoot } = await import('react-dom/client')
const { CopyMarkdown, ReplyFooter, ConversationView } = await import('../src/renderer/src/components/Conversation')
const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')
const source = readFileSync(new URL('../src/renderer/src/components/Conversation.tsx', import.meta.url), 'utf8')

const MD = '## Hoje\n\n- um item\n- outro, com **negrito**\n\n```ts\nconst a = 1\n```'
const ana: Person = { id: 'ana', name: 'Ana', role: 'owner', about: '' }
const lia = (): Agent => ({ id: 'a1', name: 'Lia', handle: 'lia', role: 'Engineering', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 0, used: 0, grants: {}, memory: 'auto', computer: false, archived: false })
const channel: Conversation = { id: 'c1', kind: 'channel', name: 'engineering', members: ['a1'] }
const message = (text: string, status: 'working' | 'done' | 'stopped' = 'done', kind: 'agent' | 'person' = 'agent'): Message => ({
  id: 'm1',
  conversationId: 'c1',
  author: { kind, id: kind === 'agent' ? 'a1' : 'ana' },
  text,
  at: 2,
  run: status === 'done' ? { status, steps: [], receipt: { model: 'sonnet', inputTokens: 10, cacheReadTokens: 0, outputTokens: 10, ms: 1 } } : { status, steps: [] }
})

let root: Root
beforeEach(() => {
  setLang('en')
  written.length = 0
  toastText.length = 0
  failWrite = false
  vi.useFakeTimers()
  fake = {
    ...realStore.getState(),
    ready: true,
    people: [ana],
    you: 'ana',
    agents: [lia()],
    conversations: [channel],
    messages: { c1: [] },
    inbox: { approvals: [], questions: [] }
  } as State
  document.getElementById('root')!.innerHTML = ''
  root = createRoot(document.getElementById('root')!)
})
afterEach(() => {
  act(() => root.unmount())
  vi.useRealTimers()
})

const draw = async (element: React.ReactElement): Promise<void> => {
  await act(async () => root.render(element))
}
const copyButton = (): HTMLElement | null => document.querySelector('.msg__copy')

describe('Copy as Markdown', () => {
  it('copies the answer’s own Markdown, and says so on the glyph for a moment', async () => {
    await draw(<CopyMarkdown text={MD} />)
    const button = copyButton()!
    expect(button).toBeTruthy()
    expect(button.getAttribute('title')).toBe('Copy as Markdown')
    expect(button.getAttribute('aria-label')).toBe('Copy as Markdown')
    expect(button.querySelector('svg rect')).toBeTruthy() // the copy glyph, not the check
    expect(button.textContent).toBe('') // a glyph, no label beside it
    await act(async () => button.click())
    expect(written).toEqual([MD]) // the source, unmangled by the page
    expect(copyButton()!.className).toContain('is-copied')
    expect(copyButton()!.querySelector('svg path')?.getAttribute('d')).toBe('m5 12 5 5L20 7')
    expect(toastText).toEqual([])
    await act(async () => vi.advanceTimersByTime(1599))
    expect(copyButton()!.className).toContain('is-copied')
    await act(async () => vi.advanceTimersByTime(1))
    expect(copyButton()!.className).not.toContain('is-copied')
    expect(copyButton()!.querySelector('svg rect')).toBeTruthy()
  })

  it('says so in the existing toast when the clipboard refuses the write, and shows no check', async () => {
    failWrite = true
    await draw(<CopyMarkdown text={MD} />)
    await act(async () => copyButton()!.click())
    expect(written).toEqual([MD])
    expect(toastText).toEqual(['Could not copy the reply.'])
    expect(copyButton()!.className).not.toContain('is-copied')
    expect(copyButton()!.querySelector('svg rect')).toBeTruthy()
    await act(async () => vi.advanceTimersByTime(1600))
    expect(copyButton()!.className).not.toContain('is-copied')
  })

  it('draws once, only under a finished agent reply with words', async () => {
    await draw(<ReplyFooter message={message(MD)} />)
    expect(document.querySelectorAll('.msg__copy')).toHaveLength(1)
    expect(document.querySelectorAll('.msg__replyto')).toHaveLength(1)

    for (const [label, m] of [
      ['still writing', message('still writing', 'working')],
      ['no words', message('', 'done')],
      ['only whitespace', message('   \n  ', 'done')],
      ['not done', message(MD, 'stopped')],
      ['a person’s note', message(MD, 'done', 'person')]
    ] as const) {
      await draw(<ReplyFooter message={m} />)
      expect(document.querySelectorAll('.msg__copy'), label).toHaveLength(0)
    }

    fake = { ...fake, messages: { c1: [message(MD)] } } as State
    await draw(<ConversationView id="c1" />)
    expect(document.querySelectorAll('.msg__copy')).toHaveLength(1)
  })

  it('sits immediately before the reply glyph in the footer’s action group', async () => {
    const footer = source.slice(source.indexOf('export function ReplyFooter('), source.indexOf('function Steer('))
    const actions = footer.indexOf('<div className="msg__actions">')
    const copy = footer.indexOf('<CopyMarkdown text={message.text} />')
    const reply = footer.indexOf('<button\n            className={`msg__replyto')
    expect(actions).toBeGreaterThan(0)
    expect(copy).toBeGreaterThan(actions)
    expect(reply).toBeGreaterThan(copy)
    const between = footer.slice(copy + '<CopyMarkdown text={message.text} />'.length, reply)
    expect(between).not.toContain('<') // nothing rendered sits between the two glyphs
    expect(source.match(/<CopyMarkdown text=/g)!).toHaveLength(1) // once, in the footer

    await draw(<ReplyFooter message={message(MD)} />)
    const group = document.querySelector('.msg__meta > .msg__actions')!
    expect(group.children).toHaveLength(2)
    const [first, second] = Array.from(group.children) as HTMLElement[]
    expect(first!.className).toBe('msg__copy')
    expect(second!.className).toContain('msg__replyto')
  })

  it('stays a borderless dim glyph, and rides the footer’s own height', () => {
    expect(css).toMatch(/\.msg__copy\s*\{[^}]*color:\s*var\(--text-3\)/)
    expect(css).toMatch(/\.msg__copy\s*\{[^}]*border:\s*0/)
    expect(css).toMatch(/\.msg__copy:hover,[\s\S]{0,80}\.msg__copy\.is-copied\s*\{[^}]*color:\s*var\(--text\)/)
    expect(css).toMatch(/\.msg__meta \.msg__copy\s*\{[^}]*min-height:\s*0/)
    expect(css).toMatch(/\.msg__actions\s*\{[^}]*gap:\s*10px/)
    expect(css).toMatch(/@media \(pointer: coarse\)\s*\{\s*\.msg__copy\s*\{[^}]*min-width:\s*44px[^}]*min-height:\s*44px/)
    expect(css).toMatch(/\.msg__copy\s*\{[^}]*min-width:\s*32px[^}]*min-height:\s*32px/)
  })

  it('also gives the glyph to a stopped reply whose words came after a step came back', async () => {
    const withWork = message(MD, 'stopped')
    withWork.run = { status: 'stopped', steps: [{ id: 's1', label: 'Read the report', status: 'done' }] }
    await draw(<ReplyFooter message={withWork} />)
    expect(document.querySelectorAll('.msg__copy')).toHaveLength(1)

    const stillThinking = message(MD, 'stopped')
    stillThinking.run = { status: 'stopped', steps: [{ id: 's2', label: 'Thinking', status: 'done' }] }
    await draw(<ReplyFooter message={stillThinking} />)
    expect(document.querySelectorAll('.msg__copy')).toHaveLength(0)
  })
})
