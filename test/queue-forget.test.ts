// A queued prompt whose message was deleted never answers afterwards: what waited to answer it lets go
// the moment the message leaves (runs.ts `forget`, called by `deleteMessage` and the retention sweep),
// and a line already on the queue is caught by `executeReply`, which sees the prompt is no longer there.
// The report it answers: "deleted queues are not really deleted even if their posts are deleted from the
// view — they still trigger when slots empty."
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

describe('a queued prompt whose message is deleted', () => {
  let db: Db
  let settings: Settings
  let started: string[]
  let released: Set<string>
  let openers: Map<string, () => void>
  let runner: Runner

  beforeEach(() => {
    db = new Db(join(mkdtempSync(join(tmpdir(), 'forget-db-')), 'test.db'))
    started = []
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
      emit: () => undefined,
      workDir: mkdtempSync(join(tmpdir(), 'forget-work-'))
    })
    db.saveAgent(agent('a1', 'lia'))
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
  })

  const release = (prompt: string): void => {
    released.add(prompt)
    openers.get(prompt)?.()
  }
  const send = (text: string): Promise<void> => runner.send('d1', `pedido ${text}`, [], undefined, undefined, { mode: 'parallel' })
  const idOf = (word: string): string => db.messages().find((m) => m.text.includes(`pedido ${word}`))!.id
  const replies = (): Message[] => db.messages().filter((m) => m.author.kind === 'agent')

  it('is deleted the way the core deletes a prompt: its line goes with it, and the queue behind it takes its turn', async () => {
    await send('um')
    await send('dois')
    await send('tres')
    const id = idOf('dois')
    // What `deleteMessage` does: the runner lets go of the message first, then the row and its thread go.
    runner.forget(id)
    db.deleteMessage(id)
    expect(db.message(id)).toBeUndefined()
    release('um')
    // Only what is still in the room runs, in the order it was written.
    await expect.poll(() => started).toEqual(['um', 'tres'])
    release('tres')
    await runner.idle()
    expect(started).not.toContain('dois')
    // One reply per prompt that is still there: nothing was answerered in the deleted prompt's place.
    expect(replies()).toHaveLength(2)
  })

  it('never puts a reply in the room even when the row went without the runner hearing of it', async () => {
    await send('um')
    await send('dois')
    const id = idOf('dois')
    // The row gone behind the runner's back (another process, a sweep that did not tell it): the line
    // it waited in is still there, so what stops it is the check before a reply starts.
    db.deleteMessage(id)
    release('um')
    await expect.poll(() => started).toEqual(['um'])
    await runner.idle()
    expect(started).toEqual(['um'])
    expect(replies()).toHaveLength(1)
  })

  it('forgets one conversation without touching another one’s queue', async () => {
    db.createConversation({ id: 'd2', kind: 'dm', name: 'a1', members: ['a1'] })
    await send('um')
    await send('dois') // waiting in d1
    await runner.send('d2', 'pedido tres', [], undefined, undefined, { mode: 'parallel' }) // runs in d2
    const id = idOf('dois')
    runner.forget(id)
    db.deleteMessage(id)
    release('um')
    await expect.poll(() => started).toEqual(['um', 'tres'])
    release('tres')
    await runner.idle()
    expect(started).toEqual(['um', 'tres'])
  })
})
