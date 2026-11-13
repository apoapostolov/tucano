// A new prompt in a conversation that is already answering can arrive four ways: alongside the
// reply that's running (the default: its own reply, its own session, and the scheduler's limit is the
// only thing that queues it), after it (queue), handed to it between two tool calls (steer, which the
// pill on a working reply also does), or in place of it (interrupt). With nothing running, all four
// are the same thing: a prompt like any other. See `send` in src/core/runs.ts.
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { CoreEvent } from '../src/shared/rpc'
import { customModel, type Agent, type EngineId, type GrantLevel, type Message, type Settings } from '../src/shared/types'
import { ConnectorManager } from '../src/core/connectors'
import { Db } from '../src/core/db'
import { fakeEngine } from '../src/core/engines/fake'
import type { Engine, Turn } from '../src/core/engines/types'
import { Gateway } from '../src/core/gateway'
import { MAX_CONCURRENT_URGENT, Runner } from '../src/core/runs'
import { plainCipher, Secrets } from '../src/core/secrets'

const DEMO = join(import.meta.dirname, '..', 'scripts', 'demo-mcp-server.mjs')
const ready = { installed: true, loggedIn: true }

let dir: string
let tasksFile: string
let db: Db
let gateway: Gateway
let connectors: ConnectorManager
let events: CoreEvent[]
let settings: Settings
let connectorId: string

const agent = (grant?: GrantLevel): Agent => ({
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
  grants: grant ? { [connectorId]: grant } : {},
  memory: 'auto',
  computer: false,
  archived: false
})

const agentMessages = (): Message[] => db.messages().filter((m) => m.author.kind === 'agent')
const mine = (): Message[] => db.messages().filter((m) => m.author.kind === 'person')
const textOf = (r: unknown): string => ((r as { content: { text: string }[] }).content[0]?.text ?? '')
// Every text the agent gets back from the call, the steer handed over with it included.
const allText = (r: unknown): string => ((r as { content: { text: string }[] }).content.map((c) => c.text ?? '').join('\n'))

// An engine that records when each reply starts and ends, so a test can say "these never overlapped".
function recorded(rec: string[], delayMs = 1): Engine {
  const base = fakeEngine('claude', { delayMs })
  return {
    id: 'claude',
    async *run(turn: Turn) {
      rec.push('start')
      try {
        yield* base.run(turn)
      } finally {
        rec.push('end')
      }
    }
  }
}

function runnerWith(engine: Engine): Runner {
  const engines = { claude: engine, codex: fakeEngine('codex', { delayMs: 1 }), opencode: fakeEngine('opencode'), pi: fakeEngine('pi'), antigravity: fakeEngine('antigravity'), cursor: fakeEngine('cursor'), grok: fakeEngine('grok'), cline: fakeEngine('cline') } as Record<EngineId, Engine>
  return new Runner({ db, engines, settings: async () => settings, emit: (e) => events.push(e), workDir: join(dir, 'work'), gateway, connectors })
}

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), 'ad-modes-'))
  tasksFile = join(dir, 'tasks.json')
  db = new Db(join(dir, 'test.db'))
  events = []
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
    language: 'pt'
  } as Settings
  gateway = new Gateway()
  await gateway.start()
  connectors = new ConnectorManager({ db, secrets: new Secrets(db, plainCipher), emit: (e) => events.push(e), openUrl: () => {}, oauthCallbackUrl: () => gateway.url('/oauth/callback') })
  connectorId = await connectors.add({ kind: 'stdio', name: 'Tarefas', command: process.execPath, args: [DEMO], env: { DEMO_TASKS_FILE: tasksFile } })
  await connectors.connect(connectorId)
})

afterEach(async () => {
  await connectors.closeAll()
  await gateway.stop()
})

describe('a prompt that arrives while a reply is running', () => {
  it('parallel: the second message starts its own reply, side by side with the one running', async () => {
    db.saveAgent(agent())
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
    const rec: string[] = []
    const r = runnerWith(recorded(rec))
    await r.send('d1', 'comece, demore 1 s')
    await r.send('d1', 'e isto também')
    await r.idle()
    // The second never waits for the first: two sessions, both answered. What holds a reply back is the
    // scheduler's limit, not the agent already working here (see MAX_CONCURRENT and `pump`).
    expect(rec).toEqual(['start', 'start', 'end', 'end'])
    expect(agentMessages().map((m) => m.run?.status)).toEqual(['done', 'done'])
    expect(mine()).toHaveLength(2)
  })

  it('queue: it waits, and starts only when the reply above it ended', async () => {
    db.saveAgent(agent())
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
    const rec: string[] = []
    const r = runnerWith(recorded(rec))
    await r.send('d1', 'comece, demore 1 s')
    await r.send('d1', 'isto vem depois', [], undefined, undefined, { mode: 'queue' })
    expect(rec).toEqual(['start']) // still waiting its turn
    expect(mine()).toHaveLength(2) // my message is there already: it waits, it isn't held back
    await r.idle()
    expect(rec).toEqual(['start', 'end', 'start', 'end']) // one after the other, never side by side
    expect(agentMessages().map((m) => m.run?.status)).toEqual(['done', 'done'])
  })

  it('queue: with nothing running there, it is a prompt like any other', async () => {
    db.saveAgent(agent())
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
    const r = runnerWith(fakeEngine('claude', { delayMs: 1 }))
    await r.send('d1', 'oi', [], undefined, undefined, { mode: 'queue' })
    await r.idle()
    expect(agentMessages()).toHaveLength(1)
    expect(agentMessages()[0]?.run?.status).toBe('done')
  })

  it('interrupt: the reply that was running stops, and the new one runs in its place', async () => {
    db.saveAgent(agent())
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
    const r = runnerWith(fakeEngine('claude', { delayMs: 15 }))
    await r.send('d1', 'conte uma história, demore 3 s')
    await new Promise((res) => setTimeout(res, 150))
    await r.send('d1', 'pare, faça isto', [], undefined, undefined, { mode: 'interrupt' })
    // The new prompt goes at once: it doesn't wait out the three seconds the old one asked for.
    await expect.poll(() => agentMessages().filter((m) => m.run?.status === 'done').length, { timeout: 2000 }).toBe(1)
    await r.idle()
    expect(agentMessages().map((m) => m.run?.status).sort()).toEqual(['done', 'stopped'])
  })

  it('interrupt: it stops only that conversation, never another one', async () => {
    db.saveAgent(agent())
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
    db.createConversation({ id: 'd2', kind: 'dm', name: 'a1', members: ['a1'] })
    const r = runnerWith(fakeEngine('claude', { delayMs: 15 }))
    await r.send('d2', 'conte uma história, demore 2 s')
    await new Promise((res) => setTimeout(res, 100))
    await r.send('d1', 'outra coisa', [], undefined, undefined, { mode: 'interrupt' })
    await r.idle()
    const other = db.messages().filter((m) => m.conversationId === 'd2' && m.author.kind === 'agent')
    expect(other[0]?.run?.status).toBe('done') // d2 was left alone
  })

  it('steer: with a reply running there, it starts no new one, and nothing of it is posted', async () => {
    db.saveAgent(agent())
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
    const r = runnerWith(fakeEngine('claude', { delayMs: 15 }))
    await r.send('d1', 'conte uma história, demore 1 s')
    await r.send('d1', 'mude de plano', [], undefined, undefined, { mode: 'steer' })
    await r.idle()
    expect(agentMessages()).toHaveLength(1) // no second reply: it went into the one running
    // A steer is not a prompt: no message of mine appears in the DM, and the reply's chain carries it.
    expect(mine()).toHaveLength(1)
    const row = db.message(agentMessages()[0]!.id)?.run?.steps.find((s) => s.kind === 'steer')
    expect(row?.input).toBe('mude de plano')
  })
})

describe('the limit of sessions running at once', () => {
  it('queues what is past the limit, and runs every message once the slots free', async () => {
    db.saveAgent(agent())
    const rec: string[] = []
    const r = runnerWith(recorded(rec, 120))
    const ids = Array.from({ length: MAX_CONCURRENT_URGENT + 2 }, (_, i) => `d${i}`)
    for (const id of ids) db.createConversation({ id, kind: 'dm', name: 'a1', members: ['a1'] })
    for (const id of ids) await r.send(id, 'oi')
    await r.idle()
    let active = 0
    let most = 0
    for (const e of rec) {
      active += e === 'start' ? 1 : -1
      most = Math.max(most, active)
    }
    // Not one engine more than the urgent ceiling: the rest waited in the scheduler's queue, and every
    // one of them still ran. That is the queue, and nothing else waits: a message with a slot free is a
    // session of its own.
    expect(most).toBe(MAX_CONCURRENT_URGENT)
    expect(agentMessages().map((m) => m.run?.status)).toHaveLength(ids.length)
    expect(agentMessages().every((m) => m.run?.status === 'done')).toBe(true)
  })
})

describe('two replies of one agent in the same DM', () => {
  it("a steer from one reply's pill reaches that reply alone", async () => {
    const results: { reply: number; text: string }[] = []
    let turns = 0
    const engine: Engine = {
      id: 'claude',
      async *run(turn: Turn) {
        const me = ++turns
        if (turn.mcpUrl) {
          const client = new Client({ name: 'scripted', version: '0' })
          await client.connect(new StreamableHTTPClientTransport(new URL(turn.mcpUrl)))
          const list = (await client.listTools()).tools.map((t) => t.name).find((n) => n.endsWith('__list_tasks'))!
          results.push({ reply: me, text: allText(await client.callTool({ name: list, arguments: {} })) })
          await new Promise((res) => setTimeout(res, 500))
          results.push({ reply: me, text: allText(await client.callTool({ name: list, arguments: {} })) })
          await client.close()
        }
        const said = `ok ${me}`
        yield { type: 'text', delta: said }
        yield { type: 'done', text: said, usage: { inputTokens: 1, cacheReadTokens: 0, outputTokens: 1 } }
      }
    }
    db.saveAgent(agent('read_write'))
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
    const r = runnerWith(engine)
    await r.send('d1', 'quais tarefas?')
    await r.send('d1', 'e as de ontem?')
    // Two sessions of the same agent, running side by side in one DM.
    await expect.poll(() => agentMessages().filter((m) => m.run?.status === 'working').length, { timeout: 8000 }).toBe(2)
    const first = agentMessages().find((m) => m.run?.status === 'working')!
    await r.send('d1', 'mude de plano: só as abertas', [], undefined, undefined, { mode: 'steer', steerTo: first.id })
    await r.idle()
    const told = results.filter((x) => x.text.includes('mude de plano'))
    expect(told).toHaveLength(1) // handed to the reply the pill belongs to, and not to the other one
  })
})

describe('a queued prompt outlives a restart', () => {
  it('is kept as waiting while its reply has not started, and goes when the app opens again', async () => {
    db.saveAgent(agent())
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
    db.saveMessage({ id: 'm1', conversationId: 'd1', author: { kind: 'person', id: db.ownerId() }, text: 'isto depois', at: Date.now(), sendMode: 'queue' })
    expect(db.queuedMessages().map((m) => m.id)).toEqual(['m1']) // what a restart finds

    // A fresh runner over the same database, as if the app had been closed and opened.
    const r = runnerWith(fakeEngine('claude', { delayMs: 1 }))
    r.resumeQueued()
    await r.idle()
    expect(agentMessages().map((m) => m.run?.status)).toEqual(['done'])
    expect(agentMessages()[0]?.run?.replyTo).toBe('m1')
    expect(db.queuedMessages()).toEqual([]) // the mark went with the reply, so it can't start twice
  })

  it('takes its turn after what is already running there', async () => {
    db.saveAgent(agent())
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
    const rec: string[] = []
    const r = runnerWith(recorded(rec))
    await r.send('d1', 'comece, demore 1 s')
    db.saveMessage({ id: 'm1', conversationId: 'd1', author: { kind: 'person', id: db.ownerId() }, text: 'e isto', at: Date.now(), sendMode: 'queue' })
    r.resumeQueued() // the app reopened while a reply was still going
    await r.idle()
    expect(rec).toEqual(['start', 'end', 'start', 'end']) // never side by side
  })
})

describe('a steer reaches the agent between two tool calls', () => {
  it('hands it over with the next tool result, as a row of the chain', async () => {
    // Two calls, and the person writes in the gap between them. That gap is made of the run itself,
    // not of a clock: the engine holds the second call until the steer's row is in the chain, so a
    // slow machine hands it over with a call the test still knows (the first one is already done).
    const results: unknown[] = []
    const between: string[] = []
    const steered = (): boolean => db.messages().some((m) => m.run?.steps.some((s) => s.kind === 'steer'))
    const engine: Engine = {
      id: 'claude',
      async *run(turn: Turn) {
        let reply = 'ok'
        if (turn.mcpUrl) {
          const client = new Client({ name: 'scripted', version: '0' })
          await client.connect(new StreamableHTTPClientTransport(new URL(turn.mcpUrl)))
          const list = (await client.listTools()).tools.map((t) => t.name).find((n) => n.endsWith('__list_tasks'))!
          results.push(await client.callTool({ name: list, arguments: {} }))
          between.push('waiting') // the first call is answered: this is the gap
          for (let i = 0; i < 500 && !steered(); i++) await new Promise((res) => setTimeout(res, 10))
          results.push(await client.callTool({ name: list, arguments: {} }))
          await client.close()
          reply = 'vi as tarefas'
        }
        yield { type: 'text', delta: reply }
        yield { type: 'done', text: reply, usage: { inputTokens: 10, cacheReadTokens: 0, outputTokens: 2 } }
      }
    }
    db.saveAgent(agent('read_write'))
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
    const r = runnerWith(engine)
    await r.send('d1', 'quais tarefas?')
    for (let i = 0; i < 500 && !between.length; i++) await new Promise((res) => setTimeout(res, 10))
    expect(between).toHaveLength(1) // the run got to the gap, whatever the machine's speed
    await r.send('d1', 'mude de plano: só as abertas', [], undefined, undefined, { mode: 'steer' })
    await r.idle()
    expect(results).toHaveLength(2)
    expect(allText(results[0])).not.toContain('mude de plano')
    expect(allText(results[1])).toContain('mude de plano') // handed over at the second call
    expect(allText(results[1])).toContain('escreveu isto enquanto você trabalhava')
    const reply = agentMessages()[0]!
    const steerStep = reply.run?.steps.find((s) => s.kind === 'steer')
    expect(steerStep).toBeDefined()
    // A row of its own in the chain, carrying what the person wrote, whole, and it is done: the call
    // that came after it is where the reply read it.
    expect(steerStep?.input).toBe('mude de plano: só as abertas')
    expect(steerStep?.status).toBe('done')
    expect(steerStep?.label).toBe('Orientação')
    expect(reply.run?.steps.filter((s) => s.kind === 'steer')).toHaveLength(1)
  })

  it('is not a prompt when the reply ends before reading it: the row says so', async () => {
    // An engine that says what each reply was told, so the test can say "this text never arrived".
    const told: string[] = []
    const base = fakeEngine('claude', { delayMs: 1 })
    const engine: Engine = {
      id: 'claude',
      async *run(turn: Turn) {
        told.push(turn.prompt)
        yield* base.run(turn)
      }
    }
    db.saveAgent(agent())
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
    const r = runnerWith(engine)
    await r.send('d1', 'conte uma história, demore 1 s')
    await new Promise((res) => setTimeout(res, 120)) // the reply is running, with no tool call ahead of it
    await r.send('d1', 'mude de plano', [], undefined, undefined, { mode: 'steer' })
    expect(mine()).toHaveLength(1) // not a message of mine
    const working = agentMessages()[0]!
    expect(working.run?.steps.find((s) => s.kind === 'steer')?.status).toBe('running')
    await r.idle()
    // The reply ended before its next call: no prompt, no second reply, and the row says it wasn't read.
    expect(agentMessages()).toHaveLength(1)
    const left = db.message(working.id)!.run!.steps.find((s) => s.kind === 'steer')!
    expect(left.status).toBe('error')
    expect(left.input).toBe('mude de plano')
    expect(told).toHaveLength(1) // the agent never got it as a prompt of its own
  })
})
