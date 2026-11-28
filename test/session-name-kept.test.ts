// A session's name is written beside a reply that is still running (src/core/titles.ts), while the
// runner keeps its own copy of that reply and saves it whole as it goes. Neither the next save to
// the database nor the next message the app sends out may drop the name: the chip would show while
// the reply works and vanish the moment it ends.
import { describe, expect, it, vi } from 'vitest'
import { Db } from '../src/core/db'
import { Titles } from '../src/core/titles'
import type { Agent, Message, Run } from '../src/shared/types'

const agent: Agent = { id: 'a1', name: 'Lia', handle: 'lia', role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 1000, used: 0, grants: {}, memory: 'auto', computer: false, archived: false }
const reply = (run: Run): Message => ({ id: 'r1', conversationId: 'c1', author: { kind: 'agent', id: 'a1' }, text: '', at: 1, run })

describe('a session name outlives the reply it names', () => {
  it('the runner saving the reply again, without the name, keeps the name in the database', () => {
    const db = new Db(':memory:')
    db.saveAgent(agent)
    db.createConversation({ id: 'c1', kind: 'channel', name: 'geral', members: ['a1'] })
    db.saveMessage(reply({ status: 'working', steps: [] }))
    db.setRunSessionName('r1', 'Notas da versão')
    // What the runner holds never had the name: it saves its copy when the reply ends.
    db.saveMessage({ ...reply({ status: 'done', steps: [{ id: 's1', label: 'lendo', status: 'done' }] }), text: 'Pronto.' })
    const saved = db.message('r1')!
    expect(saved.run).toMatchObject({ status: 'done', sessionName: 'Notas da versão' })
    expect(saved.text).toBe('Pronto.')
  })

  it('a run with nothing named yet is saved as it is', () => {
    const db = new Db(':memory:')
    db.saveAgent(agent)
    db.createConversation({ id: 'c1', kind: 'channel', name: 'geral', members: ['a1'] })
    db.saveMessage(reply({ status: 'working', steps: [] }))
    db.saveMessage(reply({ status: 'done', steps: [] }))
    expect(db.message('r1')!.run).toEqual({ status: 'done', steps: [] })
  })

  it('the next message sent out for that reply carries the name the window already shows', async () => {
    const rows = new Map<string, Message>([['r1', reply({ status: 'working', steps: [] })]])
    const db = {
      message: (id: string) => rows.get(id),
      setRunSessionName: (id: string, name: string) => rows.set(id, { ...rows.get(id)!, run: { ...rows.get(id)!.run!, sessionName: name } }),
      addReceipt: vi.fn()
    } as unknown as Db
    const engine = {
      async *run() {
        yield { type: 'done', text: 'Notas da versão', usage: { inputTokens: 1, outputTokens: 1, cacheReadTokens: 0 } }
      }
    }
    const settings = { memoryModel: 'haiku', sessionNameEnabled: true, engines: { claude: { installed: true, loggedIn: true } } }
    const titles = new Titles({ db, engines: { claude: engine } as never, settings: async () => settings as never, emit: vi.fn(), workDir: '/tmp/tucano-names-kept' })
    const working = reply({ status: 'working', steps: [], task: 'Revisar as notas da versão' })
    expect(await titles.nameSession(working)).toBe('Notas da versão')
    // The runner's own copy, done now, with no name on it.
    const done = reply({ status: 'done', steps: [] })
    expect(titles.withName(done).run?.sessionName).toBe('Notas da versão')
    // Someone else's reply is left as it is.
    const other = { ...done, id: 'r2' }
    expect(titles.withName(other)).toBe(other)
  })
})
