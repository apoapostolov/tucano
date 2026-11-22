import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { Message } from '../../../shared/types'
import { L } from '../../../shared/lang'
import { useStore, useLiveThoughtState } from '../store'
import { captureThoughtLine, restoreThoughtLine, type ThoughtLine } from '../thought-reading'
import { Icon } from './ui'

// How close to the end of the block counts as reading its end: a little over one line, so a wheel's
// fraction of a line and a subpixel scroll still count as the end. Reading even part of an earlier
// line pauses it.
const THOUGHT_END = 24
// A streaming reply's Markdown, about 7 times a second.
const STREAM_MS = 140

// Whether the block sits at the end of what it shows: the place a person is reading, not where the
// stream stopped. Content arriving below it does not move that place.
export function followsTheEnd(box: { scrollHeight: number; scrollTop: number; clientHeight: number }): boolean {
  return box.scrollHeight - box.scrollTop - box.clientHeight < THOUGHT_END
}

// What the model is thinking, dim and small, as it arrives: not what it said, and not a step. It
// sits under the steps of the run it belongs to, and above whatever the reply offers at its bottom.
// It follows the reply: open and scrolling while it works, and once that is over, folded to the last
// line it thought — the whole of it one click away. The window keeps it in memory so it can be read
// back. Off unless the person turned it on in Settings: a reply's reasoning is its own, and most
// people want the answer.
export function Thought({ message, working }: { message: Message; working: boolean }): ReactNode {
  const on = useStore((s) => s.settings.showThinking === true)
  // How tall the block is before the reasoning scrolls: 6, 12 or 18 lines, the person's own setting in
  // Settings › Conversations. It rides on the block as `data-size`; the rule that reads it is in
  // styles.css, on the box that actually scrolls (`.thought__text`). Without this the setting was
  // written and never applied: the block kept the one height it was built with.
  const size = useStore((s) => s.settings.thinkingSize ?? 'md')
  const retained = useLiveThoughtState(message.id, STREAM_MS)
  const thought = retained?.text
  // null: follow the reply — open while it thinks, folded once it's done. A click says otherwise.
  const [asked, setAsked] = useState<boolean | null>(null)
  const open = asked ?? working
  const box = useRef<HTMLDivElement>(null)
  // The block follows what arrives only while the person is at its end. Someone who scrolled up to
  // read an earlier passage keeps that place while the rest streams in below it, and the block takes
  // the stream up again by itself once they are back at the end. Opened by a click, it starts there.
  const follow = useRef(true)
  const line = useRef<ThoughtLine | null>(null)
  const written = useRef<number | null>(null)
  useLayoutEffect(() => {
    if (open) {
      follow.current = true
      line.current = null
    }
  }, [open])
  useLayoutEffect(() => {
    const el = box.current
    if (!el || !retained || !open || !on) {
      line.current = null
      written.current = null
      follow.current = true
      return
    }
    if (working && follow.current) el.scrollTop = el.scrollHeight
    else if (line.current) restoreThoughtLine(el, line.current, retained.start)
    written.current = el.scrollTop
  }, [retained, open, working, on])
  if (!on || !thought) return null
  // Folded, it carries the line it is on now: what it is thinking, cut to the width of the block.
  const last = thought.trimEnd().split(/\r?\n/).filter((l) => l.trim() !== '').pop() ?? ''
  return (
    <div className={`thought${open ? ' is-open' : ''}${working ? ' is-working' : ''}`} data-size={size} aria-label={L('O que o agente está pensando', 'What the agent is thinking')}>
      <button
        type="button"
        className="thought__head"
        aria-expanded={open}
        title={open ? L('Recolher o que ele pensou', 'Collapse reasoning') : L('Ler o que ele pensou', 'Show reasoning')}
        onClick={() => setAsked(!open)}
      >
        <Icon name="chevron" size={11} />
        <span className="thought__label">{working ? L('Pensando', 'Thinking') : L('Pensou', 'Thought')}</span>
        {!open && <span className="thought__last">{last}</span>}
      </button>
      {open && (
        <div ref={box} className="thought__text" onScroll={(e) => {
          const el = e.currentTarget
          if (written.current !== null && Math.abs(el.scrollTop - written.current) < 0.5) return
          follow.current = followsTheEnd(el)
          line.current = !follow.current && retained ? captureThoughtLine(el, retained.start) : null
          written.current = el.scrollTop
        }}>
          {thought}
          {working && <span className="thought__caret" aria-hidden="true" />}
        </div>
      )}
    </div>
  )
}
