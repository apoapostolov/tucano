// A reply the app cut comes back by itself — and it comes back now, not behind whatever else the same
// restart brought up. 20 Nov 00:16: an install closed the app under a reply; the boot pass counted its
// one resume and queued the continuation as ordinary work, behind the five sessions that had just come
// back with it. `MAX_CONCURRENT` is four, so it never got a place, and nothing looked at the row again
// while the app stayed open: the person was left reading "Interrupted" with his three tries untouched.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { Db } from '../src/core/db'
import { Runner } from '../src/core/runs'
import { fakeEngine } from '../src/core/engines/fake'
import { Memories } from '../src/core/memory'
import type { Engine, EngineEvent, Turn } from '../src/core/engines/types'
import type { Agent, EngineId, Message, Settings } from '../src/shared/types'

let db: Db
let runner: Runner
let turns: Turn[]
let settings: Settings
let holdOn: boolean
let failOn: boolean
let held: (() => void)[]
const engines = ['claude', 'codex', 'opencode', 'pi', 'antigravity', 'cursor', 'grok', 'cline', 'hermes'] as const

const release = (): void => {
  holdOn = false
  const waiting = held
  held = []
  for (const go of waiting) go()
}

// What the engine does between being asked and answering: it can be held back (the app is busy with
// other sessions) or die before it says a word (a continuation that never gets on its way).
const holding = (id: EngineId): Engine => {
  const fake = fakeEngine(id, { delayMs: 1 })
  return {
    ...fake,
    run: async function* (turn: Turn): AsyncIterable<EngineEvent> {
      turns.push(turn)
      if (failOn) throw new Error('the engine died before it said anything')
      if (holdOn) await new Promise<void>((go) => held.push(go))
      yield* fake.run(turn)
    }
  }
}

let n = 0
const makeAgent = (id: string): void => {
  const agent: Agent = { id, name: `Agent ${id}`, handle: `agent-${id}`, role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 0, used: 0, grants: {}, memory: 'read', computer: false, archived: false }
  db.saveAgent(agent)
  db.createConversation({ id: `dm-${id}`, kind: 'dm', name: `Agent ${id}`, members: [id] })
}

// A reply the app cut: it was working when the app closed, and it had got something done.
const cutReply = (id: string, conv: string, agent: string): void => {
  const at = Date.now() - 1000
  db.saveMessage({ id: `ask-${id}`, conversationId: conv, author: { kind: 'person', id: db.ownerId() }, text: `Request ${id}`, at: at - 1 })
  db.saveMessage({
    id,
    conversationId: conv,
    author: { kind: 'agent', id: agent },
    text: 'Half an answer',
    at,
    run: { status: 'interrupted', restartPending: true, cutAt: Date.now(), task: 'fix it', steps: [{ id: `s-${id}`, label: 'Ran npx vitest run', status: 'done' }, { id: `t-${id}`, label: 'Thinking', status: 'error' }] }
  } as Message)
}

beforeEach(() => {
  const dir = mkdtempSync(join(tmpdir(), 'tucano-recovery-again-'))
  db = new Db(join(dir, 'test.db'))
  turns = []
  holdOn = false
  failOn = false
  held = []
  settings = { workspaceName: 'Test', context: '', engines: Object.fromEntries(engines.map((id) => [id, { installed: true, loggedIn: true }])), routerModel: 'haiku', memoryModel: 'haiku', memoryLearning: 'off', defaultLimit: 0, approvalTtlHours: 24, theme: 'system', language: 'en', autoContinue: true } as Settings
  const impls = Object.fromEntries(engines.map((id) => [id, holding(id)])) as Record<EngineId, Engine>
  const memory = new Memories({ db, engines: impls, settings: async () => settings, emit: () => {}, workDir: join(dir, 'work') })
  runner = new Runner({ db, engines: impls, settings: async () => settings, emit: () => {}, workDir: join(dir, 'work'), memory })
  makeAgent('a')
})

afterEach(async () => {
  release()
  await runner.idle()
  db.close()
})

const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 20))

it('starts a reply the app cut even when the sessions that came back with it fill the app', async () => {
  // Four sessions are back and at work — what an install that closes the app leaves behind.
  for (const id of ['b', 'c', 'd', 'e']) makeAgent(id)
  holdOn = true
  for (const id of ['b', 'c', 'd', 'e']) void runner.send(`dm-${id}`, 'go on with your work')
  await tick()
  expect(turns).toHaveLength(4) // the four are holding the four ordinary places

  // The fifth reply was cut by the same restart: it must not queue behind them.
  makeAgent('f')
  cutReply('cut', 'dm-f', 'f') // what `interruptStaleRuns` leaves at the next boot
  void runner.resumeInterrupted(['cut'])
  await tick()
  expect(turns.filter((t) => t.prompt.includes('Request cut') || t.prompt.includes('Half an answer')).length).toBe(1)

  release()
  await runner.idle()
  // The reply it goes on from ends with its continuation on its way, not left owed.
  const after = db.message('cut')!
  expect(after.run!.status).toBe('done')
  expect(after.run!.continuedAt).toBeTypeOf('number')
  expect(n++).toBeGreaterThanOrEqual(0)
})

it('tries a cut reply again while the app stays open when its continuation never got going', async () => {
  cutReply('cut', 'dm-a', 'a')
  // The engine dies before it says a word: the row keeps its Continue and its `restartPending` — the
  // next boot used to be the only thing that read that flag again.
  failOn = true
  await runner.resumeInterrupted(['cut'])
  await runner.idle()
  const stuck = db.message('cut')!.run!
  expect(stuck.status).toBe('interrupted')
  expect(stuck.restartPending).toBe(true)
  expect(stuck.resumes).toBe(1)
  expect(db.messages().some((m) => m.conversationId === 'dm-a' && m.author.kind === 'agent' && m.id !== 'cut' && m.run?.status === 'failed')).toBe(true)

  // The same pass, reached again with the app open: it takes the row and tries once more.
  failOn = false
  await runner.resumeInterrupted()
  await runner.idle()
  expect(turns.filter((t) => t.prompt.includes('Half an answer')).length).toBeGreaterThanOrEqual(2)
  const now = db.message('cut')!.run!
  expect(now.status).toBe('done')
  expect(now.continuedAt).toBeTypeOf('number')
})

it('does not start a second reply while the continuation of the row is already on its way', async () => {
  cutReply('cut', 'dm-a', 'a')
  holdOn = true
  void runner.resumeInterrupted(['cut'])
  await tick()
  expect(turns).toHaveLength(1)
  // The tick reaches the same row a minute later: the continuation is queued or at work, so a second
  // one beside it would answer the same request twice.
  void runner.resumeInterrupted()
  await tick()
  expect(turns).toHaveLength(1)
  release()
  await runner.idle()
  expect(turns).toHaveLength(1)
})
