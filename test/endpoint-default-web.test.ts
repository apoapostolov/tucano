import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { CoreEvent } from '../src/shared/rpc'
import type { Agent, EngineId, Settings } from '../src/shared/types'
import { Db } from '../src/core/db'
import { fakeEngine } from '../src/core/engines/fake'
import { endpointEngine } from '../src/core/engines/endpoint'
import type { Engine } from '../src/core/engines/types'
import { Gateway } from '../src/core/gateway'
import { Runner } from '../src/core/runs'

const ready = { installed: true, loggedIn: true }
const agent = (id: string, extra: Partial<Agent> = {}): Agent => ({ id, name: id[0]!.toUpperCase() + id.slice(1), handle: id, role: '', color: 'sky', instructions: '', modelId: 'endpoint:acme/model-1', effort: 'low', limit: 1_000_000, used: 0, grants: {}, memory: 'auto', computer: false, archived: false, ...extra })

// An address in OpenAI's format, scripted: each call to /chat/completions gets the next answer, streamed
// as server-sent events, and what was sent is kept.
type Reply = { status?: number; error?: string; chunks?: object[] }
function provider(replies: ((body: { messages: { role: string; content: unknown; tool_calls?: unknown[]; tool_call_id?: string }[]; tools?: { function: { name: string } }[]; model: string }) => Reply)[]) {
  const sent: { url: string; headers: Record<string, string>; body: Parameters<(typeof replies)[number]>[0] }[] = []
  const f = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body))
    sent.push({ url: String(input), headers: init?.headers as Record<string, string>, body })
    const r = replies[sent.length - 1]?.(body) ?? { chunks: [{ choices: [{ delta: { content: 'fim' } }] }] }
    if (r.status && r.status !== 200) return new Response(JSON.stringify({ error: { message: r.error ?? 'no' } }), { status: r.status, headers: { 'content-type': 'application/json' } })
    const text = (r.chunks ?? []).map((c) => `data: ${JSON.stringify(c)}\n\n`).join('') + 'data: [DONE]\n\n'
    return new Response(text, { headers: { 'content-type': 'text/event-stream' } })
  }) as typeof fetch
  return { f, sent }
}
const words = (text: string, usage = { prompt_tokens: 100, completion_tokens: 10 }): Reply => ({ chunks: [...text.match(/.{1,5}/g)!.map((part) => ({ choices: [{ delta: { content: part } }] })), { choices: [], usage }] })
let db: Db
let events: CoreEvent[]
let settings: Settings
let gateway: Gateway

beforeEach(async () => {
  db = new Db(join(mkdtempSync(join(tmpdir(), 'ad-db-')), 'test.db'))
  events = []
  settings = { workspaceName: 'Edu', context: '', engines: { claude: ready, codex: ready, opencode: ready, pi: ready, antigravity: ready, cursor: ready, grok: ready, cline: ready, hermes: ready, endpoint: { ...ready, route: 'endpoint' } }, routerModel: 'haiku', memoryModel: 'haiku', memory: 'auto', chainDepth: 3 } as unknown as Settings
  gateway = new Gateway()
  await gateway.start()
})
afterEach(() => gateway.stop())

function runner(endpoint: Engine, web?: { search: (q: string, n: number) => Promise<{ url: string; title?: string; text?: string }[]>; read: (url: string) => Promise<string> }): Runner {
  const engines: Record<EngineId, Engine> = { claude: fakeEngine('claude', { delayMs: 1 }), codex: fakeEngine('codex'), opencode: fakeEngine('opencode'), pi: fakeEngine('pi'), antigravity: fakeEngine('antigravity'), cursor: fakeEngine('cursor'), grok: fakeEngine('grok'), cline: fakeEngine('cline'), hermes: fakeEngine('hermes'), endpoint }
  return new Runner({ db, engines, settings: async () => settings, emit: (e) => events.push(e), workDir: mkdtempSync(join(tmpdir(), 'ad-work-')), gateway, ...(web ? { web } : {}) })
}

describe('endpoint Web compatibility', () => {
  it.each([undefined, true, false])('preserves Web default for %s', async (web) => {
    db.saveAgent(agent('lia', { web }))
    db.createConversation({ id: 'd1', kind: 'dm', name: 'lia', members: ['lia'] })
    const p = provider([() => words('ok')])
    const r = runner(endpointEngine(async () => ({ baseUrl: 'https://x.test/v1' }), p.f))
    await r.send('d1', 'hello')
    await r.idle()
    const tools = p.sent[0]!.body.tools!.map((t) => t.function.name)
    expect(tools.includes('buscar_na_web')).toBe(web !== false)
    expect(tools.includes('ler_pagina')).toBe(web !== false)
  })
})
