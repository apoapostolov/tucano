// A reply the app cut keeps its Continue until the reply that goes on from it is really on its way.
// Marked done the moment the continuation is asked for, a continuation that never starts (the app
// closed again under it, no engine came up, the agent was let go) buried the cut reply for good: it
// showed neither the reply nor a Continue, and the next start had nothing to pick up.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { Db } from '../src/core/db'
import { Runner } from '../src/core/runs'
import { fakeEngine } from '../src/core/engines/fake'
import { Memories } from '../src/core/memory'
import { canContinue } from '../src/shared/run-progress'
import type { Engine } from '../src/core/engines/types'
import type { Agent, EngineId, Message, Settings } from '../src/shared/types'

let db: Db
let runner: Runner
let settings: Settings
let breaks: boolean
const engines = ['claude', 'codex', 'opencode', 'pi', 'antigravity', 'cursor', 'grok', 'cline', 'hermes'] as const

beforeEach(() => {
  const dir = mkdtempSync(join(tmpdir(), 'tucano-continue-survives-'))
  db = new Db(join(dir, 'test.db'))
  settings = { workspaceName: 'Test', context: '', engines: Object.fromEntries(engines.map((id) => [id, { installed: true, loggedIn: true }])), routerModel: 'haiku', memoryModel: 'haiku', memoryLearning: 'off', defaultLimit: 0, approvalTtlHours: 24, theme: 'system', language: 'en', autoContinue: true } as Settings
  breaks = false
  const fake = fakeEngine('claude', { delayMs: 1 })
  // An engine that isn't there: the continuation is asked for and never starts.
  const impl = { ...fake, run: (turn: Parameters<Engine['run']>[0]) => (breaks ? (() => { throw new Error('no engine') })() : fake.run(turn)) } as Engine
  const impls = Object.fromEntries(engines.map((id) => [id, id === 'claude' ? impl : fakeEngine(id, { delayMs: 1 })])) as Record<EngineId, Engine>
  const memory = new Memories({ db, engines: impls, settings: async () => settings, emit: () => {}, workDir: join(dir, 'work') })
  runner = new Runner({ db, engines: impls, settings: async () => settings, emit: () => {}, workDir: join(dir, 'work'), memory })
  const agent: Agent = { id: 'a', name: 'Agent a', handle: 'agent-a', role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 0, used: 0, grants: {}, memory: 'read', computer: false, archived: false }
  db.saveAgent(agent)
  db.createConversation({ id: 'dm-a', kind: 'dm', name: 'Agent a', members: ['a'] })
})

afterEach(async () => { await runner.idle(); db.close() })

// A reply that was working when the app closed, with a step behind it (something to go on with).
function cut(at: number): void {
  db.saveMessage({ id: 'ask', conversationId: 'dm-a', author: { kind: 'person', id: db.ownerId() }, text: 'Request', at: at - 1 })
  db.saveMessage({
    id: 'cut', conversationId: 'dm-a', author: { kind: 'agent', id: 'a' }, text: 'Partial', at,
    run: { status: 'working', steps: [{ id: 's1', label: 'Read file', status: 'done' }, { id: 's2', label: 'Ran', status: 'running' }] }
  } as Message)
}

const cutReply = (): Message => db.message('cut')!

it('keeps the cut reply whole when the continuation never starts', async () => {
  breaks = true
  cut(Date.now() - 2000)
  const interrupted = db.interruptStaleRuns()
  expect(interrupted).toEqual(['cut'])
  await runner.resumeInterrupted(interrupted)
  await runner.idle()
  const after = cutReply()
  // Still the reply the app cut: interrupted, still marked to be picked up, and still offering Continue.
  expect(after.run?.status).toBe('interrupted')
  expect(after.run?.restartPending).toBe(true)
  expect(after.run?.cutAt).toBeGreaterThan(0)
  expect(canContinue(after.run!)).toBe(true)
})

it('marks the cut reply done once its continuation is on its way', async () => {
  cut(Date.now() - 2000)
  const interrupted = db.interruptStaleRuns()
  await runner.resumeInterrupted(interrupted)
  await runner.idle()
  const after = cutReply()
  expect(after.run?.status).toBe('done')
  expect(after.run?.restartPending).toBeUndefined()
  // Nothing is left to resume at the next start: it went on.
  expect(db.messagesWithRun(['interrupted'])).toHaveLength(0)
})
