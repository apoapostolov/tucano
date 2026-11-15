import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Message } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

let fake: State
let thought = ''
vi.mock('../src/renderer/src/store', async original => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return { ...real, useStore: <T,>(select: (state: State) => T): T => select(fake), useLiveThoughtState: () => ({ text: thought, start: 0 }) }
})
const { window, document } = parseHTML('<html><body><div id="root"></div></body></html>')
const frames = new Map<number, FrameRequestCallback>()
let sequence = 0
let growth = 0
Object.assign(globalThis, {
  window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true,
  requestAnimationFrame: (callback: FrameRequestCallback) => { frames.set(++sequence, callback); return sequence },
  cancelAnimationFrame: (id: number) => frames.delete(id),
  ResizeObserver: class { observe(): void {} disconnect(): void {} }
})
Object.defineProperty(window.HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 500 })
Object.defineProperty(window.HTMLElement.prototype, 'scrollHeight', { configurable: true, get: () => 5000 })
window.HTMLElement.prototype.getBoundingClientRect = function () {
  const list = document.querySelector<HTMLElement>('.messages')
  const top = this.classList.contains('messages') ? 20 : 1020 + growth - (list?.scrollTop ?? 0)
  return { top, bottom: top + 500, left: 0, right: 700, width: 700, height: 500, x: 0, y: top, toJSON: () => ({}) }
}
document.elementFromPoint = () => document.querySelector('.system-line')!
const { createRoot } = await import('react-dom/client')
const { getState } = await vi.importActual<typeof import('../src/renderer/src/store')>('../src/renderer/src/store')
const { MessageList, Thought } = await import('../src/renderer/src/components/Conversation')
let root: Root
const message: Message = { id: 'anchor', conversationId: 'channel', author: { kind: 'system' }, text: 'Reading this line', at: 1 }
beforeEach(() => {
  fake = { ...getState(), messages: { channel: [message] } }
  frames.clear()
  growth = 0
  thought = 'Initial reasoning. '
  root = createRoot(document.getElementById('root')!)
})

it('keeps an internal reading position through streamed renders and resumes only at the end', async () => {
  fake.settings = { ...fake.settings, showThinking: true }
  const render = async (): Promise<void> => { await act(async () => root.render(<Thought message={message} working />)) }
  await render()
  const block = document.querySelector<HTMLElement>('.thought')!
  const scroll = async (top: number): Promise<void> => {
    block.scrollTop = top
    await act(async () => { block.dispatchEvent(new window.Event('scroll')) })
  }
  // Only 14 px above the end still expresses the intention to read back.
  await scroll(4486)
  // Layout changes can reset a native offset without any user scroll. Restore the saved place.
  block.scrollTop = 0
  for (let chunk = 0; chunk < 10; chunk++) {
    thought += 'New reasoning below the reading line. '
    await render()
    expect(block.scrollTop).toBe(4486)
    // Delayed notifications of a programmatic write must not change follow intent.
    await act(async () => { block.dispatchEvent(new window.Event('scroll')) })
  }
  await scroll(4500)
  thought += 'Follow this new reasoning. '
  await render()
  expect(block.scrollTop).toBe(5000)
})
afterEach(() => act(() => root.unmount()))
const tick = async (): Promise<void> => {
  await act(async () => {
    const pending = [...frames.values()]
    frames.clear()
    pending.forEach(callback => callback(performance.now()))
  })
}
it('compensates each layout change once and stays still between changes', async () => {
  await act(async () => root.render(<MessageList messages={[message]} conversationId="channel" />))
  const list = document.querySelector<HTMLElement>('.messages')!
  list.scrollTop = 1000
  await act(async () => { list.dispatchEvent(new window.Event('scroll')) })
  for (const amount of [80, -40, 120]) {
    growth += amount
    for (let frame = 0; frame < 10; frame++) {
      await tick()
      expect(list.scrollTop).toBe(1000 + growth)
    }
  }
  // Chromium can preserve the line before our frame runs; do not compensate twice.
  growth += 60
  list.scrollTop += 60
  await tick()
  expect(list.scrollTop).toBe(1000 + growth)
})
