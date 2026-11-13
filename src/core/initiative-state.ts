// What a check-in may do right now, and what it is told. Pure: the clock, the records and the runner
// are read by the caller, so every rule here can be read on its own and tested without one.
import { L, locale } from '../shared/lang'
import { backoffMinutes, isClosed, type Commitment, type InitiativeConfig } from '../shared/initiative'

// How often the clock looks. A cadence is in minutes, so a minute is close enough, and a tick that
// finds a review due a few seconds late costs nothing.
export const TICK_MS = 60_000
// The most responsibilities one check-in is told about; the rest come in the ones after.
export const BRIEFED_COMMITMENTS = 12

export type Refusal = 'off' | 'paused' | 'busy' | 'not-due' | 'cap' | 'allowance' | 'quiet-hours'

export interface AdmissionInput {
  config: InitiativeConfig
  now: number
  lastAt?: number // when its last check-in ran
  quietStreak: number // check-ins in a row that found nothing
  reviewsToday: number // check-ins today that ran (whatever came of them)
  tokensToday: number
  busy: boolean // one of this person's check-ins is already under way
  paused: boolean // the app is paused (Settings, or "Pausar tudo")
  quietHours: boolean
}

export type Admission = { run: false; why: Refusal } | { run: true; at: number }

// The minute a coordinator is next due: its cadence after the last check-in, doubled for each quiet
// one in a row. Before any check-in, the cadence counts from the last edit, so turning it on does not
// spend anything on the spot.
export const dueAt = (config: InitiativeConfig, lastAt: number | undefined, quietStreak: number): number =>
  (lastAt ?? config.updatedAt) + backoffMinutes(config.cadenceMinutes, quietStreak) * 60_000

export function admit(i: AdmissionInput): Admission {
  const { config } = i
  if (!config.enabled) return { run: false, why: 'off' }
  if (i.paused) return { run: false, why: 'paused' }
  if (i.busy) return { run: false, why: 'busy' }
  if (i.now < dueAt(config, i.lastAt, i.quietStreak)) return { run: false, why: 'not-due' }
  if (i.reviewsToday >= config.dailyReviews) return { run: false, why: 'cap' }
  if (i.tokensToday >= config.dailyTokens) return { run: false, why: 'allowance' }
  if (i.quietHours) return { run: false, why: 'quiet-hours' }
  return { run: true, at: i.now }
}

// What a check-in is asked, in one block: who asked it, what they said to look after, what is owed
// now, and the one rule that keeps a quiet check-in quiet. Bounded: a brief and a dozen
// responsibilities, never the conversation's whole history (the runner brings the recent messages).
export function heartbeatTask(config: InitiativeConfig, commitments: Commitment[], me: string): string {
  const live = commitments.filter((c) => !isClosed(c.state)).slice(0, BRIEFED_COMMITMENTS)
  const owed = live.map((c) => {
    const due = c.nextCheckAt ? ` · ${L('conferir', 'check')} ${new Date(c.nextCheckAt).toLocaleString(locale(), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` : ''
    const note = c.note ? ` (${c.note})` : ''
    return `- [${c.state}] ${c.description}${note}${due}`
  })
  return [
    L(
      `Esta é uma conferida sua, não uma mensagem de ${me}: ninguém está falando com você agora. ${me} te pediu pra cuidar disto, nas palavras delas:`,
      `This is your own check-in, not a message from ${me}: nobody is talking to you right now. ${me} asked you to look after this, in their words:`
    ),
    `<pedido>\n${config.brief}\n</pedido>`,
    owed.length
      ? L(`O que ${me} espera de você agora:`, `What ${me} is waiting on now:`) + `\n${owed.join('\n')}`
      : L(`Nada em aberto na lista.`, `Nothing on the list is open.`),
    L(
      `Faça o que o pedido diz, com o que você já pode fazer. Não peça permissão que não precisa, não invente trabalho e não pergunte só pra confirmar. Se nada precisa de ${me} agora, responda só com [[quiet]] nesta linha e nada mais: a conferida não aparece na conversa. Se algo precisa, escreva o que você fez ou achou, em poucas linhas, e o que ${me} precisa olhar.`,
      `Do what the request says, with what you can already do. Do not ask for permission you do not need, do not invent work, and do not ask just to confirm. If nothing needs ${me} right now, answer with [[quiet]] on this line and nothing else: the check-in leaves no trace in the conversation. If something does, write what you did or found in a few lines, and what ${me} should look at.`
    )
  ].join('\n\n')
}
