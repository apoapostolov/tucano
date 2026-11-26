// What a connector's picture accepts before it is stored: bitmaps become small PNGs, a safe SVG stays
// an SVG, an address must be https, and an SVG that carries script or a handler never reaches the core.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { iconFromFile, iconFromAddress } from '../src/renderer/src/connector-icon'

// The renderer's canvas is faked: a PNG's length comes from the ceiling it was drawn at. One fake
// image is 1000 px square, so the 96 px pass produces 96 px and each retry its own smaller size.
function fakeCanvas(lengthAt: (side: number) => number): { sizes: number[] } {
  const sizes: number[] = []
  vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 1000, height: 1000, close: vi.fn() })))
  vi.stubGlobal('document', {
    createElement: () => {
      const canvas: { width: number; height: number; getContext: () => unknown; toDataURL: () => string } = {
        width: 0,
        height: 0,
        getContext: () => ({ drawImage: vi.fn() }),
        toDataURL: () => {
          const side = canvas.width
          sizes.push(side)
          return `data:image/png;base64,${'A'.repeat(lengthAt(side))}`
        }
      }
      return canvas
    }
  })
  return { sizes }
}

afterEach(() => vi.unstubAllGlobals())

const bitmap = () => new File(['noise'], 'noise.png', { type: 'image/png' })

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

  it('redraws an oversized bitmap at a smaller ceiling until the stored PNG fits', async () => {
    const { sizes } = fakeCanvas((side) => side === 96 ? 32_500 : 1_000)
    const icon = await iconFromFile(bitmap())
    expect(sizes).toEqual([96, 80])
    expect(icon).toMatch(/^data:image\/png;base64,/)
    expect(icon.length).toBeLessThanOrEqual(32_000)
  })

  it('tries every ceiling and still refuses a bitmap that cannot fit', async () => {
    const { sizes } = fakeCanvas(() => 40_000)
    await expect(iconFromFile(bitmap())).rejects.toThrow(/too big|grande demais/)
    expect(sizes).toEqual([96, 80, 64, 48, 32, 16])
  })

  it('takes an https address as it was given and refuses other addresses', () => {
    expect(iconFromAddress('  https://example.com/logo.png  ')).toBe('https://example.com/logo.png')
    expect(() => iconFromAddress('http://example.com/logo.png')).toThrow(/https/)
    expect(() => iconFromAddress('javascript:alert(1)')).toThrow(/https/)
  })
})
