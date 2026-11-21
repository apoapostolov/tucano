import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { L } from '../../../shared/lang'

export const SECTION_SCROLL_MS = 280
export const sectionEase = (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export interface StripSection {
  id: string
  label: string
}

// The nearest ancestor that really scrolls. A settings page scrolls in `.page__scroll`; the wiki's
// settings are a modal that scrolls in its own box, and the strip has to sit in whichever one holds
// it, because a sticky row cannot leave the box it scrolls in.
function scrollParent(element: HTMLElement | null): HTMLElement | null {
  for (let node = element?.parentElement ?? null; node; node = node.parentElement) {
    const overflow = window.getComputedStyle(node).overflowY
    if (overflow === 'auto' || overflow === 'scroll') return node
  }
  return null
}

// A row of section names for one scrolling surface: sticky under whatever header that surface has,
// following the reading position, and taking the surface to a section. It is links and not a tab
// list, because the sections stay visible together in one document, so the active link carries
// `aria-current="location"`. Only sections whose anchor was really rendered get a link.
export function SectionStrip({ sections, label }: { sections: readonly StripSection[]; label?: string }): ReactNode {
  const [scroller, setScroller] = useState<HTMLElement | null>(null)
  const [present, setPresent] = useState<readonly string[] | null>(null)
  const [current, setCurrent] = useState<string>(sections[0]?.id ?? '')
  const root = useRef<HTMLElement>(null)
  const frame = useRef<number | null>(null)
  const movingTo = useRef<string | null>(null)
  const track = useRef<() => void>(() => {})
  // How far the surface's own header reaches down: the strip parks under it instead of over it.
  const above = useRef(0)
  const opened = useRef(false)
  const available = present
    ? present.map(id => sections.find(section => section.id === id)).filter((section): section is StripSection => section !== undefined)
    : sections
  const currentId = available.some(section => section.id === current) ? current : available[0]?.id ?? ''
  const ids = sections.map(section => section.id).join('|')

  useLayoutEffect(() => setScroller(scrollParent(root.current)), [])

  const cancel = (): void => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
    movingTo.current = null
    root.current?.removeAttribute('data-settings-scrolling')
  }

  const showSection = (id: string, animated: boolean, focus: boolean): void => {
    cancel()
    const target = scroller?.querySelector<HTMLElement>(`[data-settings-section="${id}"]`)
    if (!scroller || !target) return
    setCurrent(id)
    const inset = (root.current?.getBoundingClientRect().height ?? 0) + above.current + 16
    const destinationTop = (): number => Math.max(0, Math.min(scroller.scrollHeight - scroller.clientHeight,
      scroller.scrollTop + target.getBoundingClientRect().top - scroller.getBoundingClientRect().top - inset))
    const top = destinationTop()
    if (focus) target.focus({ preventScroll: true })
    // The box the strip sits in may pad its top and stick the strip above that padding, so the last
    // word on where the section lands is the measurement after the move, not the arithmetic before it.
    const settle = (): void => {
      // The strip itself moves as the box scrolls, so one correction can chase its own tail: measure,
      // correct, measure again.
      for (let pass = 0; pass < 3; pass++) {
        const shown = root.current?.getBoundingClientRect().bottom
        if (shown === undefined) return
        const delta = target.getBoundingClientRect().top - (shown + 16)
        if (Math.abs(delta) < 0.5) return
        const next = Math.max(0, Math.min(scroller.scrollHeight - scroller.clientHeight, scroller.scrollTop + delta))
        if (next === scroller.scrollTop) return
        scroller.scrollTop = next
      }
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const start = scroller.scrollTop
    if (!animated || reduced || Math.abs(top - start) < 1) {
      scroller.scrollTop = top
      settle()
      track.current()
      return
    }
    movingTo.current = id
    root.current?.setAttribute('data-settings-scrolling', id)
    let began: number | null = null
    const step = (at: number): void => {
      began ??= at
      const progress = Math.min(1, (at - began) / SECTION_SCROLL_MS)
      scroller.scrollTop = start + (destinationTop() - start) * sectionEase(progress)
      if (progress < 1) frame.current = requestAnimationFrame(step)
      else {
        frame.current = null
        movingTo.current = null
        settle()
        root.current?.removeAttribute('data-settings-scrolling')
        track.current()
      }
    }
    frame.current = requestAnimationFrame(step)
  }

  useLayoutEffect(() => {
    const element = root.current
    if (!element || !scroller) return
    // The strip parks under the surface's own tab row when it has one, and the surface keeps room
    // under its last section so that section can reach the line like every other one.
    const size = (): void => {
      above.current = scroller.querySelector<HTMLElement>('.tabs:not(.tabs--sections)')?.getBoundingClientRect().height ?? 0
      element.style.setProperty('--settings-nav-top', `${above.current}px`)
      const tail = Math.max(0, scroller.clientHeight - above.current - element.getBoundingClientRect().height - 32)
      scroller.style.setProperty('--settings-tail', `${tail}px`)
    }
    size()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(size)
    observer?.observe(scroller)
    observer?.observe(element)
    return () => observer?.disconnect()
  }, [scroller, ids])

  useLayoutEffect(() => {
    if (!scroller) return
    const wanted = new Set<string>(sections.map(section => section.id))
    const seen: string[] = []
    for (const element of Array.from(scroller.querySelectorAll<HTMLElement>('[data-settings-section]'))) {
      const id = element.dataset.settingsSection
      if (id && wanted.has(id) && !seen.includes(id)) seen.push(id)
    }
    setPresent(previous => previous && previous.join('|') === seen.join('|') ? previous : seen)
    if (!opened.current) {
      opened.current = true
      scroller.scrollTop = 0
      setCurrent(seen[0] ?? sections[0]?.id ?? '')
      return
    }
    if (seen.length > 0) setCurrent(value => seen.includes(value) ? value : seen[0]!)
  }, [scroller, ids])

  useEffect(() => {
    if (!scroller) return
    let tracking: number | null = null
    const read = (): void => {
      if (tracking !== null) return
      tracking = requestAnimationFrame(() => {
        tracking = null
        if (movingTo.current) return
        const targets = [...scroller.querySelectorAll<HTMLElement>('[data-settings-section]')]
        // The line is a real measurement under the strip, not a sum of heights from the box's top: a
        // box may pad its top, and a section lands 16 px under the strip rather than under that sum.
        const line = (root.current?.getBoundingClientRect().bottom ?? scroller.getBoundingClientRect().top) + 24
        const selected = targets.filter(element => element.getBoundingClientRect().top <= line).at(-1) ?? targets[0]
        if (selected?.dataset.settingsSection) setCurrent(selected.dataset.settingsSection)
      })
    }
    track.current = read
    const interrupt = (): void => { cancel(); read() }
    const interruptKey = (event: KeyboardEvent): void => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Escape'].includes(event.key)) interrupt()
    }
    read()
    scroller.addEventListener('scroll', read, { passive: true })
    scroller.addEventListener('wheel', interrupt, { passive: true })
    scroller.addEventListener('touchstart', interrupt, { passive: true })
    scroller.addEventListener('pointerdown', interrupt, { passive: true })
    scroller.addEventListener('keydown', interruptKey)
    window.addEventListener('resize', interrupt)
    return () => {
      cancel()
      track.current = () => {}
      if (tracking !== null) cancelAnimationFrame(tracking)
      scroller.removeEventListener('scroll', read)
      scroller.removeEventListener('wheel', interrupt)
      scroller.removeEventListener('touchstart', interrupt)
      scroller.removeEventListener('pointerdown', interrupt)
      scroller.removeEventListener('keydown', interruptKey)
      window.removeEventListener('resize', interrupt)
    }
  }, [scroller, ids])

  // The active link follows the selection sideways, without scrolling the surface itself.
  useEffect(() => {
    const link = root.current?.querySelector<HTMLElement>('[aria-current="location"]')
    const strip = link?.parentElement
    if (!link || !strip) return
    if (link.offsetLeft < strip.scrollLeft) strip.scrollLeft = link.offsetLeft
    else if (link.offsetLeft + link.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = link.offsetLeft + link.offsetWidth - strip.clientWidth
  }, [currentId])

  const chooseSection = (event: MouseEvent<HTMLAnchorElement>, id: string): void => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
    event.preventDefault()
    showSection(id, event.detail > 0, true)
  }

  if (available.length < 2) return null

  return (
    <nav className="tabs tabs--sections settings-sections" aria-label={label ?? L('Seções de configurações', 'Settings sections')} ref={root}>
      {available.map(section => (
        <a key={section.id} href={`#settings-${section.id}`} aria-current={currentId === section.id ? 'location' : undefined}
          onClick={event => chooseSection(event, section.id)}>{section.label}</a>
      ))}
    </nav>
  )
}
