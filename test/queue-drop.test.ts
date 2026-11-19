// A queued prompt taken back before it went (the x on its row in the work drawer, runs.ts `dropQueued`):
// the line it waited in goes, so nothing starts it afterwards, and the message goes with it — the row in
// the drawer and the pill it already put in the conversation are one message, so both leave together.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Agent, EngineId, Message, Settings } from '../src/shared/types'
import { Db } from '../src/core/db'
import { fakeEngine } from '../src/core/engines/fake'
import type { Engine, Turn } from '../src/core/engines/types'
import { Runner } from '../src/core/runs'

const ready = { installed: true, loggedIn: true }
const WORDS = ['um', 'dois', 'tres']
const agent = (id: string, handle: string): Agent => ({ id, name: handle, handle, role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 1_000_000, used: 0, grants: {}, memory: 'auto', computer: false, archived: false })

describe('taking a prompt back out of the queue', () => {
  let db: Db
  let settings: Settings
  let started: string[]
  let released: Set<string>
  let openers: Map<string, () => void>
  let events: { type: string; id?: string }[]
  let runner: Runner

  beforeEach(() => {
    db = new Db(join(mkdtempSync(join(tmpdir(), 'drop-db-')), 'test.db'))
    started = []
    events = []
    released = new Set()
    openers = new Map()
    const base = fakeEngine('claude', { delayMs: 1 })
    const claude: Engine = {
      ...base,
      async *run(t: Turn) {
        const words = (m: { text: string }): string | undefined => WORDS.find((w) => m.text.includes(`pedido ${w}`))
        const mine = db.messages().filter((m) => m.author.kind === 'person' && m.sendMode !== 'queue' && !started.includes(words(m) ?? ''))
        const which = words(mine.at(-1) ?? { text: '' }) ?? t.prompt.slice(0, 30)
        started.push(which)
        if (!released.has(which)) await new Promise<void>((open) => openers.set(which, open))
        yield* base.run(t)
      }
    }
    const engines = { claude, codex: fakeEngine('codex'), opencode: fakeEngine('opencode'), pi: fakeEngine('pi'), antigravity: fakeEngine('antigravity'), cursor: fakeEngine('cursor'), grok: fakeEngine('grok'), cline: fakeEngine('cline'), hermes: fakeEngine('hermes'), endpoint: fakeEngine('endpoint') } as Record<EngineId, Engine>
    settings = { workspaceName: 'Edu', context: '', engines: { claude: ready, codex: ready, opencode: ready, pi: ready, antigravity: ready, cursor: ready, grok: ready, cline: ready, hermes: ready, endpoint: ready }, routerModel: 'haiku', memoryModel: 'haiku', memoryLearning: 'approve', defaultLimit: 1000, approvalTtlHours: 24, theme: 'system', language: 'pt', maxParallelSessions: 1 }
    runner = new Runner({
      db,
      engines,
      settings: async () => settings,
      emit: (e) => void events.push(e as { type: string; id?: string }),
      workDir: mkdtempSync(join(tmpdir(), 'drop-work-'))
    })
    db.saveAgent(agent('a1', 'lia'))
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
  })

  const release = (prompt: string): void => {
    released.add(prompt)
    openers.get(prompt)?.()
  }
  const send = (text: string): Promise<void> => runner.send('d1', `pedido ${text}`, [], undefined, undefined, { mode: 'parallel' })
  const queued = (): string[] => db.messages().filter((m) => m.sendMode === 'queue').map((m) => WORDS.find((w) => m.text.includes(`pedido ${w}`))!)
  const idOf = (word: string): string => db.messages().find((m) => m.text.includes(`pedido ${word}`))!.id

  it('never starts the prompt and takes its message out of the room', async () => {
    await send('um')
    await send('dois')
    await send('tres')
    expect(queued()).toEqual(['dois', 'tres'])
    const id = idOf('dois')
    runner.dropQueued(id)
    // The pill the prompt put in the conversation goes with it: one message, so one removal.
    expect(db.messages().some((m) => m.text.includes('pedido dois'))).toBe(false)
    expect(queued()).toEqual(['tres'])
    expect(events.filter((e) => e.type === 'message_removed').map((e) => e.id)).toEqual([id])
    release('um')
    // The one behind it takes its turn in the order it was written; the dropped one never comes back.
    await expect.poll(() => started).toEqual(['um', 'tres'])
    expect(started).not.toContain('dois')
    release('tres')
    await runner.idle()
    expect(db.messages().filter((m) => m.author.kind === 'agent').map((m) => m.run?.status)).toEqual(['done', 'done'])
  })

  it('says the message is gone, so the row leaves the drawer and the conversation in the same step', async () => {
    await send('um')
    await send('dois')
    const id = idOf('dois')
    runner.dropQueued(id)
    expect(events.filter((e) => e.type === 'message_removed')).toEqual([{ type: 'message_removed', id, conversationId: 'd1' }])
    release('um')
    await runner.idle()
  })

  it('drops a prompt that was never handed to this session, reading it from the database', async () => {
    // What another process queued, or a restart that has not read it yet: it goes all the same.
    db.saveMessage({ id: 'q1', conversationId: 'd1', author: { kind: 'person', id: 'ana' }, text: 'pedido dois', at: 1, sendMode: 'queue' } as Message)
    runner.dropQueued('q1')
    expect(db.message('q1')).toBeUndefined()
  })

  it('leaves a prompt that already started alone: it carries no queue mark any more', async () => {
    await send('um')
    await send('dois')
    release('um')
    await expect.poll(() => started).toEqual(['um', 'dois'])
    await expect.poll(() => db.messages().some((m) => m.text.includes('pedido dois') && m.sendMode === 'queue')).toBe(false)
    runner.dropQueued(idOf('dois'))
    expect(db.messages().some((m) => m.text.includes('pedido dois'))).toBe(true) // still in the room, still answering
    release('dois')
    await runner.idle()
  })
})
