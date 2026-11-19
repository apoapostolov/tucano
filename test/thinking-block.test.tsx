// The block that shows the model's thinking follows the reply it belongs to: the reasoning whole,
// while it thinks and after it stops, with nothing over it — no label line and no fold, since the
// text is the point. A cursor on the line it is writing says it is still arriving, and it stays out
// of the way of what the reply offers at its bottom.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Message, Settings } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<html><body><div id="root"></div></body></html>')
window.Element.prototype.scrollTo = () => {} // the block keeps itself at the last line; linkedom has no scrolling
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })

let fake: Pick<State, 'settings'>
let thought: string | undefined
vi.mock('../src/renderer/src/store', () => ({ useStore: (select: (s: unknown) => unknown) => select(fake), useLiveThoughtState: () => thought === undefined ? undefined : { text: thought, start: 0 } }))

const { createRoot } = await import('react-dom/client')
const { Thought } = await import('../src/renderer/src/components/Conversation')

const message: Message = { id: 'm1', conversationId: 'dm', author: { kind: 'agent', id: 'a1' }, text: '', at: 1 }
let root: ReturnType<typeof createRoot>

const draw = async (working: boolean): Promise<void> => {
  await act(async () => root.render(<Thought message={message} working={working} />))
}
const block = (): Element | null => document.querySelector('.thought')

beforeEach(() => {
  fake = { settings: { showThinking: true } as Settings }
  thought = 'o pedido tem duas partes.\nprimeiro a conta.'
  root = createRoot(document.getElementById('root')!)
})
afterEach(async () => {
  await act(async () => root.unmount())
})

describe('the thinking block', () => {
  it('is the reasoning alone while it arrives: no label line, no fold, and a cursor on the line it is writing', async () => {
    await draw(true)
    expect(block()!.className).toContain('is-working')
    expect(document.querySelector('.thought__text')!.textContent).toContain('primeiro a conta.')
    expect(document.querySelector('.thought__caret')).not.toBeNull()
    // Nothing to click and nothing to read over the text: the header, its label and its chevron are gone.
    expect(document.querySelector('.thought__head')).toBeNull()
    expect(document.querySelector('.thought__label')).toBeNull()
    expect(block()!.querySelector('button')).toBeNull()
    expect(block()!.textContent).not.toContain('Pensando')
  })

  it('keeps the whole of it once the reply is over, with no cursor and nothing folded away', async () => {
    await draw(false)
    expect(block()!.className).not.toContain('is-working')
    expect(block()!.className).not.toContain('is-open')
    expect(document.querySelector('.thought__text')!.textContent).toContain('o pedido tem duas partes.')
    expect(document.querySelector('.thought__caret')).toBeNull()
    expect(block()!.textContent).not.toContain('Pensou')
  })

  it('is nothing at all while it has thought nothing, or with the switch off', async () => {
    await draw(true)
    thought = undefined
    await draw(true)
    expect(block()).toBeNull()
    thought = 'algo'
    fake = { settings: { showThinking: false } as Settings }
    await draw(true)
    expect(block()).toBeNull()
  })
})
