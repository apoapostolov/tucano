// A message answered from the reply button or by Ctrl+L on an excerpt, over the real core: what the
// core stores on the reply (the quote as it read there, and who wrote it), and who it calls — the
// agent whose message is being answered, ahead of the router. Refusals are in reply-rpc.test.ts.
import { beforeAll, expect, it } from 'vitest'
import type { Message } from '../src/shared/types'
import type { Snapshot } from '../src/shared/rpc'
import { bootCore, type Client } from './helpers/core'

let owner: Client
let channelId: string
let liaId: string

const until = async (ok: () => boolean | Promise<boolean>, ms = 8000): Promise<void> => {
  const end = Date.now() + ms
  while (!(await ok())) {
    if (Date.now() > end) throw new Error('timed out')
    await new Promise((r) => setTimeout(r, 20))
  }
}
const snapshot = async (): Promise<Snapshot> => owner.call<Snapshot>('snapshot')
const messages = async (): Promise<Message[]> => (await snapshot()).messages

beforeAll(async () => {
  owner = (await bootCore({ server: true })).connect()
  await owner.call('setMyName', { name: 'Ana' })
  const snap = await snapshot()
  channelId = snap.conversations.find((c) => c.kind === 'channel' && c.members.length > 1)!.id
  liaId = snap.agents.find((a) => a.handle === 'lia')!.id
}, 30_000)

it('keeps the excerpt I selected, with who wrote it, so the agent reads the quote on its own', async () => {
  await owner.call('sendMessage', { conversationId: channelId, text: 'O prazo é sexta e ninguém revisou o texto.' })
  const original = (await messages()).find((m) => m.text.includes('O prazo é sexta'))!
  await owner.call('sendMessage', { conversationId: channelId, text: 'Explique por quê.', reply: { messageId: original.id, quote: 'ninguém revisou o texto' } })
  const quoted = (await messages()).find((m) => m.text === 'Explique por quê.')!
  expect(quoted.reply).toMatchObject({ messageId: original.id, text: 'ninguém revisou o texto', excerpt: true, author: 'Ana', at: original.at })

  // The message without an excerpt quotes it whole, and says it isn't a selection.
  await owner.call('sendMessage', { conversationId: channelId, text: 'E o resto?', reply: { messageId: original.id } })
  const whole = (await messages()).find((m) => m.text === 'E o resto?')!
  expect(whole.reply).toMatchObject({ messageId: original.id, text: original.text, author: 'Ana' })
  expect(whole.reply?.excerpt).toBeUndefined()
})

it('calls the agent whose message is being answered, not the router', async () => {
  await owner.call('sendMessage', { conversationId: channelId, text: 'Alguém me ajuda com o build?' })
  await until(async () => (await messages()).some((m) => m.conversationId === channelId && m.author.kind === 'agent' && m.run?.status === 'done'))
  const said = (await messages()).filter((m) => m.conversationId === channelId && m.author.kind === 'agent' && m.run?.status === 'done').at(-1)!
  const asked = said.author
  const before = (await messages()).length
  await owner.call('sendMessage', { conversationId: channelId, text: 'E por que essa ordem?', reply: { messageId: said.id } })
  const mine = (await messages()).find((m) => m.text === 'E por que essa ordem?')!
  await until(async () => (await messages()).some((m) => m.run?.replyTo === mine.id))
  const answered = (await messages()).find((m) => m.run?.replyTo === mine.id)!
  expect(answered.author).toEqual(asked) // the one quoted, even with another agent in the room
  expect((await messages()).length).toBeGreaterThan(before + 1)
})

it('refuses a reply to a message in another conversation, and saves nothing', async () => {
  const dmId = await owner.call<string>('openDm', { agentId: liaId })
  await owner.call('sendMessage', { conversationId: dmId, text: 'Só aqui.' })
  const elsewhere = (await messages()).find((m) => m.conversationId === dmId && m.text === 'Só aqui.')!
  await expect(owner.call('sendMessage', { conversationId: channelId, text: 'Resposta fora de lugar.', reply: { messageId: elsewhere.id } })).rejects.toThrow(/mensagem desta conversa/)
  expect((await messages()).some((m) => m.text === 'Resposta fora de lugar.')).toBe(false)
})
