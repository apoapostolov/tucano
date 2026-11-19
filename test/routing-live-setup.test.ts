import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import type { CoreEvent } from '../src/shared/rpc'
import { normalizeRouting, targetId, type RoutingConfig } from '../src/shared/routing'
import { type Agent, type EngineId, type Message, type Settings } from '../src/shared/types'
import { Db } from '../src/core/db'
import { fakeEngine } from '../src/core/engines/fake'
import type { Engine, Turn } from '../src/core/engines/types'
import { Runner } from '../src/core/runs'

const ready = { installed: true, loggedIn: true }
const target = (engine: EngineId, model: string, effort: 'low' | 'medium' | 'high' | 'xhigh' = 'medium') => ({ id: targetId({ engine, model, effort }), engine, model, effort })

// Apo's own setup, verbatim: the `routing` value out of his live TucanoNext database, read the way
// the app reads it (`normalizeRouting`). Every chain entry is written the way the settings picker
// writes it, with its harness in front, and the tiers hold three different harnesses — which is
// where a routed reply died before: pi answered `Model "pi:opencode-go/…" not found`. The five
// readings below are the five ways a real prompt lands, and each must start a session.
const LIVE = {"enabled": false, "pools": {"free": {"descriptor": "Only free providers: for what isn't worth spending on.", "chain": [{"id": "pi/pi:opencode-go/beam-free#high", "engine": "pi", "model": "pi:opencode-go/beam-free", "effort": "high"}]}, "t1": {"descriptor": "Cheap and fast: a question, a one-line fix.", "chain": [{"id": "pi/pi:opencode-go/deepseek-v4.1-flash#medium", "engine": "pi", "model": "pi:opencode-go/deepseek-v4.1-flash", "effort": "medium"}, {"id": "pi/pi:opencode-go/iceman-contributor-free#medium", "engine": "pi", "model": "pi:opencode-go/iceman-contributor-free", "effort": "medium"}, {"id": "pi/pi:opencode-go/longcat-2.5-free#medium", "engine": "pi", "model": "pi:opencode-go/longcat-2.5-free", "effort": "medium"}]}, "t2": {"descriptor": "Everyday work: ordinary code and conversations.", "chain": [{"id": "pi/pi:opencode-go/deepseek-v4.1-flash#high", "engine": "pi", "model": "pi:opencode-go/deepseek-v4.1-flash", "effort": "high"}]}, "t3": {"descriptor": "Real work: several moving parts, tradeoffs to weigh.", "chain": [{"id": "pi/pi:deepseek/deepseek-flash#high", "engine": "pi", "model": "pi:deepseek/deepseek-flash", "effort": "high"}]}, "t4": {"descriptor": "Hard: architecture, a serious review, stubborn debugging.", "chain": [{"id": "codex/codex:gpt-6.1-sol#medium", "engine": "codex", "model": "codex:gpt-6.1-sol", "effort": "medium"}]}, "t5": {"descriptor": "The best there is: when being wrong costs more than the tokens.", "chain": [{"id": "codex/codex:gpt-6.1-sol#high", "engine": "codex", "model": "codex:gpt-6.1-sol", "effort": "high"}]}}, "roles": {"code": {"descriptor": "Writing or changing code, scripts or configuration until it works", "chain": []}, "review": {"descriptor": "Auditing code, a diff, a document or a plan for problems and risks", "chain": []}, "plan": {"descriptor": "Deciding what to build, sequencing work, designing an approach before any edit", "chain": []}, "debug": {"descriptor": "Diagnosing a failure, an error or odd behaviour, and finding its cause", "chain": []}, "refactor": {"descriptor": "Restructuring code that works without changing what it does", "chain": []}, "research": {"descriptor": "Searching, reading and pulling together external information or unfamiliar APIs", "chain": []}, "write": {"descriptor": "Producing prose, documentation or other non-code content from scratch", "chain": []}, "explain": {"descriptor": "Answering a question, or explaining how something works", "chain": []}, "operate": {"descriptor": "Running commands, tooling, git, deploys or setting up an environment", "chain": []}, "chat": {"descriptor": "Small talk, an acknowledgement, or a request with no real work behind it", "chain": []}}, "roleFloor": {"plan": "t3", "review": "t3"}, "free": {"policy": "fallback"}, "confidenceFloor": 0.34, "allowTier4": true, "allowTier5": false}
const live = (): RoutingConfig => ({ ...normalizeRouting(JSON.parse(JSON.stringify(LIVE))), enabled: true })

function agent(id: string, handle: string, extra: Partial<Agent> = {}): Agent {
  return { id, name: handle, handle, role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 1_000_000, used: 0, grants: {}, memory: 'auto', computer: false, archived: false, ...extra }
}

let db: Db
let events: CoreEvent[]
let settings: Settings
let turns: Turn[]

const answer = (role = 'code', complexity = 1, capability = 1, confidence: number | undefined = 0.9): unknown => ({
  answers: { acao: { choice: role, ...(confidence === undefined ? {} : { confidence }), probabilities: { [role]: 0.9 } }, complexidade: { score: complexity }, capacidade: { score: capability }, raciocinio: { noul: 0.1 } }
})

let READING: unknown = answer()

function runnerFor(): Runner {
  turns = []
  const wrap = (id: EngineId): Engine => {
    const e = fakeEngine(id, { delayMs: 1 })
    return { id: e.id, run: (t) => (turns.push(t), e.run(t)) }
  }
  const engines = { claude: wrap('claude'), codex: wrap('codex'), opencode: wrap('opencode'), pi: wrap('pi'), antigravity: wrap('antigravity'), cursor: wrap('cursor'), grok: wrap('grok'), cline: wrap('cline'), hermes: wrap('hermes'), endpoint: wrap('endpoint') } as Record<EngineId, Engine>
  return new Runner({ db, engines, settings: async () => settings, emit: (e) => events.push(e), workDir: mkdtempSync(join(tmpdir(), 'ad-work-')), jev: { key: async () => 'k-1', fetch: (async () => Response.json(READING)) as unknown as typeof fetch } })
}

const replies = (): Message[] => db.messages().filter((m) => m.author.kind === 'agent')

beforeEach(() => {
  db = new Db(join(mkdtempSync(join(tmpdir(), 'ad-db-')), 'test.db'))
  events = []
  settings = {
    workspaceName: 'Apo', context: '',
    engines: { claude: { installed: false, loggedIn: false }, codex: ready, opencode: ready, pi: ready, antigravity: ready, cursor: { installed: false, loggedIn: false }, grok: { installed: false, loggedIn: false }, cline: { installed: false, loggedIn: false }, hermes: ready, endpoint: { installed: false, loggedIn: false } } as Settings['engines'],
    harnesses: ['codex', 'opencode', 'pi', 'antigravity', 'hermes'],
    routerModel: 'pi:opencode-go/deepseek-v4.1-flash', memoryModel: 'pi:opencode-go/deepseek-v4.1-flash', memoryLearning: 'approve',
    defaultLimit: 1000, approvalTtlHours: 24, theme: 'system', language: 'pt'
  } as Settings
  db.saveAgent(agent('a1', 'tinker', { modelId: 'pi:opencode-go/deepseek-v4.1-flash', effort: 'medium' }))
  db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
})

describe("Apo's live routing setup", () => {
  const cases: [string, unknown][] = [
    ['trivial, sure', answer('chat', 0, 0, 0.9)],
    ['everyday, sure', answer('code', 1, 1, 0.9)],
    ['hard, sure', answer('code', 3, 3, 0.9)],
    ['hard, unsure', answer('code', 3, 3, 0.2)],
    ['hard, no confidence', answer('code', 3, 3, undefined)]
  ]
  for (const [name, reading] of cases) {
    it('starts a session: ' + name, async () => {
      settings.routing = live()
      READING = reading
      const r = runnerFor()
      await r.send('d1', 'ajusta o readme')
      await r.idle()
      const [reply] = replies()
      const t = turns.at(-1)
      expect(reply?.run?.status, `${name}: ${reply?.run?.error ?? ''}`).toBe('done')
      // What the engine gets is the model's own name every time: never the `<harness>:` prefix the
      // settings hold, which is what pi refused with `Model "pi:…" not found`.
      expect(t?.model ?? '').not.toMatch(/^(pi|codex|claude|opencode|hermes|antigravity|cursor|grok|cline):/)
    })
  }
})
