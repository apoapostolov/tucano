import { useContext, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import type { Message } from '../../../shared/types'
import { L } from '../../../shared/lang'
import { useStore, useLiveThoughtState } from '../store'
import { captureLine, lineTop, type ReadingLine } from '../reading-line'
import { Reading } from '../reading-context'

// How close to the end of the block counts as reading its end: a little over one line, so a wheel's
// fraction of a line and a subpixel scroll still count as the end. Reading even part of an earlier
// line pauses it.
const THOUGHT_END = 24

// Whether the block sits at the end of what it shows: the place a person is reading, not where the
// stream stopped. Content arriving below it does not move that place.
export function followsTheEnd(box: { scrollHeight: number; scrollTop: number; clientHeight: number }): boolean {
  return box.scrollHeight - box.scrollTop - box.clientHeight < THOUGHT_END
}

// What the model is thinking, dim and small, as it arrives: not what it said, and not a step.
// It stays after the reply ends (the window keeps it in memory) so it can be read back. Off unless
// the person turned it on in Settings: a reply's reasoning is its own, and most people want the answer.
// It sits in the chain, above the pill that acts on the reply and under the steps it explains.
export function Thought({ message, working }: { message: Message; working: boolean }): ReactNode {
  const on = useStore((s) => s.settings?.showThinking === true)
  // How much of it shows before it scrolls: a line or two when it is only a hint, most of the
  // window when the reasoning is the thing being read.
  const size = useStore((s) => s.settings?.thinkingSize ?? 'md')
  const retained = useLiveThoughtState(message.id, 140)
  const thought = retained?.text
  const origin = useRef(retained?.start ?? 0)
  const currentStart = useRef(0)
  currentStart.current = retained?.start ?? 0
  const box = useRef<HTMLDivElement>(null)
  // The block follows what arrives only while the person is at its end. Someone who scrolled up to
  // read an earlier passage keeps that place as the rest streams in below it, and the block takes
  // the stream up again by itself once they are back at the end.
  const follow = useRef(true)
  // The list around the block follows the reply's end, which carries the block up the page while the
  // answer arrives below it. Reading above the block's end holds the list too, and coming back hands
  // it back (`Reading`, above). Only a block that holds it may give it back: another reply's block
  // folding or scrolling away must not take the list back to the end while this one is being read.
  const reading = useContext(Reading)
  const holding = useRef(false)
  const position = useRef(0)
  const written = useRef<number | null>(null)
  const heldElement = useRef<HTMLElement | null>(null)
  const line = useRef<ReadingLine | null>(null)
  const gesture = useRef(0)
  const pinnedRow = useRef<{ el: HTMLElement; visibility: string } | null>(null)
  const unpin = (): void => {
    if (pinnedRow.current) pinnedRow.current.el.style.contentVisibility = pinnedRow.current.visibility
    pinnedRow.current = null
  }
  const preserveTextLine = (): void => {
    const el = box.current
    const saved = line.current
    if (!el || !saved || !holding.current) return
    const start = currentStart.current
    saved.offset -= start - origin.current
    origin.current = start
    if (saved.offset < 0) {
      line.current = captureLine(el)
      return
    }
    const top = lineTop(el, saved.offset)
    if (top === null) return
    const moved = top - saved.top
    if (Math.abs(moved) < 1) return
    el.scrollTop += moved
    position.current = el.scrollTop
    written.current = el.scrollTop
    const after = lineTop(el, saved.offset)
    if (after !== null && Math.abs(after - saved.top) >= 1) saved.top = after
  }
  const holdList = (): void => {
    origin.current = retained?.start ?? 0
    holding.current = true
    const row = box.current?.closest<HTMLElement>('.msg')
    if (row && !pinnedRow.current) {
      pinnedRow.current = { el: row, visibility: row.style.contentVisibility }
      row.style.contentVisibility = 'visible'
    }
    heldElement.current = box.current
    line.current = box.current ? captureLine(box.current) : null
    reading.hold(box.current, preserveTextLine, () => { line.current = box.current ? captureLine(box.current) : null })
  }
  const releaseList = (): void => {
    if (!holding.current) return
    holding.current = false
    unpin()
    line.current = null
    reading.release(heldElement.current)
    heldElement.current = null
  }
  useEffect(() => () => {
    reading.forget(heldElement.current)
    unpin()
  }, [reading])
  // Follow intent survives streamed DOM updates. Browser-generated scroll events from our own
  // writes cannot resume following; only moving back to the actual end releases the hold.
  useLayoutEffect(() => {
    const el = box.current
    if (!el || !on || !thought) {
      reading.forget(heldElement.current)
      heldElement.current = null
      unpin()
      holding.current = false
      line.current = null
      written.current = null
      follow.current = true
      return
    }
    if (Date.now() < gesture.current && written.current !== null && Math.abs(el.scrollTop - written.current) >= 1) {
      position.current = el.scrollTop
      follow.current = followsTheEnd(el)
      if (follow.current) releaseList()
      else holdList()
      gesture.current = 0
    }
    if (follow.current && reading.follows()) el.scrollTop = el.scrollHeight
    else if (!follow.current) el.scrollTop = position.current
    written.current = el.scrollTop
    reading.preserve()
    preserveTextLine()
  })
  if (!on || !thought) return null
  return (
    <>
      {/* The one line naming it: the word alone, dim and in full caps in the sheet. The chrome the
          header used to carry — the chevron and the fold — stayed gone; only the name came back,
          over the reasoning rather than over the text. One word names it in English whether it is
          thinking or done; the Portuguese keeps its pair. Screen readers get the block's own
          aria-label, so this line is not read twice. */}
      <div className="thought__head" aria-hidden="true">
        {L(working ? 'Pensando' : 'Pensou', 'Thinking')}
      </div>
      <div
        ref={box}
        className={`thought${working ? ' is-working' : ''}`}
        data-size={size}
        style={{ overflowAnchor: 'none' }}
        aria-label={L('O que o agente está pensando', 'What the agent is thinking')}
        onScroll={(e) => {
          const el = e.currentTarget
          if (written.current !== null && Math.abs(el.scrollTop - written.current) < 1) return
          gesture.current = 0
          position.current = el.scrollTop
          written.current = el.scrollTop
          follow.current = followsTheEnd(el)
          if (follow.current) releaseList()
          else {
            holdList()
            line.current = captureLine(el)
          }
        }}
        onPointerDown={() => { gesture.current = Date.now() + 250 }}
        onTouchStart={() => { gesture.current = Date.now() + 250 }}
        onKeyDown={() => { gesture.current = Date.now() + 250 }}
        onWheel={(e) => {
          gesture.current = Date.now() + 250
          if (e.deltaY < 0) {
            follow.current = false
            position.current = e.currentTarget.scrollTop
            written.current = e.currentTarget.scrollTop
            holdList()
          } else if (e.deltaY > 0 && followsTheEnd(e.currentTarget)) {
            follow.current = true
            releaseList()
          }
        }}
      >
        <div className="thought__text">
          {thought}
          {/* The line it is writing: the stream's end, while the reply works. */}
          {working && <span className="thought__caret" aria-hidden="true" />}
        </div>
      </div>
    </>
  )
}
