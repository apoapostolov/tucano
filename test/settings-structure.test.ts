import { describe, expect, it } from 'vitest'
import { PERSONAL_SETTINGS } from '../src/core/policy-people'
import { settingsDestination, settingsPages, settingsStructure, settingsTabStructure } from '../src/renderer/src/settings-structure'

const all = { admin: true, owner: true, team: true, servers: true }

describe('retained settings ownership and access', () => {
  it('keeps canonical ownership distinct from the existing rendered tabs', () => {
    const sections = settingsStructure(all)
    expect(settingsPages().map(([id]) => id)).toEqual(['app', 'workspace', 'agents', 'models', 'knowledge', 'connections'])
    const tabs = ['geral', 'modelos', 'agentes', 'integracoes', 'pessoas', 'atividade', 'servidores', 'harnesses']
    const listed = tabs.flatMap(tab => settingsTabStructure(tab, sections).map(section => section.id))
    expect(new Set(listed).size).toBe(listed.length)
    expect(new Set(sections.map(section => section.id)).size).toBe(sections.length)
    expect(settingsTabStructure('modelos', sections).map(section => section.id).slice(0, 3)).toEqual(['models-agents', 'models-session-names', 'models-runtimes'])
    expect(sections.find(section => section.id === 'knowledge-memory')!.page).toBe('knowledge')
    expect(sections.find(section => section.id === 'workspace-context')!.page).toBe('workspace')
  })

  it('resolves legacy destinations to their canonical subjects', () => {
    const sections = settingsStructure(all)
    for (const [tab, section] of Object.entries({ servidores: 'connections-servers', pessoas: 'workspace-people', atividade: 'workspace-activity', integracoes: 'connections-phone', roteamento: 'models-routing' })) {
      expect(settingsDestination(tab, sections).section).toBe(section)
    }
  })

  it('keeps members away from administrative controls and preserves personal keys', () => {
    const visible = settingsStructure({ admin: false, owner: false, team: true, servers: true }).filter(section => section.visible)
    expect(new Set(visible.map(section => section.page))).toEqual(new Set(['app', 'workspace', 'harnesses']))
    expect(visible.map(section => section.id)).not.toContain('models-agents')
    expect(visible.map(section => section.id)).not.toContain('agents-permissions')
    for (const section of visible.filter(section => section.scope === 'personal')) {
      for (const key of section.keys) expect(PERSONAL_SETTINGS).toContain(key)
    }
  })

  it('preserves owner, administrator and server capability boundaries', () => {
    const sections = settingsStructure({ admin: true, owner: false, team: true, servers: false })
    expect(sections.find(section => section.id === 'connections-phone')!.visible).toBe(false)
    expect(sections.find(section => section.id === 'connections-servers')!.visible).toBe(false)
    expect(sections.find(section => section.id === 'workspace-backups')!.visible).toBe(false)
    expect(sections.find(section => section.id === 'workspace-danger')!.visible).toBe(true)
    expect(sections.find(section => section.id === 'workspace-transfer')!.visible).toBe(true)
  })
})
