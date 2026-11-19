// How the quota panels draw, and which providers they draw: one choice for every provider, and a
// switch per provider the quota reader found on this computer. What is checked here is the reading of
// the setting (an unset one is the table), the rows the settings offer (the reader's providers, in its
// order, each once — Grok and Z.ai and DeepSeek included when their login is found), and the filtering
// both readers go through (the settings' list and what the pages end up drawing).
import { describe, expect, it } from 'vitest'
import { DEFAULT_QUOTA_VIEW, quotaShown, quotaSnapshotRows, quotaView, quotaViewChoices, shownQuotas, visibleQuotas, withQuotaShown } from '../src/shared/quota-view'
import type { ProviderQuota } from '../src/shared/types'

const quota = (id: string, label = id, via = 'test'): ProviderQuota => ({ id, label, via, at: 1 })

describe('quotaView', () => {
  it('draws the table when nothing was chosen', () => {
    expect(DEFAULT_QUOTA_VIEW).toBe('table')
    expect(quotaView(undefined)).toBe('table')
    expect(quotaView({})).toBe('table')
  })

  it('keeps the choice the person made', () => {
    expect(quotaView({ quotaView: 'rings' })).toBe('rings')
    expect(quotaView({ quotaView: 'table' })).toBe('table')
  })

  it('falls back to the table for a value the app never wrote', () => {
    expect(quotaView({ quotaView: 'circles' as never })).toBe('table')
    expect(quotaView({ quotaView: null as never })).toBe('table')
  })

  it('offers both ways, exactly one of them marked as the one in use', () => {
    for (const current of [undefined, 'table', 'rings'] as const) {
      const choices = quotaViewChoices(current)
      expect(choices.map((c) => c.value)).toEqual(['table', 'rings'])
      expect(choices.filter((c) => c.on)).toHaveLength(1)
      expect(choices.find((c) => c.on)!.value).toBe(quotaView({ quotaView: current }))
      for (const c of choices) expect(c.label.length > 0 && c.hint.length > 0).toBe(true)
    }
  })
})

describe('quotaSnapshotRows', () => {
  it('offers one row per provider the reader found, in the reader’s order', () => {
    const rows = quotaSnapshotRows({
      list: [quota('anthropic-claude-code', 'Claude Code', 'Claude Code'), quota('openai-codex', 'Codex', 'Codex'), quota('opencode-go', 'OpenCode Go', 'Pi')],
      at: 1
    })
    expect(rows).toEqual([
      { id: 'anthropic-claude-code', label: 'Claude Code' },
      { id: 'openai-codex', label: 'Codex' },
      { id: 'opencode-go', label: 'OpenCode Go' }
    ])
  })

  it('offers the providers a harness only hosts: Grok, Z.ai and DeepSeek get a switch too', () => {
    // None of these has an engine of its own: the reader finds them through Pi, Hermes or an OpenCode
    // login, and the settings ask the reader, not the installed harnesses.
    const rows = quotaSnapshotRows({
      list: [quota('xai-oauth', 'Grok', 'Hermes'), quota('zai', 'Z.ai', 'Pi'), quota('deepseek', 'DeepSeek', 'OpenCode')],
      at: 1
    })
    expect(rows.map((r) => r.id)).toEqual(['xai-oauth', 'zai', 'deepseek'])
    expect(rows.map((r) => r.label)).toEqual(['Grok', 'Z.ai', 'DeepSeek'])
  })

  it('never offers the same provider twice, when two logins report it', () => {
    const rows = quotaSnapshotRows({
      list: [quota('zai', 'Z.ai', 'Pi'), quota('xai-oauth', 'Grok', 'Hermes'), quota('zai', 'Z.ai (Hermes)', 'Hermes')],
      at: 1
    })
    expect(rows.map((r) => r.id)).toEqual(['zai', 'xai-oauth'])
    // The first reading keeps the name, so the row doesn't rename itself between reads.
    expect(rows[0]!.label).toBe('Z.ai')
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length)
  })

  it('offers nothing before the read, or when the reader found nobody', () => {
    expect(quotaSnapshotRows(undefined)).toEqual([])
    expect(quotaSnapshotRows(null)).toEqual([])
    expect(quotaSnapshotRows({ list: [], at: 1 })).toEqual([])
  })
})

describe('which quotas are shown', () => {
  it('shows every provider the person never put away', () => {
    expect(quotaShown(undefined, 'openai-codex')).toBe(true)
    expect(quotaShown({}, 'openai-codex')).toBe(true)
    expect(quotaShown({ quotaHidden: [] }, 'openai-codex')).toBe(true)
  })

  it('hides the ones that were unticked, and only those', () => {
    const s = { quotaHidden: ['openai-codex'] }
    expect(quotaShown(s, 'openai-codex')).toBe(false)
    expect(quotaShown(s, 'anthropic-claude-code')).toBe(true)
  })

  it('draws the read without the hidden providers, in the reader’s order', () => {
    const list = [quota('openai-codex'), quota('opencode-go'), quota('anthropic-claude-code')]
    expect(visibleQuotas(list, undefined).map((p) => p.id)).toEqual(['openai-codex', 'opencode-go', 'anthropic-claude-code'])
    expect(visibleQuotas(list, { quotaHidden: ['opencode-go'] }).map((p) => p.id)).toEqual(['openai-codex', 'anthropic-claude-code'])
    expect(visibleQuotas(list, { quotaHidden: ['openai-codex', 'opencode-go', 'anthropic-claude-code'] })).toEqual([])
    // The hidden list names a provider that isn't in this read: nothing else goes with it.
    expect(visibleQuotas(list, { quotaHidden: ['zai'] })).toHaveLength(3)
  })

  it('draws nothing before the core has answered, or with nothing configured', () => {
    expect(shownQuotas(null, undefined)).toEqual([])
    expect(shownQuotas({ list: [], at: 1 }, undefined)).toEqual([])
    expect(shownQuotas({ list: [quota('zai')], at: 1 }, { quotaHidden: ['zai'] })).toEqual([])
    expect(shownQuotas({ list: [quota('zai')], at: 1 }, undefined).map((p) => p.id)).toEqual(['zai'])
  })
})

describe('withQuotaShown', () => {
  it('leaves the read alone and answers the list to save', () => {
    const was = { quotaHidden: ['zai'] }
    expect(withQuotaShown(was, 'openai-codex', false)).toEqual(['zai', 'openai-codex'])
    expect(withQuotaShown(was, 'zai', true)).toEqual([])
    expect(withQuotaShown(undefined, 'zai', false)).toEqual(['zai'])
    // Ticking a provider that was already shown changes nothing.
    expect(withQuotaShown({ quotaHidden: ['zai'] }, 'openai-codex', true)).toEqual(['zai'])
    expect(was).toEqual({ quotaHidden: ['zai'] })
  })
})
