// A person's Continue on a session that shows no answer at all: the app cut it while it worked, a
// continuation was started from the row (which is why the row reads `done`, with `cutAt` behind it) and
// the words never came. The core used to refuse it — `canResume` read the status alone — so the pill
// would have done nothing even where it showed.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { Db } from '../src/core/db'
import { Runner } from '../src/core/runs'
import { fakeEngine } from '../src/core/engines/fake'
import { Memories } from '../src/core/memory'
import { canResume, finishedSilently } from '../src/shared/run-progress'
import type { Agent, EngineId, Message, Settings } from '../src/shared/types'
import type { Engine } from '../src/core/engines/types'

let db: Db
let runner: Runner
const engines = ['claude', 'codex', 'opencode', 'pi', 'antigravity', 'cursor', 'grok', 'cline', 'hermes'] as const

beforeEach(() => {
  const dir = mkdtempSync(join(tmpdir(), 'tucano-continue-silent-'))
  db = new Db(join(dir, 'test.db'))
  const settings = { workspaceName: 'Test', context: '', engines: Object.fromEntries(engines.map((id) => [id, { installed: true, loggedIn: true }])), routerModel: 'haiku', memoryModel: 'haiku', memoryLearning: 'off', defaultLimit: 0, approvalTtlHours: 24, theme: 'system', language: 'en', autoContinue: true } as Settings
  const impls = Object.fromEntries(engines.map((id) => [id, fakeEngine(id, { delayMs: 1 })])) as Record<EngineId, Engine>
  const memory = new Memories({ db, engines: impls, settings: async () => settings, emit: () => {}, workDir: join(dir, 'work') })
  runner = new Runner({ db, engines: impls, settings: async () => settings, emit: () => {}, workDir: join(dir, 'work'), memory })
  const agent: Agent = { id: 'a', name: 'Agent a', handle: 'agent-a', role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 0, used: 0, grants: {}, memory: 'read', computer: false, archived: false }
  db.saveAgent(agent)
  db.createConversation({ id: 'dm-a', kind: 'dm', name: 'Agent a', members: ['a'] })
})

afterEach(async () => { await runner.idle(); db.close() })

// A row the app cut and then continued from: `done`, no words, the cut still recorded.
const silent = (): void => {
  db.saveMessage({ id: 'ask', conversationId: 'dm-a', author: { kind: 'person', id: db.ownerId() }, text: 'Request', at: 1000 })
  db.saveMessage({
    id: 'cut', conversationId: 'dm-a', author: { kind: 'agent', id: 'a' }, text: '', at: 1001,
    run: { status: 'done', cutAt: 900, task: 'fix the test', steps: [{ id: 's1', label: 'Ran npx vitest run', status: 'done' }] }
  } as Message)
}

it('reads a done row with no words as resumable', () => {
  silent()
  const run = db.message('cut')!.run!
  expect(finishedSilently(run, '')).toBe(true)
  expect(canResume(run, '')).toBe(true)
  // With an answer, it is a finished reply: no Continue is owed.
  expect(canResume(run, 'Done.')).toBe(false)
})

it('goes on from it when the person presses Continue', async () => {
  silent()
  await runner.continue('cut')
  await runner.idle()
  const replies = db.messages().filter((m) => m.conversationId === 'dm-a').filter((m) => m.author.kind === 'agent' && m.id !== 'cut')
  expect(replies).toHaveLength(1)
  expect(replies[0]!.text.trim().length).toBeGreaterThan(0)
  // The turn knows where it stopped: nothing written, and the work it already did.
  expect(replies[0]!.run?.task).toMatch(/never got to say anything|cortada/)
  expect(replies[0]!.run?.task).toContain('Ran npx vitest run')
})
