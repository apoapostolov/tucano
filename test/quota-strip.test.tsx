// The little bars in a session's header. What is checked here: one bar per provider the bots of the
// conversation are set to run on (main model, then its fallback, two at most), the window it draws is
// the longest the provider reports (month over week over the short one), the provider is named above
// its bar, a wallet with no cap draws nothing, the tone follows what is left, a click opens Usage and
// limits, and reading every provider costs one read even when several conversations are opened. What
// the bars look like and where they sit is measured in the built app; linkedom has no layout.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { setLang } from '../src/shared/lang'
import type { ProviderQuota } from '../src/shared/types'

const { window, document } = parseHTML('<html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })

let reply: ProviderQuota[] = []
const loadQuotas = vi.fn(async () => reply)
const navigate = vi.fn()
vi.mock('../src/renderer/src/store', () => ({
  useStore: (select: (s: unknown) => unknown) => select({ settings: {} }),
  amAdmin: () => true,
  loadQuotas: () => loadQuotas(),
  navigate: (view: unknown) => navigate(view),
  agentById: () => undefined,
  countedTokens: () => 0,
  ENGINES: {},
  isTeam: () => false,
  loadUsage: async () => null,
  messageById: () => undefined,
  modelInfo: () => undefined,
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
const { QuotaStrip, forgetQuotaStrip, longest } = await import('../src/renderer/src/components/QuotaStrip')

beforeAll(() => setLang('en'))

let root: Root
const flush = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}
beforeEach(() => {
  reply = []
  loadQuotas.mockClear()
  navigate.mockClear()
  forgetQuotaStrip()
  root = createRoot(document.getElementById('root')!)
})
afterEach(async () => await act(async () => root.unmount()))

const render = async (agents: unknown[] = [CODEX]): Promise<void> => {
  await act(async () => root.render(<QuotaStrip agents={agents as never} />))
  await flush()
}
const pills = (): HTMLElement[] => [...document.querySelectorAll('.quota-strip__pill')] as HTMLElement[]
// A bot as the sidebar stores one: a model id names its harness, and the login inside it.
// React synthesises onMouseEnter from a mouseover that comes from outside the element, so the test
// sends one: linkedom has no MouseEvent at all.
const hover = async (el: Element): Promise<void> => {
  await act(async () => {
    const e = new window.Event('mouseover', { bubbles: true })
    Object.defineProperty(e, 'relatedTarget', { value: document.body })
    el.dispatchEvent(e)
  })
}
const bot = (modelId: string, fallbackModelId?: string) => ({ modelId, ...(fallbackModelId ? { fallbackModelId } : {}) }) as never
const CODEX = bot('codex:gpt-6.1-sol')
const OPENCODE = bot('pi:opencode-go/deepseek-v4.1-flash', 'pi:opencode-go/beam-free')
const GROK = bot('pi:xai-oauth/grok-4.6')
const plane = (over: Partial<ProviderQuota>): ProviderQuota => ({ id: 'openai-codex', label: 'Codex', via: 'Codex', at: Date.now(), ...over })
// A window with a cap, as a provider reports it: what is left, out of what it allows.
const pct = (leftOver: number, resetsAt?: number) => ({ used: 1 - leftOver, remaining: leftOver, limit: 1, unit: '%' as const, ...(resetsAt ? { resetsAt } : {}) })

describe('the window it keeps', () => {
  it('keeps the month where there is a month, the week where there is a week', () => {
    expect(longest(plane({ session: pct(0.8), week: pct(0.5), month: pct(0.2) }))?.span).toBe('month')
    expect(longest(plane({ session: pct(0.8), week: pct(0.5) }))?.span).toBe('week')
    expect(longest(plane({ session: pct(0.8) }))?.span).toBe('session')
    expect(longest(plane({ error: 'the login expired' }))).toBeUndefined()
  })

  it('leaves a wallet alone: a balance with no cap has no bar to draw', () => {
    expect(longest(plane({ month: { remaining: 3.42, unit: 'usd' } }))).toBeUndefined()
    expect(longest(plane({ month: { remaining: 0, limit: 0, unit: 'usd' } }))).toBeUndefined()
  })

  it('reads a real zero as a real reading, not as absent', () => {
    const pick = longest(plane({ month: pct(0) }))
    expect(pick?.span).toBe('month')
    expect(pick?.w.remaining).toBe(0)
  })
})

describe('the strip in the header', () => {
  it('draws a bar for the providers the bots run on, in the longest window each reports', async () => {
    reply = [
      plane({ session: pct(0.9), week: pct(0.7), month: pct(0.4) }),
      plane({ id: 'xai-oauth', label: 'Grok', via: 'Hermes', week: pct(0.38) }),
      plane({ id: 'deepseek', label: 'DeepSeek', via: 'Pi', month: { remaining: 3.42, unit: 'usd' } })
    ]
    await render([CODEX, GROK])
    expect(pills().map((p) => [p.dataset.provider, p.dataset.span])).toEqual([
      ['openai-codex', 'month'],
      ['xai-oauth', 'week']
    ])
  })

  it('leaves out a provider no bot of this conversation runs on', async () => {
    reply = [
      plane({ month: pct(0.4) }),
      plane({ id: 'xai-oauth', label: 'Grok', via: 'Hermes', week: pct(0.38) })
    ]
    await render([OPENCODE])
    expect(pills()).toHaveLength(0)
    expect(document.querySelector('.quota-strip')).toBeNull()
  })

  it('names the provider above its bar, as the provider writes it', async () => {
    reply = [plane({ id: 'opencode-go', label: 'OpenCode Go', via: 'Pi', month: pct(0.4) })]
    await render([OPENCODE])
    expect(document.querySelector('.quota-strip__name')!.textContent).toBe('OpenCode Go')
    // The name is small caps in the stylesheet, so the text stays as the provider writes it.
    expect(pills()[0]!.querySelector('.quota-strip__track i')).not.toBeNull()
  })

  it('keeps two bars at most, the main model first and its fallback after', async () => {
    reply = [
      plane({ month: pct(0.4) }),
      plane({ id: 'xai-oauth', label: 'Grok', via: 'Hermes', week: pct(0.5) }),
      plane({ id: 'opencode-go', label: 'OpenCode Go', via: 'Pi', month: pct(0.6) }),
      plane({ id: 'zai', label: 'Z.ai', via: 'Pi', week: pct(0.7) })
    ]
    await render([CODEX, GROK, OPENCODE])
    expect(pills().map((p) => p.dataset.provider)).toEqual(['openai-codex', 'xai-oauth'])
    // A bot with a fallback on another provider asks for that one too, main first.
    await act(async () => root.unmount())
    root = createRoot(document.getElementById('root')!)
    await render([bot('pi:opencode-go/deepseek-v4.1-flash', 'codex:gpt-6.1-sol')])
    expect(pills().map((p) => p.dataset.provider)).toEqual(['opencode-go', 'openai-codex'])
  })

  it('draws nothing at all when no provider has a cap', async () => {
    reply = [plane({ id: 'deepseek', label: 'DeepSeek', via: 'Pi', month: { remaining: 3.42, unit: 'usd' } })]
    await render()
    expect(document.querySelector('.quota-strip')).toBeNull()
    expect(loadQuotas).toHaveBeenCalledTimes(1)
  })

  it('tones the bar by what is left: danger at 10%, warn at 30%', async () => {
    reply = [
      plane({ session: pct(0.08) }),
      plane({ id: 'zai', label: 'Z.ai', via: 'Pi', week: pct(0.25) }),
      plane({ id: 'opencode-go', label: 'OpenCode Go', via: 'Pi', month: pct(0.79) })
    ]
    await render([CODEX, bot('pi:zai/glm-5.3')])
    const tone = (id: string): string => pills().find((p) => p.dataset.provider === id)!.className
    expect(tone('openai-codex')).toContain('is-danger')
    expect(tone('zai')).toContain('is-warn')
    // A provider with plenty left carries neither tone, and the bar is as long as what is left.
    await act(async () => root.unmount())
    root = createRoot(document.getElementById('root')!)
    await render([OPENCODE])
    expect(tone('opencode-go')).not.toContain('is-danger')
    expect(tone('opencode-go')).not.toContain('is-warn')
    expect(pills().find((p) => p.dataset.provider === 'opencode-go')!.querySelector('i')!.getAttribute('style')).toContain('79%')
  })

  it('opens a box on a bar with the windows of that provider, what is left and when each resets', async () => {
    const soon = Date.now() + 5 * 86_400_000
    reply = [
      plane({ label: 'OpenCode Go', via: 'Pi', month: { ...pct(0.5, soon) }, week: pct(0.7), session: pct(0.22) })
    ]
    await render()
    expect(document.querySelector('.quota-card')).toBeNull()
    await hover(pills()[0]!)
    const card = document.querySelector('.quota-card')!
    expect(card).not.toBeNull()
    expect(card.querySelector('.quota-card__name')!.textContent).toContain('OpenCode Go')
    // One row per window the provider reports, longest first, each with its own bar.
    expect([...card.querySelectorAll('.quota-card__span')].map((n) => n.textContent)).toEqual(['Month', 'Week', '5h'])
    expect([...card.querySelectorAll('.quota-card__left')].map((n) => n.textContent!.trim())).toEqual(['50% left', '70% left', '22% left'])
    expect(card.querySelectorAll('.quota-card__track')).toHaveLength(3)
    expect(card.textContent).toContain('resets')
  })

  it('names the window by what it is, never by it being the longest', async () => {
    reply = [plane({ month: { ...pct(0.5, Date.now() + 86_400_000) } })]
    await render()
    await hover(pills()[0]!)
    const text = document.querySelector('.quota-card')!.textContent!
    expect(text).not.toMatch(/longest/i)
    expect((document.querySelector('.quota-strip') as HTMLElement).getAttribute('title')).toBeNull()
    // The short window keeps a concrete name too, read fresh rather than from the strip's cache.
    reply = [plane({ session: pct(0.5) })]
    await act(async () => root.unmount())
    forgetQuotaStrip()
    root = createRoot(document.getElementById('root')!)
    await render()
    await hover(pills()[0]!)
    expect(document.querySelector('.quota-card')!.textContent).toContain('5h')
  })

  it('opens Usage and limits on a click', async () => {
    reply = [plane({ month: pct(0.5) })]
    await render()
    await act(async () => (document.querySelector('.quota-strip') as HTMLElement).click())
    expect(navigate).toHaveBeenCalledWith({ kind: 'usage' })
  })

  it('reads every provider once, however many conversations are opened', async () => {
    reply = [plane({ month: pct(0.5) })]
    await render()
    await act(async () => root.unmount())
    root = createRoot(document.getElementById('root')!)
    await render()
    expect(loadQuotas).toHaveBeenCalledTimes(1)
    expect(pills()).toHaveLength(1)
  })

  it('draws nothing when the read fails, and says nothing about it here', async () => {
    loadQuotas.mockRejectedValueOnce(new Error('no logins on this computer'))
    await act(async () => root.render(<QuotaStrip agents={[CODEX] as never} />))
    await flush()
    expect(document.querySelector('.quota-strip')).toBeNull()
  })
})
