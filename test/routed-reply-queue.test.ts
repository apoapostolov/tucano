import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import type { Agent, EngineId, Settings } from '../src/shared/types'
import { Db } from '../src/core/db'
import { fakeEngine } from '../src/core/engines/fake'
import type { Engine, Turn } from '../src/core/engines/types'
import { Gateway } from '../src/core/gateway'
import { Runner } from '../src/core/runs'
import { routerSystem } from '../src/core/router'

const until = async (ready: () => boolean, detail = () => ''): Promise<void> => {
  const end = Date.now() + 8000
  while (!ready()) {
    if (Date.now() > end) throw new Error(`queue did not reach the expected state: ${detail()}`)
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
}
const agent = (id: string, modelId = 'sonnet'): Agent => ({
  id, handle: id, name: id === 'theo' ? 'Theo' : id, role: id === 'theo' ? 'Dados' : 'Engenharia',
  color: 'sky', instructions: '', modelId, effort: 'low', limit: 1_000_000, used: 0,
  grants: {}, memory: 'read', computer: false, archived: false
})

it('keeps a routed reply behind a real queued reservation, then answers it after the routine', async () => {
  const root = mkdtempSync(join(tmpdir(), 'tucano-routing-queue-'))
  const db = new Db(join(root, 'test.db'))
  const gateway = new Gateway()
  await gateway.start()
  let release!: () => void
  const blocked = new Promise<void>((resolve) => { release = resolve })
  let workers = 0
  let theoStarts = 0
  let theoActive = 0
  let maxTheo = 0
  const wrap = (id: EngineId): Engine => {
    const base = fakeEngine(id, { delayMs: 1 })
    return {
      id,
      async *run(turn: Turn) {
        if (turn.system === routerSystem()) {
          yield { type: 'done', text: JSON.stringify({ handles: ['theo'], reason: 'dados' }), usage: { inputTokens: 1, cacheReadTokens: 0, outputTokens: 1 } }
          return
        }
        if (turn.agentKey?.startsWith('worker')) {
          workers++
          await blocked
        }
        const theo = turn.agentKey === 'theo'
        if (theo) {
          theoStarts++
          maxTheo = Math.max(maxTheo, ++theoActive)
        }
        try { yield* base.run(turn) } finally { if (theo) theoActive-- }
      }
    }
  }
  const ids: EngineId[] = ['claude', 'codex', 'opencode', 'pi', 'antigravity', 'cursor', 'grok', 'cline', 'hermes']
  const engines = Object.fromEntries(ids.map((id) => [id, wrap(id)])) as Record<EngineId, Engine>
  const settings = {
    workspaceName: 'Edu', context: '', routerModel: 'haiku', memoryModel: 'haiku',
    engines: Object.fromEntries(ids.map((id) => [id, { installed: true, loggedIn: true }]))
  } as Settings
  const runner = new Runner({ db, gateway, engines, settings: async () => settings, emit: () => {}, workDir: join(root, 'work') })
  const routine = (id: string, agentId: string, conversationId: string) => ({
    id, name: id, agentId, conversationId, prompt: 'rotina', schedule: { days: [1], time: '09:00' }, enabled: true, createdAt: 1
  })
  const jobs: Promise<unknown>[] = []
  try {
    for (let i = 0; i < 4; i++) {
      const id = `worker${i}`
      db.saveAgent(agent(id))
      db.createConversation({ id, kind: 'dm', name: id, members: [id] })
      jobs.push(runner.runRoutine(routine(id, id, id), { scheduledAt: 1, late: false }))
    }
    await until(() => workers === 4)
    db.saveAgent(agent('lia'))
    db.saveAgent(agent('theo', 'gpt-5.6-luna'))
    db.createConversation({ id: 'room', kind: 'channel', name: 'engenharia', members: ['lia', 'theo'] })
    jobs.push(runner.runRoutine(routine('queued', 'theo', 'room'), { scheduledAt: 1, late: false }))
    await runner.send('room', 'qual foi a receita da semana?')
    await until(() => db.messages().some((m) => m.author.kind === 'system' && m.text.toLowerCase().includes('theo')), () => JSON.stringify(db.messages().filter((m) => m.author.kind === 'system').map((m) => m.text)))
    expect(theoStarts).toBe(0)
    release()
    await Promise.all(jobs)
    await runner.idle()
    expect(theoStarts).toBe(2)
    expect(maxTheo).toBe(1)
    const replies = db.messages().filter((m) => m.author.kind === 'agent' && m.author.id === 'theo')
    expect(replies).toHaveLength(2)
    expect(replies.every((m) => m.run?.status === 'done')).toBe(true)
  } finally {
    release()
    await Promise.allSettled(jobs)
    await runner.idle()
    await gateway.stop()
    db.close()
  }
})
