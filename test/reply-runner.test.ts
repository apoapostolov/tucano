// What a reply does in the core: which message it is about, what the agent reads of it, who answers it,
// and what is refused before anything of the person's is written.
//
// `test/runner.test.ts` is upstream's own file and this tree does not carry it (the 0.2.45 merge dropped
// it), so these live here, with only the scaffolding they need.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import type { CoreEvent } from '../src/shared/rpc'
import type { Agent, EngineId, Message, Settings } from '../src/shared/types'
import { Db } from '../src/core/db'
import { fakeEngine } from '../src/core/engines/fake'
import type { Engine, Turn } from '../src/core/engines/types'
import { People } from '../src/core/people'
import { Runner } from '../src/core/runs'

const ready = { installed: true, loggedIn: true }

function agent(id: string, handle: string, extra: Partial<Agent> = {}): Agent {
  return { id, name: handle, handle, role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 1_000_000, used: 0, grants: {}, memory: 'auto', computer: false, archived: false, ...extra }
}

// Wraps an engine to count how many turns were actually started.
function counted(engine: Engine): Engine & { turns: Turn[] } {
  const turns: Turn[] = []
  return { id: engine.id, turns, run: (t) => (turns.push(t), engine.run(t)) }
}

let db: Db
let events: CoreEvent[]
let claude: ReturnType<typeof counted>
let settings: Settings

function runner(engine: Engine = fakeEngine('claude', { delayMs: 1 })): Runner {
  claude = counted(engine)
  const engines: Record<EngineId, Engine> = { claude, codex: fakeEngine('codex', { delayMs: 1 }), opencode: fakeEngine('opencode'), pi: fakeEngine('pi'), antigravity: fakeEngine('antigravity'), cursor: fakeEngine('cursor'), grok: fakeEngine('grok'), cline: fakeEngine('cline'), hermes: fakeEngine('hermes'), endpoint: fakeEngine('endpoint') }
  return new Runner({ db, engines, settings: async () => settings, emit: (e) => events.push(e), workDir: mkdtempSync(join(tmpdir(), 'ad-work-')) })
}

const agentMessages = (): Message[] => db.messages().filter((m) => m.author.kind === 'agent')

beforeEach(() => {
  db = new Db(join(mkdtempSync(join(tmpdir(), 'ad-db-')), 'test.db'))
  events = []
  settings = { workspaceName: 'Edu', context: '', engines: { claude: ready, codex: ready, opencode: ready, pi: ready, antigravity: ready, cursor: ready, grok: ready, cline: ready, hermes: ready, endpoint: ready }, routerModel: 'haiku', memoryModel: 'haiku', memoryLearning: 'approve', defaultLimit: 1000, approvalTtlHours: 24, theme: 'system', language: 'pt' }
  db.saveAgent(agent('a1', 'lia'))
  // theo never joins on his own: the chime-in router would otherwise add a turn of its own to these counts.
  db.saveAgent(agent('a2', 'theo', { modelId: 'gpt-5.6-luna', proactive: false }))
  db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
  db.createConversation({ id: 'c1', kind: 'channel', name: 'engenharia', members: ['a1', 'a2'] })
})

describe('a reply to a message', () => {
  it('keeps only the selected excerpt in a reply and passes it to the responding agent', async () => {
    db.saveMessage({ id: 'quoted', conversationId: 'c1', author: { kind: 'agent', id: 'a1' }, text: 'An introduction.\n\n**Deploy** after review.\n\nA separate conclusion.', at: 100 })
    const r = runner()
    await r.send('c1', 'Explain this part.', [], undefined, undefined, { reply: { messageId: 'quoted', quote: 'Deploy after review.' } })
    await r.idle()
    const saved = db.messages().find((m) => m.reply)!
    expect(saved.reply).toMatchObject({ messageId: 'quoted', author: 'lia', text: 'Deploy after review.', excerpt: true })
    expect(saved.text).toBe('Explain this part.')
    expect(claude.turns[0]?.prompt).toContain('> Deploy after review.')
    expect(claude.turns).toHaveLength(1)
  })

  it('rejects empty or excessive excerpts and excerpts without an original message', async () => {
    db.saveMessage({ id: 'quoted', conversationId: 'c1', author: { kind: 'agent', id: 'a1' }, text: 'Original text.', at: 100 })
    const r = runner()
    for (const quote of ['', '   ', 'a'.repeat(32_001)]) {
      await expect(r.send('c1', 'A reply.', [], undefined, undefined, { reply: { messageId: 'quoted', quote } })).rejects.toThrow()
    }
    await expect(r.send('c1', 'A reply.', [], undefined, undefined, { reply: { messageId: '', quote: 'Text.' } })).rejects.toThrow()
    expect(db.messages().filter((m) => m.author.kind === 'person')).toEqual([])
  })

  it('quotes an older message and directs the reply to its author in the same channel', async () => {
    const source: Message = { id: 'quoted', conversationId: 'c1', author: { kind: 'agent', id: 'a1' }, text: 'The deployment needs a review.', at: 100, run: { status: 'done', steps: [] } }
    db.saveMessage(source)
    for (let i = 0; i < 50; i++) db.saveMessage({ id: `filler-${i}`, conversationId: 'c1', author: { kind: 'person', id: db.ownerId() }, text: 'Later context.', at: 101 + i })
    const r = runner()
    await r.send('c1', 'Review it now.', [], undefined, undefined, { reply: { messageId: source.id } })
    await r.idle()
    const reply = db.messages().find((m) => m.reply)!
    expect(reply.reply).toEqual({ messageId: source.id, author: 'lia', agentId: 'a1', text: source.text, at: 100 })
    expect(claude.turns).toHaveLength(1)
    expect(claude.turns[0]?.prompt).toContain('[Em resposta a lia:]')
    expect(claude.turns[0]?.prompt).toContain(`> ${source.text}`)
    expect(db.message(source.id)).toMatchObject(source)
  })

  it('rejects replies to missing messages, other conversations, system messages or active runs', async () => {
    const r = runner()
    const source: Message = { id: 'quoted', conversationId: 'c1', author: { kind: 'agent', id: 'a1' }, text: 'Still thinking.', at: 100, run: { status: 'working', steps: [] } }
    db.saveMessage(source)
    await expect(r.send('d1', 'A reply.', [], undefined, undefined, { reply: { messageId: source.id } })).rejects.toThrow()
    await expect(r.send('c1', 'A reply.', [], undefined, undefined, { reply: { messageId: 'missing' } })).rejects.toThrow()
    await expect(r.send('c1', 'A reply.', [], undefined, undefined, { reply: { messageId: source.id } })).rejects.toThrow()
    db.saveMessage({ id: 'system', conversationId: 'c1', author: { kind: 'system' }, text: 'System notice.', at: 100 })
    await expect(r.send('c1', 'A reply.', [], undefined, undefined, { reply: { messageId: 'system' } })).rejects.toThrow()
    expect(db.messages().filter((m) => m.author.kind === 'person')).toEqual([])
  })

  it("keeps another agent's pending question open when replying to a particular agent", async () => {
    db.saveMessage({ id: 'quoted', conversationId: 'c1', author: { kind: 'agent', id: 'a1' }, text: 'Ready.', at: 100 })
    db.saveMessage({ id: 'question', conversationId: 'c1', author: { kind: 'agent', id: 'a2' }, text: 'Which environment?', at: 101, run: { status: 'waiting_input', steps: [], question: 'Which environment?' } })
    const r = runner()
    r.setPaused(true)
    await r.send('c1', 'A reply for Lia.', [], undefined, undefined, { reply: { messageId: 'quoted' } })
    expect(db.message('question')?.run?.status).toBe('waiting_input')
  })

  it('keeps explicit mentions ahead of the quoted author and does not route quoted mentions', async () => {
    db.saveMessage({ id: 'quoted', conversationId: 'c1', author: { kind: 'agent', id: 'a2' }, text: 'Ask @theo about this.', at: 100 })
    const r = runner()
    await r.send('c1', '@lia please explain.', [], undefined, undefined, { reply: { messageId: 'quoted' } })
    await r.idle()
    expect(agentMessages().map((m) => m.author)).toEqual([{ kind: 'agent', id: 'a2' }, { kind: 'agent', id: 'a1' }])
    expect(claude.turns).toHaveLength(1)
  })

  it('answers a pending question when replying to the agent who asked it', async () => {
    db.saveMessage({ id: 'question', conversationId: 'c1', author: { kind: 'agent', id: 'a1' }, text: 'Which environment?', at: 100, run: { status: 'waiting_input', steps: [], question: 'Which environment?' } })
    const r = runner()
    await r.send('c1', 'Staging.', [], undefined, undefined, { reply: { messageId: 'question' } })
    await r.idle()
    expect(db.message('question')?.run?.status).toBe('done')
    expect(claude.turns).toHaveLength(1)
  })

  it('refuses to quote history that the writer cannot read', async () => {
    const people = new People(db)
    const joined = people.join(people.createInvite(db.owner(), { role: 'member' }).code, 'Bia')
    if (!('person' in joined)) throw new Error(joined.error)
    db.setMeta('heritageAt', '200')
    db.saveMessage({ id: 'heritage', conversationId: 'c1', author: { kind: 'agent', id: 'a1' }, text: 'Owner-only history.', at: 100 })
    const r = runner()
    await expect(r.send('c1', 'Explain.', [], undefined, joined.person.id, { reply: { messageId: 'heritage' } })).rejects.toThrow()
    expect(db.messages().filter((m) => m.author.kind === 'person')).toEqual([])
    r.setPaused(true)
    await r.send('c1', 'Share this quote.', [], undefined, db.ownerId(), { reply: { messageId: 'heritage' } })
    expect(db.messages().find((m) => m.reply)?.reply?.text).toBe('Owner-only history.')
  })

  it('keeps a mention of a person ahead of the quoted agent', async () => {
    const people = new People(db)
    people.join(people.createInvite(db.owner(), { role: 'member' }).code, 'Bia')
    db.saveMessage({ id: 'quoted', conversationId: 'c1', author: { kind: 'agent', id: 'a1' }, text: 'Ready.', at: Date.now() })
    const r = runner()
    await r.send('c1', '@Bia could you review this?', [], undefined, undefined, { reply: { messageId: 'quoted' } })
    await r.idle()
    expect(claude.turns).toHaveLength(0)
    expect(agentMessages().map((m) => m.id)).toEqual(['quoted'])
  })
})
