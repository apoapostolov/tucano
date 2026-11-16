import { createServer, type Server } from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Settings } from '../src/shared/types'
import { bootCore, type Client } from './helpers/core'

const savedKey = 'synthetic-endpoint-key'
const replacementKey = 'synthetic-replacement-key'
const requests: { path: string; authorization?: string }[] = []
let server: Server
let owner: Client
let address: string

beforeAll(async () => {
  server = createServer((req, res) => {
    requests.push({ path: req.url!, authorization: req.headers.authorization })
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ data: [{ id: 'scope-model' }] }))
  })
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const bound = server.address()
  if (!bound || typeof bound === 'string') throw new Error('Expected an isolated TCP endpoint')
  address = `http://127.0.0.1:${bound.port}`
  owner = (await bootCore({ server: true, seed: false })).connect()
  await owner.call('snapshot')
}, 60_000)

afterAll(async () => {
  if (server) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

async function save(path: string, key?: string): Promise<void> {
  await owner.call('setEndpoint', { baseUrl: `${address}${path}`, models: ['scope-model'], ...(key !== undefined ? { key } : {}) })
}

async function probe(path: string, key?: string): Promise<void> {
  const result = await owner.call<{ models: string[]; error?: string }>('probeEndpoint', { baseUrl: `${address}${path}`, ...(key !== undefined ? { key } : {}) })
  expect(result).toEqual({ models: ['scope-model'] })
}

describe('endpoint keys stay with their configured address', () => {
  it('reuses the saved key at the same normalized address, including after a keyless save', async () => {
    await save('/saved/v1', savedKey)
    await save('/saved/v1/models/')
    await probe('/saved/v1/models/')
    expect(requests.at(-1)).toEqual({ path: '/saved/v1/models', authorization: `Bearer ${savedKey}` })
  })

  it('does not send the saved key when probing a different address without an explicit key', async () => {
    await save('/saved/v1', savedKey)
    await probe('/other/v1')
    expect(requests.at(-1)).toEqual({ path: '/other/v1/models', authorization: undefined })
    await probe('/saved/v1')
    expect(requests.at(-1)?.authorization).toBe(`Bearer ${savedKey}`)
  })

  it('clears the saved key when saving another address without a replacement', async () => {
    await save('/saved/v1', savedKey)
    await save('/other/v1')
    const snapshot = await owner.call<{ settings: Settings }>('snapshot')
    expect(snapshot.settings.endpoint?.hasKey).toBe(false)
    await probe('/other/v1')
    expect(requests.at(-1)).toEqual({ path: '/other/v1/models', authorization: undefined })
  })

  it('uses an explicit probe key and saves an explicit replacement for another address', async () => {
    await save('/saved/v1', savedKey)
    await probe('/other/v1', replacementKey)
    expect(requests.at(-1)?.authorization).toBe(`Bearer ${replacementKey}`)
    await save('/other/v1', replacementKey)
    await probe('/other/v1')
    expect(requests.at(-1)?.authorization).toBe(`Bearer ${replacementKey}`)
    await probe('/other/v1', '')
    expect(requests.at(-1)?.authorization).toBeUndefined()
  })
})
