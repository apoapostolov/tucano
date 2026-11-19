import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

it('takes the server window title from the app name, not a hardcoded released name', () => {
  const source = readFileSync(new URL('../src/main/servers.ts', import.meta.url), 'utf8')
  expect(source).not.toMatch(/setTitle\(['"`]Tucano/)
  expect(source).toMatch(/setTitle\(app\.getName\(\)\)/)
  expect(source).toMatch(/setTitle\(`\$\{app\.getName\(\)\} · /)
})
