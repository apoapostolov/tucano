import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from 'react'
import { L } from '../../../shared/lang'
import type { Message } from '../../../shared/types'
import { allWorkingIds, dropQueued, messagesIn, reorderQueued, sendMessage, startQueued, stopRun, useStore } from '../store'
import { Icon, type IconName, duration } from './ui'

// What the drawer keeps about one conversation while the app is open: whether it is open, and the
// replies that ended here. Those stay as rows, marked with how they ended, until someone takes them
// off the list. Per conversation, so each DM and channel keeps its own and coming back to one finds
// it as it was left: none of it is shared across the rest of Tucano.
interface DrawerMemory {
  open?: boolean
  done: string[]
  working?: string // the replies at work when it was last drawn, so one that ends while you're elsewhere still counts
}
const drawerMemory = new Map<string, DrawerMemory>()
const drawerFor = (conversationId: string): DrawerMemory => {
  const had = drawerMemory.get(conversationId)
  if (had) return had
  const made: DrawerMemory = { done: [] }
  drawerMemory.set(conversationId, made)
  return made
}
// A reply that ended, as the drawer shows it: how it ended, in a glyph and a tone. The words stay in
// the glyph's title, so the row has the room the Follow pill needs (the ended label was taking it).
const endedAs = (status: string): { icon: IconName; tone: 'ok' | 'bad' | 'off'; said: string } =>
  status === 'done'
    ? { icon: 'check', tone: 'ok', said: L('Concluída', 'Done') }
    : status === 'failed' || status === 'limit_reached'
      ? { icon: 'x', tone: 'bad', said: L('Falhou', 'Failed') }
      : { icon: 'pause', tone: 'off', said: L('Interrompida', 'Stopped') }
// What counts as ended: a reply waiting on a person (a question, an approval) is still in flight.
const ENDED = ['done', 'stopped', 'interrupted', 'failed', 'limit_reached', 'paused']

// Counts up while something is running, so each row's duration moves without a redraw from elsewhere
// (the frame the drawer wore when it first shipped, in #282).
function useTick(on: boolean): number {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!on) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [on])
  return now
}

// The one-line field a drawer row opens for Steer (a reply at work) and Follow (one that ended).
// The pill keeps the row it is on; the field is that row's second line, one line tall, from where the
// row's words start to its right edge. Enter sends, Escape closes without sending, and the glyph stays
// asleep until there is something to send. The same call carries both: a steer reaches the reply at
// its next tool call, and for a done reply the core's `followIn` resumes it in place (runs.ts).
function RowPrompt({ icon, label, title, aria, placeholder, onSend }: {
  icon: IconName
  label: string
  title: string
  aria: string
  placeholder: string
  onSend: (text: string) => void
}): ReactNode {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const typed = note.trim()
  const close = (): void => {
    setOpen(false)
    setNote('')
  }
  const go = (): void => {
    if (!typed) return
    onSend(typed)
    close()
  }
  return (
    <div className={`steps__ask steps__ask--${icon}`}>
      <button
        type="button"
        className="steps__ask-pill steps__steer-pill"
        aria-label={label}
        aria-expanded={open}
        title={title}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <Icon name={icon} size={11} />
        <span className="steps__ask-pill__word">{label}</span>
      </button>
      {open && (
        <div className="steps__ask-note steps__ask-note--row">
          <input
            type="text"
            aria-label={aria}
            placeholder={placeholder}
            value={note}
            autoFocus
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && typed) {
                e.preventDefault()
                go()
              }
              if (e.key === 'Escape') close()
            }}
          />
          <button type="button" className="icon-btn icon-btn--sm steps__ask-send" title={L('Enviar', 'Send')} aria-label={L('Enviar', 'Send')} disabled={!typed} onClick={go}>
            <Icon name="send" size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

// The work this conversation is carrying, attached above the field: the replies running right now,
// each with a Steer, the prompts waiting their turn with their order and controls, and the replies
// that already ended here — kept, marked with how they ended, with a Follow on the ones the core can
// resume. A reply inside one of this conversation's threads counts as work here too: its row opens
// that thread on it. It opens by itself when it gains something to show — a queued prompt, or a
// second reply running at once — and can be closed; with nothing in it, it isn't there at all. Each
// conversation has its own.
export function WorkDrawer({
  conversationId,
  onJump,
  onThread
}: {
  conversationId: string
  onJump?: (messageId: string, threadId?: string) => void
  onThread?: (rootId: string) => void
}): ReactNode {
  // Ids, not the messages: a step streaming into one reply shouldn't redraw the list around it.
  const ids = useStore((s) => allWorkingIds(s, conversationId))
  const messages = useStore((s) => messagesIn(s, conversationId))
  const remember = drawerFor(conversationId)
  const running = messages.filter((m) => ids.includes(m.id))
  // In the order it will run in: the place a person dragged the rows into (runs.ts, `reorderQueued`),
  // and after those the order they were written in.
  const queued = messages
    .filter((m) => m.sendMode === 'queue')
    .sort((a, b) => (a.queuePos ?? Number.MAX_SAFE_INTEGER) - (b.queuePos ?? Number.MAX_SAFE_INTEGER) || a.at - b.at)
  const busy = queued.length > 0 || running.length > 1
  const [open, setOpen] = useState<boolean>(remember.open ?? busy)
  // The queued row being dragged, and the one it would land on: the grip is the handle, and the row it
  // is dropped on takes its place in the queue the core runs (runs.ts, `reorderQueued`).
  const [dragged, setDragged] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [ended, setEnded] = useState<string[]>(remember.done)
  const now = useTick(running.length > 0)
  // Two clicks for a destructive glyph: the first arms it and turns it red, the second does it.
  // Only one button is armed at a time; leaving it or clicking elsewhere disarms it.
  const [armed, setArmed] = useState<string | null>(null)
  const arm = (key: string, run: () => void): void => {
    if (armed === key) {
      setArmed(null)
      run()
      return
    }
    setArmed(key)
  }
  const disarm = (): void => setArmed(null)
  const oneLine = (text: string, max: number): string => {
    const flat = text.replace(/\s+/g, ' ').trim()
    return flat.length > max ? `${flat.slice(0, max)}…` : flat
  }
  // Which thread a row belongs to: the message that started it, in its own words. Nothing outside
  // threads has one, and those rows open a thread of their own.
  const threadRoot = (m: Message): Message | undefined => (m.threadId ? messages.find((x) => x.id === m.threadId) : undefined)
  const threadOf = (m: Message): string => m.threadId ?? m.id
  // The thread button's tooltip says which thread it opens, in that thread's own words.
  const into = (m: Message): string => {
    const root = threadRoot(m)
    if (!root) return L('Abrir a thread desta resposta', 'Open this reply’s thread')
    return L(`Abrir a thread: ${oneLine(root.text, 60) || 'sem texto'}`, `Open the thread: ${oneLine(root.text, 60) || 'no text'}`)
  }
  // What it says about a reply: the prompt it answers, not its own words.
  const asked = (m: Message): string => {
    const from = m.run?.replyTo ?? m.run?.routineAsk
    const mine = from ? messages.find((x) => x.id === from) : undefined
    return oneLine(mine?.text ?? m.run?.work ?? '', 90) || L('Uma resposta', 'A reply')
  }
  const paint = (next: boolean): void => {
    remember.open = next
    setOpen(next)
  }
  const keep = (list: string[]): void => {
    remember.done = list
    setEnded(list)
  }
  const was = useRef(busy)
  useEffect(() => {
    if (busy && !was.current) paint(true) // it just got something to show
    was.current = busy
  }, [busy])
  // A reply that leaves the working list here has ended: it stays as a row of its own, so it can
  // still be jumped to, and only the trash glyph in that row takes it off.
  const working = ids.join(',')
  const watched = useRef(remember.working ?? working)
  useEffect(() => {
    const before = watched.current ? watched.current.split(',') : []
    const nowIds = working ? working.split(',') : []
    watched.current = working
    remember.working = working
    const over = before.filter((id) => !nowIds.includes(id) && !remember.done.includes(id))
    if (over.length) keep([...remember.done, ...over])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [working])
  // A queued prompt put before or after another: the whole queue goes in its new order, so the row it
  // was dropped on keeps its place and everything else keeps its own.
  const moveQueued = (from: string, to: string): void => {
    const order = queued.map((m) => m.id)
    const at = order.indexOf(from)
    const into = order.indexOf(to)
    if (at < 0 || into < 0 || at === into) return
    const next = [...order]
    next.splice(into, 0, ...next.splice(at, 1))
    reorderQueued(conversationId, next)
  }
  const finished = ended.map((id) => messages.find((m) => m.id === id)).filter((m): m is Message => !!m?.run && ENDED.includes(m.run.status))
  if (!running.length && !queued.length && !finished.length) return null
  const counts = [
    running.length > 0 ? L(`${running.length} respondendo`, `${running.length} replying`) : '',
    queued.length > 0 ? L(`${queued.length} na fila`, `${queued.length} queued`) : '',
    finished.length > 0 ? L(`${finished.length} terminada${finished.length === 1 ? '' : 's'}`, `${finished.length} finished`) : ''
  ]
    .filter((part) => part !== '')
    .join(' · ')
  return (
    <div className={`work-drawer ${open ? 'is-open' : ''}`}>
      <button type="button" className="work-drawer__head" onClick={() => paint(!open)} aria-expanded={open}>
        <Icon name="layers" size={13} />
        <span className="work-drawer__count">{counts}</span>
        <span className="work-drawer__more">{open ? L('Fechar', 'Close') : L('Ver', 'Show')}</span>
        <span className={`work-drawer__caret ${open ? 'is-open' : ''}`}>
          <Icon name="caret" size={12} />
        </span>
      </button>
      {open && (
        <div className="work-drawer__list">
          {running.map((m) => (
            <div className="work-row" key={m.id}>
              <button type="button" className="work-row__go" onClick={() => onJump?.(m.id, m.threadId)} title={L('Ir para esta resposta', 'Go to this reply')}>
                <span className="work-row__dot" aria-hidden />
                <span className="work-row__text">{asked(m)}</span>
              </button>
              <span className="work-row__meta">{duration(Math.max(0, now - m.at))}</span>
              {/* Steering first, stopping after it: what a person does to a running reply is say how
                  to go on far more often than kill it, and the x at the row's end is the last thing
                  under the pointer rather than the first. */}
              <div className="work-row__steer">
                <RowPrompt
                  icon="pointer"
                  label={L('Orientar', 'Steer')}
                  title={L('Dizer como seguir, sem parar esta resposta', 'Say how to go on without stopping this reply')}
                  aria={L('Orientação para esta resposta', 'A steer for this reply')}
                  placeholder={L('Como ele deve seguir?', 'How should it go on?')}
                  onSend={(text) => void sendMessage(m.conversationId, text, [], m.threadId, [], 'steer', m.id)}
                />
              </div>
              <button type="button"
                className="icon-btn icon-btn--sm work-row__thread-btn"
                title={into(m)}
                aria-label={L('Abrir a thread desta resposta', 'Open this reply’s thread')}
                onClick={() => onThread?.(threadOf(m))}
              >
                <Icon name="thread" size={12} />
              </button>
              <button type="button"
                className={`icon-btn icon-btn--sm work-row__stop ${armed === `stop:${m.id}` ? 'is-armed' : ''}`}
                title={armed === `stop:${m.id}` ? L('Clique de novo para parar', 'Click again to stop') : L('Parar esta resposta', 'Stop this reply')}
                aria-label={L('Parar esta resposta', 'Stop this reply')}
                onClick={() => arm(`stop:${m.id}`, () => stopRun(m.id))}
                onBlur={disarm}
                onMouseLeave={disarm}
              >
                <Icon name="x" size={12} />
              </button>
            </div>
          ))}
          {queued.length > 0 && (
            <>
              <div className="work-drawer__group">{L('Na fila', 'Queued')}</div>
              {queued.map((m) => (
                <div
                  className={`work-row work-row--queued ${over === m.id && dragged !== m.id ? 'is-over' : ''}`}
                  key={m.id}
                  onDragOver={(e: DragEvent<HTMLDivElement>) => {
                    if (!dragged || dragged === m.id) return
                    e.preventDefault() // a row is a place to drop one: the browser drops nothing it wasn't told about
                    if (over !== m.id) setOver(m.id)
                  }}
                  onDragLeave={() => setOver((was) => (was === m.id ? null : was))}
                  onDrop={(e: DragEvent<HTMLDivElement>) => {
                    e.preventDefault()
                    const from = e.dataTransfer?.getData('text/plain') || dragged
                    setOver(null)
                    setDragged(null)
                    if (from) moveQueued(from, m.id)
                  }}
                >
                  {/* The handle: dragged, it moves this prompt up or down the queue; the arrows do the
                      same from the keyboard. Off the jump button, so a drag never opens the message. */}
                  <span
                    className="work-row__grip"
                    role="button"
                    tabIndex={0}
                    draggable
                    title={L('Arraste para mudar a ordem da fila', 'Drag to change the order of the queue')}
                    aria-label={L('Mudar a ordem deste pedido na fila', 'Move this prompt in the queue')}
                    onDragStart={(e: DragEvent<HTMLSpanElement>) => {
                      setDragged(m.id)
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setData('text/plain', m.id)
                    }}
                    onDragEnd={() => {
                      setDragged(null)
                      setOver(null)
                    }}
                    onKeyDown={(e: KeyboardEvent<HTMLSpanElement>) => {
                      const at = queued.findIndex((q) => q.id === m.id)
                      const to = e.key === 'ArrowUp' ? at - 1 : e.key === 'ArrowDown' ? at + 1 : -1
                      if (to < 0 || to >= queued.length) return
                      e.preventDefault()
                      moveQueued(m.id, queued[to]!.id)
                    }}
                  >
                    <Icon name="grip" size={11} />
                  </span>
                  <button type="button" className="work-row__go" onClick={() => onJump?.(m.id, m.threadId)} title={L('Ir para este pedido', 'Go to this prompt')}>
                    <Icon name="clock" size={11} />
                    {/* The heading above already says it is waiting: the row is the prompt alone. */}
                    <span className="work-row__text">{oneLine(m.text, 90) || L('sem texto', 'no text')}</span>
                  </button>
                  <button type="button"
                    className="icon-btn icon-btn--sm work-row__thread-btn"
                    title={into(m)}
                    aria-label={L('Abrir a thread deste pedido', 'Open this prompt’s thread')}
                    onClick={() => onThread?.(threadOf(m))}
                  >
                    <Icon name="thread" size={12} />
                  </button>
                  {/* Past the cap it would wait for a slot: pressing this sends it now, which is what
                      asking for it means (runs.ts, `startQueued`). */}
                  <button type="button"
                    className="icon-btn icon-btn--sm work-row__start"
                    title={L('Começar este pedido agora', 'Start this prompt now')}
                    aria-label={L('Começar este pedido agora', 'Start this prompt now')}
                    onClick={() => startQueued(m.id)}
                  >
                    <Icon name="play" size={11} />
                  </button>
                  {/* Taking the prompt back before it went: it never runs, and the message goes with
                      its row, so the bubble it put in the conversation goes too (runs.ts, `dropQueued`).
                      The x sits at the row's end, where a running session carries its stop. */}
                  <button type="button"
                    className={`icon-btn icon-btn--sm work-row__drop ${armed === `drop:${m.id}` ? 'is-armed' : ''}`}
                    title={armed === `drop:${m.id}` ? L('Clique de novo para tirar da fila', 'Click again to take it out') : L('Tirar este pedido da fila', 'Take this prompt out of the queue')}
                    aria-label={L('Tirar este pedido da fila', 'Take this prompt out of the queue')}
                    onClick={() => arm(`drop:${m.id}`, () => dropQueued(m.id))}
                    onBlur={disarm}
                    onMouseLeave={disarm}
                  >
                    <Icon name="x" size={12} />
                  </button>
                </div>
              ))}
            </>
          )}
          {finished.length > 0 && (
            <>
              <div className="work-drawer__group">{L('Terminadas', 'Finished')}</div>
              {finished.map((m) => {
                const how = endedAs(m.run?.status ?? 'done')
                // The core resumes only a reply that ended as done. A stopped, cut or failed one keeps
                // its own way back (Continue / Try again) on the message itself, so it gets no Follow
                // here that the core would refuse.
                const followable = m.run?.status === 'done'
                return (
                  <div className="work-row work-row--done" key={m.id}>
                    <button type="button" className="work-row__go" onClick={() => onJump?.(m.id, m.threadId)} title={L('Ir para esta resposta', 'Go to this reply')}>
                      <span className={`work-row__state work-row__state--${how.tone}`} title={how.said}>
                        <Icon name={how.icon} size={11} />
                      </span>
                      <span className="work-row__text">{asked(m)}</span>
                    </button>
                    {/* How it ended is the glyph in the row's own lead, with its words in the title: a
                        written label here costs the line its room. Follow is the same field as Steer,
                        sent through the same call; for a done reply the core's `followIn` takes it. */}
                    {followable && (
                      <div className="work-row__follow">
                        <RowPrompt
                          icon="down"
                          label={L('Seguir', 'Follow')}
                          title={L('Dizer como esta resposta segue agora', 'Say how this reply goes on now')}
                          aria={L('O que mais esta resposta deve fazer', 'What more this reply should do')}
                          placeholder={L('O que mais?', 'What next?')}
                          onSend={(text) => void sendMessage(m.conversationId, text, [], m.threadId, [], 'steer', m.id)}
                        />
                      </div>
                    )}
                    <button type="button"
                      className="icon-btn icon-btn--sm work-row__thread-btn"
                      title={into(m)}
                      aria-label={L('Abrir a thread desta resposta', 'Open this reply’s thread')}
                      onClick={() => onThread?.(threadOf(m))}
                    >
                      <Icon name="thread" size={12} />
                    </button>
                    <button type="button"
                      className={`icon-btn icon-btn--sm work-row__remove ${armed === `remove:${m.id}` ? 'is-armed' : ''}`}
                      title={armed === `remove:${m.id}` ? L('Clique de novo para tirar', 'Click again to remove') : L('Tirar da lista', 'Remove from the list')}
                      aria-label={L('Tirar da lista', 'Remove from the list')}
                      onClick={() => arm(`remove:${m.id}`, () => keep(remember.done.filter((x) => x !== m.id)))}
                      onBlur={disarm}
                      onMouseLeave={disarm}
                    >
                      <Icon name="trash" size={12} />
                    </button>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
