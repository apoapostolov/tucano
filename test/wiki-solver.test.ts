// Who reads a finding: a bot named in Wiki settings, with its own instructions above the rules the job
// needs, or the app's own resolver when no bot is named or the name no longer matches an agent.
import { describe, expect, it } from 'vitest'
import type { Agent, Settings } from '../src/shared/types'
import { chooseSolver, resolverSystem } from '../src/core/wiki-resolver'

const agent = (over: Partial<Agent> = {}): Agent =>
  ({ id: 'a1', name: 'Lia', handle: 'lia', role: 'Wiki', instructions: 'Prefira a fonte mais nova.', effort: 'medium', modelId: 'x', ...over }) as Agent

const settings = (over: Partial<Settings> = {}): Settings => ({ workspaceName: 'Ana Ribeiro', ...over }) as Settings

describe('who reads a finding for the resolver', () => {
  it('reads with the app resolver when Wiki settings name no bot', () => {
    const solver = chooseSolver({ settings: () => settings(), agent: () => undefined })
    expect(solver.bot).toBeUndefined()
    expect(solver.system('as regras')).toBe('as regras')
  })

  it("puts the bot's own instructions above the rules the job needs", () => {
    const bot = agent()
    const solver = chooseSolver({ settings: () => settings({ wikiResolveBot: 'a1' }), agent: (id) => (id === 'a1' ? bot : undefined) })
    expect(solver.bot).toBe(bot)
    expect(solver.system('as regras')).toBe('Prefira a fonte mais nova.\n\nas regras')
  })

  it('keeps the job its rules when the bot was written without instructions', () => {
    const bot = agent({ instructions: '   \n ' })
    const solver = chooseSolver({ settings: () => settings({ wikiResolveBot: 'a1' }), agent: () => bot })
    expect(solver.bot).toBe(bot)
    expect(solver.system('as regras')).toBe('as regras')
  })

  it('falls back to the app resolver when the named bot is gone', () => {
    const solver = chooseSolver({ settings: () => settings({ wikiResolveBot: 'deleted-agent' }), agent: () => undefined })
    expect(solver.bot).toBeUndefined()
    expect(solver.system('as regras')).toBe('as regras')
  })

  it('treats an empty setting as no bot at all', () => {
    const solver = chooseSolver({ settings: () => settings({ wikiResolveBot: '' }), agent: () => agent() })
    expect(solver.bot).toBeUndefined()
  })

  it('never drops the JSON the resolver reads back', () => {
    const solver = chooseSolver({ settings: () => settings({ wikiResolveBot: 'a1' }), agent: () => agent() })
    const system = solver.system(resolverSystem())
    expect(system).toContain('Prefira a fonte mais nova.')
    expect(system).toContain('JSON')
  })
})
