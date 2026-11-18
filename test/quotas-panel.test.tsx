// The providers panel in Usage and limits: one column per provider, the same three rows in each,
// the numbers the provider gave, and a column that says why it has nothing instead of vanishing.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { ProviderQuota } from '../src/shared/types'

const { window, document } = parseHTML('<html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
Object.assign(document, { oninput: null })

let reply: ProviderQuota[] = []
let reported: { fiveHour?: { utilization: number; resetsAt: number }; sevenDay?: { utilization: number; resetsAt: number }; at: number } | undefined
// How the page draws them, and which ones: the same two settings the header strip reads.
let view: 'table' | 'rings' = 'table'
let hidden: string[] = []
const snapshot = () => ({ list: reply, at: Date.now() })
const loadQuotas = vi.fn(async () => snapshot())
const refreshQuotas = vi.fn(async () => snapshot())
vi.mock('../src/renderer/src/store', () => ({
  useStore: (select: (s: unknown) => unknown) => select({ settings: { quota: reported, quotaView: view, quotaHidden: hidden } }),
  amAdmin: () => true,
  loadQuotas: () => loadQuotas(),
  refreshQuotas: () => refreshQuotas(),
  agentById: () => undefined,
  countedTokens: () => 0,
  ENGINES: {},
  isTeam: () => false,
  loadUsage: async () => null,
  messageById: () => undefined,
  modelInfo: () => undefined,
  navigate: () => undefined,
  receipts: () => []
}))
vi.mock('../src/renderer/src/components/ui', () => ({
  AgentAvatar: () => null,
  duration: (ms: number) => `${ms}`,
  Icon: () => null,
  tokens: (n: number) => `${Math.round(n)}`,
  usd: (v: number) => `$${v.toFixed(2)}`
}))
vi.mock('../src/renderer/src/components/Pages', () => ({ Sheet: ({ children }: { children?: unknown }) => children }))
vi.mock('../src/renderer/src/components/People', () => ({ AdminOnly: ({ children }: { children?: unknown }) => children }))

const { createRoot } = await import('react-dom/client')
const { Quotas } = await import('../src/renderer/src/components/Usage')

let root: ReturnType<typeof createRoot>
const flush = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}
beforeEach(async () => {
  reply = []
  reported = undefined
  view = 'table'
  hidden = []
  loadQuotas.mockClear()
  refreshQuotas.mockClear()
  root = createRoot(document.getElementById('root')!)
})
afterEach(async () => await act(async () => root.unmount()))

const render = async (): Promise<void> => {
  await act(async () => root.render(<Quotas />))
  await flush()
}
const heads = (): Element[] => [...document.querySelectorAll('.usage-quota__head')]
const cells = (): Element[] => [...document.querySelectorAll('.usage-quota__cell')]

const quota = (over: Partial<ProviderQuota>): ProviderQuota => ({ id: 'openai-codex', label: 'Codex', via: 'Codex', at: Date.now(), ...over })

it('draws one column per provider and the same three rows in each', async () => {
  reply = [
    quota({ session: { used: 0.42, remaining: 0.58, limit: 1, unit: '%' }, week: { used: 0.1, remaining: 0.9, limit: 1, unit: '%' } }),
    quota({ id: 'opencode-go', label: 'OpenCode Go', via: 'Pi', session: { used: 0.2, remaining: 0.8, limit: 1, unit: '%' }, week: { used: 0.55, remaining: 0.45, limit: 1, unit: '%' }, month: { used: 0.1, remaining: 0.9, limit: 1, unit: '%' } })
  ]
  await render()
  expect(heads().map((h) => h.querySelector('strong')!.textContent)).toEqual(['Codex', 'OpenCode Go'])
  expect(heads().map((h) => h.querySelector('span')!.textContent)).toEqual(['Codex', 'Pi'])
  // Three rows of provider cells, and no more: a missing window keeps its place.
  expect(cells()).toHaveLength(6)
  expect(document.querySelectorAll('.usage-quotas__row')).toHaveLength(3)
  expect(loadQuotas).toHaveBeenCalledTimes(1)
})

it('shows what the provider says is left, and the bar for it', async () => {
  reply = [quota({ session: { used: 0.42, remaining: 0.58, limit: 1, unit: '%' }, week: { used: 1, remaining: 0, limit: 1, unit: '%', resetsAt: Date.now() + 3_600_000 } })]
  await render()
  const [session, week, month] = cells()
  expect(session!.textContent).toContain('58%')
  expect(session!.querySelector('.usage-quota__track i')!.getAttribute('style')).toContain('width:58%')
  expect(week!.textContent).toContain('0%')
  expect(week!.className).toContain('is-danger')
  expect(month!.className).toContain('is-empty')
})

it('keeps a column whose provider could not be read, and says why there', async () => {
  reply = [quota({ error: 'The login expired. Sign in again through that tool.' }), quota({ id: 'zai', label: 'Z.ai', via: 'Pi', session: { used: 0.3, remaining: 0.7, limit: 1, unit: '%' } })]
  await render()
  expect(heads()).toHaveLength(2)
  expect(heads()[0]!.className).toContain('is-off')
  expect(heads()[0]!.getAttribute('title')).toContain('expired')
  expect(cells()[0]!.textContent).toContain('—')
  expect(cells()[1]!.textContent).toContain('70%')
})

it('shows a balance in its own money, with no bar invented for it', async () => {
  reply = [quota({ id: 'openrouter', label: 'OpenRouter', via: 'Hermes', month: { remaining: 15, limit: 20, used: 0.25, unit: 'usd' } })]
  await render()
  expect(document.body.textContent).toContain('$15.00')
  expect(document.querySelectorAll('.usage-quota__track')).toHaveLength(1)
})

it('fills the Claude column from the last reply when its credentials are not on disk', async () => {
  reported = { fiveHour: { utilization: 0.34, resetsAt: Date.now() + 3_600_000 }, sevenDay: { utilization: 0.21, resetsAt: Date.now() + 86_400_000 }, at: Date.now() }
  reply = []
  await render()
  expect(heads()).toHaveLength(1)
  expect(heads()[0]!.textContent).toContain('Claude Code')
  expect(cells()[0]!.textContent).toContain('66%')
  expect(cells()[1]!.textContent).toContain('79%')
})

it('says where it looks when there is no login at all', async () => {
  await render()
  expect(heads()).toHaveLength(0)
  expect(document.body.textContent).toMatch(/Nenhum login|No login/)
})

it('reads again on demand', async () => {
  await render()
  const button = [...document.querySelectorAll('button')].find((b) => /Ler de novo|Read again/.test(b.textContent ?? ''))!
  await act(async () => button.dispatchEvent(new window.Event('click', { bubbles: true })))
  await flush()
  expect(refreshQuotas).toHaveBeenCalledTimes(1)
})

it('heads the panel with the provider count in the month’s header shape', async () => {
  reply = [quota({ session: { used: 0.2, remaining: 0.8, limit: 1, unit: '%' } }), quota({ id: 'zai', label: 'Z.ai', via: 'Pi', week: { used: 0.2, remaining: 0.8, limit: 1, unit: '%' } })]
  await render()
  const head = document.querySelector('.usage-card .usage-month__head')!
  expect(head).not.toBeNull()
  // The eyebrow names the panel, the figure counts the providers, and the unit says what they are.
  expect(head.querySelector('.usage-eyebrow')!.textContent).toMatch(/O que cada provedor ainda tem|What each provider has left/)
  expect(head.querySelector('.usage-month__total strong')!.textContent).toBe('2')
  expect(head.querySelector('.usage-month__total span')!.textContent).toMatch(/provedores|providers/)
  // The old h2 title and its subtitle are gone: one header, not two.
  expect(document.querySelector('.usage-card h2')).toBeNull()
  expect(head.textContent).not.toMatch(/Lido agora|Read just now/)
  // Where and when it was read, in the muted line under the figure.
  expect(head.querySelector('.muted.small')!.textContent).toMatch(/Lido às|Read at/)
  // The read-again button keeps the right end of that same row.
  const headButtons = [...head.querySelectorAll('button')]
  expect(headButtons).toHaveLength(1)
  expect(headButtons[0]!.textContent).toMatch(/Ler de novo|Read again/)
})

// The rings' way: each provider is its own card, under its own name, with its windows inside it. The
// grouping is per provider — never one run of every provider's rings in a wrapping row.
const pct = (leftOver: number) => ({ used: 1 - leftOver, remaining: leftOver, limit: 1, unit: '%' as const })
const cards = (): Element[] => [...document.querySelectorAll('.usage-quota-card')]
const rings = (card: Element): Element[] => [...card.querySelectorAll('.usage-ring')]

it('draws one card per provider in the rings’ way, its rings inside its own card', async () => {
  view = 'rings'
  reply = [
    quota({ session: pct(0.8), week: pct(0.55) }),
    quota({ id: 'zai', label: 'Z.ai', via: 'Pi', week: pct(0.3), month: pct(0.12) })
  ]
  await render()
  expect(cards().map((c) => c.getAttribute('data-provider'))).toEqual(['openai-codex', 'zai'])
  expect(cards()[0]!.querySelector('.usage-quota-card__head')!.textContent).toContain('Codex')
  expect(cards()[1]!.querySelector('.usage-quota-card__head')!.textContent).toContain('Z.ai')
  expect(rings(cards()[0]!)).toHaveLength(2)
  expect(rings(cards()[1]!)).toHaveLength(2)
  // A window belongs to the provider whose card it is: no ring escapes its card.
  expect(document.querySelectorAll('.usage-quotas__rings > .usage-ring')).toHaveLength(0)
  // The table's columns are the other way, and aren't drawn here.
  expect(heads()).toHaveLength(0)
  expect(document.querySelectorAll('.usage-quotas__row')).toHaveLength(0)
})

it('keeps a wallet’s card, and says it has no cap instead of drawing an empty ring', async () => {
  view = 'rings'
  reply = [quota({ id: 'deepseek', label: 'DeepSeek', via: 'Pi', month: { remaining: 3.42, unit: 'usd' } })]
  await render()
  expect(cards()).toHaveLength(1)
  expect(rings(cards()[0]!)).toHaveLength(0)
  expect(cards()[0]!.textContent).toMatch(/sem limite|no cap/)
  expect(cards()[0]!.textContent).toContain('DeepSeek')
})

it('leaves a hidden provider out of the rings too, as the table does', async () => {
  view = 'rings'
  hidden = ['zai']
  reply = [quota({ session: pct(0.5) }), quota({ id: 'zai', label: 'Z.ai', via: 'Pi', week: pct(0.5) })]
  await render()
  expect(cards().map((c) => c.getAttribute('data-provider'))).toEqual(['openai-codex'])
})
