// The Asks page gathers every "Waiting for you" prompt, not only the agents' questions: a card an
// admin has to apply, a memory waiting to be kept, and a change the curator wants to make to a page
// used to exist only where it was made (For you, Memory, the wiki tab).
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Agent, Memory, Person, WikiChange } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

let fake: State
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return { ...real, useStore: <T,>(select: (s: State) => T): T => select(fake) }
})
const { getState, waitingOnYou } = await import('../src/renderer/src/store')
const { AsksPage } = await import('../src/renderer/src/components/Pages')

const me: Person = { id: 'ana', name: 'Ana', role: 'owner', about: '' }
const lia: Agent = { id: 'a1', name: 'Lia', handle: 'lia', role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 1_000_000, used: 0, grants: {}, memory: 'auto', computer: false, archived: false }

const memory = (id: string, text: string): Memory => ({
  id,
  scope: 'me',
  text,
  state: 'pending',
  origin: 'agent',
  agentId: 'a1',
  messageIds: [],
  createdAt: Date.now(),
  confirmedAt: Date.now()
})

const change = (id: string, ops: WikiChange['ops']): WikiChange => ({ id, at: Date.now(), by: 'auto', state: 'pending', ops, reason: 'O Marcos aceitou o orçamento.' })

const card = { id: 'a1', agentId: 'a1', proposal: { kind: 'channel', name: 'financeiro', members: ['a1'], needs: [] } as NonNullable<State['inbox']['proposals']>[number]['proposal'], by: 'p2', at: Date.now() }

const page = (p: Partial<State> = {}): string => {
  fake = { ...fake, ...p } as State
  return renderToStaticMarkup(<AsksPage />)
}

beforeEach(() => {
  vi.stubGlobal('window', {})
  fake = { ...getState(), ready: true, people: [me], agents: [lia], you: 'ana', inbox: { approvals: [], questions: [] }, memories: [], wikiWaiting: [] } as State
})

describe('the Asks page', () => {
  it('is a rest screen only when all four kinds are empty', () => {
    const html = page()
    expect(html).toContain('Nada esperando você')
    expect(html).not.toContain('Memórias esperando você')
    expect(html).not.toContain('Mudanças no wiki esperando você')
    expect(html).not.toContain('Cartões esperando um admin aplicar')
  })

  it('carries a memory the agents want to keep, with Keep and Discard, so it is not a dead end', () => {
    const html = page({ memories: [memory('m1', 'Prefere PRs pequenos.')] })
    expect(html).toContain('Memórias esperando você')
    expect(html).toContain('Prefere PRs pequenos.')
    expect(html).toContain('Lia quer guardar')
    expect(html).toContain('Guardar')
    expect(html).toContain('Descartar')
    expect(html).not.toContain('Nada esperando você')
  })

  it("carries the curator's change to a page, with its diff and the two ways to decide it", () => {
    const html = page({ wikiWaiting: [change('c1', [{ op: 'append', page: 'Marcos Lima', text: '- 03/11: aceitou o orçamento.' }])] })
    expect(html).toContain('Mudanças no wiki esperando você')
    expect(html).toContain('O Marcos aceitou o orçamento.')
    expect(html).toContain('03/11: aceitou o orçamento.')
    expect(html).toContain('Aprovar')
    expect(html).toContain('Recusar')
    expect(html).toContain('Ver no wiki')
  })

  it('carries a card a member sent the admins to apply', () => {
    const html = page({ inbox: { approvals: [], questions: [], proposals: [card] } })
    expect(html).toContain('Cartões esperando um admin aplicar')
    expect(html).toContain('financeiro')
    expect(html).not.toContain('Nada esperando você')
  })

  it('counts the four kinds for the sidebar entry, not only the questions', () => {
    const one = { inbox: { approvals: [], questions: [] }, memories: [memory('m1', 'a')], wikiWaiting: [change('c1', [{ op: 'append', page: 'x', text: 'y' }])] } as Partial<State>
    expect(waitingOnYou({ ...fake, ...one } as State)).toBe(2)
    expect(waitingOnYou({ ...fake, ...one, memories: [] } as State)).toBe(1)
    expect(waitingOnYou({ ...fake, memories: [], wikiWaiting: [] } as State)).toBe(0)
  })
})
