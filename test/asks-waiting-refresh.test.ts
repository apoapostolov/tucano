import { expect, it, vi } from 'vitest'
import type { WikiChange } from '../src/shared/types'

const { call } = vi.hoisted(() => ({ call: vi.fn() }))
vi.mock('../src/renderer/src/rpc', () => ({ call, connect: vi.fn(), disconnect: vi.fn() }))
const { getState, loadWikiWaiting } = await import('../src/renderer/src/store')

it('does not bring an approved wiki change back when an older refresh finishes last', async () => {
  let old!: (changes: WikiChange[]) => void
  const earlier = new Promise<WikiChange[]>((resolve) => { old = resolve })
  call.mockReturnValueOnce(earlier).mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([])
  loadWikiWaiting()
  loadWikiWaiting()
  await vi.waitFor(() => expect(call).toHaveBeenCalledTimes(4))
  const change: WikiChange = { id: 'old', at: 1, by: 'auto', state: 'pending', ops: [], reason: 'Already approved after this reading began.' }
  old([change])
  await earlier
  await Promise.resolve()
  await Promise.resolve()
  expect(getState().wikiWaiting).toEqual([])
})
