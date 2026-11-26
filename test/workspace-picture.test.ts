// What a workspace picture may carry. The page shrinks bitmaps and checks remote addresses; these
// rules run again wherever a picture is written, so a crafted IPC or settings patch cannot put an
// unsafe address or an SVG with a script into a workspace's database.
import { expect, it } from 'vitest'
import { settingsPatchError } from '../src/core/settings-patch'
import { workspacePictureError } from '../src/shared/workspaces'

const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB'
const svg = (body: string): string => `data:image/svg+xml;base64,${Buffer.from(body).toString('base64')}`
const safeSvg = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>')

it('accepts the picture kinds the connector icon accepts, and an empty value that clears it', () => {
  expect(workspacePictureError('')).toBeUndefined()
  expect(workspacePictureError(png)).toBeUndefined()
  expect(workspacePictureError(safeSvg)).toBeUndefined()
  expect(workspacePictureError('  https://example.com/logo.png  ')).toBeUndefined()
})

it('refuses remote sources that are not https and SVG that carries a script or HTML inside', () => {
  for (const bad of [
    'http://example.com/logo.png',
    'javascript:alert(1)',
    'file:///etc/passwd',
    'https://example.com/x'.repeat(200),
    'data:text/html;base64,PHNjcmlwdD4=',
    svg('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
    svg('<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><p>hi</p></foreignObject></svg>'),
    svg('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>')
  ]) expect(workspacePictureError(bad), bad).toBeDefined()
})

it('checks a picture sent straight to the core, not only one picked in the page', () => {
  expect(settingsPatchError({ workspacePicture: png })).toBeUndefined()
  expect(settingsPatchError({ workspacePicture: 'javascript:alert(1)' })).toMatch(/https/i)
  expect(settingsPatchError({ workspacePicture: svg('<svg onload="alert(1)"/>') })).toMatch(/SVG/i)
  expect(settingsPatchError({ workspacePicture: 42 })).toMatch(/inválido|Invalid/i)
})
