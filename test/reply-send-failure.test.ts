// A message is written and drawn before the core reads the files attached to it. When one of those reads
// fails (EACCES, ENOSPC: the artifact folder can't be written), the composer must not be told the message
// didn't go: it kept the draft and the quote, and a second Enter posted the same message twice.
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeAll, expect, it, vi } from 'vitest'
import type { Snapshot } from '../src/shared/rpc'
import { bootCore, type Client, type TestCore } from './helpers/core'

let core: TestCore
let owner: Client
let conversationId: string
// One core per test file: the module runs once, so a second boot in the same file never answers.
beforeAll(async () => {
  core = await bootCore({ server: true })
  owner = core.connect()
  const snapshot = await owner.call<Snapshot>('snapshot')
  conversationId = snapshot.conversations.find((c) => c.kind === 'channel')!.id
}, 30_000)

// The artifact folder is the one place a send writes after it has already saved the message, so a file
// standing where the folder goes makes exactly that step fail.
const poisonArtifacts = (): void => {
  const dir = join(core.dataDir, 'artifacts')
  rmSync(dir, { recursive: true, force: true })
  writeFileSync(dir, 'not a folder')
}

it('carries a send through when only the file kept after it fails', async () => {
  const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
  poisonArtifacts()
  await expect(owner.call('sendMessage', { conversationId, text: 'This one went.', files: [{ name: 'notes.txt', data: Buffer.from('hello').toString('base64') }] })).resolves.toBeUndefined()
  expect(logged.mock.calls.some(([first]) => first === '[core] sendMessage')).toBe(true)
  expect((await owner.call<Snapshot>('snapshot')).messages.some((m) => m.text === 'This one went.')).toBe(true)
  logged.mockRestore()
})

it('still refuses a message it cannot stand behind, and writes none of it', async () => {
  await expect(owner.call('sendMessage', { conversationId, text: 'Kept as a draft.', reply: { messageId: 'missing' } })).rejects.toThrow(/mensagem desta conversa/)
  expect((await owner.call<Snapshot>('snapshot')).messages.some((m) => m.text === 'Kept as a draft.')).toBe(false)
})
