// What a connector's picture accepts before it is stored: bitmaps become small PNGs, a safe SVG stays
// an SVG, an address must be https, and an SVG that carries script or a handler never reaches the core.
import { describe, expect, it } from 'vitest'
import { iconFromFile, iconFromAddress } from '../src/renderer/src/connector-icon'

const svgFile = (body: string): File => new File([body], 'mark.svg', { type: 'image/svg+xml' })

describe("a connector's picture from the page", () => {
  it('keeps a plain SVG as an SVG data URL', async () => {
    const icon = await iconFromFile(svgFile('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>'))
    expect(icon).toMatch(/^data:image\/svg\+xml;base64,/)
    expect(Buffer.from(icon.split(',')[1] ?? '', 'base64').toString('utf8')).toContain('<circle')
  })

  it('refuses an SVG with script, an HTML foreignObject, a script address or an on handler', async () => {
    for (const body of [
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><p>hi</p></foreignObject></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)">x</a></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>'
    ]) {
      await expect(iconFromFile(svgFile(body))).rejects.toThrow(/SVG|script|HTML/)
    }
  })

  it('refuses a file that is not an image without turning it into a data URL', async () => {
    await expect(iconFromFile(new File(['hello'], 'notes.txt', { type: 'text/plain' }))).rejects.toThrow(/image|imagem/)
  })

  it('takes an https address as it was given and refuses other addresses', () => {
    expect(iconFromAddress('  https://example.com/logo.png  ')).toBe('https://example.com/logo.png')
    expect(() => iconFromAddress('http://example.com/logo.png')).toThrow(/https/)
    expect(() => iconFromAddress('javascript:alert(1)')).toThrow(/https/)
  })
})
