// The little bars in a session's header. What is checked here: one bar per provider, each naming the
// provider it draws, the window it draws is the longest the provider reports (month over week over
// the short one), a wallet with no cap draws nothing, the tone follows what is left, a click opens
// Usage and limits, and reading every provider costs one read even when several conversations are
// opened. The widths the bars take are measured in a browser in test/quota-strip-layout.test.ts;
// linkedom has no layout.
//
// The box over a bar has its own block below: the pointer names one provider and gets that
// provider's windows alone, leaving the strip closes it, the keyboard opens it where there is no
// pointer to name a bar, and a wallet is a line of money rather than a bar.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { setLang } from '../src/shared/lang'
import type { ProviderQuota } from '../src/shared/types'

const { window, document } = parseHTML('<html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })

let reply: ProviderQuota[] = []
// What the settings say, for the cases that read one: the view the strip draws, and the providers
// the person put away.
const state = vi.hoisted(() => ({ settings: {} as Record<string, unknown> }))
const loadQuotas = vi.fn(async () => ({ list: reply, at: Date.now() }))
const navigate = vi.fn()
vi.mock('../src/renderer/src/store', () => ({
  useStore: (select: (s: unknown) => unknown) => select({ settings: state.settings }),
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
  state.settings = {}
  loadQuotas.mockClear()
  navigate.mockClear()
  forgetQuotaStrip()
  root = createRoot(document.getElementById('root')!)
})
afterEach(async () => await act(async () => root.unmount()))

// What the header is about: the providers the people in this conversation actually run on.
const agent = (modelId: string, fallbackModelId?: string): never =>
  ({ modelId, fallbackModelId } as never)
const render = async (agents: never[] = []): Promise<void> => {
  await act(async () => root.render(<QuotaStrip agents={agents} />))
  await flush()
}
const pills = (): HTMLElement[] => [...document.querySelectorAll('.quota-strip__pill')] as HTMLElement[]
// The pointer and the keyboard, as the header hears them: a pointer moving onto an element arrives as
// `mouseover`, moving off it as `mouseout`, and the keyboard's focus as `focusin`, its leaving as
// `focusout`. linkedom has no MouseEvent, and React reads the target and its ancestors from these.
const hover = async (el: Element): Promise<void> => {
  await act(async () => el.dispatchEvent(new window.Event('mouseover', { bubbles: true })))
}
const leave = async (el: Element): Promise<void> => {
  await act(async () => el.dispatchEvent(new window.Event('mouseout', { bubbles: true })))
}
const focusOn = async (el: Element): Promise<void> => {
  await act(async () => el.dispatchEvent(new window.Event('focusin', { bubbles: true })))
}
const blurOff = async (el: Element): Promise<void> => {
  await act(async () => el.dispatchEvent(new window.Event('focusout', { bubbles: true })))
}
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
  it('draws one bar per provider, in its longest window', async () => {
    reply = [
      plane({ session: pct(0.9), week: pct(0.7), month: pct(0.4) }),
      plane({ id: 'xai-oauth', label: 'Grok', via: 'Hermes', week: pct(0.38) }),
      plane({ id: 'deepseek', label: 'DeepSeek', via: 'Pi', month: { remaining: 3.42, unit: 'usd' } })
    ]
    await render([agent('codex:gpt-6.1-sol', 'pi:xai-oauth/grok-4.6')])
    expect(pills().map((p) => [p.dataset.provider, p.dataset.span])).toEqual([
      ['openai-codex', 'month'],
      ['xai-oauth', 'week']
    ])
    // Each bar names the provider it draws, above its track.
    expect(pills().map((p) => p.querySelector('.quota-strip__name')?.textContent)).toEqual(['Codex', 'Grok'])
    expect(pills().every((p) => !!p.querySelector('.quota-strip__track > i'))).toBe(true)
  })

  it('leaves out a logged-in provider nobody in the conversation runs on', async () => {
    reply = [
      plane({ month: pct(0.4) }),
      plane({ id: 'zai', label: 'Z.ai', via: 'Pi', month: pct(0.2) })
    ]
    await render([agent('codex:gpt-6.1-sol')])
    expect(pills().map((p) => p.dataset.provider)).toEqual(['openai-codex'])
  })

  it('draws the fallback provider too, even when the main model is the first bar', async () => {
    reply = [
      plane({ month: pct(0.4) }),
      plane({ id: 'xai-oauth', label: 'Grok', via: 'Hermes', month: pct(0.2) })
    ]
    await render([agent('codex:gpt-6.1-sol', 'grok:grok-4.6')])
    expect(pills().map((p) => p.dataset.provider)).toEqual(['openai-codex', 'xai-oauth'])
  })

  it('draws nothing at all when no provider has a cap', async () => {
    reply = [plane({ id: 'deepseek', label: 'DeepSeek', via: 'Pi', month: { remaining: 3.42, unit: 'usd' } })]
    await render([agent('pi:deepseek/deepseek-v4.1-flash')])
    expect(document.querySelector('.quota-strip')).toBeNull()
    expect(loadQuotas).toHaveBeenCalledTimes(1)
  })

  it('tones the bar by what is left: danger at 10%, warn at 30%', async () => {
    reply = [
      plane({ session: pct(0.08) }),
      plane({ id: 'zai', label: 'Z.ai', via: 'Pi', week: pct(0.25) }),
      plane({ id: 'opencode-go', label: 'OpenCode Go', via: 'Pi', month: pct(0.79) })
    ]
    await render([agent('codex:gpt-6.1-sol', 'pi:zai/glm-5.3')])
    const tone = (id: string): string => pills().find((p) => p.dataset.provider === id)!.className
    expect(tone('openai-codex')).toContain('is-danger')
    expect(tone('zai')).toContain('is-warn')
    await act(async () => root.unmount())
    root = createRoot(document.getElementById('root')!)
    await render([agent('pi:opencode-go/deepseek-v4.1-flash')])
    expect(tone('opencode-go')).not.toContain('is-danger')
    expect(tone('opencode-go')).not.toContain('is-warn')
    // The bar is as long as what is left.
    expect(pills().find((p) => p.dataset.provider === 'opencode-go')!.querySelector('i')!.getAttribute('style')).toContain('79%')
  })

  it('says whose number it is and when it resets, without leaving the header', async () => {
    reply = [plane({ id: 'opencode-go', label: 'OpenCode Go', via: 'Pi', month: { ...pct(0.5, Date.now() + 5 * 86_400_000) } })]
    await render([agent('pi:opencode-go/deepseek-v4.1-flash')])
    await hover(pills()[0]!)
    const said = document.querySelector('.quota-card')!.textContent!
    expect(said).toContain('OpenCode Go')
    expect(said).toContain('Month')
    expect(said).toContain('50%')
    expect(said).toContain('resets')
    // Reading it is not opening Usage and limits: the click is still the click.
    expect(navigate).not.toHaveBeenCalled()
  })

  it('draws the bars in the view the settings chose, and the box says the same numbers', async () => {
    state.settings = { quotaView: 'rings' }
    reply = [plane({ month: pct(0.5) })]
    await render([agent('codex:gpt-6.1-sol')])
    // Rings: the part left painted around a small circle, and no length to read.
    expect(pills()[0]!.querySelector('.quota-strip__ring')).not.toBeNull()
    expect(pills()[0]!.querySelector('i')).toBeNull()
    await hover(pills()[0]!)
    expect(document.querySelector('.quota-card__track i')!.getAttribute('style')).toContain('50%')
  })

  it('leaves out a provider the person put away, and its bar with it', async () => {
    state.settings = { quotaHidden: ['zai'] }
    reply = [plane({ month: pct(0.4) }), plane({ id: 'zai', label: 'Z.ai', via: 'Pi', week: pct(0.2) })]
    await render([agent('codex:gpt-6.1-sol', 'pi:zai/glm-5.3')])
    expect(pills().map((p) => p.dataset.provider)).toEqual(['openai-codex'])
  })

  it('opens Usage and limits on a click', async () => {
    reply = [plane({ month: pct(0.5) })]
    await render([agent('codex:gpt-6.1-sol')])
    await act(async () => (document.querySelector('.quota-strip') as HTMLElement).click())
    expect(navigate).toHaveBeenCalledWith({ kind: 'usage' })
  })

  it('reads every provider once, however many conversations are opened', async () => {
    reply = [plane({ month: pct(0.5) })]
    await render([agent('codex:gpt-6.1-sol')])
    await act(async () => root.unmount())
    root = createRoot(document.getElementById('root')!)
    await render([agent('codex:gpt-6.1-sol')])
    expect(loadQuotas).toHaveBeenCalledTimes(1)
    expect(pills()).toHaveLength(1)
  })

  it('draws nothing when the read fails, and says nothing about it here', async () => {
    loadQuotas.mockRejectedValueOnce(new Error('no logins on this computer'))
    await act(async () => root.render(<QuotaStrip agents={[agent('codex:gpt-6.1-sol')]} />))
    await flush()
    expect(document.querySelector('.quota-strip')).toBeNull()
  })

  it('carries no native title to compete with the box', async () => {
    reply = [plane({ month: pct(0.5) })]
    await render([agent('codex:gpt-6.1-sol')])
    expect(document.querySelector('[title]')).toBeNull()
  })
})

describe('the box over a bar', () => {
  // Two providers whose windows differ, so the box says which bar the pointer named: the header
  // carries one number each, and the box is the one place those numbers are spelled out.
  const both = async (): Promise<void> => {
    reply = [
      plane({ session: pct(0.9), week: pct(0.7), month: pct(0.5, Date.now() + 5 * 86_400_000) }),
      plane({ id: 'zai', label: 'Z.ai', via: 'Pi', week: pct(0.4) })
    ]
    await render([agent('codex:gpt-6.1-sol', 'pi:zai/glm-5.3')])
  }
  const card = (): HTMLElement | null => document.querySelector('.quota-card')
  const written = (sel: string): string[] => [...document.querySelectorAll(sel)].map((n) => n.textContent ?? '')

  it("opens the pointed-at provider's own windows, and only those", async () => {
    await both()
    // Nothing is open until the pointer says which bar it is asking about.
    expect(card()).toBeNull()
    await hover(pills()[0]!)
    expect(card()!.getAttribute('role')).toBe('tooltip')
    expect(written('.quota-card__name')).toEqual(['Codex'])
    // Every window that provider reports a cap for, longest first, each with what is left and when it
    // resets — the rows the Usage page draws, in the header's own box.
    expect(written('.quota-card__span')).toEqual(['Month', 'Week', '5h'])
    expect(written('.quota-card__left')).toEqual(['50% left', '70% left', '90% left'])
    expect(written('.quota-card__track')).toHaveLength(3)
    expect(written('.quota-card__reset')[0]).toContain('resets')
    expect(card()!.textContent).not.toContain('Z.ai')
    // The other bar names the other provider, in the one window that one reports.
    await hover(pills()[1]!)
    expect(written('.quota-card__name')).toEqual(['Z.ai'])
    expect(written('.quota-card__span')).toEqual(['Week'])
    expect(card()!.textContent).not.toContain('Codex')
  })

  it('closes when the pointer leaves the strip', async () => {
    await both()
    await hover(pills()[1]!)
    expect(card()).not.toBeNull()
    await leave(document.querySelector('.quota-strip-wrap')!)
    expect(card()).toBeNull()
  })

  it('opens on the keyboard, where there is no pointer to name one bar, and closes when it goes', async () => {
    await both()
    const strip = document.querySelector('.quota-strip')!
    await focusOn(strip)
    expect(card()!.getAttribute('role')).toBe('tooltip')
    // No pointer named a bar, so the box holds each bar it could be reading.
    expect(written('.quota-card__name')).toEqual(['Codex', 'Z.ai'])
    await blurOff(strip)
    expect(card()).toBeNull()
  })

  it('says what is in a wallet, which draws no bar of its own', async () => {
    reply = [plane({ month: pct(0.3), week: { remaining: 3.42, unit: 'usd' } })]
    await render([agent('codex:gpt-6.1-sol')])
    await hover(pills()[0]!)
    // A balance has no cap, so it is a line of money rather than a bar.
    expect(written('.quota-card__span')).toEqual(['Month'])
    expect(card()!.textContent).toContain('$3.42 in the wallet')
  })

  it('says why a provider could not be read in full, beside the figure it did report', async () => {
    reply = [plane({ month: pct(0.5), error: 'the login expired' })]
    await render([agent('codex:gpt-6.1-sol')])
    await hover(pills()[0]!)
    expect(card()!.textContent).toContain('the login expired')
    expect(written('.quota-card__span')).toEqual(['Month'])
  })
})
