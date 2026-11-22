// What the app cut when it closed goes on by itself at the next start: every reply that was working,
// not the first one it happens to find. Three conversations, three agents' replies, three new turns.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { Db } from '../src/core/db'
import { Runner } from '../src/core/runs'
import { fakeEngine } from '../src/core/engines/fake'
import { Memories } from '../src/core/memory'
import type { Engine, Turn } from '../src/core/engines/types'
import type { Agent, EngineId, Message, Settings } from '../src/shared/types'

let db: Db
let runner: Runner
let turns: Turn[]
let settings: Settings
let memory: Memories
const engines = ['claude', 'codex', 'opencode', 'pi', 'antigravity', 'cursor', 'grok', 'cline', 'hermes'] as const

const agentOf = (id: string): Agent => ({ id, name: `Agent ${id}`, handle: `agent-${id}`, role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 0, used: 0, grants: {}, memory: 'read', computer: false, archived: false })

beforeEach(() => {
  const dir = mkdtempSync(join(tmpdir(), 'tucano-restart-many-'))
  db = new Db(join(dir, 'test.db'))
  turns = []
  settings = { workspaceName: 'Test', context: '', engines: Object.fromEntries(engines.map((id) => [id, { installed: true, loggedIn: true }])), routerModel: 'haiku', memoryModel: 'haiku', memoryLearning: 'off', defaultLimit: 0, approvalTtlHours: 24, theme: 'system', language: 'en' } as Settings
  const impls = Object.fromEntries(engines.map((id) => {
    const fake = fakeEngine(id, { delayMs: 1 })
    return [id, { ...fake, run: (turn: Turn) => { turns.push(turn); return fake.run(turn) } }]
  })) as Record<EngineId, Engine>
  memory = new Memories({ db, engines: impls, settings: async () => settings, emit: () => {}, workDir: join(dir, 'work') })
  runner = new Runner({ db, engines: impls, settings: async () => settings, emit: () => {}, workDir: join(dir, 'work'), memory })
  for (const id of ['a', 'b', 'c']) {
    const agent: Agent = { id, name: `Agent ${id}`, handle: `agent-${id}`, role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 0, used: 0, grants: {}, memory: 'read', computer: false, archived: false }
    db.saveAgent(agent)
    db.createConversation({ id: `dm-${id}`, kind: 'dm', name: `Agent ${id}`, members: [id] })
  }
})

afterEach(async () => { await runner.idle(); db.close() })

function reply(id: string, conv: string, agent: string, at: number, status: NonNullable<Message['run']>['status']): void {
  db.saveMessage({ id: `ask-${id}`, conversationId: conv, author: { kind: 'person', id: db.ownerId() }, text: `Request ${id}`, at: at - 1 })
  db.saveMessage({ id, conversationId: conv, author: { kind: 'agent', id: agent }, text: `Partial ${id}`, at, run: { status, steps: [{ id: `step-${id}`, label: 'Read file', status: 'done' }] } })
}

it('starts every reply that was working, each in its own conversation', async () => {
  settings.autoContinue = true
  const now = Date.now()
  reply('one', 'dm-a', 'a', now - 3000, 'working')
  reply('two', 'dm-b', 'b', now - 2000, 'working')
  reply('three', 'dm-c', 'c', now - 1000, 'working')
  const interrupted = db.interruptStaleRuns()
  expect(interrupted).toHaveLength(3)
  await runner.resumeInterrupted(interrupted) // the path the app takes at startup (index.ts)
  await runner.idle()
  expect(turns).toHaveLength(3)
  expect(db.messagesWithRun(['done']).map((m) => m.id).filter((id) => ['one', 'two', 'three'].includes(id)).sort()).toEqual(['one', 'three', 'two'])
})

it('starts every reply that was working when they share a conversation', async () => {
  settings.autoContinue = true
  const now = Date.now()
  reply('one', 'dm-a', 'a', now - 2000, 'working')
  reply('two', 'dm-a', 'a', now - 1000, 'working')
  const interrupted = db.interruptStaleRuns()
  expect(interrupted).toHaveLength(2)
  await runner.resumeInterrupted(interrupted)
  await runner.idle()
  expect(turns).toHaveLength(2)
  expect(db.messagesWithRun(['done']).filter((m) => ['one', 'two'].includes(m.id))).toHaveLength(2)
})

it('starts all of them with recovery on and auto-continue off', async () => {
  settings.resumeInterrupted = true
  settings.autoContinue = false
  const now = Date.now()
  reply('one', 'dm-a', 'a', now - 2000, 'working')
  reply('two', 'dm-b', 'b', now - 1000, 'working')
  const interrupted = db.interruptStaleRuns()
  await runner.resumeInterrupted(interrupted)
  await runner.idle()
  expect(turns).toHaveLength(2)
})

it('brings back every one of them through the app own order: the marks first, then both reads', async () => {
  settings.autoContinue = true
  const now = Date.now()
  reply('one', 'dm-a', 'a', now - 3000, 'working')
  reply('two', 'dm-b', 'b', now - 2000, 'working')
  reply('three', 'dm-c', 'c', now - 1000, 'working')
  // core/index.ts: the boot marks them, the list goes in once the engines are found, and the scan runs
  const interrupted = db.interruptStaleRuns()
  void runner.resumeInterrupted(interrupted)
  await runner.resumeInterrupted()
  runner.resumeQueued()
  await runner.idle()
  expect(turns).toHaveLength(3)
  for (const id of ['one', 'two', 'three']) expect(db.message(id)?.run?.status).toBe('done')
})

it('starts over a reply cut while it was still thinking, rather than leaving it', async () => {
  settings.resumeInterrupted = true
  db.saveMessage({ id: 'ask-thought', conversationId: 'dm-a', author: { kind: 'person', id: db.ownerId() }, text: 'Request', at: Date.now() - 2000 })
  db.saveMessage({ id: 'thought', conversationId: 'dm-a', author: { kind: 'agent', id: 'a' }, text: '', at: Date.now() - 1000, run: { status: 'working', steps: [{ id: 's-thought', label: 'Thinking', status: 'running' }] } })
  const interrupted = db.interruptStaleRuns()
  expect(interrupted).toHaveLength(1)
  await runner.resumeInterrupted(interrupted)
  await runner.idle()
  expect(turns).toHaveLength(1)
  expect(db.message('thought')?.run?.status).toBe('done')
  expect(db.message('thought')?.run?.restartPending).toBeUndefined()
})

it('a reply that cannot come back never stops the ones after it', async () => {
  settings.autoContinue = true
  const now = Date.now()
  reply('one', 'dm-a', 'a', now - 3000, 'working')
  reply('two', 'dm-b', 'b', now - 2000, 'working')
  reply('three', 'dm-c', 'c', now - 1000, 'working')
  // Its agent was archived between the job dying and the app coming back: it stays for the person.
  db.saveAgent({ ...db.agent('b')!, archived: true })
  const interrupted = db.interruptStaleRuns()
  expect(interrupted).toHaveLength(3)
  await runner.resumeInterrupted(interrupted)
  await runner.idle()
  expect(turns).toHaveLength(2)
  expect(db.message('two')?.run?.status).toBe('interrupted')
  expect(db.message('two')?.run?.restartPending).toBeUndefined()
  expect(db.message('one')?.run?.status).toBe('done')
  expect(db.message('three')?.run?.status).toBe('done')
})
