// The clock behind initiative: every minute it asks each person's coordinator whether a check-in is
// due, admits one at a time, and records what came of it. Admission is a claim taken before any
// await, so a tick that finds work already under way cannot start a second one.
//
// It decides nothing about permissions: a check-in runs through the runner as any reply does, with
// the agent's own rules, the person's visibility and Autonomy's verdict on every tool call.
import { randomUUID } from 'node:crypto'
import { L } from '../shared/lang'
import { dayStartIn, type Commitment, type InitiativeConfig, type InitiativeWake, type LinkSnapshot, type WakeWhy } from '../shared/initiative'
import { inQuietHours, type Person, type Settings } from '../shared/types'
import type { Db } from './db'
import type { Initiative } from './initiative'
import type { Runner } from './runs'
import { admit, attemptsOf, dueAt, heartbeatTask, quietStreakOf, TICK_MS, type Refusal } from './initiative-state'

// Where a reported check-in reaches the person: the same desktop notification and phone push every
// reply uses, with the first line of what it found.
export type WakeNotify = (title: string, body: string, conversationId?: string, to?: string[]) => void

// A report that repeats the one before it, word for word, is not news: it stays out of the
// conversation, and its record says why. A day is enough to tell a repeat from a new problem.
const REPEAT_WINDOW = 24 * 3_600_000

export class Heartbeat {
  private claims = new Set<string>() // people with a check-in under way
  private timer: ReturnType<typeof setInterval> | undefined
  private readonly now: () => number

  constructor(
    private readonly deps: {
      db: Db
      runner: Runner
      initiative: Initiative
      settings: () => Settings
      people: () => Person[]
      notify?: WakeNotify
      now?: () => number
    }
  ) {
    this.now = deps.now ?? Date.now
  }

  start(): void {
    if (this.timer) return
    this.timer = setInterval(() => void this.tick().catch((e: unknown) => console.error('[initiative]', e)), TICK_MS)
    this.timer.unref?.()
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = undefined
  }

  // Everyone whose check-in is due, one after another: a person's own review never runs beside
  // another of theirs, and a tick that finds one under way leaves it alone.
  async tick(now = this.now()): Promise<InitiativeWake[]> {
    const settings = this.deps.settings()
    const quietHours = inQuietHours(settings.quietHours)
    const ran: InitiativeWake[] = []
    for (const person of this.deps.people()) {
      const config = this.deps.db.initiative(person.id)
      if (!config) continue
      const wakes = this.deps.db.wakes(person.id, { limit: 60 })
      const attempts = attemptsOf(wakes)
      const lastAt = attempts[0]?.at
      const quietStreak = quietStreakOf(wakes)
      const today = dayStartIn(config.timezone, now)
      const todayRuns = attempts.filter((w) => w.at >= today)
      // A DM where the person had the last word and has not been answered yet: their turn comes first.
      const last = this.deps.db.lastAuthor(config.conversationId)
      // What the work behind each responsibility says now: a link that moved is what a resume is for.
      const fresh = this.deps.initiative.refresh(person, now)
      const verdict = admit({
        config,
        now,
        ...(lastAt === undefined ? {} : { lastAt }),
        quietStreak,
        reviewsToday: todayRuns.length,
        tokensToday: todayRuns.reduce((n, w) => n + w.tokens, 0),
        busy: this.claims.has(person.id),
        paused: this.deps.runner.isPaused(),
        quietHours,
        resume: fresh.due.length > 0,
        floorMinutes: this.deps.initiative.floorMinutes(config, fresh.waitingUser),
        personTalking: last?.kind === 'person'
      })
      if (!verdict.run) continue
      // The claim is taken here, before the first await: a second tick cannot pass this line.
      this.claims.add(person.id)
      try {
        const wake = await this.run(person, config, settings, now, fresh)
        if (wake) ran.push(wake)
      } finally {
        this.claims.delete(person.id)
      }
    }
    return ran
  }

  // "Conferir agora": the person asking for one, on the spot. Their cadence and their quiet hours are
  // theirs to skip; the caps, the pause, the allowance and one-at-a-time are not. It returns as soon
  // as the check-in has started, so a page can watch the record fill in instead of freezing.
  startNow(person: Person): { started: boolean; why?: Refusal } {
    const config = this.deps.db.initiative(person.id)
    if (!config) return { started: false, why: 'off' }
    const now = this.now()
    const work = this.deps.initiative.refresh(person, now)
    const wakes = this.deps.db.wakes(person.id, { limit: 60 })
    const attempts = attemptsOf(wakes)
    const today = dayStartIn(config.timezone, now)
    const todayRuns = attempts.filter((w) => w.at >= today)
    const verdict = admit({
      config,
      now,
      ...(attempts[0] ? { lastAt: attempts[0].at } : {}),
      quietStreak: quietStreakOf(wakes),
      reviewsToday: todayRuns.length,
      tokensToday: todayRuns.reduce((n, w) => n + w.tokens, 0),
      busy: this.claims.has(person.id),
      paused: this.deps.runner.isPaused(),
      quietHours: false,
      manual: true
    })
    if (!verdict.run) return { started: false, why: verdict.why }
    this.claims.add(person.id)
    void this.run(person, config, this.deps.settings(), now, work)
      .catch((e: unknown) => console.error('[initiative]', e))
      .finally(() => this.claims.delete(person.id))
    return { started: true }
  }

  // Whether one of this person's check-ins is under way, for a page that asks.
  running(personId: string): boolean {
    return this.claims.has(personId)
  }

  // When this person's next check-in is due: what a page shows, and what a test reads. While something
  // of the bot's waits on the person, that is the longer wait, not the cadence.
  dueAtFor(person: Person, config: InitiativeConfig): number | undefined {
    if (!config.enabled) return undefined
    const wakes = this.deps.db.wakes(person.id, { limit: 60 })
    const fresh = this.deps.initiative.refresh(person, this.now())
    return dueAt(config, attemptsOf(wakes)[0]?.at, quietStreakOf(wakes), this.deps.initiative.floorMinutes(config, fresh.waitingUser))
  }

  private skip(person: Person, config: InitiativeConfig, why: WakeWhy, now: number, id: string = randomUUID()): InitiativeWake {
    const wake: InitiativeWake = { id, personId: person.id, agentId: config.agentId, revision: config.revision, at: now, outcome: 'skipped', why, tokens: 0 }
    this.deps.db.saveWake(wake)
    return wake
  }

  private async run(
    person: Person,
    config: InitiativeConfig,
    settings: Settings,
    now: number,
    work: { due: LinkSnapshot[]; links: Map<string, LinkSnapshot[]>; stalled: Commitment[] }
  ): Promise<InitiativeWake | undefined> {
    const { db, runner } = this.deps
    const agent = db.agent(config.agentId)
    if (!agent || agent.archived) return this.skip(person, config, 'agent', now)
    const conversation = db.conversation(config.conversationId)
    if (!conversation || conversation.kind !== 'dm') return this.skip(person, config, 'dm', now)
    // An edit since admission stops it: the check-in was admitted under the brief the person has
    // since changed, and a review of the old one is not what they asked for.
    const fresh = db.initiative(person.id)
    if (!fresh || !fresh.enabled || fresh.revision !== config.revision) return this.skip(person, config, fresh?.enabled ? 'revision' : 'off', now)

    const id = randomUUID()
    const me = person.role === 'owner' ? settings.workspaceName : person.name
    // Written before it starts, as interrupted: an app that dies mid-check-in leaves an honest record.
    this.deps.db.saveWake({ id, personId: person.id, agentId: agent.id, revision: config.revision, at: now, outcome: 'interrupted', tokens: 0 })
    const result = await runner.checkIn({
      personId: person.id,
      revision: config.revision,
      wake: id,
      agent,
      conversation,
      task: heartbeatTask(fresh, db.commitments(person.id), me, { links: work.links, moved: work.due, stalled: work.stalled.map((c) => c.description) })
    })
    if (result.outcome === 'skipped') return this.skip(person, config, result.why ?? 'error', now, id)
    // What this check-in read is now seen, and what it found exactly where it was counts one more time
    // without progress: news wakes the coordinator once, and a cycle with nothing in it is bounded.
    this.deps.initiative.settle(person, now, [...work.links.values()].flat(), this.now())
    const message = result.message
    const said = (message?.text.trim() || message?.run?.error?.trim() || '').trim()
    // Saying the same thing twice is not an intervention: the report stays in its record, out of the
    // conversation, and a page can say why it was not delivered.
    const deduped = result.outcome === 'reported' && this.repeats(person, said, now)
    if (result.outcome === 'reported' && message && !deduped) {
      runner.reveal(message)
      this.deps.notify?.(L(`${agent.name} conferiu`, `${agent.name} checked in`), said.replace(/[*_`#>]/g, '').slice(0, 240), conversation.id, [person.id])
    }
    const wake: InitiativeWake = {
      id,
      personId: person.id,
      agentId: agent.id,
      revision: config.revision,
      at: now,
      endedAt: this.now(),
      outcome: result.outcome,
      tokens: message ? db.tokensForMessage(message.id) : 0,
      ...(message ? { messageId: message.id } : {}),
      // What it said, kept for the person alone: a quiet one leaves only this, and a failed one keeps
      // the words it failed with.
      ...(said ? { text: said.slice(0, 4_000) } : {}),
      ...(deduped ? { deduped: true } : {}),
      ...(result.outcome === 'failed' ? { why: 'error' as const } : {})
    }
    db.saveWake(wake)
    // A month of records is enough; older ones go as this one lands, so the table never grows without end.
    db.pruneWakes(person.id, now - 30 * 24 * 3_600_000)
    return wake
  }

  // The last thing it said, word for word. Compared without the markdown that wraps it, since the same
  // finding is often bolded in one check-in and plain in the next.
  private repeats(person: Person, said: string, now: number): boolean {
    if (!said) return false
    const plain = (t: string): string => t.replace(/[*_`#>]/g, '').replace(/\s+/g, ' ').trim()
    const mine = plain(said)
    return this.deps.db
      .wakes(person.id, { limit: 20 })
      .filter((w) => w.outcome === 'reported' && !w.deduped && w.text && now - w.at < REPEAT_WINDOW)
      .some((w) => plain(w.text!) === mine)
  }
}
