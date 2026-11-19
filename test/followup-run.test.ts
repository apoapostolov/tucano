// A follow up: a reply that has ended goes on where it stopped, with an instruction. The same row keeps
// working (its text and its steps stay, the instruction becomes a row of its own), and the session it
// ended with is resumed, so the new turn carries the instruction and the past comes from the cache
// instead of being written to the model again. See `followUp` in src/core/runs.ts.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { CoreEvent } from '../src/shared/rpc'
import type { Agent, EngineId, Message, Settings } from '../src/shared/types'
import { setLang } from '../src/shared/lang'
import { Db } from '../src/core/db'
import { fakeEngine } from '../src/core/engines/fake'
import type { Engine, Turn } from '../src/core/engines/types'
import { Runner } from '../src/core/runs'

let dir: string
let db: Db
let events: CoreEvent[]
let settings: Settings

const DEMO = 1_000_000

const agent = (): Agent => ({
  id: 'a1',
  name: 'Lia',
  handle: 'lia',
  role: '',
  color: 'sky',
  instructions: '',
  modelId: 'sonnet',
  effort: 'low',
  limit: DEMO,
  used: 0,
  grants: {},
  memory: 'auto',
  computer: false,
  archived: false
})

const replies = (): Message[] => db.messages().filter((m) => m.author.kind === 'agent')

// An engine that keeps what each turn was given, so a test can say what the model saw and whether the
// session went on or started over. `sessions` false: an engine that can't keep one at all.
function recorded(turns: Turn[], opts: { sessions?: boolean } = {}): Engine {
  const base = fakeEngine('claude', {
    delayMs: 1,
    sessions: opts.sessions !== false,
    reply: (turn) => (turn.prompt.includes('segunda parte') ? 'Segunda parte pronta.' : 'Primeira parte pronta.')
  })
  return {
    id: 'claude',
    ...(opts.sessions === false ? {} : { sessions: true }),
    async *run(turn) {
      turns.push(turn)
      yield* base.run(turn)
    }
  }
}

function runnerWith(engine: Engine): Runner {
  const engines = { claude: engine, codex: fakeEngine('codex', { delayMs: 1 }), opencode: fakeEngine('opencode'), pi: fakeEngine('pi'), antigravity: fakeEngine('antigravity'), cursor: fakeEngine('cursor'), grok: fakeEngine('grok'), cline: fakeEngine('cline') } as Record<EngineId, Engine>
  return new Runner({ db, engines, settings: async () => settings, emit: (e) => events.push(e), workDir: join(dir, 'work') })
}

const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
// Until the reply on screen is working, without guessing a delay.
async function untilWorking(ms = 3000): Promise<Message> {
  for (let i = 0; i < ms / 25; i++) {
    const m = replies()[0]
    if (m?.run?.status === 'working') return m
    await wait(25)
  }
  throw new Error('no reply started')
}

beforeEach(() => {
  setLang('en')
  dir = mkdtempSync(join(tmpdir(), 'followup-'))
  db = new Db(join(dir, 'test.db'))
  events = []
  const ready = { installed: true, loggedIn: true }
  settings = {
    workspaceName: 'Edu',
    context: '',
    engines: { claude: ready, codex: ready, opencode: ready, pi: ready, antigravity: ready, cursor: ready, grok: ready, cline: ready },
    routerModel: 'haiku',
    memoryModel: 'haiku',
    memoryLearning: 'approve',
    defaultLimit: 100_000,
    approvalTtlHours: 24,
    theme: 'system',
    language: 'en'
  } as Settings
  db.saveAgent(agent())
  db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
})

afterEach(() => setLang('pt'))

describe('a reply that goes on from where it stopped', () => {
  it('goes on in the same reply, keeping what it said and did, and resumes its session', async () => {
    const turns: Turn[] = []
    const r = runnerWith(recorded(turns))
    await r.send('d1', 'faça a primeira parte')
    await r.idle()
    const first = replies()[0]!
    expect(first.run?.status).toBe('done')
    expect(first.text).toBe('Primeira parte pronta.')
    const stepsBefore = first.run!.steps.length

    r.followUp(first.id, 'agora a segunda parte: feche com uma linha')
    await r.idle()

    // One reply, not two: it isn't a message of its own.
    expect(replies()).toHaveLength(1)
    const after = db.message(first.id)!
    expect(after.id).toBe(first.id)
    // What it had said stays, and the new turn goes under it.
    expect(after.text).toBe('Primeira parte pronta.\n\nSegunda parte pronta.')
    expect(after.run?.status).toBe('done')
    // Its steps stay, and the instruction is a row of the person's own before the new ones.
    expect(after.run!.steps.length).toBeGreaterThan(stepsBefore)
    const row = after.run!.steps.find((s) => s.kind === 'followup')!
    expect(row.label).toBe('You asked it to go on')
    expect(row.detail).toBe('agora a segunda parte: feche com uma linha')
    expect(after.run!.steps.indexOf(row)).toBe(stepsBefore)
    // The turn is told it's a continuation, and where to go: not a fresh ask that repeats the old one.
    expect(turns[1]!.prompt).toContain('This carries on from your last reply in this conversation')

    // The session went on: same id, resumed, and only the new work was sent — not the whole history again.
    expect(turns).toHaveLength(2)
    expect(turns[1]!.session?.resume).toBe(true)
    expect(turns[1]!.session?.id).toBe(turns[0]!.session?.id)
    expect(turns[1]!.prompt).toContain('agora a segunda parte: feche com uma linha')
    expect(turns[1]!.prompt).not.toContain('faça a primeira parte')
    expect(turns[1]!.prompt).not.toContain('Primeira parte pronta.') // the past came from the cache
  })

  it('an engine that keeps no session gets the past reply with the instruction, so it can still follow it', async () => {
    const turns: Turn[] = []
    const r = runnerWith(recorded(turns, { sessions: false }))
    await r.send('d1', 'faça a primeira parte')
    await r.idle()
    const first = replies()[0]!

    r.followUp(first.id, 'agora a segunda parte')
    await r.idle()

    expect(replies()).toHaveLength(1)
    expect(db.message(first.id)!.text).toBe('Primeira parte pronta.\n\nSegunda parte pronta.')
    // No session: what the reply had said is the message being answered, so it rides with the task.
    expect(turns[1]!.session).toBeUndefined()
    expect(turns[1]!.prompt).toContain('agora a segunda parte')
    expect(turns[1]!.prompt).toContain('Primeira parte pronta.')
  })

  // A steer steers the reply at work; a follow up wakes one that isn't. A reply the app cut keeps its
  // row, its words and its steps, and the instruction is what it does next — the same door as Continue,
  // with words (19 Nov: a cut session could only be woken, never told what to do).
  it('wakes a reply the app cut, in its own row, so a cut session can be told what to do next', async () => {
    const turns: Turn[] = []
    const r = runnerWith(recorded(turns))
    await r.send('d1', 'faça a primeira parte')
    await r.idle()
    const first = replies()[0]!
    const stepsBefore = first.run!.steps.length
    // What a boot leaves behind: cut while it worked, and still owed its continuation. The new runner
    // is the app opened again — no session in memory, which is why a cut reply can't resume.
    db.saveMessage({ ...first, run: { ...first.run!, status: 'interrupted', restartPending: true, cutAt: Date.now() } })
    const booted = runnerWith(recorded(turns))

    booted.followUp(first.id, 'agora a segunda parte')
    await booted.idle()

    // The same reply, awake again: one row, not a second reply beside it.
    expect(replies()).toHaveLength(1)
    const after = db.message(first.id)!
    expect(after.id).toBe(first.id)
    expect(after.text).toBe('Primeira parte pronta.\n\nSegunda parte pronta.')
    expect(after.run?.status).toBe('done')
    // Its cut marks are gone with the wake: nothing needs to resume it a second time at the next boot.
    expect(after.run?.restartPending).toBeUndefined()
    expect(after.run?.cutAt).toBeUndefined()
    // What it did stays, and the instruction is a row of the person's own before the new work.
    expect(after.run!.steps.length).toBeGreaterThan(stepsBefore)
    expect(after.run!.steps[stepsBefore]).toMatchObject({ kind: 'followup', detail: 'agora a segunda parte' })
    // A cut turn never ended well, so its session is gone: the new one starts on the whole transcript,
    // and the reply it carries on from rides with the task so it can see it.
    expect(turns).toHaveLength(2)
    expect(turns[1]!.session?.resume).toBe(false)
    expect(turns[1]!.prompt).toContain('agora a segunda parte')
    expect(turns[1]!.prompt).toContain('Primeira parte pronta.')
  })

  it('wakes a stopped reply too, and takes one wake per row', async () => {
    const turns: Turn[] = []
    const r = runnerWith(recorded(turns))
    await r.send('d1', 'faça a primeira parte')
    await r.idle()
    const first = replies()[0]!
    db.saveMessage({ ...first, run: { ...first.run!, status: 'stopped' } })

    // Two presses while the first is on its way: the second starts nothing, or two turns would fight
    // over one row (the same guard a Continue on this row uses).
    r.followUp(first.id, 'agora a segunda parte')
    r.followUp(first.id, 'outra coisa')
    await r.idle()

    expect(turns).toHaveLength(2)
    const after = db.message(first.id)!
    expect(after.text).toBe('Primeira parte pronta.\n\nSegunda parte pronta.')
    const rows = after.run!.steps.filter((s) => s.kind === 'followup')
    expect(rows).toHaveLength(1)
    expect(rows[0]!.detail).toBe('agora a segunda parte')
  })

  // The press lands on the row at once. A wake doesn't start the turn where it was pressed: the agent
  // answers one thing at a time in a conversation, so a follow-up pressed while another reply of that
  // agent runs there waits for it — and on 19 Nov it waited with the row looking exactly as it did
  // before the press, the field closed, which reads as a press that did nothing (Apo: "it just woke
  // with a big delay").
  it('says it is awake on the row the moment it is pressed, before the turn gets its place', async () => {
    const turns: Turn[] = []
    const r = runnerWith(recorded(turns))
    await r.send('d1', 'faça a primeira parte')
    await r.idle()
    const first = replies()[0]!
    const before = db.message(first.id)!

    r.followUp(first.id, 'agora a segunda parte')
    // Read straight back, before the turn had a chance to do anything: the row is at work, saying why.
    const waking = db.message(first.id)!
    expect(waking.run?.status).toBe('working')
    expect(waking.run!.steps.at(-1)).toMatchObject({ label: 'Waking · waiting for the reply above to finish', status: 'running' })
    // The pill is spent with the press: one wake per row, and its words are not a second offer.
    expect(waking.run!.steps.filter((s) => s.label === 'You asked it to go on')).toHaveLength(0)

    await r.idle()
    const after = db.message(first.id)!
    // The turn wrote its own chain over the waking line: it is the reply's, not a step left behind.
    expect(after.run?.status).toBe('done')
    expect(after.run!.steps.some((s) => s.label === 'Waking · waiting for the reply above to finish')).toBe(false)
    expect(after.run!.steps.filter((s) => s.kind === 'followup')).toHaveLength(1)
    expect(after.text).toBe('Primeira parte pronta.\n\nSegunda parte pronta.')
    expect(before.run?.status).toBe('done') // the row it was, kept whole for the wake that never starts
  })

  it('is left at work by the sweep no longer than it takes its turn, not cut as a corpse', async () => {
    const turns: Turn[] = []
    const r = runnerWith(recorded(turns))
    await r.send('d1', 'faça a primeira parte')
    await r.idle()
    const first = replies()[0]!

    r.followUp(first.id, 'agora a segunda parte')
    // What the app does every minute: a row at work with steps and no runner is taken as dead. The row
    // that is only waiting its place is not dead, and cutting it would wake it a second time.
    await wait(30)
    expect(r.sweepOrphans(Date.now() + 5 * 60_000)).toEqual([])
    expect(db.message(first.id)!.run?.status).toBe('working')
    await r.idle()
    expect(db.message(first.id)!.run?.status).toBe('done')
  })

  // A wake that never gets its turn (the conversation went, the row went with it) gives the row back as
  // it was: a reply left at work with nobody behind it has no pill and no way on.
  it('gives the row back when the turn never starts', async () => {
    const turns: Turn[] = []
    const r = runnerWith(recorded(turns))
    await r.send('d1', 'faça a primeira parte')
    await r.idle()
    const first = replies()[0]!
    // A reply whose thread is gone: it can't be placed where it belongs, so no turn starts for it.
    const stranded: Message = { ...first, id: 'reply-que-nao-tem-thread', threadId: 'thread-que-nao-existe' }
    db.saveMessage(stranded)

    r.followUp(stranded.id, 'agora a segunda parte')
    await r.idle()

    const back = db.message(stranded.id)!
    expect(back.run?.status).toBe('done')
    expect(back.run!.steps.some((s) => s.label === 'Waking · waiting for the reply above to finish')).toBe(false)
    expect(turns).toHaveLength(1) // nothing was sent
    // And it is offered again: the row is what it was, pill and all, not a reply at work with nobody behind it.
    expect(back.run!.steps).toEqual(first.run!.steps)
  })

  it('is not offered for a reply that is still at work: a running one is steered, not followed up', async () => {
    const turns: Turn[] = []
    const r = runnerWith(recorded(turns))
    await r.send('d1', 'demore 2 s')
    const working = await untilWorking()
    r.followUp(working.id, 'não devia entrar')
    await r.idle()
    expect(turns).toHaveLength(1) // no second turn was started
    expect(db.message(working.id)!.run!.steps.some((s) => s.kind === 'followup')).toBe(false)
  })

  it('ignores an empty instruction, an unknown reply, and a message that is not an agent reply', async () => {
    const turns: Turn[] = []
    const r = runnerWith(recorded(turns))
    await r.send('d1', 'faça a primeira parte')
    await r.idle()
    const first = replies()[0]!
    const mine = db.messages().find((m) => m.author.kind === 'person')!
    r.followUp(first.id, '   ')
    r.followUp('nao-existe', 'qualquer coisa')
    r.followUp(mine.id, 'qualquer coisa')
    await r.idle()
    expect(turns).toHaveLength(1)
    expect(db.message(first.id)!.text).toBe('Primeira parte pronta.')
  })
})
