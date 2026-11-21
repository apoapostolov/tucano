// The strip a scrolling surface uses for its sections: it names the groups that were really drawn, in
// the order they read, sticks under whatever header that surface has, follows the reading position,
// moves in 280 ms with an interruptible ease, and moves at once for a keyboard activation or a
// reduced-motion preference. The modal case is the one here: the box is not `.page__scroll`.
import { parseHTML } from 'linkedom'
import { act, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Root } from 'react-dom/client'
import { setLang } from '../src/shared/lang'
import { SectionStrip } from '../src/renderer/src/components/SectionStrip'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
let focus: HTMLElement | null = null
let reduced = false
let sequence = 0
const frames = new Map<number, FrameRequestCallback>()
Object.assign(window, { matchMedia: () => ({ matches: reduced }) })
// linkedom has no computed styles: what the strip asks for (does this box scroll?) is set inline here.
Object.assign(window, {
  getComputedStyle: (element: HTMLElement) => ({ overflowY: element.style?.overflowY || '' })
})
Object.assign(globalThis, {
  requestAnimationFrame: (callback: FrameRequestCallback) => { frames.set(++sequence, callback); return sequence },
  cancelAnimationFrame: (id: number) => { frames.delete(id) },
  ResizeObserver: class { observe(): void {} disconnect(): void {} }
})
const STRIP = 36
const BOX_TOP = 84
const GROUP_TOP = 240
const GROUP_STRIDE = 280
const VIEW = 600
const CONTENT = 1800
const offsets = new WeakMap<HTMLElement, number>()
Object.defineProperty(window.HTMLElement.prototype, 'scrollTop', {
  configurable: true,
  get() { return offsets.get(this as unknown as HTMLElement) ?? 0 },
  set(value: number) { offsets.set(this as unknown as HTMLElement, value) }
})
Object.defineProperty(window.HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return VIEW } })
Object.defineProperty(window.HTMLElement.prototype, 'scrollHeight', { configurable: true, get() { return CONTENT } })
window.HTMLElement.prototype.focus = function () { focus = this as unknown as HTMLElement }
// The box scrolls (so the strip finds it), the strip sits at the box's top once scrolled, and each
// group stands below the one above it.
window.HTMLElement.prototype.getBoundingClientRect = function () {
  const element = this as unknown as HTMLElement
  const box = document.querySelector<HTMLElement>('.wk-settings')
  const scrolled = box?.scrollTop || 0
  const groups = [...document.querySelectorAll('[data-settings-section]')]
  const index = groups.indexOf(element)
  if (index >= 0) {
    const top = GROUP_TOP + index * GROUP_STRIDE - scrolled
    return { top, bottom: top + 240, left: 0, right: 500, width: 500, height: 240, x: 0, y: top, toJSON: () => ({}) }
  }
  if (element.classList.contains('wk-settings')) {
    return { top: BOX_TOP, bottom: BOX_TOP + VIEW, left: 0, right: 500, width: 500, height: VIEW, x: 0, y: BOX_TOP, toJSON: () => ({}) }
  }
  if (element.classList.contains('settings-sections')) {
    const top = BOX_TOP + 22 - Math.min(22, scrolled)
    return { top, bottom: top + STRIP, left: 0, right: 500, width: 500, height: STRIP, x: 0, y: top, toJSON: () => ({}) }
  }
  return { top: BOX_TOP, bottom: BOX_TOP + 40, left: 0, right: 500, width: 500, height: 40, x: 0, y: BOX_TOP, toJSON: () => ({}) }
}
const { createRoot } = await import('react-dom/client')

const SECTIONS = [
  { id: 'wiki-curator', label: 'The curator' },
  { id: 'wiki-resolver', label: 'Resolver' },
  { id: 'wiki-folder', label: 'The folder' },
  { id: 'wiki-import', label: 'Bring what you already have' }
]
let root: Root
let skipped: string | null = null

function Harness(): ReactNode {
  return (
    <div className="wk-settings" style={{ overflowY: 'auto' }}>
      <header>Wiki settings</header>
      <SectionStrip sections={SECTIONS} label="Wiki settings sections" />
      {SECTIONS.filter(section => section.id !== skipped).map(section => (
        <section key={section.id} data-settings-section={section.id} tabIndex={-1} />
      ))}
    </div>
  )
}
const render = async (): Promise<void> => {
  await act(async () => root.render(<Harness />))
  await tick(0)
}
const tick = async (at: number): Promise<void> => {
  await act(async () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(at)) })
}
const click = async (selector: string, detail = 1): Promise<Event> => {
  const event = new window.Event('click', { bubbles: true, cancelable: true })
  Object.entries({ button: 0, detail }).forEach(([key, value]) => Object.defineProperty(event, key, { value }))
  await act(async () => document.querySelector(selector)!.dispatchEvent(event))
  return event
}
const box = (): HTMLElement => document.querySelector('.wk-settings')!
const links = (): HTMLAnchorElement[] => [...document.querySelectorAll<HTMLAnchorElement>('.settings-sections a')]
const reached = (index: number): number => GROUP_TOP + index * GROUP_STRIDE - 16 - (BOX_TOP + 22 - 22) - STRIP

beforeEach(async () => {
  setLang('en')
  document.getElementById('root')!.innerHTML = ''
  root = createRoot(document.getElementById('root')!)
  reduced = false
  skipped = null
  frames.clear()
  focus = null
  await act(async () => { offsets.set(document.createElement('div'), 0) })
})
afterEach(async () => { await act(async () => root.unmount()); frames.clear() })

describe('section strip on a modal box', () => {
  it('finds the scrolling box above it and names the groups that were drawn', async () => {
    await render()
    expect(links().map(link => link.textContent)).toEqual(SECTIONS.map(section => section.label))
    expect(links()[0]!.getAttribute('aria-current')).toBe('location')
    expect(document.querySelectorAll('[aria-live], [role="tablist"]')).toHaveLength(0)
    // The strip leaves the box room under its last group so that group can reach the line too.
    expect(box().style.getPropertyValue('--settings-tail')).toBe(`${VIEW - STRIP - 32}px`)
  })

  it('drops a group whose card the box did not draw', async () => {
    skipped = SECTIONS[1]!.id
    await render()
    expect(links()).toHaveLength(SECTIONS.length - 1)
    expect(links().map(link => link.getAttribute('href'))).not.toContain(`#settings-${SECTIONS[1]!.id}`)
  })

  it('lands a clicked group under the strip and names it, over 280 ms', async () => {
    await render()
    const index = 2
    await click(`a[href="#settings-${SECTIONS[index]!.id}"]`)
    await tick(0)
    await tick(140)
    expect(box().scrollTop).toBeGreaterThan(0)
    expect(box().scrollTop).toBeLessThan(reached(index) + 1)
    await tick(280)
    expect(box().scrollTop).toBeCloseTo(reached(index), 0)
    expect(links()[index]!.getAttribute('aria-current')).toBe('location')
    expect(focus?.getAttribute('data-settings-section')).toBe(SECTIONS[index]!.id)
  })

  it('moves at once for a keyboard activation and for a reduced-motion preference', async () => {
    await render()
    await click(`a[href="#settings-${SECTIONS[1]!.id}"]`, 0)
    expect(box().scrollTop).toBeCloseTo(reached(1), 0)
    reduced = true
    await click(`a[href="#settings-${SECTIONS[3]!.id}"]`)
    expect(box().scrollTop).toBeCloseTo(reached(3), 0)
  })

  it('is not drawn at all when there is only one group to name', async () => {
    await act(async () => root.render(
      <div className="wk-settings" style={{ overflowY: 'auto' }}>
        <SectionStrip sections={[SECTIONS[0]!]} />
        <section data-settings-section="wiki-curator" tabIndex={-1} />
      </div>
    ))
    expect(document.querySelector('.settings-sections')).toBeNull()
  })
})
