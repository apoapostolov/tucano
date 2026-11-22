// A thread's name in the panel's header (src/renderer/src/components/Conversation.tsx): the name of the
// session answering in it. In a channel that answers in threads the thread hangs from the person's own
// message, which has no run and so no name — the name lives on the replies, and the first reply that
// has one speaks for the thread.
import { parseHTML } from 'linkedom'
import { describe, expect, it } from 'vitest'
import type { Message } from '../src/shared/types'

const { window, document } = parseHTML('<!doctype html><html><body></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Element: window.Element, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })

const { sessionNameOf } = await import('../src/renderer/src/components/Conversation')

const person: Message = { id: 'm1', conversationId: 'dm', author: { kind: 'person', id: 'ana' }, text: 'faz o login', at: 1 }
const answer = (id: string, sessionName?: string): Message => ({
  id,
  conversationId: 'dm',
  author: { kind: 'agent', id: 'lia' },
  text: '',
  at: 2,
  threadId: 'm1',
  run: { status: 'working', steps: [], ...(sessionName ? { sessionName } : {}) }
})

describe('a thread’s name', () => {
  it('is the session name of the reply answering in it, under the person’s own message', () => {
    expect(sessionNameOf(person, [answer('r1', 'Corrigir o login')])).toBe('Corrigir o login')
  })

  it('is still found when the first reply in the thread went unnamed', () => {
    expect(sessionNameOf(person, [answer('r1'), answer('r2', 'Corrigir o login')])).toBe('Corrigir o login')
  })

  it('is the root’s own name when the thread was opened by a reply', () => {
    expect(sessionNameOf(answer('r0', 'Nome da raiz'), [])).toBe('Nome da raiz')
  })

  it('is nothing before a name arrives, so the panel keeps saying Thread', () => {
    expect(sessionNameOf(person, [answer('r1')])).toBeUndefined()
    expect(sessionNameOf(undefined, [])).toBeUndefined()
  })
})
