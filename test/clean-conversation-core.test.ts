import { beforeAll, expect, it } from 'vitest'
import { bootCore, type Client, type TestCore } from './helpers/core'
import type { Conversation, Person } from '../src/shared/types'
let core: TestCore
let owner: Client
beforeAll(async () => { core = await bootCore({ server: true }); owner = core.connect() }, 30_000)
it('requires channel admin rights, allows DM owners, and retains both conversations', async () => {
  const id = await owner.call<string>('createChannel', { name: 'clean-test' })
  const { code } = await owner.call<{ code: string }>('createInvite', { role: 'member' })
  const joined = await core.ask<{ data: { person: Person } }>({ type: 'join', code, name: 'Member' }, 'join-result')
  const member = core.connect(joined.data.person.id)
  await expect(member.call('cleanConversation', { id })).rejects.toThrow()
  await owner.call('cleanConversation', { id })
  const dm = await member.call<{ conversationId: string }>('ensureTuca', {})
  await member.call('cleanConversation', { id: dm.conversationId })
  const snap = await member.call<{ conversations: Conversation[] }>('snapshot')
  expect(snap.conversations.some((c) => c.id === dm.conversationId)).toBe(true)
  expect(owner.events.some((e) => e.type === 'conversation_cleared' && e.id === id)).toBe(true)
})
