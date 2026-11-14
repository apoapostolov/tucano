// Preserve the desktop’s actual device scale while testing different CSS viewport widths.
export async function electronCopyViewport(page) {
  const native = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, deviceScaleFactor: devicePixelRatio }))
  const session = await page.context().newCDPSession(page)
  return {
    native,
    async set(width) {
      if (!width) return
      await page.setViewportSize({ width, height: 900 })
      await session.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: native.deviceScaleFactor, mobile: false })
    },
    async restore() {
      await session.send('Emulation.clearDeviceMetricsOverride')
      await session.detach()
    }
  }
}
