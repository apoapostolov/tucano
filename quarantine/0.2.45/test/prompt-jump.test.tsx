// The glyph under "Reply in thread" that goes back to the prompt a reply answers: when it shows,
// and what it says it does.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Message } from '../src/shared/types'
import { PromptJump, promptAway } from '../src/renderer/src/components/Conversation'

const said = (id: string, replyTo?: string): Message => ({
  id,
  conversationId: 'c',
  author: { kind: 'agent', id: 'a' },
  text: id,
  at: 1,
  ...(replyTo ? { run: { status: 'working' as const, steps: [], replyTo } } : {})
})
const mine = (id: string): Message => ({ id, conversationId: 'c', author: { kind: 'person', id: 'owner' }, text: id, at: 1 })

describe('the way back to a reply’s prompt', () => {
  it('shows when something came between the reply and the prompt it answers', () => {
    expect(promptAway(said('r', 'p'), mine('p'))).toBe(false)
    // Another session's reply, or a note, is in between.
    expect(promptAway(said('r', 'p'), mine('outra'))).toBe(true)
    expect(promptAway(said('r', 'p'))).toBe(true)
  })

  it('turns into a down arrow after the jump, to return to the old position', () => {
    const html = renderToStaticMarkup(<PromptJump back onClick={() => {}} />)
    expect(html).toContain('msg__reply--down')
    expect(html).toContain('aria-label="Voltar aonde estava"')
  })

  it('is a small button in the message’s corner that says where it goes', () => {
    const html = renderToStaticMarkup(<PromptJump onClick={() => {}} />)
    expect(html).toContain('msg__reply')
    expect(html).toContain('msg__reply--up')
    expect(html).toContain('aria-label="Ir para o começo desta sessão"')
    expect(html).toContain('<svg')
  })
})
