// Which quotas are drawn, and how: one choice for every provider, instead of a panel per harness, and
// a switch per provider the person actually has. The header strip and the Usage page read the same
// rules here, so a provider hidden in one is hidden in the other.
import { L } from './lang'
import { type QuotasSnapshot, type ProviderQuota, type QuotaView, type Settings } from './types'

// What the panels draw when the person hasn't chosen: every provider's windows in one table.
export const DEFAULT_QUOTA_VIEW: QuotaView = 'table'

export const quotaView = (s: Pick<Settings, 'quotaView'> | undefined): QuotaView => (s?.quotaView === 'rings' || s?.quotaView === 'table' ? s.quotaView : DEFAULT_QUOTA_VIEW)

// The two ways, with the sentence that says what each one does; the one in use is marked.
export function quotaViewChoices(current: QuotaView | undefined): { value: QuotaView; label: string; hint: string; on: boolean }[] {
  const on = quotaView({ quotaView: current })
  return [
    {
      value: 'table',
      label: L('Tabela', 'Table'),
      hint: L('Uma coluna por provedor e as janelas em linhas: os números lado a lado, para comparar.', 'A column per provider and the windows as rows: the figures side by side, to compare.'),
      on: on === 'table'
    },
    {
      value: 'rings',
      label: L('Anéis', 'Rings'),
      hint: L('Um anel por janela, com a parte usada pintada: a proporção de cada uma de relance.', 'A ring per window, the used part painted: each window’s ratio at a glance.'),
      on: on === 'rings'
    }
  ]
}

// One switch in the settings: the provider, as the quota reader named it.
export interface QuotaProviderRow {
  id: string // what the quota reader calls the provider (`ProviderQuota.id`)
  label: string
}

// The providers the settings offer a switch for: the ones the quota reader found on this computer, in
// the order it read them. The reader is the source of truth, not the installed harnesses: a provider
// reached through Pi, Hermes or an OpenCode login (Grok, Z.ai, DeepSeek…) is one the person has a
// quota for, and a harness that hosts other people's providers names none of its own. Two logins for
// the same provider are one row, under the name the first reading gave it.
export function quotaSnapshotRows(snap: QuotasSnapshot | null | undefined): QuotaProviderRow[] {
  const rows: QuotaProviderRow[] = []
  const seen = new Set<string>()
  for (const p of snap?.list ?? []) {
    if (seen.has(p.id)) continue
    seen.add(p.id)
    rows.push({ id: p.id, label: p.label })
  }
  return rows
}

// A provider is drawn unless the person unticked it: one configured later shows up by itself.
export const quotaShown = (s: Pick<Settings, 'quotaHidden'> | undefined, id: string): boolean => !s?.quotaHidden?.includes(id)

// The read without the providers the person put away, in the order the reader gave them.
export function visibleQuotas<T extends { id: string }>(list: readonly T[], s: Pick<Settings, 'quotaHidden'> | undefined): T[] {
  return list.filter((p) => quotaShown(s, p.id))
}

// What the settings save after a switch moves: the ids that stay hidden, the rest read again.
export function withQuotaShown(s: Pick<Settings, 'quotaHidden'> | undefined, id: string, shown: boolean): string[] {
  const hidden = new Set(s?.quotaHidden ?? [])
  if (shown) hidden.delete(id)
  else hidden.add(id)
  return [...hidden]
}

// The last read, ready for a panel: its providers with the ones the person put away taken out. No
// snapshot at all (the first paint, before the core answers) draws nothing rather than a guess.
export function shownQuotas(snap: QuotasSnapshot | null, s: Pick<Settings, 'quotaHidden'> | undefined): ProviderQuota[] {
  if (!snap) return []
  return visibleQuotas(snap.list, s)
}
