// Check-ins: the clock, the admission rules, and what a quiet one leaves behind. One fake engine, so
// the runner's real path runs (sessions, queue, receipts) without spawning anything.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import type { CoreEvent } from '../src/shared/rpc'
import type { Agent, EngineId, Message, Settings } from '../src/shared/types'
import { backoffMinutes, dayStartIn, isQuiet, type InitiativeInput } from '../src/shared/initiative'
import { Db } from '../src/core/db'
import { fakeEngine } from '../src/core/engines/fake'
import type { Engine } from '../src/core/engines/types'
import { Gateway } from '../src/core/gateway'
import { Heartbeat } from '../src/core/initiative-heartbeat'
import { Initiative } from '../src/core/initiative'
import { admit, dueAt, heartbeatTask } from '../src/core/initiative-state'
import { People } from '../src/core/people'
import { Runner } from '../src/core/runs'

const ready = { installed: true, loggedIn: true }
const agent = (id: string, extra: Partial<Agent> = {}): Agent => ({
  id,
  name: id,
  handle: id,
  role: '',
  color: 'sky',
  instructions: '',
  modelId: 'sonnet',
  effort: 'low',
  limit: 10_000_000,
  used: 0,
  grants: {},
  memory: 'auto',
  computer: false,
  archived: false,
  ...extra
})

let db: Db
let people: People
let initiative: Initiative
let runner: Runner
let heartbeat: Heartbeat
let gateway: Gateway
let events: CoreEvent[]
let settings: Settings
let reply = ''
let delay = 2
let clock = 1_000_000
let dm: string
let turns: string[] = []

const engines = (): Record<EngineId, Engine> => {
  const one = (id: EngineId): Engine =>
    fakeEngine(id, {
      delayMs: delay,
      reply: (turn) => {
        turns.push(turn.prompt)
        return reply
      }
    })
  return { claude: one('claude'), codex: one('codex'), opencode: one('opencode'), pi: one('pi'), antigravity: one('antigravity'), cursor: one('cursor'), grok: one('grok'), cline: one('cline'), hermes: one('hermes') }
}

beforeEach(async () => {
  db = new Db(join(mkdtempSync(join(tmpdir(), 'ad-init-')), 'test.db'))
  people = new People(db)
  initiative = new Initiative(db, people)
  events = []
  reply = ''
  delay = 2
  clock = 1_000_000
  turns = []
  settings = {
    workspaceName: 'Ana',
    context: '',
    engines: { claude: ready, codex: ready, opencode: ready, pi: ready, antigravity: ready, cursor: ready, grok: ready, cline: ready, hermes: ready },
    routerModel: 'haiku',
    memoryModel: 'haiku',
    memory: 'off',
    chainDepth: 3
  } as unknown as Settings
  db.saveAgent(agent('lia'))
  db.createConversation({ id: 'dm', kind: 'dm', name: 'lia', members: ['lia'], owner: db.ownerId() })
  dm = 'dm'
  gateway = new Gateway()
  await gateway.start()
  runner = new Runner({ db, engines: engines(), settings: async () => settings, emit: (e) => events.push(e), workDir: mkdtempSync(join(tmpdir(), 'ad-init-work-')), gateway })
  heartbeat = new Heartbeat({ db, runner, settings: () => settings, people: () => db.people(), now: () => clock })
  return () => gateway.stop()
})

const config = (over: Partial<InitiativeInput> = {}): InitiativeInput => ({
  agentId: 'lia',
  conversationId: dm,
  enabled: true,
  brief: 'Watch the invoice thread and answer the client.',
  observe: { conversations: [] },
  work: { conversations: [], kinds: [] },
  cadenceMinutes: 15,
  notify: 'material',
  dailyReviews: 24,
  dailyTokens: 2_000_000,
  timezone: 'Europe/Sofia',
  ...over
})

// A config saved at `clock`, and a moment a cadence later, when its first check-in is due.
const turnedOn = (over: Partial<InitiativeInput> = {}): { saved: ReturnType<Initiative['save']>; due: number } => {
  const saved = initiative.save(db.owner(), config(over), 0)
  return { saved, due: saved.updatedAt + (over.cadenceMinutes ?? 15) * 60_000 + 1 }
}

const visible = (conversationId = dm): Message[] => db.openingMessages(100).messages.filter((m) => m.conversationId === conversationId)

describe('the rules on their own', () => {
  it('waits a cadence, then a cadence doubled for each quiet check-in, up to two hours', () => {
    expect(backoffMinutes(15, 0)).toBe(15)
    expect(backoffMinutes(15, 1)).toBe(30)
    expect(backoffMinutes(15, 3)).toBe(120)
    expect(backoffMinutes(15, 12)).toBe(120)
  })

  it('counts a day where the person is, not where the computer is', () => {
    const noon = Date.UTC(2026, 10, 13, 10, 0, 0) // 12:00 in Sofia, 10:00 UTC
    expect(dayStartIn('Europe/Sofia', noon)).toBe(Date.UTC(2026, 10, 12, 22, 0, 0))
    const late = Date.UTC(2026, 10, 13, 22, 30, 0) // 00:30 in Sofia: already the next day there
    expect(dayStartIn('Europe/Sofia', late)).toBe(Date.UTC(2026, 10, 13, 22, 0, 0))
  })

  it('reads the marker only when it is the whole answer', () => {
    expect(isQuiet('[[quiet]]')).toBe(true)
    expect(isQuiet('**[[QUIET]]**\n')).toBe(true)
    expect(isQuiet('[[quiet]]\nThe invoice is still unpaid.')).toBe(false)
    expect(isQuiet('')).toBe(false)
  })

  it('writes a bounded request: the brief, what is owed, and the one rule that keeps it quiet', () => {
    const { saved } = turnedOn()
    const task = heartbeatTask(saved, [], 'Ana')
    expect(task).toContain('Watch the invoice thread and answer the client.')
    expect(task).toContain('[[quiet]]')
    expect(task.length).toBeLessThan(4_000)
  })

  it('refuses before the cadence, at the cap, and past the allowance', () => {
    const { saved, due } = turnedOn({ dailyReviews: 2 })
    const base = { config: saved, now: due, quietStreak: 0, reviewsToday: 0, tokensToday: 0, busy: false, paused: false, quietHours: false }
    expect(admit({ ...base, now: due - 2 })).toEqual({ run: false, why: 'not-due' })
    expect(admit(base)).toMatchObject({ run: true })
    expect(admit({ ...base, reviewsToday: 2 })).toEqual({ run: false, why: 'cap' })
    expect(admit({ ...base, tokensToday: saved.dailyTokens })).toEqual({ run: false, why: 'allowance' })
    expect(admit({ ...base, paused: true })).toEqual({ run: false, why: 'paused' })
    expect(admit({ ...base, quietHours: true })).toEqual({ run: false, why: 'quiet-hours' })
    expect(admit({ ...base, busy: true })).toEqual({ run: false, why: 'busy' })
    expect(dueAt(saved, due, 1)).toBe(due + 30 * 60_000) // one quiet in a row doubled it
  })
})

describe('a check-in', () => {
  it('finds nothing, says nothing, and keeps what it did to itself', async () => {
    const { due } = turnedOn()
    reply = '[[quiet]]'
    clock = due
    const ran = await heartbeat.tick(due)
    expect(ran.map((w) => w.outcome)).toEqual(['quiet'])
    // The conversation is untouched: no bubble, no unread, nothing to page back through.
    expect(visible()).toEqual([])
    const wake = db.wakes(db.ownerId())[0]!
    expect(wake).toMatchObject({ outcome: 'quiet', revision: 1, personId: db.ownerId() })
    expect(wake.messageId).toBeDefined()
    expect(wake.endedAt).toBeGreaterThan(0)
    // The reply itself is still there, hidden, as the record of what it said.
    expect(db.message(wake.messageId!)).toMatchObject({ hidden: true, text: '[[quiet]]' })
    expect(db.conversation(dm)?.unread).toBe(0)
  })

  it('says what it found, and then it is a message like any other', async () => {
    const { due } = turnedOn()
    reply = 'The invoice is still unpaid. I asked the client for the number.'
    clock = due
    const ran = await heartbeat.tick(due)
    expect(ran[0]).toMatchObject({ outcome: 'reported' })
    const shown = visible()
    expect(shown).toHaveLength(1)
    expect(shown[0]).toMatchObject({ text: reply, author: { kind: 'agent', id: 'lia' } })
    expect(shown[0]!.hidden).toBeUndefined()
    expect(events.filter((e) => e.type === 'message' && (e as { message: Message }).message.id === shown[0]!.id).length).toBeGreaterThan(0)
    expect(db.wakes(db.ownerId())[0]!.text).toBe(reply)
  })

  it('runs once however often the clock looks, and waits its cadence after', async () => {
    const { due } = turnedOn()
    reply = '[[quiet]]'
    clock = due
    expect((await heartbeat.tick(due)).length).toBe(1)
    for (let i = 0; i < 5; i++) expect(await heartbeat.tick(due + i * 1_000)).toEqual([])
    expect(db.wakes(db.ownerId()).filter((w) => w.outcome !== 'skipped')).toHaveLength(1)
    // A quiet one doubled the wait: 30 minutes, not 15.
    const next = heartbeat.dueAtFor(db.owner(), db.initiative(db.ownerId())!)!
    expect(next).toBe(due + 30 * 60_000)
    expect(await heartbeat.tick(next - 1)).toEqual([])
    expect((await heartbeat.tick(next + 1)).length).toBe(1)
  })

  it('stops at the day\'s reviews, and at the allowance it was given', async () => {
    const { due } = turnedOn({ dailyReviews: 1 })
    reply = 'Something worth reading.'
    clock = due
    expect((await heartbeat.tick(due)).length).toBe(1)
    const next = heartbeat.dueAtFor(db.owner(), db.initiative(db.ownerId())!)!
    // The next is due, but today's one review is spent.
    expect(await heartbeat.tick(next + 1)).toEqual([])
    expect(db.wakes(db.ownerId())).toHaveLength(1)
  })

  it('stops when the person edits the brief while it waits its turn', async () => {
    const { due } = turnedOn()
    reply = 'should never be sent'
    clock = due
    // Admitted under revision 1, then edited before it starts: the claim is taken with the row it read.
    const edited = initiative.save(db.owner(), config({ brief: 'Something else entirely.' }), 1)
    expect(edited.revision).toBe(2)
    const ran = await heartbeat.tick(due)
    expect(ran).toEqual([])
    // The heartbeat re-reads the row: a different revision than the one it would have admitted under
    // is not admitted at all, so nothing ran and nothing was written.
    expect(db.wakes(db.ownerId())).toEqual([])
  })

  it('does nothing at all while the app is paused', async () => {
    const { due } = turnedOn()
    reply = 'anything'
    runner.setPaused(true)
    clock = due
    expect(await heartbeat.tick(due)).toEqual([])
    expect(db.wakes(db.ownerId())).toEqual([])
    // And a check-in taken straight to the runner refuses, saying why.
    const skipped = await runner.checkIn({ personId: db.ownerId(), revision: 1, wake: 'w1', agent: db.agent('lia')!, conversation: db.conversation(dm)!, task: 'x' })
    expect(skipped).toEqual({ outcome: 'skipped', why: 'paused' })
  })

  it('runs again after its session was let go, and after the app forgot them all', async () => {
    const { due } = turnedOn()
    reply = '[[quiet]]'
    clock = due
    expect((await heartbeat.tick(due)).length).toBe(1)
    runner.forgetSessions({ conversationId: dm })
    const next = heartbeat.dueAtFor(db.owner(), db.initiative(db.ownerId())!)!
    clock = next
    expect((await heartbeat.tick(next)).length).toBe(1)
    expect(db.wakes(db.ownerId()).filter((w) => w.outcome === 'quiet')).toHaveLength(2)
  })

  it('sits behind a person talking to the same bot, and leaves their exchange alone', async () => {
    const { due } = turnedOn()
    delay = 30
    reply = '[[quiet]]'
    clock = due
    const sent = runner.send(dm, 'quick question')
    const ticking = heartbeat.tick(due)
    await Promise.all([sent, ticking])
    await runner.idle()
    // The person's turn came first, and the check-in waited for it: the same bot, one reply at a time.
    expect(turns).toHaveLength(2)
    expect(turns[0]).toContain('quick question')
    expect(turns[1]).toContain('Watch the invoice thread')
    // The person's reply is the only thing in the DM: the check-in found nothing and left nothing.
    const shown = visible()
    expect(shown.filter((m) => m.author.kind === 'person').map((m) => m.text)).toEqual(['quick question'])
    expect(db.wakes(db.ownerId()).map((w) => w.outcome)).toEqual(['quiet'])
    expect(typeof db.wakes(db.ownerId())[0]!.tokens).toBe('number')
  })

  it('keeps a failed one out of the conversation, and says so in its record', async () => {
    const { due } = turnedOn()
    db.saveAgent(agent('lia', { limit: 1_000 }))
    clock = due
    // Its whole month is spent: the runner stops before spawning anything.
    db.addReceipt({ messageId: 'x', agentId: 'lia', engine: 'claude', model: 'sonnet', inputTokens: 10_000_000, cacheReadTokens: 0, outputTokens: 1_000, ms: 1, at: Date.now() })
    const ran = await heartbeat.tick(due)
    expect(ran.map((w) => w.outcome)).toEqual(['failed'])
    expect(visible()).toEqual([])
    expect(db.wakes(db.ownerId())[0]!.why).toBe('error')
    expect(db.wakes(db.ownerId())[0]!.text).toContain('limite')
  })
})
