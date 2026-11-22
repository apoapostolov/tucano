// The order the person gave the sidebar's own lists (DMs, agents): kept as ids in the settings, so a
// row that isn't there any more is simply gone, and one the order doesn't know yet shows last.
import { describe, expect, it } from 'vitest'
import { moveBefore, nudge, ordered } from '../src/shared/list-order'

const rows = (...ids: string[]): { id: string }[] => ids.map((id) => ({ id }))

describe("a list in the person's order", () => {
  it('follows the saved order', () => {
    expect(ordered(rows('a', 'b', 'c'), ['c', 'a', 'b']).map((r) => r.id)).toEqual(['c', 'a', 'b'])
  })

  it('shows what the order does not name last, keeping the core order', () => {
    expect(ordered(rows('a', 'b', 'c', 'd'), ['c', 'd']).map((r) => r.id)).toEqual(['c', 'd', 'a', 'b'])
  })

  it('forgets a row that is gone', () => {
    expect(ordered(rows('a', 'c'), ['a', 'b', 'c']).map((r) => r.id)).toEqual(['a', 'c'])
  })

  it('is the core order when nothing was saved, and survives a bad value', () => {
    expect(ordered(rows('a', 'b')).map((r) => r.id)).toEqual(['a', 'b'])
    expect(ordered(rows('a', 'b'), [] as string[]).map((r) => r.id)).toEqual(['a', 'b'])
    expect(ordered(rows('a', 'b'), null).map((r) => r.id)).toEqual(['a', 'b'])
  })
})

describe('moving a row', () => {
  it('puts it before the row it was dropped on', () => {
    expect(moveBefore(rows('a', 'b', 'c'), undefined, 'c', 'a')).toEqual(['c', 'a', 'b'])
    expect(moveBefore(rows('a', 'b', 'c'), ['c', 'b', 'a'], 'a', 'b')).toEqual(['c', 'a', 'b'])
    expect(moveBefore(rows('a', 'b', 'c'), ['c', 'b', 'a'], 'c', 'b')).toEqual(['c', 'b', 'a']) // already there
  })

  it('goes last when dropped past the end, and does nothing when dropped on itself', () => {
    expect(moveBefore(rows('a', 'b', 'c'), undefined, 'a')).toEqual(['b', 'c', 'a'])
    expect(moveBefore(rows('a', 'b', 'c'), undefined, 'b', 'b')).toEqual(['a', 'b', 'c'])
  })

  it('steps one place for the menu and the keyboard, and stops at the ends', () => {
    expect(nudge(rows('a', 'b', 'c'), undefined, 'b', -1)).toEqual(['b', 'a', 'c'])
    expect(nudge(rows('a', 'b', 'c'), undefined, 'b', 1)).toEqual(['a', 'c', 'b'])
    expect(nudge(rows('a', 'b', 'c'), undefined, 'a', -1)).toEqual(['a', 'b', 'c'])
    expect(nudge(rows('a', 'b', 'c'), undefined, 'c', 1)).toEqual(['a', 'b', 'c'])
  })

  it('starts from the whole list, so what was never moved stays where it is', () => {
    // Two rows saved out of four: the order is saved from the list as it is shown.
    expect(nudge(rows('a', 'b', 'c'), ['c', 'a'], 'c', 1)).toEqual(['a', 'c', 'b'])
  })
})

const items = ['a', 'b', 'c', 'd'].map((id) => ({ id }))
const ids = (list: { id: string }[]): string[] => list.map((i) => i.id)

describe('a sidebar list in the order the person left it', () => {
  it('shows what the order names first, then the rest as they come, and forgets what is gone', () => {
    expect(ids(ordered(items, ['c', 'gone', 'a', 'c']))).toEqual(['c', 'a', 'b', 'd'])
    expect(ids(ordered(items, undefined))).toEqual(['a', 'b', 'c', 'd'])
    expect(ids(ordered(items, 'bad' as unknown as string[]))).toEqual(['a', 'b', 'c', 'd'])
  })

  it('moves a row before another, or last, and leaves it be when dropped on itself', () => {
    expect(moveBefore(items, null, 'd', 'b')).toEqual(['a', 'd', 'b', 'c'])
    expect(moveBefore(items, null, 'a', undefined)).toEqual(['b', 'c', 'd', 'a'])
    expect(moveBefore(items, ['b', 'a'], 'c', 'c')).toEqual(['b', 'a', 'c', 'd'])
  })

  it('steps a row up or down, and not past either end', () => {
    expect(nudge(items, null, 'c', -1)).toEqual(['a', 'c', 'b', 'd'])
    expect(nudge(items, null, 'c', 1)).toEqual(['a', 'b', 'd', 'c'])
    expect(nudge(items, null, 'a', -1)).toEqual(['a', 'b', 'c', 'd'])
    expect(nudge(items, null, 'd', 1)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('steps over the rows that are not shown next to it (hidden, another sector), which keep their places', () => {
    const near = (id: string): boolean => id !== 'b' // b is hidden
    expect(nudge(items, null, 'c', -1, near)).toEqual(['c', 'a', 'b', 'd'])
    expect(nudge(items, null, 'a', 1, near)).toEqual(['b', 'c', 'a', 'd'])
    expect(nudge(items, null, 'c', 1, near)).toEqual(['a', 'b', 'd', 'c'])
    expect(nudge(items, null, 'd', 1, near)).toEqual(['a', 'b', 'c', 'd'])
  })
})
