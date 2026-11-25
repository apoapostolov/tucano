// A several-times-a-day routine keeps one block per hour, in a 24-hour grid whatever clock the
// person reads. The two Git sweep schedules from the driver profile are the regression: 09:00 and
// 21:00 must read as different times and sit at their own rows, not only at 21:00.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Agent, Routine } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true, matchMedia: () => ({ matches: true }) })
Object.assign(document, { oninput: null })
vi.mock('open-bot-avatar/dom', () => ({ mountAvatar: () => new Proxy({}, { get: () => () => {} }) }))

let fake: State
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: State) => T): T => select(fake),
    saveRoutine: vi.fn(async (r: Routine) => r),
    runRoutine: vi.fn(),
    navigate: vi.fn()
  }
})
const { getState } = await import('../src/renderer/src/store')
const { createRoot } = await import('react-dom/client')
const { RoutinesPage } = await import('../src/renderer/src/components/Routines')
const { setLang } = await import('../src/shared/lang')
const { setClock } = await import('../src/shared/clock')
type Clock = '12' | '24'

const lia: Agent = { id: 'a1', name: 'Lia', handle: 'lia', role: '', color: 'sky', instructions: '', modelId: 'sonnet', effort: 'low', limit: 1_000_000, used: 0, grants: {}, memory: 'auto', computer: false, archived: false }
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
// Off, with a run behind it: the two Git sweep rows in the driver's profile.
const sweep = (times: string[]): Routine => ({
  id: 's1', name: 'Git sweep', agentId: 'a1', conversationId: 'd1', prompt: 'Sweep repo radar.',
  schedule: { days: ALL_DAYS, time: times[0]!, times: times.length > 1 ? times : undefined },
  enabled: false, createdAt: 0, lastAt: 1795503828959
})

let root: Root
beforeEach(() => {
  // Wednesday 18 November 08:00, before the first time, so the whole week is still to come.
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 18, 8, 0))
  const base = getState()
  fake = { ...base, ready: true, agents: [lia], conversations: [{ id: 'd1', kind: 'dm', name: 'a1', members: ['a1'] }], routines: [], messages: { d1: [] }, connectors: [] } as State
  root = createRoot(document.getElementById('root')!)
})
afterEach(async () => {
  await act(async () => root.unmount())
  vi.useRealTimers()
})

type Block = { label: string; top: number; hour: number | undefined; col: number; off: boolean }
const blocks = (): Block[] => {
  const cols = [...document.querySelectorAll('.cal__col')]
  const rows = [...document.querySelectorAll('.cal__hours span')].map((el) => ({ label: el.textContent ?? '', top: Number.parseFloat((el as HTMLElement).style.top) || 0 }))
  return [...document.querySelectorAll('.cal__ev')].map((el) => {
    const top = Number.parseFloat((el as HTMLElement).style.top) || 0
    return {
      label: (el.getAttribute('title') ?? '').split(' · ')[0] ?? '',
      top,
      hour: rows.find((r) => r.top === top) ? Number(rows.find((r) => r.top === top)!.label.slice(0, 2)) : undefined,
      col: cols.indexOf(el.closest('.cal__col')!),
      off: el.className.includes('is-off')
    }
  })
}
const render = async (times: string[], clock: Clock, language: 'pt' | 'en'): Promise<Block[]> => {
  setClock(clock)
  setLang(language)
  fake = { ...fake, routines: [sweep(times)] }
  await act(async () => root.render(<RoutinesPage />))
  return blocks()
}
// One day that holds every time of the routine, so the blocks can be compared in the same column.
const oneDay = (all: Block[], count: number): Block[] => {
  const cols = [...new Set(all.map((b) => b.col))]
  const day = cols.map((c) => all.filter((b) => b.col === c)).find((list) => new Set(list.map((b) => b.label)).size >= count)
  if (!day) throw new Error(`no day with ${count} different times: ${all.map((b) => `${b.col}:${b.label}@${b.top}`).join(' | ')}`)
  return [...day].sort((a, b) => a.top - b.top)
}

describe('the routines grid with several times a day', () => {
  it('places 09:00 and 21:00 at their own hours, with different labels, in the 24-hour clock', async () => {
    const day = oneDay(await render(['09:00', '21:00'], '24', 'pt'), 2)
    expect(day.map((b) => b.label)).toEqual(['09:00', '21:00'])
    expect(day.map((b) => b.hour)).toEqual([9, 21])
    expect(day[0]!.top).toBeLessThan(day[1]!.top)
    expect(day.every((b) => b.off)).toBe(true)
    expect(document.querySelector('.cal__allday')).toBeNull()
  })

  it('places 15:00 and 21:00 at their own hours', async () => {
    const day = oneDay(await render(['15:00', '21:00'], '24', 'pt'), 2)
    expect(day.map((b) => b.label)).toEqual(['15:00', '21:00'])
    expect(day.map((b) => b.hour)).toEqual([15, 21])
  })

  it('places 09:00, 13:00 and 17:00 in three rows', async () => {
    const day = oneDay(await render(['09:00', '13:00', '17:00'], '24', 'pt'), 3)
    expect(day.map((b) => b.label)).toEqual(['09:00', '13:00', '17:00'])
    expect(day.map((b) => b.hour)).toEqual([9, 13, 17])
  })

  it('keeps the same rows and distinct labels in a 12-hour clock', async () => {
    const morningEvening = oneDay(await render(['09:00', '21:00'], '12', 'en'), 2)
    expect(morningEvening.map((b) => b.label)).toEqual(['9:00 AM', '9:00 PM'])
    expect(morningEvening.map((b) => b.hour)).toEqual([9, 21])

    const afternoonEvening = oneDay(await render(['15:00', '21:00'], '12', 'en'), 2)
    expect(afternoonEvening.map((b) => b.label)).toEqual(['3:00 PM', '9:00 PM'])
    expect(afternoonEvening.map((b) => b.hour)).toEqual([15, 21])
  })

  it('keeps a single-time routine at its one hour', async () => {
    const day = oneDay(await render(['09:00'], '24', 'pt'), 1)
    expect(day.map((b) => b.label)).toEqual(['09:00'])
    expect(day.map((b) => b.hour)).toEqual([9])
  })
})
