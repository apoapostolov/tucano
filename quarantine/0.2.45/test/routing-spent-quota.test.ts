import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { defaultRouting, targetId, type RoutingConfig } from '../src/shared/routing'
import { customModel, type Agent, type EngineId, type Message, type Settings } from '../src/shared/types'
import { Db } from '../src/core/db'
import { fakeEngine } from '../src/core/engines/fake'
import type { Engine, Turn } from '../src/core/engines/types'
import { Runner } from '../src/core/runs'

// Apo's live setup, in the shape that made a reply impossible to start: the free pool out of the
// way, hard work on the Codex weekly tier, everyday work on Pi — and the Codex week used up until
// the 22nd (its own app-server said so). Routing handed the reply to Codex, Codex answered "you're
// at your limit", and the reply died where the tier below could have run it. Nothing in the chain
// may end a reply: a spent subscription is a reason to walk one step further.

const ready = { installed: true, loggedIn: true }
const target = (engine: EngineId, model: string, effort: 'low' | 'medium' | 'high' | 'xhigh' = 'medium') => ({ id: targetId({ engine, model, effort }), engine, model, effort })
const DAY = 86_400_000

const setup = (): RoutingConfig => {
  const base = defaultRouting()
  return {
    ...base,
    enabled: true,
    free: { policy: 'off' },
    pools: {
      ...base.pools,
      t3: { descriptor: 't3', chain: [target('pi', customModel('pi', 'deepseek/deepseek-flash'), 'high')] },
      t4: { descriptor: 't4', chain: [target('codex', customModel('codex', 'gpt-6.1-sol'), 'medium')] }
    }
  }
}

const agent = (): Agent => ({ id: 'a1', name: 'tinker', handle: 'tinker', role: '', color: 'sky', instructions: '', modelId: 'pi:opencode-go/deepseek-v4.1-flash', effort: 'medium', limit: 1_000_000, used: 0, grants: {}, memory: 'auto', computer: false, archived: false })

// A hard request: code and a lot of capability, which asks for t4 — the Codex tier.
const hard = (): unknown => ({ answers: { acao: { choice: 'code', confidence: 0.9, probabilities: { code: 0.9 } }, complexidade: { score: 3 }, capacidade: { score: 3 }, raciocinio: { noul: 0.6 } } })

let db: Db
let settings: Settings
let turns: Turn[]

function runner(): Runner {
  turns = []
  const wrap = (id: EngineId): Engine => {
    const e = fakeEngine(id, { delayMs: 1 })
    return { id: e.id, run: (t) => (turns.push(t), e.run(t)) }
  }
  const engines = { claude: wrap('claude'), codex: wrap('codex'), opencode: wrap('opencode'), pi: wrap('pi'), antigravity: wrap('antigravity'), cursor: wrap('cursor'), grok: wrap('grok'), cline: wrap('cline'), hermes: wrap('hermes'), endpoint: wrap('endpoint') } as Record<EngineId, Engine>
  return new Runner({ db, engines, settings: async () => settings, emit: () => {}, workDir: mkdtempSync(join(tmpdir(), 'ad-work-')), jev: { key: async () => 'k-1', fetch: (async () => Response.json(hard())) as unknown as typeof fetch } })
}

const reply = (): Message | undefined => db.messages().filter((m) => m.author.kind === 'agent').at(-1)

beforeEach(() => {
  db = new Db(join(mkdtempSync(join(tmpdir(), 'ad-db-')), 'test.db'))
  settings = {
    workspaceName: 'Apo', context: '',
    engines: { claude: ready, codex: ready, opencode: ready, pi: ready, antigravity: ready, cursor: ready, grok: ready, cline: ready, hermes: ready, endpoint: ready } as Settings['engines'],
    harnesses: ['codex', 'opencode', 'pi', 'antigravity', 'hermes'],
    routerModel: 'pi:opencode-go/deepseek-v4.1-flash', memoryModel: 'pi:opencode-go/deepseek-v4.1-flash', memoryLearning: 'approve',
    defaultLimit: 1000, approvalTtlHours: 24, theme: 'system', language: 'pt',
    routing: setup()
  } as Settings
  db.saveAgent(agent())
  db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
})

describe('a chain entry whose subscription is spent', () => {
  it('runs the reply on the tier below instead of dying on the dead one', async () => {
    settings.codexQuota = { windows: [{ minutes: 300, utilization: 0.1, resetsAt: Date.now() + DAY }, { minutes: 10_080, utilization: 1, resetsAt: Date.now() + 3 * DAY }], plan: 'plus', at: Date.now() }
    const r = runner()
    await r.send('d1', 'refaça o motor de sessões')
    await r.idle()

    const m = reply()
    expect(m?.run?.status).toBe('done')
    // The tier the read asked for is still the one it asked for; what served it is the one below.
    expect(m?.run?.route?.requested).toBe('t4')
    expect(m?.run?.route?.selected?.engine).toBe('pi')
    expect(turns.at(-1)).toMatchObject({ model: 'deepseek/deepseek-flash', effort: 'high' })
    // And the line over the reply says why the Codex tier was passed over, with the day it frees up.
    const codex = m?.run?.route?.attempts.find((a) => a.engine === 'codex')
    expect(codex?.skip).toMatch(/semanal/)
  })

  it('uses the tier again once its window has turned over', async () => {
    settings.codexQuota = { windows: [{ minutes: 10_080, utilization: 1, resetsAt: Date.now() - 60_000 }], plan: 'plus', at: Date.now() }
    const r = runner()
    await r.send('d1', 'refaça o motor de sessões')
    await r.idle()

    expect(reply()?.run?.status).toBe('done')
    expect(reply()?.run?.route?.selected?.engine).toBe('codex')
    expect(turns.at(-1)).toMatchObject({ model: 'gpt-6.1-sol', effort: 'medium' })
  })

  it('keeps a spent Claude window out of the same walk', async () => {
    settings.routing = { ...setup(), pools: { ...setup().pools, t4: { descriptor: 't4', chain: [target('claude', 'claude-opus-4-6', 'medium')] } } }
    settings.quota = { fiveHour: { utilization: 1, resetsAt: Date.now() + 3600_000 }, at: Date.now() }
    settings.harnesses = [...(settings.harnesses ?? []), 'claude']
    const r = runner()
    await r.send('d1', 'refaça o motor de sessões')
    await r.idle()

    expect(reply()?.run?.status).toBe('done')
    expect(reply()?.run?.route?.selected?.engine).toBe('pi')
    expect(reply()?.run?.route?.attempts.find((a) => a.engine === 'claude')?.skip).toMatch(/5 horas|5-hour/)
  })
})
