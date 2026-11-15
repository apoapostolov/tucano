import { expect, it, vi } from 'vitest'
import { People } from '../src/core/people'

it('filters each streamed delta against current audience and renderer preference', async () => {
  vi.resetModules()
  let heritage = 0
  const conversation = { id: 'c', kind: 'channel' }
  const message = { id: 'm', conversationId: 'c', at: 1, author: { kind: 'agent', id: 'a' }, text: '' }
  const db = { meta: () => heritage, ownerId: () => 'owner', conversationOwner: () => conversation, conversation: () => conversation, messageConversation: () => 'c', message: () => message, prefs: () => ({}) }
  const people = new People(db as never)
  const person = { id: 'p', role: 'member' } as any
  let listener: any
  const settings = { workspaceName: 'QA', language: 'en', engines: {}, theme: 'system', showThinking: true }
  const port: any = { onmessage: null, postMessage(req: any) { const result = req.method === 'snapshot' ? { settings, agents: [], conversations: [conversation], messages: [message], since: {}, connectors: [], approvals: [], memories: [], artifacts: [], computers: [], browsers: [], routines: [], skills: [], platform: 'windows', packaged: false, isolatedComputers: true, people: [], you: '' } : undefined; queueMicrotask(() => port.onmessage({ data: { id: req.id, result } })) } }
  const win: any = { addEventListener: (_: string, fn: any) => { listener = fn }, removeEventListener: () => {}, tucano: { onNavigate: () => {}, viewing: () => {}, connect: () => queueMicrotask(() => listener({ source: win, data: 'core:port', ports: [port] })) } }
  Object.assign(globalThis, { window: win })
  const store = await import('../src/renderer/src/store')
  await store.start()
  const send = (text: string) => { const event = people.eventFor({ type: 'thinking', id: 'm', text }, person); if (event) port.onmessage({ data: { event } }); return !!event }
  expect(send('before ')).toBe(true)
  heritage = 2
  expect(send('hidden ')).toBe(false)
  expect(store.liveThought('m')).toBe('before ')
  person.role = 'owner'
  expect(send('owner ')).toBe(true)
  port.onmessage({ data: { event: { type: 'settings', settings: { ...settings, showThinking: false } } } })
  expect(store.liveThought('m')).toBeUndefined()
  expect(send('off ')).toBe(true)
  port.onmessage({ data: { event: { type: 'settings', settings } } })
  expect(store.liveThought('m')).toBeUndefined()
  expect(send('after')).toBe(true)
  expect(store.liveThought('m')).toBe('after')
})
