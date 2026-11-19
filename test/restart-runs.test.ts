import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { Db } from '../src/core/db'
import { Runner } from '../src/core/runs'
import { fakeEngine } from '../src/core/engines/fake'
import { Memories } from '../src/core/memory'
import { settingsPatchError } from '../src/core/settings-patch'
import type { Engine, Turn } from '../src/core/engines/types'
import type { Agent, EngineId, Message, Settings } from '../src/shared/types'

let db: Db
let runner: Runner
let turns: Turn[]
let settings: Settings
let memory: Memories
const engines = ['claude', 'codex', 'opencode', 'pi', 'antigravity', 'cursor', 'grok', 'cline', 'hermes'] as const

it('accepts the recovery setting only as a boolean', () => {
  expect(settingsPatchError({ resumeInterrupted: false })).toBeUndefined()
  expect(settingsPatchError({ resumeInterrupted: true })).toBeUndefined()
  expect(settingsPatchError({ resumeInterrupted: 'false' })).toBeTruthy()
})

beforeEach(() => {
  const dir = mkdtempSync(join(tmpdir(), 'tucano-restart-'))
  db = new Db(join(dir, 'test.db'))
  turns = []
  settings = { workspaceName: 'Test', context: '', engines: Object.fromEntries(engines.map((id) => [id, { installed: true, loggedIn: true }])), routerModel: 'haiku', memoryModel: 'haiku', memoryLearning: 'off', defaultLimit: 0, approvalTtlHours: 24, theme: 'system', language: 'en' } as Settings
  const impls = Object.fromEntries(engines.map((id) => {
    const fake = fakeEngine(id, { delayMs: 1 })
    return [id, { ...fake, run: (turn: Turn) => { turns.push(turn); return fake.run(turn) } }]
  })) as Record<EngineId, Engine>
  memory = new Memories({ db, engines: impls, settings: async () => settings, emit: () => {}, workDir: join(dir, 'work') })
  runner = new Runner({ db, engines: impls, settings: async () => settings, emit: () => {}, workDir: join(dir, 'work'), memory })
  const agent: Agent = { id: 'a', name: 'Agent', handle: 'agent', role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 0, used: 0, grants: {}, memory: 'read', computer: false, archived: false }
  db.saveAgent(agent)
  db.createConversation({ id: 'dm', kind: 'dm', name: 'Agent', members: ['a'] })
})

it('resumes working replies when enabled, preserving progress and keeping explicit stops stopped', async () => {
  settings.resumeInterrupted = true
  reply('running', 1000, 'working')
  const msg = db.message('running')!
  db.saveMessage({ ...msg, run: { ...msg.run!, task: 'Original task', work: 'TASK-123', steps: [{ id: 's', label: 'Saved file', status: 'done' }] } })
  reply('stopped', 2000, 'stopped')
  reply('old-interrupted', 3000, 'interrupted')
  expect(db.interruptStaleRuns()).toBe(1)
  await runner.resumeInterrupted()
  await runner.idle()
  expect(turns).toHaveLength(1)
  expect(turns[0]?.prompt).toContain('Original task')
  expect(turns[0]?.prompt).toContain('Partial running')
  expect(turns[0]?.prompt).toContain('Saved file')
  expect(db.message('running')?.run?.status).toBe('done')
  expect(db.messagesWithRun(['done']).some(m => m.id !== 'running' && m.run?.work === 'TASK-123')).toBe(true)
  expect(db.message('running')?.run?.restartPending).toBeUndefined()
  expect(db.message('stopped')?.run?.status).toBe('stopped')
  expect(db.message('old-interrupted')?.run?.status).toBe('interrupted')
})

it('leaves replies interrupted when recovery is disabled, without replaying them on a later start', async () => {
  settings.resumeInterrupted = true
  reply('running', 1000, 'working')
  db.interruptStaleRuns()
  settings.resumeInterrupted = false
  await runner.resumeInterrupted()
  settings.resumeInterrupted = true
  await runner.resumeInterrupted()
  await runner.idle()
  expect(turns).toHaveLength(0)
  expect(db.message('running')?.run?.status).toBe('interrupted')
})

it('does not resume by default or replay skipped work after enabling recovery', async () => {
  reply('running', 1000, 'working')
  db.interruptStaleRuns()
  await runner.resumeInterrupted()
  settings.resumeInterrupted = true
  await runner.resumeInterrupted()
  await runner.idle()
  expect(turns).toHaveLength(0)
  expect(db.message('running')?.run?.status).toBe('interrupted')
})

it('uses the Continue rule: thinking alone is not recovered, failed tool work is', async () => {
  settings.resumeInterrupted = true
  reply('thinking', 1000, 'working')
  reply('failed-tool', 2000, 'working')
  for (const [id, label, status] of [['thinking', 'Thought', 'done'], ['failed-tool', 'Read file', 'error']] as const) {
    const msg = db.message(id)!
    db.saveMessage({ ...msg, run: { ...msg.run!, steps: [{ id: 's', label, status }] } })
  }
  db.interruptStaleRuns()
  await runner.resumeInterrupted()
  await runner.idle()
  expect(turns).toHaveLength(1)
  expect(db.message('thinking')?.run?.status).toBe('interrupted')
  expect(db.message('failed-tool')?.run?.status).toBe('done')
})

it('queues all interrupted replies while paused and resumes each once', async () => {
  settings.resumeInterrupted = true
  reply('one', 1000, 'working')
  reply('two', 2000, 'working')
  db.interruptStaleRuns()
  runner.setPaused(true)
  await runner.resumeInterrupted()
  await runner.resumeInterrupted()
  expect(turns).toHaveLength(0)
  expect(db.message('one')?.run?.restartPending).toBe(true)
  expect(db.message('one')?.run?.status).toBe('interrupted')
  runner.setPaused(false)
  await runner.idle()
  expect(turns).toHaveLength(2)
  expect(db.message('one')?.run?.status).toBe('done')
  expect(db.message('two')?.run?.status).toBe('done')
})

it('does not restart approval waits, questions, budget pauses, failures or completed replies', async () => {
  for (const status of ['waiting_approval', 'waiting_input', 'paused', 'failed', 'done'] as const) reply(status, 1000, status)
  expect(db.interruptStaleRuns()).toBe(0)
  await runner.resumeInterrupted()
  expect(turns).toHaveLength(0)
})

it('does not recover an archived agent', async () => {
  settings.resumeInterrupted = true
  reply('running', 1000, 'working')
  db.interruptStaleRuns()
  db.saveAgent({ ...db.agent('a')!, archived: true })
  await runner.resumeInterrupted()
  expect(turns).toHaveLength(0)
})

afterEach(async () => { await runner.idle(); db.close() })

function reply(id: string, at: number, status: NonNullable<Message['run']>['status']): void {
  db.saveMessage({ id: `ask-${id}`, conversationId: 'dm', author: { kind: 'person', id: db.ownerId() }, text: `Request ${id}`, at: at - 1 })
  db.saveMessage({ id, conversationId: 'dm', author: { kind: 'agent', id: 'a' }, text: `Partial ${id}`, at, run: { status, steps: [{ id: `step-${id}`, label: 'Read file', status: 'done' }] } })
}
