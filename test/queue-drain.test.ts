// Past the channel's cap ("Parallel sessions per channel", Settings › Agents), a prompt waits in
// the queue: it says so on the message and in the work drawer. Two things about that queue are
// pinned here — it starts from the FIRST prompt sent, and it starts as soon as a slot frees, not
// when the whole channel goes quiet. A person who reorders the queue in the drawer (runs.ts,
// `reorderQueued`) is followed too. See `send`, `runIn`, `settleIn` and `drainIn` in src/core/runs.ts.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Agent, EngineId, Settings } from '../src/shared/types'
import { Db } from '../src/core/db'
import { fakeEngine } from '../src/core/engines/fake'
import type { Engine, Turn } from '../src/core/engines/types'
import { Runner } from '../src/core/runs'

const ready = { installed: true, loggedIn: true }
const WORDS = ['um', 'dois', 'tres']
const agent = (id: string, handle: string): Agent => ({ id, name: handle, handle, role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 1_000_000, used: 0, grants: {}, memory: 'auto', computer: false, archived: false })

describe('the queue past the cap', () => {
  let db: Db
  let settings: Settings
  let started: string[]
  let released: Set<string>
  let openers: Map<string, () => void>
  let runner: Runner

  beforeEach(() => {
    db = new Db(join(mkdtempSync(join(tmpdir(), 'qd-db-')), 'test.db'))
    started = []
    released = new Set()
    openers = new Map()
    const base = fakeEngine('claude', { delayMs: 1 })
    // Every prompt holds until the test lets it go, so a test can say exactly when a slot frees.
    const claude: Engine = {
      ...base,
      async *run(t: Turn) {
        // Which prompt this turn answers: the newest of mine that is not queued and has no reply yet.
        // The conversation itself is read whole, so the text can't say it.
        const words = (m: { text: string }): string | undefined => WORDS.find((w) => m.text.includes(`pedido ${w}`))
        const mine = db.messages().filter((m) => m.author.kind === 'person' && m.sendMode !== 'queue' && !started.includes(words(m) ?? ''))
        const which = words(mine.at(-1) ?? { text: '' }) ?? t.prompt.slice(0, 30)
        started.push(which)
        if (!released.has(which)) await new Promise<void>((open) => openers.set(which, open))
        yield* base.run(t)
      }
    }
    const engines = { claude, codex: fakeEngine('codex'), opencode: fakeEngine('opencode'), pi: fakeEngine('pi'), antigravity: fakeEngine('antigravity'), cursor: fakeEngine('cursor'), grok: fakeEngine('grok'), cline: fakeEngine('cline'), hermes: fakeEngine('hermes'), endpoint: fakeEngine('endpoint') } as Record<EngineId, Engine>
    settings = { workspaceName: 'Edu', context: '', engines: { claude: ready, codex: ready, opencode: ready, pi: ready, antigravity: ready, cursor: ready, grok: ready, cline: ready, hermes: ready, endpoint: ready }, routerModel: 'haiku', memoryModel: 'haiku', memoryLearning: 'approve', defaultLimit: 1000, approvalTtlHours: 24, theme: 'system', language: 'pt' }
    runner = new Runner({ db, engines, settings: async () => settings, emit: () => {}, workDir: mkdtempSync(join(tmpdir(), 'qd-work-')) })
    db.saveAgent(agent('a1', 'lia'))
    db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
  })

  // Let a prompt answer: one that is holding now, or one that hasn't started yet when it does.
  const release = (prompt: string): void => {
    released.add(prompt)
    openers.get(prompt)?.()
  }
  const send = (text: string) => runner.send('d1', `pedido ${text}`, [], undefined, undefined, { mode: 'parallel' })
  const queued = () => db.messages().filter((m) => m.sendMode === 'queue').map((m) => WORDS.find((w) => m.text.includes(`pedido ${w}`))!)

  it('starts from the first prompt sent as soon as a slot frees, not when the channel goes quiet', async () => {
    settings.maxParallelSessions = 2
    await send('um')
    await send('dois')
    await send('tres')
    expect(started).toEqual(['um', 'dois'])
    expect(queued()).toEqual(['tres'])
    release('um') // one of the two ends: there is room again, and the third is first in line
    await expect.poll(() => started).toEqual(['um', 'dois', 'tres'])
    expect(queued()).toEqual([])
    release('dois')
    release('tres')
    await runner.idle()
  })

  it('keeps a channel at its cap and goes in the order they were written', async () => {
    settings.maxParallelSessions = 1
    await send('um')
    await send('dois')
    await send('tres')
    expect(started).toEqual(['um'])
    expect(queued()).toEqual(['dois', 'tres'])
    release('um')
    await expect.poll(() => started).toEqual(['um', 'dois'])
    expect(queued()).toEqual(['tres'])
    release('dois')
    await expect.poll(() => started).toEqual(['um', 'dois', 'tres'])
    release('tres')
    await runner.idle()
    expect(db.messages().filter((m) => m.author.kind === 'agent').map((m) => m.run?.status)).toEqual(['done', 'done', 'done'])
  })

  it('follows the order a person puts the queue in, and keeps it for a restart', async () => {
    settings.maxParallelSessions = 1
    await send('um')
    await send('dois')
    await send('tres')
    const ids = db.messages().filter((m) => m.sendMode === 'queue').map((m) => m.id)
    expect(ids).toHaveLength(2)
    runner.reorderQueued('d1', [ids[1]!, ids[0]!]) // three before two
    // What a restart reads: the same order.
    expect(db.queuedMessages().map((m) => WORDS.find((w) => m.text.includes(`pedido ${w}`))!)).toEqual(['tres', 'dois'])
    release('um')
    await expect.poll(() => started).toEqual(['um', 'tres'])
    release('tres')
    await expect.poll(() => started).toEqual(['um', 'tres', 'dois'])
    release('dois')
    await runner.idle()
  })
})
