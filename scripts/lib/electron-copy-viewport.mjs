// Resize only the isolated, hidden Electron window in native device-independent pixels.
// BrowserWindow sizing preserves the desktop’s actual scale; viewport emulation can reset it.
export async function electronCopyViewport(page, resize) {
  if (!resize) throw new Error('Electron copy checks require the isolated window resize callback')
  const native = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, deviceScaleFactor: devicePixelRatio }))
  return {
    native,
    async set(width) {
      if (!width) return
      await resize({ width, height: 900 })
      await page.waitForFunction(expected => innerWidth === expected, width)
    },
    async restore() {
      await resize({ width: native.width, height: native.height })
      await page.waitForFunction(expected => innerWidth === expected, native.width)
    }
  }
}
