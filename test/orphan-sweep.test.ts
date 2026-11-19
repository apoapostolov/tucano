// A reply whose turn died while the app stayed open: no runner owns it any more, so nothing will ever
// write its end. The channel showed it at work for ever — no reply, no Continue, no way on — until the
// app was restarted, and with a session left mid-think on 19 Nov it never came back at all.
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
const engines = ['claude', 'codex', 'opencode', 'pi', 'antigravity', 'cursor', 'grok', 'cline', 'hermes'] as const

beforeEach(() => {
  const dir = mkdtempSync(join(tmpdir(), 'tucano-orphan-'))
  db = new Db(join(dir, 'test.db'))
  turns = []
  settings = { workspaceName: 'Test', context: '', engines: Object.fromEntries(engines.map((id) => [id, { installed: true, loggedIn: true }])), routerModel: 'haiku', memoryModel: 'haiku', memoryLearning: 'off', defaultLimit: 0, approvalTtlHours: 24, theme: 'system', language: 'en', autoContinue: true } as Settings
  const impls = Object.fromEntries(engines.map((id) => {
    const fake = fakeEngine(id, { delayMs: 1 })
    return [id, { ...fake, run: (turn: Turn) => { turns.push(turn); return fake.run(turn) } }]
  })) as Record<EngineId, Engine>
  const memory = new Memories({ db, engines: impls, settings: async () => settings, emit: () => {}, workDir: join(dir, 'work') })
  runner = new Runner({ db, engines: impls, settings: async () => settings, emit: () => {}, workDir: join(dir, 'work'), memory })
  const agent: Agent = { id: 'a', name: 'Agent a', handle: 'agent-a', role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 0, used: 0, grants: {}, memory: 'read', computer: false, archived: false }
  db.saveAgent(agent)
  db.createConversation({ id: 'dm-a', kind: 'dm', name: 'Agent a', members: ['a'] })
})

afterEach(async () => { await runner.idle(); db.close() })

const stuck = (id: string, at: number, steps = true): void => {
  db.saveMessage({ id: `ask-${id}`, conversationId: 'dm-a', author: { kind: 'person', id: db.ownerId() }, text: `Request ${id}`, at: at - 1 })
  db.saveMessage({
    id, conversationId: 'dm-a', author: { kind: 'agent', id: 'a' }, text: '', at,
    run: { status: 'working', task: 'fix it', steps: steps ? [{ id: 's1', label: 'Ran npx vitest run', status: 'done' }, { id: 's2', label: 'Thinking', status: 'running' }] : [] }
  } as Message)
}

it('takes a reply no runner owns as cut, once it has been dead for a while', () => {
  const now = Date.now()
  stuck('dead', now)
  // The first pass only remembers it: the gap between a reply being saved and its runner taking it is
  // milliseconds, so one look is a race.
  expect(runner.sweepOrphans(now)).toEqual([])
  expect(db.message('dead')!.run!.status).toBe('working')
  expect(runner.sweepOrphans(now + 30_000)).toEqual([])
  expect(runner.sweepOrphans(now + 61_000)).toEqual(['dead'])
  const run = db.message('dead')!.run!
  expect(run.status).toBe('interrupted')
  expect(run.restartPending).toBe(true)
  expect(run.cutAt).toBe(now + 61_000)
  // What was still running when it died is not left spinning.
  expect(run.steps.find((s) => s.id === 's2')!.status).toBe('error')
})

it('leaves the router note alone, and forgets a reply that came back to life', () => {
  const now = Date.now()
  stuck('note', now, false) // no steps: "Picking who answers…", which no runner owns while the router thinks
  expect(runner.sweepOrphans(now + 120_000)).toEqual([])
  expect(db.message('note')!.run!.status).toBe('working')
  stuck('revived', now)
  runner.sweepOrphans(now)
  db.saveMessage({ ...db.message('revived')!, run: { ...db.message('revived')!.run!, status: 'done' } })
  expect(runner.sweepOrphans(now + 120_000)).toEqual([])
})

it('goes on by itself from a reply whose turn died, as at a restart', async () => {
  const now = Date.now()
  stuck('dead', now)
  runner.sweepOrphans(now)
  const cut = runner.sweepOrphans(now + 61_000)
  expect(cut).toEqual(['dead'])
  await runner.resumeInterrupted(cut)
  await runner.idle()
  expect(turns).toHaveLength(1)
  const after = db.messages().filter((m) => m.conversationId === 'dm-a' && m.author.kind === 'agent' && m.id !== 'dead')
  expect(after).toHaveLength(1)
  expect(after[0]!.text.trim().length).toBeGreaterThan(0)
})

it('stops picking a reply up by itself after three tries, and leaves the Continue', async () => {
  const now = Date.now()
  stuck('dead', now)
  const first = db.message('dead')!
  db.saveMessage({ ...first, run: { ...first.run!, resumes: 3 } })
  runner.sweepOrphans(now)
  const cut = runner.sweepOrphans(now + 61_000)
  await runner.resumeInterrupted(cut)
  await runner.idle()
  expect(turns).toHaveLength(0)
  const run = db.message('dead')!.run!
  expect(run.status).toBe('interrupted')
  expect(run.restartPending).toBeUndefined()
})
