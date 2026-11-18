// Every agent's open question to the person, gathered on the waiting-on-you screen: alone
// (Aprovações) the section is the only place a question exists outside the reply that asked it.
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Agent, Person } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

let fake: State
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return { ...real, useStore: <T,>(select: (s: State) => T): T => select(fake) }
})
const { getState } = await import('../src/renderer/src/store')
const { AsksWaiting } = await import('../src/renderer/src/components/Pages')

const me: Person = { id: 'ana', name: 'Ana', role: 'owner', about: '' }
const bia: Person = { id: 'bia', name: 'Bia', role: 'admin', about: '' }
const lia: Agent = { id: 'a1', name: 'Lia', handle: 'lia', role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 1_000_000, used: 0, grants: {}, memory: 'auto', computer: false, archived: false }
const tucano: Agent = { ...lia, id: 'a2', name: 'Tucano', handle: 'tucano' }

type Asked = State['inbox']['questions'][number]
const q = (id: string, agentId: string, conversationId: string | undefined, text: string): Asked => ({
  id,
  ...(conversationId ? { conversationId } : {}),
  agentId,
  text,
  askedTo: 'ana',
  requestedBy: 'ana',
  state: 'open',
  deadlineAt: Date.now() + 3_600_000,
  createdAt: 1
})

// The renderer reads `window` for the web build; these components don't need more than that.
beforeEach(() => {
  vi.stubGlobal('window', {})
})

const page = (questions: Asked[], people: Person[] = [me]): string => {
  fake = {
    ...getState(),
    ready: true,
    people,
    you: 'ana',
    agents: [lia, tucano],
    conversations: [
      { id: 'dm1', kind: 'dm', name: 'Lia', members: ['a1'] },
      { id: 'ch1', kind: 'channel', name: 'vendas', members: ['a2'] }
    ],
    inbox: { approvals: [], questions }
  } as State
  return renderToStaticMarkup(<AsksWaiting />)
}

describe('the questions section of the waiting-on-you screen', () => {
  it('is nothing at all when no agent asked anything', () => {
    expect(page([])).toBe('')
  })

  it('gathers questions asked in different conversations, which is the point', () => {
    const html = page([q('q1', 'a1', 'dm1', 'Publico o post hoje?'), q('q2', 'a2', 'ch1', 'Fecho o mês assim?')])
    expect(html).toContain('Perguntas · 2')
    expect(html).toContain('Publico o post hoje?')
    expect(html).toContain('Fecho o mês assim?')
    expect(html).toContain('na sua DM com Lia')
    expect(html).toContain('em #vendas')
    expect(html).toContain('Ver na conversa')
  })

  it('answers the question on the card itself, with no team to fall back on', () => {
    const html = page([q('q1', 'a1', 'dm1', 'Publico o post hoje?')])
    expect(html).toContain('class="question')
    expect(html).toContain('Lia pergunta a você')
    // Alone there is no one else the answer would reach the conversation through, so the card
    // answers it where it shows (the Asks page, this section) instead of pointing back.
    expect(html).toContain('Sua resposta')
    expect(html).toContain('Responder')
    expect(html).not.toContain('Sua próxima mensagem aqui é a resposta.')
    expect(html).not.toContain('Respondida')
  })

  it('answers in place for whoever may answer it, with a team', () => {
    const html = page([q('q1', 'a1', 'dm1', 'Publico o post hoje?')], [me, bia])
    expect(html).toContain('Lia pergunta a você')
    expect(html).toContain('question__answer')
    expect(html).toContain('Responder')
  })

  it('carries the decisions of a question that has them', () => {
    const html = page([{ ...q('q1', 'a1', 'dm1', 'Qual caminho?'), decisions: [{ question: 'Qual caminho?', kind: 'single', options: [{ label: 'Um' }, { label: 'Outro' }] }] }])
    expect(html).toContain('class="ask ask--answer')
    expect(html).toContain('Esperando você')
    expect(html).toContain('Um')
  })

  it('still lists one whose conversation is gone, without a link to it', () => {
    const html = page([q('q1', 'a1', undefined, 'Ainda quer isso?')])
    expect(html).toContain('Ainda quer isso?')
    expect(html).toContain('numa conversa que você não vê')
    expect(html).not.toContain('Ver na conversa')
  })
})
