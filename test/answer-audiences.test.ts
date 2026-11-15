import { describe, expect, it } from 'vitest'
import { Runner } from '../src/core/runs'
import type { Delegation, Person } from '../src/shared/types'

describe('answer-back audiences', () => {
  for (const restricted of [false, true]) {
    it(`sends separate follow-ups for two ${restricted ? 'restricted' : 'unrestricted'} requesters`, async () => {
      const access = (agent: string, channel: string) => ({ mode: 'picked' as const, sectors: [], agents: [agent], channels: ['origin', channel] })
      const people = [
        { id: 'bia', name: 'Bia', role: 'member', ...(restricted ? { access: access('alpha', 'private-alpha') } : {}) },
        { id: 'caio', name: 'Caio', role: 'member', ...(restricted ? { access: access('beta', 'private-beta') } : {}) }
      ] as Person[]
      const agents = [{ id: 'boss', name: 'Boss' }, { id: 'alpha', name: 'Alpha' }, { id: 'beta', name: 'Beta' }]
      const conversations = [
        { id: 'origin', kind: 'channel', name: 'origin' },
        { id: 'private-alpha', kind: 'channel', name: 'alpha-room' },
        { id: 'private-beta', kind: 'channel', name: 'beta-room' }
      ]
      const delegations: Delegation[] = ['alpha', 'beta'].map((id, i) => ({ id: `delegation-${id}`, from: 'boss', to: id, conversationId: `private-${id}`, rootId: `root-${id}`, originConversationId: 'origin', originMessageId: `message-${id}`, requestedBy: people[i]!.id, text: id, state: 'done', createdAt: i }))
      const jobs: (() => Promise<unknown>)[] = []
      const replies: { task: string; for: Person }[] = []
      const db = {
        agent: (id: string) => agents.find((a) => a.id === id),
        conversation: (id: string) => conversations.find((c) => c.id === id),
        person: (id: string) => people.find((p) => p.id === id),
        ownerId: () => 'owner',
        delegationsFrom: () => delegations
      }
      const r = Object.create(Runner.prototype) as any
      r.deps = { db, settings: async () => ({ workspaceName: 'Workspace' }) }
      r.tells = new Map()
      r.followups = { busy: () => false, reserve: () => {} }
      r.enqueue = (job: () => Promise<unknown>) => jobs.push(job)
      r.execute = async (_agent: unknown, _conversation: unknown, opts: { task: string; for: Person }) => { replies.push(opts) }
      r.keep = (updated: Delegation) => { Object.assign(delegations.find((d) => d.id === updated.id)!, updated) }
      r.tellAsker('boss', 'origin', undefined)
      expect(jobs).toHaveLength(1)
      await jobs.shift()!()
      expect(r.tells.size).toBe(1)
      ;[...r.tells.values()][0]()
      expect(jobs).toHaveLength(1)
      await jobs.shift()!()
      expect(replies.map((reply) => reply.for.id)).toEqual(['bia', 'caio'])
      expect(replies[0]!.task).toContain('Alpha')
      expect(replies[0]!.task).not.toContain('Beta')
      expect(replies[0]!.task).not.toContain('beta-room')
      expect(replies[1]!.task).toContain('Beta')
      expect(replies[1]!.task).not.toContain('Alpha')
      expect(replies[1]!.task).not.toContain('alpha-room')
    })
  }
})
