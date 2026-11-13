// The clock behind initiative: every minute it asks each person's coordinator whether a check-in is
// due, admits one at a time, and records what came of it. Admission is a claim taken before any
// await, so a tick that finds work already under way cannot start a second one.
//
// It decides nothing about permissions: a check-in runs through the runner as any reply does, with
// the agent's own rules, the person's visibility and Autonomy's verdict on every tool call.
import { randomUUID } from 'node:crypto'
import { dayStartIn, MAX_QUIET_BACKOFF, type InitiativeConfig, type InitiativeWake, type WakeOutcome, type WakeWhy } from '../shared/initiative'
import { inQuietHours, type Person, type Settings } from '../shared/types'
import type { Db } from './db'
import type { Runner } from './runs'
import { admit, dueAt, heartbeatTask, TICK_MS } from './initiative-state'

// What a check-in that ran counts as: these are the attempts, not the ones admitted and refused.
export const RAN: readonly WakeOutcome[] = ['quiet', 'reported', 'failed', 'interrupted']

export class Heartbeat {
  private claims = new Set<string>() // people with a check-in under way
  private timer: ReturnType<typeof setInterval> | undefined
  private readonly now: () => number

  constructor(
    private readonly deps: {
      db: Db
      runner: Runner
      settings: () => Settings
      people: () => Person[]
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
      const attempts = wakes.filter((w) => RAN.includes(w.outcome))
      const lastAt = attempts[0]?.at
      const quietStreak = this.streak(wakes)
      const today = dayStartIn(config.timezone, now)
      const todayRuns = attempts.filter((w) => w.at >= today)
      const verdict = admit({
        config,
        now,
        ...(lastAt === undefined ? {} : { lastAt }),
        quietStreak,
        reviewsToday: todayRuns.length,
        tokensToday: todayRuns.reduce((n, w) => n + w.tokens, 0),
        busy: this.claims.has(person.id),
        paused: this.deps.runner.isPaused(),
        quietHours
      })
      if (!verdict.run) continue
      // The claim is taken here, before the first await: a second tick cannot pass this line.
      this.claims.add(person.id)
      try {
        const wake = await this.run(person, config, settings, now)
        if (wake) ran.push(wake)
      } finally {
        this.claims.delete(person.id)
      }
    }
    return ran
  }

  // When this person's next check-in is due: what a page shows, and what a test reads.
  dueAtFor(person: Person, config: InitiativeConfig): number | undefined {
    if (!config.enabled) return undefined
    const wakes = this.deps.db.wakes(person.id, { limit: 60 })
    return dueAt(config, wakes.filter((w) => RAN.includes(w.outcome))[0]?.at, this.streak(wakes))
  }

  // Quiet check-ins in a row, newest first: each one doubles the wait before the next.
  private streak(wakes: InitiativeWake[]): number {
    let n = 0
    for (const w of wakes) {
      if (w.outcome === 'skipped') continue
      if (w.outcome !== 'quiet') break
      n++
      if (n >= MAX_QUIET_BACKOFF) break
    }
    return n
  }

  private skip(person: Person, config: InitiativeConfig, why: WakeWhy, now: number, id: string = randomUUID()): InitiativeWake {
    const wake: InitiativeWake = { id, personId: person.id, agentId: config.agentId, revision: config.revision, at: now, outcome: 'skipped', why, tokens: 0 }
    this.deps.db.saveWake(wake)
    return wake
  }

  private async run(person: Person, config: InitiativeConfig, settings: Settings, now: number): Promise<InitiativeWake | undefined> {
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
      task: heartbeatTask(fresh, db.commitments(person.id), me)
    })
    if (result.outcome === 'skipped') return this.skip(person, config, result.why ?? 'error', now, id)
    const message = result.message
    if (result.outcome === 'reported' && message) runner.reveal(message)
    const said = (message?.text.trim() || message?.run?.error?.trim() || '')
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
      ...(result.outcome === 'failed' ? { why: 'error' as const } : {})
    }
    db.saveWake(wake)
    // A month of records is enough; older ones go as this one lands, so the table never grows without end.
    db.pruneWakes(person.id, now - 30 * 24 * 3_600_000)
    return wake
  }
}
