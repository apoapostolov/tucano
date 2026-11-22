// A steer: what a person writes into a reply that is already running. It is not a message of theirs —
// nothing of it is posted — it is handed to that reply at its next tool call, in their words, and the
// reply's own chain carries it as a row of the person's. A reply that ends before taking one leaves it
// marked as not read. See `steerIn`, `markSteer`, `steerLeftovers` and `send(mode: 'steer')` in
// src/core/runs.ts.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { CoreEvent } from '../src/shared/rpc'
import type { Agent, EngineId, Message, Settings } from '../src/shared/types'
import { setLang } from '../src/shared/lang'
import { Db } from '../src/core/db'
import { callTool, fakeEngine } from '../src/core/engines/fake'
import { Gateway } from '../src/core/gateway'
import type { Engine, Turn } from '../src/core/engines/types'
import { Runner } from '../src/core/runs'

let dir: string
let db: Db
let events: CoreEvent[]
let settings: Settings
let gateway: Gateway

const agent = (): Agent => ({
  id: 'a1',
  name: 'Lia',
  handle: 'lia',
  role: '',
  color: 'sky',
  instructions: '',
  modelId: 'sonnet',
  effort: 'low',
  limit: 1_000_000,
  used: 0,
  grants: {},
  memory: 'auto',
  computer: false,
  archived: false
})

const replies = (): Message[] => db.messages().filter((m) => m.author.kind === 'agent')
const people = (): Message[] => db.messages().filter((m) => m.author.kind === 'person')
const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function untilWorking(ms = 3000): Promise<Message> {
  for (let i = 0; i < ms / 25; i++) {
    const m = replies().find((x) => x.run?.status === 'working')
    if (m) return m
    await wait(25)
  }
  throw new Error('no reply started')
}

// An engine that stays in flight long enough to be steered, and then calls a tool: the call is where
// a steer is handed over. `seen` keeps the tool result as the model got it.
function toolAfterABeat(seen: string[]): Engine {
  const base = fakeEngine('claude', { delayMs: 1, reply: () => 'Feito como você pediu.' })
  return {
    id: 'claude',
    async *run(turn: Turn) {
      await wait(400)
      const r = await callTool(turn.mcpUrl!, 'ask_user', { question: 'Qual o prazo?' })
      seen.push(((r as { content?: { text?: string }[] }).content ?? []).map((c) => c.text ?? '').join('\n'))
      yield* base.run(turn)
    }
  }
}

function runnerWith(engine: Engine): Runner {
  const engines = { claude: engine, codex: fakeEngine('codex', { delayMs: 1 }), opencode: fakeEngine('opencode'), pi: fakeEngine('pi'), antigravity: fakeEngine('antigravity'), cursor: fakeEngine('cursor'), grok: fakeEngine('grok'), cline: fakeEngine('cline') } as Record<EngineId, Engine>
  return new Runner({ db, engines, settings: async () => settings, emit: (e) => events.push(e), workDir: join(dir, 'work'), gateway })
}

beforeEach(async () => {
  setLang('en')
  dir = mkdtempSync(join(tmpdir(), 'steer-'))
  db = new Db(join(dir, 'test.db'))
  events = []
  gateway = new Gateway()
  await gateway.start()
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
  db.renamePerson(db.ownerId(), 'Edu') // the name a steer is handed over with
  db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
})

afterEach(async () => {
  await gateway.stop()
  setLang('pt')
})

describe('a steer into the reply that is running', () => {
  it('is handed over at the next tool call, in their words, and posts no message of its own', async () => {
    const seen: string[] = []
    const r = runnerWith(toolAfterABeat(seen))
    await r.send('d1', 'arrume o menu')
    const running = await untilWorking()

    await r.send('d1', 'só as abertas, não mexa no resto', [], undefined, undefined, { mode: 'steer', steerTo: running.id })

    // Nothing was posted: a steer is not a message of the person's.
    expect(people()).toHaveLength(1)
    expect(people()[0]!.text).toBe('arrume o menu')
    // It is a row of the reply's chain, in their words, while the reply carries on.
    const given = db.message(running.id)!.run!.steps.find((s) => s.kind === 'steer')!
    expect(given.input).toBe('só as abertas, não mexa no resto')
    expect(given.status).toBe('running')

    await r.idle()

    // The model got it with the call, said by name, and the row closed with the work it joined.
    expect(seen).toHaveLength(1)
    expect(seen[0]).toContain('Edu wrote this while you were working:')
    expect(seen[0]).toContain('só as abertas, não mexa no resto')
    expect(db.message(running.id)!.run!.steps.find((s) => s.kind === 'steer')!.status).toBe('done')
    // One reply, and the person's own message is still the only one of theirs.
    expect(replies()).toHaveLength(1)
    expect(people()).toHaveLength(1)
  })

  it('with no reply running there, is an ordinary prompt: it posts the message and is answered', async () => {
    const r = runnerWith(fakeEngine('claude', { delayMs: 1, reply: () => 'Tudo aberto.' }))
    await r.send('d1', 'só as abertas', [], undefined, undefined, { mode: 'steer' })
    await r.idle()

    expect(people()).toHaveLength(1)
    expect(people()[0]!.text).toBe('só as abertas')
    expect(replies()).toHaveLength(1)
    expect(replies()[0]!.text).toBe('Tudo aberto.')
  })

  it('a reply that ends before taking one leaves it in its chain, marked as not read', async () => {
    const r = runnerWith(fakeEngine('claude', { delayMs: 1 }))
    await r.send('d1', 'demore 3 s')
    const running = await untilWorking()

    await r.send('d1', 'pelo caminho mais curto', [], undefined, undefined, { mode: 'steer', steerTo: running.id })
    await r.idle()

    const row = db.message(running.id)!.run!.steps.find((s) => s.kind === 'steer')!
    expect(row.status).toBe('error')
    expect(row.error).toBe('The reply ended before the agent read this instruction.')
    expect(db.message(running.id)!.run!.status).toBe('done')
    // Still nothing of it posted as a message of the person's.
    expect(people()).toHaveLength(1)
  })
})

describe('a reply put on hold', () => {
  it('waits before its next tool call and goes on when it is let go, in the same row', async () => {
    const seen: string[] = []
    const r = runnerWith(toolAfterABeat(seen))
    await r.send('d1', 'arrume o menu')
    const running = await untilWorking()

    r.pause(running.id)
    await wait(700) // past the beat the engine takes before its call
    expect(seen).toHaveLength(0) // the call never went out
    expect(db.message(running.id)!.run!.status).toBe('paused')
    expect(replies()).toHaveLength(1)

    r.resume(running.id)
    await r.idle()

    expect(seen).toHaveLength(1)
    expect(replies()).toHaveLength(1)
    expect(db.message(running.id)!.text).toBe('Feito como você pediu.')
  })
})
