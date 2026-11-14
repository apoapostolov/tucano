// A reply the person put on hold: it keeps its session and waits where nothing of the model's is in
// flight (a tool call about to start, another turn), then goes on when it is let go.
import { describe, expect, it } from 'vitest'
import { Hold } from '../src/core/hold'

describe('a reply put on hold', () => {
  it('never waits when nobody asked for a hold', async () => {
    const hold = new Hold()
    expect(hold.held).toBe(false)
    expect(await hold.wait(new AbortController().signal)).toBe(false)
  })

  it('waits where the run reaches it, and goes on when it is let go', async () => {
    const hold = new Hold()
    hold.request()
    expect(hold.held).toBe(true)
    let went = false
    const waiting = hold.wait(new AbortController().signal).then((waited) => {
      went = true
      return waited
    })
    await new Promise((r) => setTimeout(r, 10))
    expect(went).toBe(false) // still held
    hold.release()
    expect(await waiting).toBe(true)
    expect(hold.held).toBe(false)
  })

  it('lets a reply that was let go before reaching it go on without stopping', async () => {
    const hold = new Hold()
    hold.request()
    hold.release()
    expect(await hold.wait(new AbortController().signal)).toBe(false)
  })

  it('wakes on a stop, so a hold nobody lets go of cannot leave the reply waiting for ever', async () => {
    const hold = new Hold()
    hold.request()
    const ctl = new AbortController()
    const waiting = hold.wait(ctl.signal)
    ctl.abort()
    expect(await waiting).toBe(true)
  })

  it('takes a second pause while it waits as the same hold', async () => {
    const hold = new Hold()
    hold.request()
    hold.request()
    const waiting = hold.wait(new AbortController().signal)
    hold.release()
    expect(await waiting).toBe(true)
    expect(hold.held).toBe(false)
  })
})
