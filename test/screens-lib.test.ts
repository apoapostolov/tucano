import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { idle, parseSize, shot, measure, measureInPage, writeFrames } from '../scripts/screens/lib.mjs'

// The harness's DOM-free parts. Nothing here launches Electron: a story that needs a window is proved
// by running it (`node scripts/screens.mjs <area>`), and what is tested here is the shape of the
// evidence, which is the part that has to hold before any frame is worth looking at.

const LIB = fileURLToPath(new URL('../scripts/screens/lib.mjs', import.meta.url))
const removed: string[] = []
afterEach(() => {
  for (const dir of removed.splice(0)) {
    if (process.platform === 'win32') {
      const script = fileURLToPath(new URL('../scripts/screens/recycle.ps1', import.meta.url))
      execFileSync('powershell.exe', ['-NoProfile', '-File', script, '-Path', dir])
    } else {
      execFileSync('gio', ['trash', dir])
    }
  }
})

const temp = () => {
  const dir = mkdtempSync(join(tmpdir(), 'tucano-screens-test-'))
  removed.push(dir)
  return dir
}

// The page's globals, put in place for the length of one call and taken back out, so the browser side
// of `measure` runs for real against a document a test made up.
function withDom(run: () => unknown, found: Record<string, unknown[]>): unknown {
  const saved = ['document', 'getComputedStyle'].map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const)
  const document = { querySelectorAll: (selector: string) => found[selector] ?? [] }
  const getComputedStyle = (element: { computed: Record<string, string> }) => element.computed
  Object.defineProperty(globalThis, 'document', { value: document, configurable: true, writable: true })
  Object.defineProperty(globalThis, 'getComputedStyle', { value: getComputedStyle, configurable: true, writable: true })
  try {
    return run()
  } finally {
    for (const [name, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
      else delete (globalThis as Record<string, unknown>)[name]
    }
  }
}

// A stand-in for a Playwright page: `evaluate` runs the function the library sends with the document
// the test described, which is how the real one runs it in the app's renderer.
const page = (found: Record<string, unknown[]>) => ({
  evaluate: (fn: (arg: unknown) => unknown, arg: unknown) => Promise.resolve(withDom(() => fn(arg), found))
})

// A computed style answers both ways a real one does: by its JavaScript name and by
// getPropertyValue, which is how a hyphenated property has to be asked for.
const boxed = (computed: Record<string, string>, box = { x: 4, y: 8, width: 240, height: 900 }) => ({
  computed: { ...computed, getPropertyValue: (name: string) => computed[name] ?? '' },
  getBoundingClientRect: () => box
})

describe('runner arguments', () => {
  it('rejects a missing flag value without launching Electron', () => {
    const runner = fileURLToPath(new URL('../scripts/screens.mjs', import.meta.url))
    for (const args of [['sidebar-reorder', '--out'], ['sidebar-reorder', '--size', '--tag', 'before']]) {
      const result = spawnSync(process.execPath, [runner, ...args], { encoding: 'utf8' })
      expect(result.status).toBe(1)
      expect(result.stderr).toMatch(/requires a value/)
      expect(result.stdout).not.toMatch(/mode:/)
    }
  })
})

describe('capture safeguards', () => {
  it('rejects empty and zero viewports', () => {
    expect(parseSize('1280x900')).toEqual({ width: 1280, height: 900 })
    for (const size of ['', '0x900', '1280x0', '-1x900', 'wide']) {
      expect(() => parseSize(size)).toThrow(/--size takes/)
    }
  })

  it('fails when the app never becomes idle', async () => {
    const busy = { evaluate: async () => {}, waitForTimeout: async () => {}, locator: () => ({ count: async () => 1 }) }
    await expect(idle(busy as never, { timeout: 1, step: 1 })).rejects.toThrow(/remained busy/)
  })

  it('waits for fonts and hides animation and carets during capture', async () => {
    const calls: unknown[] = []
    const win = { evaluate: async () => { calls.push('fonts') }, screenshot: async (options: unknown) => { calls.push(options) } }
    await shot(win as never, 'probe')
    expect(calls[0]).toBe('fonts')
    expect(calls[1]).toMatchObject({ animations: 'disabled', caret: 'hide' })
  })
})

describe('measure', () => {
  it('returns the computed style and the box of a selector it finds', async () => {
    const found = { '.sidebar': [boxed({ opacity: '1', visibility: 'visible', display: 'block', 'pointer-events': 'auto' })] }
    const rows = await measure(page(found) as never, '.sidebar', ['pointer-events'])
    expect(rows).toEqual([
      {
        selector: '.sidebar',
        index: 0,
        props: { opacity: '1', visibility: 'visible', display: 'block', 'pointer-events': 'auto' },
        box: { x: 4, y: 8, w: 240, h: 900 }
      }
    ])
  })

  it('measures every element a selector matches, and numbers them', async () => {
    const found = {
      '.channel-row': [
        boxed({ opacity: '1', visibility: 'visible', display: 'flex' }, { x: 0, y: 10, width: 200, height: 28 }),
        boxed({ opacity: '0.5', visibility: 'hidden', display: 'flex' }, { x: 0, y: 38, width: 200, height: 28 })
      ]
    }
    const rows = await measure(page(found) as never, '.channel-row')
    expect(rows.map((row) => row.index)).toEqual([0, 1])
    expect(rows[1]!.props).toMatchObject({ opacity: '0.5', visibility: 'hidden' })
    expect(rows[1]!.box).toEqual({ x: 0, y: 38, w: 200, h: 28 })
  })

  it('throws for a selector it does not find, because a measurement of nothing is not proof', async () => {
    await expect(measure(page({}) as never, '.gallery__cell--hero')).rejects.toThrow(/nothing matched ".gallery__cell--hero"/)
  })

  it('returns nothing for a selector a story says may be absent', async () => {
    expect(await measure(page({}) as never, '.lightbox', [], { optional: true })).toEqual([])
  })

  it('reads a hyphenated property through getPropertyValue and the rest as they are named', () => {
    const asked: string[] = []
    const computed: Record<string, unknown> = { opacity: '1', visibility: 'visible', display: 'block' }
    computed.getPropertyValue = (name: string) => {
      asked.push(name)
      return '18px'
    }
    const element = { computed, getBoundingClientRect: () => ({ x: 0, y: 0, width: 10, height: 10 }) }
    const rows = withDom(() => measureInPage({ selector: '.a', props: ['max-height'] }), { '.a': [element] }) as Array<{ props: Record<string, string | null> }>
    expect(rows[0]!.props).toEqual({ opacity: '1', visibility: 'visible', display: 'block', 'max-height': '18px' })
    expect(asked).toEqual(['max-height'])
  })
})

describe('writeFrames', () => {
  const rows = [
    { selector: '.sidebar', index: 0, props: { opacity: '1', visibility: 'visible', display: 'block' }, box: { x: 0, y: 0, w: 240, h: 860 }, frame: '01-rest.png', data: { step: 'rest' } },
    { selector: '.top-row', index: 1, props: { opacity: '1', visibility: 'visible', display: 'flex' }, box: { x: 0, y: 40, w: 240, h: 24 }, frame: '/tmp/wherever/02-carried.png' }
  ]

  it('writes frames.json in the agreed shape, stamped with the story and the library hash', () => {
    const out = temp()
    const file = writeFrames(out, rows, { script: 'scripts/screens-probe.mjs', story: 'probe', size: '1440x900', tag: 'after' })
    expect(file).toBe(join(out, 'frames.json'))
    const written = JSON.parse(readFileSync(file, 'utf8'))
    expect(Object.keys(written).sort()).toEqual(
      ['app', 'at', 'data', 'dirty', 'head', 'lib', 'libSha256', 'mode', 'out', 'rows', 'script', 'size', 'story', 'tag'].sort()
    )
    expect(written.story).toBe('probe')
    expect(written.script).toBe('scripts/screens-probe.mjs')
    expect(written.lib).toBe('scripts/screens/lib.mjs')
    expect(written.libSha256).toBe(createHash('sha256').update(readFileSync(LIB)).digest('hex'))
    expect(written.tag).toBe('after')
    expect(written.size).toBe('1440x900')
    expect(written.rows).toHaveLength(2)
    for (const row of written.rows) {
      expect(Object.keys(row).sort()).toEqual(['box', 'data', 'frame', 'index', 'libSha256', 'note', 'props', 'script', 'selector', 'story'].sort())
      expect(row.story).toBe('probe')
      expect(row.script).toBe('scripts/screens-probe.mjs')
      // The same hash on every row: "the before and the after came from the same script" is data here.
      expect(row.libSha256).toBe(written.libSha256)
    }
    expect(written.rows[0].selector).toBe('.sidebar')
    expect(written.rows[0].frame).toBe('01-rest.png')
    expect(written.rows[0].data).toEqual({ step: 'rest' })
    // A frame is recorded by name, so the file can be moved with its folder.
    expect(written.rows[1].frame).toBe('02-carried.png')
  })

  it('refuses a row without a selector', () => {
    const out = temp()
    expect(() => writeFrames(out, [{ props: { opacity: '1' }, box: { x: 0, y: 0, w: 1, h: 1 } } as never], { script: 'scripts/screens-probe.mjs' })).toThrow(
      /row 0 has no selector/
    )
    expect(() => writeFrames(out, [{ selector: '  ' }], { script: 'scripts/screens-probe.mjs' })).toThrow(/row 0 has no selector/)
  })

  it('refuses a row that is not a row', () => {
    const out = temp()
    expect(() => writeFrames(out, [null as never], { script: 'scripts/screens-probe.mjs' })).toThrow(/row 0 is not an object/)
    expect(() => writeFrames(out, [['.sidebar'] as never], { script: 'scripts/screens-probe.mjs' })).toThrow(/row 0 is not an object/)
  })
})
