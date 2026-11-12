// The little bars in a session's header: what the bots in this conversation have left, one bar for
// the provider each one spends, and only the window that lasts longest of that provider's. A plan is
// decided by the month, not by the five hours it happens to be in — a month at 8% left is the number
// that matters, and the short window under it only says how the next few hours go. So the header
// draws the month where there is one, the week where there isn't, and the short window for a provider
// that reports nothing longer.
//
// Only the providers these bots are set to run on, main model then its fallback, and two at most:
// every login on the computer would be a wall of bars, and a bar whose provider no reply here can
// spend says nothing about this conversation.
//
// The header carries one number per provider, so pointing at a bar opens a box with that provider's
// own windows, each drawn as the bar it is on the Usage page: the month, the week, the short window,
// what is left of each and when each one resets. The keyboard reaches the same box by focusing the
// strip.
//
// A wallet (a balance with no cap) draws no bar, because it has no denominator: inventing one would
// read as "nearly full" when it says nothing. Its money is in the box and on the Usage page.
import { useEffect, useState, type ReactNode } from 'react'
import { L } from '../../../shared/lang'
import { agentProviders } from '../../../shared/quota-provider'
import type { Agent, ProviderQuota, QuotaWindow } from '../../../shared/types'
import { amAdmin, loadQuotas, navigate, useStore } from '../store'
import { left, share, until } from './Usage'

type Span = 'month' | 'week' | 'session'
// Longest first: the first window a provider reports is the one the header keeps.
const SPANS: readonly Span[] = ['month', 'week', 'session']
const LABELS: Record<Span, () => string> = {
  month: () => L('Mês', 'Month'),
  week: () => L('Semana', 'Week'),
  session: () => L('5 h', '5h')
}

// The windows a provider reports with a cap to draw, longest first.
const capped = (p: ProviderQuota): { span: Span; w: QuotaWindow }[] =>
  SPANS.map((span) => ({ span, w: p[span] })).filter(
    (x): x is { span: Span; w: QuotaWindow } => !!x.w && x.w.limit !== undefined && x.w.limit > 0 && x.w.remaining !== undefined
  )

// The one window a provider shows in the header: its longest, and only if it has a cap to draw.
export function longest(p: ProviderQuota): { span: Span; w: QuotaWindow } | undefined {
  return capped(p)[0]
}

// Reading every provider's quota costs a request each, so the strip keeps what it read for a while
// instead of asking again on every conversation the person opens. The Usage page reads on its own.
const FRESH = 10 * 60_000
let cache: { list: ProviderQuota[]; at: number } | null = null
export const forgetQuotaStrip = (): void => {
  cache = null
}

// `admin` gates the read, and is named as such: what only an admin may ask is only asked by one.
function useQuotas(admin: boolean): ProviderQuota[] {
  const [list, setList] = useState<ProviderQuota[]>(cache && Date.now() - cache.at < FRESH ? cache.list : [])
  useEffect(() => {
    if (!admin) return
    if (cache && Date.now() - cache.at < FRESH) {
      setList(cache.list)
      return
    }
    let live = true
    loadQuotas()
      .then((l) => {
        cache = { list: l, at: Date.now() }
        if (live) setList(l)
      })
      // A failed read is not a strip of zeros: it draws nothing and the Usage page says why.
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [admin])
  return list
}

const tone = (s: number | undefined): string => (s === undefined ? '' : s <= 0.1 ? 'is-danger' : s <= 0.3 ? 'is-warn' : '')

// The bar one window draws, in the same three tones the header uses.
function Track({ w }: { w: QuotaWindow }): ReactNode {
  const s = share(w)
  return (
    <span className={`quota-card__track ${tone(s)}`}>
      <i style={{ width: `${Math.round((s ?? 0) * 100)}%` }} />
    </span>
  )
}

// One provider in the box: its name, then a row for each window it reports.
function ProviderBox({ p }: { p: ProviderQuota }): ReactNode {
  const rows = capped(p)
  const wallet = [p.month, p.week, p.session].find((w) => !!w && w.unit === 'usd' && (w.limit === undefined || w.limit <= 0))
  return (
    <div className="quota-card__provider">
      <div className="quota-card__name">
        {p.label}
        {p.plan ? <span className="quota-card__plan">{p.plan}</span> : null}
      </div>
      {rows.map(({ span, w }) => (
        <div className="quota-card__window" key={span}>
          <span className="quota-card__span">{LABELS[span]()}</span>
          <span className="quota-card__left">
            {left(w)} {L('livre', 'left')}
          </span>
          <Track w={w} />
          <span className="quota-card__reset">{w.resetsAt ? `${L('zera', 'resets')} ${until(w.resetsAt)}` : ''}</span>
        </div>
      ))}
      {wallet && (
        <div className="quota-card__wallet">
          {left(wallet)} {L('na carteira', 'in the wallet')}
        </div>
      )}
      {rows.length === 0 && !wallet && <div className="quota-card__note">{p.error ?? L('nada com teto para desenhar', 'nothing with a cap to draw')}</div>}
    </div>
  )
}

/** The bots whose providers this header draws: a DM's own, a channel's members. */
export function QuotaStrip({ agents }: { agents: Agent[] }): ReactNode {
  // Whose logins are read is an admin's, as everywhere else: a member's app never asks.
  const admin = useStore(amAdmin)
  const accounts = useStore((s) => s.settings.accounts ?? [])
  const list = useQuotas(admin)
  // The provider the pointer is on, and whether the keyboard is on the strip: either opens the box.
  const [peeked, setPeeked] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)
  if (!admin) return null
  const bars = agentProviders(agents, accounts)
    .map((id) => list.find((p) => p.id === id))
    .filter((p): p is ProviderQuota => !!p)
    .filter((p) => capped(p).length > 0)
  if (bars.length === 0) return null
  const boxes = bars.filter((p) => (peeked ? p.id === peeked : focused))
  return (
    <div className="quota-strip-wrap" onMouseLeave={() => setPeeked(null)}>
      <button
        type="button"
        className="quota-strip"
        aria-label={L('Uso e limites', 'Usage and limits')}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={() => navigate({ kind: 'usage' })}
      >
        {bars.map((p) => {
          const pick = longest(p)!
          return (
            <span
              key={p.id}
              className={`quota-strip__pill ${tone(share(pick.w))}`}
              data-provider={p.id}
              data-span={pick.span}
              onMouseEnter={() => setPeeked(p.id)}
            >
              <span className="quota-strip__name">{p.label}</span>
              <span className="quota-strip__track">
                <i style={{ width: `${Math.round((share(pick.w) ?? 0) * 100)}%` }} />
              </span>
            </span>
          )
        })}
      </button>
      {boxes.length > 0 && (
        <div className="quota-card" role="tooltip">
          {boxes.map((p) => (
            <ProviderBox key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  )
}
