// The Asks page: every question an agent is waiting on, in one place, and what left the list under it.
// TucanoNext's own page — upstream 0.2.45 keeps asks on their cards in the conversation and has no
// page for them — kept here, out of Pages.tsx, so the settings rewrite carries through untouched.
import { useEffect, useState, type ReactNode } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { L } from '../../../shared/lang'
import { parseQuestionsText } from '../../../shared/questions'
import type { InboxQuestion } from '../../../shared/types'
import { dismissQuestion, navigate, questionsHistory, useStore } from '../store'
import { QuestionCard, questionDrafts } from './Conversation'
import { AgentAvatar, Icon, time } from './ui'
import { NothingWaiting, Page } from './Pages'

// A question long enough to read as prose, drawn as the markdown it was written in.
const Prose = ({ text, className }: { text: string; className: string }): ReactNode => (
  <div className={className}>
    <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
  </div>
)

function AskWhere({ conversationId, agentId, at, actions }: { conversationId?: string; agentId: string; at: number; actions?: ReactNode }): ReactNode {
  const conversations = useStore((s) => s.conversations)
  const agents = useStore((s) => s.agents)
  const conv = conversations.find((c) => c.id === conversationId)
  const who = agents.find((x) => x.id === agentId)?.name
  const where = !conv
    ? L('numa conversa que você não vê', "in a conversation you don't see")
    : conv.kind === 'channel'
      ? L(`em #${conv.name}`, `in #${conv.name}`)
      : who
        ? L(`na sua DM com ${who}`, `in your DM with ${who}`)
        : L('na sua DM', 'in your DM')
  return (
    <div className="row row--between small muted list-meta">
      <span>
        {where} · {time(at)}
      </span>
      <span className="row">
        {conv && (
          <button className="link" onClick={() => navigate({ kind: 'conversation', id: conv.id })}>
            {L('Ver conversa', 'See Conversation')}
          </button>
        )}
        {actions}
      </span>
    </div>
  )
}

// Every agent's question to the person, in one place, the way Approvals gathers the approvals:
// without it a question only exists as a card inside the reply that made it, which in a long
// session is pages up (see the placement issue) or on a DM nobody opened.

export function AsksPage(): ReactNode {
  const inbox = useStore((s) => s.inbox)
  const conversations = useStore((s) => s.conversations)
  const agents = useStore((s) => s.agents)
  // Which one is being dismissed, and the two steps it takes: an ask left unanswered is gone for
  // good, and the only list that showed it was this one.
  const [dropping, setDropping] = useState<string | null>(null)
  // The one history row whose text is open. One at a time: the list is for scanning, the text for
  // reading the one you picked.
  const [opened, setOpened] = useState<string | null>(null)
  const [past, setPast] = useState<InboxQuestion[]>([])
  const questions = inbox.questions
  // Answered by someone else while this person was typing: keep it here with what they wrote,
  // the same way the team inbox does.
  const gone = (inbox.answered ?? []).filter((q) => questionDrafts.get(q.id)?.trim() && !questions.some((x) => x.id === q.id))
  const waiting = [...questions.map((q) => ({ q, done: false })), ...gone.map((q) => ({ q, done: true }))]
  // What left the list: answered and closed asks, newest first. Reloaded when the open ones change,
  // which is exactly when one of them moved down here.
  useEffect(() => {
    let live = true
    questionsHistory(30).then(
      (rows) => live && setPast(rows),
      () => {}
    )
    return () => {
      live = false
    }
  }, [questions.length])
  const where = (conversationId: string | undefined, agentId: string): string => {
    const conv = conversations.find((c) => c.id === conversationId)
    const who = agents.find((x) => x.id === agentId)?.name
    if (!conv) return L('numa conversa que você não vê', "in a conversation you don't see")
    if (conv.kind === 'channel') return L(`em #${conv.name}`, `in #${conv.name}`)
    return who ? L(`na sua DM com ${who}`, `in your DM with ${who}`) : L('na sua DM', 'in your DM')
  }
  const dismissActions = (id: string): ReactNode =>
    dropping === id ? (
      <>
        <span>{L('Deixar sem resposta?', 'Leave it unanswered?')}</span>
        <button
          className="link"
          onClick={() => {
            setDropping(null)
            dismissQuestion(id)
          }}
        >
          {L('Sim, dispensar', 'Yes, dismiss')}
        </button>
        <button className="link" onClick={() => setDropping(null)}>
          {L('Manter', 'Keep it')}
        </button>
      </>
    ) : (
      <button className="link" onClick={() => setDropping(id)} title={L('Dispensa a pergunta sem resposta; o agente segue.', 'Dismiss without answering; the agent continues.')}>
        {L('Dispensar', 'Dismiss')}
      </button>
    )

  return (
    <Page title={L('Perguntas', 'Asks')} subtitle={L('As perguntas dos agentes que esperam sua resposta, em um só lugar.', 'The agents’ questions waiting for your answer, in one place.')}>
      {waiting.length === 0 && <NothingWaiting why={L('Quando um agente fizer uma pergunta, ela aparece aqui e na conversa.', 'When an agent asks you something, it appears here and in the conversation.')} />}
      {waiting.length > 0 && (
        <>
          <div className="caps-title">{L(`Perguntas · ${waiting.length}`, `Questions · ${waiting.length}`)}</div>
          <div className="stack-list">
            {waiting.map(({ q, done }) => (
              <div key={q.id}>
                <AskWhere conversationId={q.conversationId} agentId={q.agentId} at={q.createdAt} actions={done ? undefined : dismissActions(q.id)} />
                <QuestionCard
                  id={q.id}
                  agentName={agents.find((x) => x.id === q.agentId)?.name}
                  askedTo={q.askedTo}
                  question={q.text}
                  {...(q.decisions ? { decisions: q.decisions, ...(q.answers ? { answers: q.answers } : {}) } : {})}
                  answered={done}
                  {...(q.answeredBy ? { answeredBy: q.answeredBy } : {})}
                  inbox
                />
              </div>
            ))}
          </div>
        </>
      )}
      {past.length > 0 && (
        <section className="approvals-history">
          <div className="caps-title">
            <span className="grow">{L('Histórico', 'History')}</span>
          </div>
          {past.map((q) => (
            <AskedRow
              key={q.id}
              q={q}
              place={where(q.conversationId, q.agentId)}
              open={opened === q.id}
              onToggle={() => setOpened(opened === q.id ? null : q.id)}
            />
          ))}
        </section>
      )}
    </Page>
  )
}

// One answered or closed ask, in the approvals' history rows: the agent, the ask flattened to a
// single line, how it ended, when. Clicking the row opens the ask itself, which is stored as
// numbered lines whose options sit behind pipes and reads as a wall of text unshaped.
const askSummary = (text: string): string =>
  parseQuestionsText(text)
    .map((q) => q.question)
    .join(' · ')
    .replace(/\s+/g, ' ')
    .trim()

// The same text as markdown: one bullet per question, and one under it per option it offered.
const askMarkdown = (text: string): string =>
  parseQuestionsText(text)
    .map((q) =>
      q.options && q.options.length > 0 ? [`- ${q.question}`, ...q.options.map((o) => `  - ${o.label}`)].join('\n') : `- ${q.question}`
    )
    .join('\n')

export function AskedRow({
  q,
  place,
  open,
  onToggle
}: {
  q: InboxQuestion
  place: string
  open: boolean
  onToggle: () => void
}): ReactNode {
  const agent = useStore((s) => s.agents.find((x) => x.id === q.agentId))
  const you = useStore((s) => s.you)
  const people = useStore((s) => s.people)
  const by = q.answeredBy ? people.find((p) => p.id === q.answeredBy) : undefined
  const there = useStore((s) => s.conversations.some((c) => c.id === q.conversationId))
  const ended =
    q.state !== 'answered'
      ? L('sem resposta', 'no answer')
      : q.answeredBy === you
        ? L('por você', 'by you')
        : by
          ? L(`por ${by.name}`, `by ${by.name}`)
          : L('respondida', 'answered')
  const line = askSummary(q.text)
  return (
    <div className={`history-row ${q.state === 'answered' ? 'history-row--approved' : ''} ${open ? 'is-open' : ''}`}>
      <button type="button" className="history-row__line" onClick={onToggle} aria-expanded={open}>
        {agent ? <AgentAvatar agent={agent} size={20} still /> : <span className="history-row__noone" />}
        <span className="history-row__what">
          <span className="grow truncate" title={line}>
            {line}
          </span>
          <span className="history-row__who">{agent?.name ?? L('Agente', 'Agent')}</span>
        </span>
        <span className="history-row__at">{time(q.answeredAt ?? q.createdAt)}</span>
        <span className="history-row__state">{ended}</span>
      </button>
      {open && (
        <ul className="history-row__more">
          <li>
            <div className="grow">
              {q.decisions?.length ? (
                <div className="history-questions">
                  {q.decisions.map((question, i) => {
                    const answer = q.answers?.[i] ?? undefined
                    const taken = answer?.chosen ?? []
                    return (
                      <div key={i} className="history-question">
                        <p className="history-question__title">{question.question}</p>
                        <div className="history-question__options">
                          {(question.options ?? []).map((option, j) => (
                            <span
                              key={j}
                              className={`history-question__option ${taken.includes(j) ? 'is-answered' : ''} ${q.recommended?.[i] === j ? 'is-recommended' : ''}`}
                            >
                              <span className="history-question__number">{j + 1}</span>
                              {/* The answer is running text beside the number, not a row of items:
                                  a long label wraps inside the card, and the agent's tag follows the
                                  last line of it instead of being pinned to the right of one line. */}
                              <span className="history-question__body">
                                <span className="history-question__label">{option.label}</span>
                                {option.description && (
                                  <>
                                    {' '}
                                    <span className="history-question__detail">{option.description}</span>
                                  </>
                                )}
                                {q.recommended?.[i] === j && (
                                  <>
                                    {' '}
                                    <span className="history-question__pill">{L('Recomendado', 'Recommended')}</span>
                                  </>
                                )}
                              </span>
                            </span>
                          ))}
                          {answer?.other && (
                            <span className="history-question__option history-question__option--said is-answered">
                              <span className="history-question__number">…</span>
                              <span className="history-question__label">{answer.other}</span>
                            </span>
                          )}
                          {answer?.text && (
                            <span className="history-question__option history-question__option--said is-answered">
                              <span className="history-question__number">…</span>
                              <span className="history-question__label">{answer.text}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Markdown remarkPlugins={[remarkGfm]}>{askMarkdown(q.text)}</Markdown>
              )}
              <span className="hint">
                {place} · {time(q.createdAt)}
              </span>
            </div>
            {there && (
              <button className="link link--quiet" onClick={() => navigate({ kind: 'conversation', id: q.conversationId! })}>
                {L('Ver conversa', 'See Conversation')}
              </button>
            )}
          </li>
        </ul>
      )}
    </div>
  )
}

// ---------- Approvals ----------

