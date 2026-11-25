// The queue behind a conversation's replies-at-once cap, and the controls on its rows in the work
// drawer: prompts start in written order as a slot frees, a person's order survives a restart, Start
// bypasses the cap once, Drop takes a waiting prompt and its message out together, and no deleted prompt
// ever answers afterwards. Adapted from the 0.2.44 queue tests to this driver's runner (`repliesAtOnce`,
// the convWaiting queue, `reorderQueued` / `startQueued` / `dropQueued` in runs.ts).
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
const agent = (id: string, handle: string): Agent => ({ id, name: handle, handle, role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 1_000_000, used: 0, grants: {}, memory: 'auto', computer: false, archived: false })

describe('the work drawer queue', () => {
  let db: Db
  let settings: Settings
  let started: string[]
  let gates: Map<string, () => void> // prompt text → the open that releases that reply
  let released: Set<string> // prompts freed before their reply got as far as the engine
  let runner: Runner
  let events: { type: string; id?: string; message?: Message }[]

  beforeEach(() => {
    db = new Db(join(mkdtempSync(join(tmpdir(), 'wdq-db-')), 'test.db'))
    started = []
    gates = new Map()
    released = new Set()
    events = []
    const base = fakeEngine('claude', { delayMs: 1 })
    // Each reply holds until the test releases it, so a slot frees at a known moment. Which prompt a
    // turn answers comes from the conversation's newest person message that isn't queued and hasn't
    // started yet, so reordering the queue is visible in the order replies begin.
    const claude: Engine = {
      ...base,
      async *run(t: Turn) {
        const prompt = db.messages().filter((m) => m.author.kind === 'person' && m.sendMode !== 'queue' && !started.includes(m.text)).at(-1)?.text ?? t.prompt
        started.push(prompt)
        if (!released.has(prompt)) await new Promise<void>((open) => gates.set(prompt, open))
        yield* base.run(t)
      }
    }
    const engines = { claude, codex: fakeEngine('codex'), opencode: fakeEngine('opencode'), pi: fakeEngine('pi'), antigravity: fakeEngine('antigravity'), cursor: fakeEngine('cursor'), grok: fakeEngine('grok'), cline: fakeEngine('cline'), hermes: fakeEngine('hermes'), endpoint: fakeEngine('endpoint') } as Record<EngineId, Engine>
    settings = { workspaceName: 'Edu', context: '', engines: { claude: ready, codex: ready, opencode: ready, pi: ready, antigravity: ready, cursor: ready, grok: ready, cline: ready, hermes: ready, endpoint: ready }, routerModel: 'haiku', memoryModel: 'haiku', memoryLearning: 'approve', defaultLimit: 1000, approvalTtlHours: 24, theme: 'system', language: 'pt' }
    runner = new Runner({ db, engines, settings: async () => settings, emit: (e) => events.push(e as typeof events[number]), workDir: mkdtempSync(join(tmpdir(), 'wdq-work-')) })
    db.saveAgent(agent('a1', 'lia'))
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
  })

  const release = (...prompts: string[]): void => {
    for (const p of prompts) {
      released.add(p)
      gates.get(p)?.()
      gates.delete(p)
    }
  }
  const send = (text: string, conv = 'd1'): Promise<void> => runner.send(conv, text)
  const queued = (): string[] => db.queuedMessages().map((m) => m.text)
  const idOf = (text: string): string => db.messages().find((m) => m.text === text)!.id
  const replies = (): Message[] => db.messages().filter((m) => m.author.kind === 'agent')

  it('starts in written order as a slot frees, not when the whole conversation goes quiet', async () => {
    settings.repliesAtOnce = 2
    await send('um')
    await send('dois')
    await send('tres')
    expect(started).toEqual(['um', 'dois'])
    expect(queued()).toEqual(['tres'])
    release('um')
    await expect.poll(() => started).toEqual(['um', 'dois', 'tres'])
    expect(queued()).toEqual([])
    release('dois', 'tres')
    await runner.idle()
  })

  it('drains in the order a person reordered, and keeps that order across a restart', async () => {
    settings.repliesAtOnce = 1
    await send('um')
    await send('dois')
    await send('tres')
    const ids = db.queuedMessages().map((m) => m.id)
    expect(ids).toHaveLength(2)
    runner.reorderQueued('d1', [ids[1]!, ids[0]!])
    expect(queued()).toEqual(['tres', 'dois'])
    expect(db.message(ids[1]!)?.queuePos).toBe(0)
    expect(db.message(ids[0]!)?.queuePos).toBe(1)
    expect(events.filter((e) => e.type === 'message' && e.message?.queuePos !== undefined)).toHaveLength(2)
    release('um')
    await expect.poll(() => started).toEqual(['um', 'tres'])
    release('tres')
    await expect.poll(() => started).toEqual(['um', 'tres', 'dois'])
    release('dois')
    await runner.idle()
  })

  it('puts omitted queued prompts after the ones named, in written order', async () => {
    settings.repliesAtOnce = 1
    await send('um')
    await send('dois')
    await send('tres')
    await send('quatro')
    const [, b] = db.queuedMessages().map((m) => m.id)
    runner.reorderQueued('d1', [b!])
    expect(queued()).toEqual(['tres', 'dois', 'quatro'])
    release('um', 'tres', 'dois', 'quatro')
    await runner.idle()
  })

  it('starts past the cap exactly once, whether it waits in memory or only in the database', async () => {
    settings.repliesAtOnce = 1
    await send('um')
    await send('dois')
    expect(started).toEqual(['um'])
    const waiting = db.queuedMessages()
    expect(waiting).toHaveLength(1)
    runner.startQueued(waiting[0]!.id)
    runner.startQueued(waiting[0]!.id) // twice must not start it twice
    await expect.poll(() => started).toEqual(['um', 'dois'])
    expect(db.message(waiting[0]!.id)?.sendMode).toBeUndefined()
    expect(db.message(waiting[0]!.id)?.queuePos).toBeUndefined()
    // A prompt marked in the database but not in this session's waiting line (a restart) also goes now.
    const m: Message = { id: 'db-only', conversationId: 'd1', author: { kind: 'person', id: db.ownerId() }, text: 'db-only', at: Date.now(), sendMode: 'queue' }
    db.saveMessage(m)
    runner.startQueued(m.id)
    await expect.poll(() => started).toEqual(['um', 'dois', 'db-only'])
    expect(db.message(m.id)?.sendMode).toBeUndefined()
    release('um', 'dois', 'db-only')
    await runner.idle()
  })

  it('drops a waiting prompt: its job goes, its message and scoped rows go, and it never starts', async () => {
    settings.repliesAtOnce = 1
    await send('um')
    await send('dois')
    const id = idOf('dois')
    db.saveMessage({ ...db.message(id)!, threadId: id }) // a message-scoped row the delete must take too
    runner.dropQueued(id)
    expect(db.message(id)).toBeUndefined()
    expect(db.messages().some((m) => m.threadId === id)).toBe(false)
    expect(events.filter((e) => e.type === 'message_removed').map((e) => e.id)).toEqual([id])
    expect(queued()).toEqual([])
    release('um')
    await runner.idle()
    expect(started).toEqual(['um'])
    expect(replies()).toHaveLength(1)
  })

  it('leaves an already-started prompt alone on Drop', async () => {
    settings.repliesAtOnce = 1
    await send('um')
    await send('dois')
    const startedId = idOf('um')
    const waitingId = idOf('dois')
    runner.dropQueued(startedId)
    expect(db.message(startedId)).toBeDefined()
    expect(events.some((e) => e.type === 'message_removed')).toBe(false)
    runner.dropQueued(waitingId)
    expect(db.message(waitingId)).toBeUndefined()
    release('um')
    await runner.idle()
    expect(started).toEqual(['um'])
  })

  it('rejects another conversation’s ids, duplicates, and more than 500 ids', async () => {
    settings.repliesAtOnce = 1
    db.createConversation({ id: 'd2', kind: 'dm', name: 'a1', members: ['a1'] })
    await send('um')
    await send('dois')
    const ids = db.queuedMessages().map((m) => m.id)
    const otherId = 'other-conv-message'
    db.saveMessage({ id: otherId, conversationId: 'd2', author: { kind: 'person', id: db.ownerId() }, text: 'de outra conversa', at: 1 })
    expect(() => runner.reorderQueued('d1', [otherId])).toThrow(/fila desta conversa|queue/)
    expect(() => runner.reorderQueued('d1', [ids[0]!, ids[0]!])).toThrow(/duas vezes|twice/)
    expect(() => runner.reorderQueued('d1', Array(501).fill(ids[0]))).toThrow(/Ordem grande|Too many/)
    expect(db.message(ids[0]!)?.queuePos).toBeUndefined()
    release('um', 'dois')
    await runner.idle()
  })

  it('clears the queue mark and position together, and never resurrects a deleted prompt', async () => {
    settings.repliesAtOnce = 1
    await send('um')
    await send('dois')
    const id = idOf('dois')
    db.setQueuePos(id, 0)
    expect(db.message(id)?.queuePos).toBe(0)
    // clearWaiting writes only the two columns: a whole-message upsert would put the row back.
    db.deleteMessage(id)
    db.clearQueueMark(id)
    expect(db.message(id)).toBeUndefined()
    release('um')
    await runner.idle()
    expect(started).toEqual(['um'])
  })

  it('a queued prompt waiting when a conversation is cleaned never starts into it', async () => {
    settings.repliesAtOnce = 1
    await send('um')
    await send('dois')
    expect(queued()).toEqual(['dois'])
    runner.forgetConversation('d1') // what cleanConversation / deleteConversation call
    db.cleanConversation('d1')
    expect(db.queuedMessages()).toEqual([])
    release('um')
    await runner.idle()
    expect(started).toEqual(['um'])
  })
})
