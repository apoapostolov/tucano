// A finished ask comes back with what it was asked as: the Asks page's history reads each question's
// decisions, the answer taken on each and the option a classifier pointed at, exactly as the open list
// does (people.ts `history`). Without them the page could only draw the ask's text, which is why the
// widgets never showed up in the real app.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Decision } from '../src/shared/questions'
import type { Person, Question, Run } from '../src/shared/types'
import { Db } from '../src/core/db'
import { People } from '../src/core/people'

const decisions: Decision[] = [
  { question: 'Publico o post hoje?', kind: 'single', options: [{ label: 'Sim, publico' }, { label: 'Não, espero', description: 'fica para amanhã' }] },
  { question: 'Quando reviso o texto?', kind: 'text' }
]

const setup = (): { people: People; db: Db; person: Person } => {
  const db = new Db(join(mkdtempSync(join(tmpdir(), 'asks-history-')), 'test.db'))
  const people = new People(db)
  const person = people.owner()
  db.saveAgent({ id: 'a1', name: 'Lia', handle: 'lia', role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 1_000_000, used: 0, grants: {}, memory: 'auto', computer: false, archived: false })
  db.createConversation({ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] })
  return { people, db, person }
}

const asked = (person: Person, over: Partial<Question> = {}): Question => ({
  id: 'm1',
  conversationId: 'd1',
  agentId: 'a1',
  text: '1. Publico o post hoje? (Sim, publico | Não, espero)\n2. Quando reviso o texto?',
  askedTo: person.id,
  requestedBy: person.id,
  state: 'answered',
  deadlineAt: 0,
  answeredBy: person.id,
  answeredAt: 2,
  createdAt: 1,
  ...over
})

describe('the Asks history carries the ask itself', () => {
  it('gives a finished ask its decisions, its answers and the recommended one', () => {
    const { people, db, person } = setup()
    db.saveMessage({
      id: 'm1',
      conversationId: 'd1',
      author: { kind: 'agent', id: 'a1' },
      text: 'Duas coisas antes de eu seguir.',
      at: 1,
      run: { id: 'r1', at: 1, status: 'done', questions: decisions, answers: [{ chosen: [1] }, { text: 'sexta' }], recommended: [0, null] } as unknown as Run
    })
    db.saveQuestion(asked(person))
    const [row] = people.history(person)
    expect(row).toMatchObject({ id: 'm1', state: 'answered', conversationId: 'd1' })
    expect(row!.decisions).toEqual(decisions)
    expect(row!.answers).toEqual([{ chosen: [1] }, { text: 'sexta' }])
    expect(row!.recommended).toEqual([0, null])
  })

  it('leaves a plain ask without decisions, so the page draws its text', () => {
    const { people, db, person } = setup()
    db.saveMessage({ id: 'm1', conversationId: 'd1', author: { kind: 'agent', id: 'a1' }, text: 'Posso seguir?', at: 1, run: { id: 'r1', at: 1, status: 'done', question: 'Posso seguir?' } as unknown as Run })
    db.saveQuestion(asked(person, { text: 'Posso seguir?' }))
    const [row] = people.history(person)
    expect(row!.decisions).toBeUndefined()
    expect(row!.text).toBe('Posso seguir?')
  })

  it('keeps the open list as it was: the same ask still carries its decisions there', () => {
    const { people, db, person } = setup()
    db.saveMessage({
      id: 'm1',
      conversationId: 'd1',
      author: { kind: 'agent', id: 'a1' },
      text: 'Duas coisas antes de eu seguir.',
      at: 1,
      run: { id: 'r1', at: 1, status: 'waiting_input', questions: decisions, answers: [{ chosen: [0] }, null] } as unknown as Run
    })
    db.saveQuestion(asked(person, { state: 'open', answeredBy: undefined, answeredAt: undefined }))
    const [open] = people.inbox(person).questions
    expect(open!.decisions).toEqual(decisions)
    expect(people.history(person)).toEqual([])
  })
})
