// The one screenshot harness. A story file imports this and its own steps, and nothing else: the
// Electron launch, the temporary database, the fake engines, the viewport, the frames directory, the
// error collection and frames.json are shared by the migrated stories.
//
//   import { openApp, until, shot, measure, writeFrames, close } from './screens/lib.mjs'
//
//   export const size = '1440x900'
//   export default async function story(t) {
//     await until(t.win, '.sidebar')
//     const rows = measure(t.win, '.sidebar .section')
//     rows[0].frame = await shot(t, '01-rest')
//     writeFrames(t.out, rows)
//     await close(t)
//   }
//
// `node scripts/screens.mjs <area> [--out <dir>] [--size WxH] [--tag before|after]` runs it. Read
// docs/screens-harness.md before writing a new one.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { _electron as electron } from 'playwright'

const HERE = dirname(fileURLToPath(import.meta.url))
/** The checkout this library belongs to. A story runs against its build. */
export const ROOT = resolve(HERE, '../..')
/** This file, as an absolute path. */
export const LIB = fileURLToPath(import.meta.url)
// The hash is of the bytes on disk, taken once: every row of one run carries the same one, which is
// what makes "the before and the after came from the same script" a fact in the data and not a claim.
const LIB_BYTES = readFileSync(LIB)
const LIB_SHA = createHash('sha256').update(LIB_BYTES).digest('hex')

/** The sha256 of this library file, as written into every frames.json. */
export const libSha256 = () => LIB_SHA

/** A path inside the checkout, always with forward slashes, however Windows spells it. */
const inTree = (path) => relative(ROOT, path).split(sep).join('/')

/** How a story's path is written into frames.json: relative to the checkout, forward slashes only. */
function treePath(path) {
  if (!path) return path
  if (isAbsolute(path)) return inTree(path)
  return String(path).replaceAll('\\', '/')
}

/** The default the runner fills in before a story is imported. */
const run = {
  area: null,
  script: null,
  out: null,
  size: null,
  tag: 'after',
  app: null,
  mode: 'library',
  allowErrors: []
}

const sessions = new Set()
// Every session this run opened, closed or not: a story that restarts the app still has errors from
// the first window, and the runner has to see them after the story ends.
const everySession = []
const tempDirs = new Set()

/** What the runner tells the library about this run. A story never has to call it. */
export function setRun(patch = {}) {
  Object.assign(run, patch)
}

/** The library's view of the current run, for a story that wants to print or branch on it. */
export function runInfo() {
  return { ...run, lib: inTree(LIB), libSha256: LIB_SHA }
}

/** `1440x900` to a viewport, with a message that names what was typed instead of what was wanted. */
export function parseSize(size) {
  const found = /^(\d+)x(\d+)$/.exec(String(size ?? '').trim())
  if (!found || Number(found[1]) < 1 || Number(found[2]) < 1 || !Number.isSafeInteger(Number(found[1])) || !Number.isSafeInteger(Number(found[2]))) throw new Error(`--size takes WxH, like 1440x900; got ${JSON.stringify(size)}`)
  return { width: Number(found[1]), height: Number(found[2]) }
}

const sizeText = (size) => `${size.width}x${size.height}`

/** A frame directory: the one named, else the runner's, else `frames/<area>/<tag>` in the checkout. */
function outDir(out, tag = run.tag ?? 'after', area = run.area ?? 'scratch') {
  const wanted = out ?? run.out ?? join(ROOT, 'frames', area, tag)
  const full = isAbsolute(wanted) ? wanted : resolve(ROOT, wanted)
  mkdirSync(full, { recursive: true })
  return full
}

// A story says `shot(t, '01-rest')` with a session, or `shot(win, '01-rest')` with the page. Both
// need the session for the frames directory and the frame list, so a page remembers its own.
const byPage = new WeakMap()

const sessionOf = (target) => {
  if (!target) return null
  if (sessions.has(target)) return target
  return byPage.get(target) ?? null
}

// A session, or a page: a story that launched its own window, or a test standing in for one, hands
// over the page itself.
const pageOf = (target) => {
  if (!target) return null
  if (sessions.has(target)) return target.win
  return typeof target.evaluate === 'function' ? target : null
}

const describe = (target) => (sessions.has(target) ? 'session' : 'page')

// Assembled in the page, so nothing here re-implements a box in Node: `measure` is the only
// measurement primitive, and this is its browser side. Exported because a unit test can run it
// against a fake document without an Electron launch.
export function measureInPage({ selector, props = [] }) {
  const names = [...new Set(['opacity', 'visibility', 'display', ...props])]
  const elements = [...document.querySelectorAll(selector)]
  const rows = []
  for (const [index, element] of elements.entries()) {
    const style = getComputedStyle(element)
    const values = {}
    for (const name of names) {
      values[name] = name.includes('-') ? style.getPropertyValue(name) || null : (style[name] ?? null)
    }
    const box = element.getBoundingClientRect()
    rows.push({
      index,
      props: values,
      box: { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) }
    })
  }
  return rows
}

/**
 * Launches the built app and hands back a session. Everything a story needs to look at a screen:
 * a window at the requested viewport, a database of its own, the fake engines, and the errors.
 *
 * Pass `data` to keep a database across two launches (a story that restarts the app, or seeds rows
 * between runs); otherwise it is a fresh temp folder that goes away when the run ends.
 */
export async function openApp(options = {}) {
  const size = run.size ?? options.size ?? '1440x900'
  const viewport = parseSize(size)
  const tag = options.tag ?? run.tag ?? 'after'
  const out = outDir(options.out, tag)
  const data = options.data ? resolve(options.data) : mkdtempSync(join(tmpdir(), 'tucano-screens-'))
  if (!options.data) tempDirs.add(data)
  const env = {
    ...process.env,
    TUCANO_DATA: data,
    TUCANO_SEED: String(options.seed ?? 1),
    TUCANO_LOCALE: options.locale ?? 'en-US',
    ...options.env
  }
  if (options.fake !== false) env.TUCANO_FAKE_ENGINES = '1'
  // A story that is run from a shell that is itself an Electron (a test runner, a harness) inherits
  // these two, and the app then never starts as an app.
  delete env.ELECTRON_RUN_AS_NODE
  delete env.ELECTRON_RENDERER_URL
  const app = options.app ?? run.app ?? ROOT
  // Its own Electron profile too, so an installed Tucano that is open never takes this one over.
  const profile = options.profile === false ? [] : [`--user-data-dir=${join(data, 'electron')}`]
  // A checkout is launched as `.` inside it; an installed build is handed over as an executable.
  const packaged = /\.(exe|app|AppImage)$/i.test(app) || (existsSync(app) && !statSync(app).isDirectory())
  const launch = packaged
    ? { executablePath: resolve(app), args: profile, env }
    : { args: ['.', ...profile], cwd: resolve(app), env }
  const running = await electron.launch(launch)
  const win = await running.firstWindow()
  const errors = []
  win.on('pageerror', (error) => errors.push(String(error)))
  win.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  await win.setViewportSize(viewport)
  const session = {
    app: running,
    win,
    data,
    out,
    size: sizeText(viewport),
    tag,
    errors,
    frames: [],
    closed: false,
    ownsData: !options.data
  }
  byPage.set(win, session)
  sessions.add(session)
  everySession.push(session)
  return session
}

/**
 * Writes one frame and returns its path, so a row can carry it. `element` photographs that selector
 * instead of the whole window, which is what a sidebar or a channel frame is.
 */
export async function shot(target, name, element) {
  const session = sessionOf(target)
  const page = pageOf(target)
  if (!page) throw new Error(`shot: nothing to photograph for ${describe(target)} ${JSON.stringify(name)}`)
  const dir = session?.out ?? outDir()
  const file = join(dir, `${name}.png`)
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  const capture = { path: file, animations: 'disabled', caret: 'hide' }
  if (element) await page.locator(element).first().screenshot(capture)
  else await page.screenshot(capture)
  session?.frames.push(file)
  run.frames = [...(run.frames ?? []), file]
  return file
}

/** Waits, so a transition is over before the frame is taken. The only sleep a story should need. */
export async function settle(target, ms = 500) {
  const page = pageOf(target)
  if (!page) throw new Error('settle: no page')
  await page.waitForTimeout(ms)
}

// 30 s, not 15: a cold launch on a loaded machine spends 20 s getting from the boot screen to the
// workspace (measured at 420x900 on Windows), and a wait that trips on a normal start teaches a story
// to pass its own numbers, which is what this library exists to stop.
const UNTIL_MS = 30_000

/** Waits for a selector to be there (visible by default) and returns its locator. */
export async function until(target, selector, options = {}) {
  const page = pageOf(target)
  if (!page) throw new Error(`until: no page for ${JSON.stringify(selector)}`)
  const locator = page.locator(selector).nth(options.nth ?? 0)
  await locator.waitFor({ state: options.state ?? 'visible', timeout: options.timeout ?? UNTIL_MS })
  return locator
}

// What "at work" looks like on this app's screens: a chain that says it is working, a shimmer, a
// reply being typed, a message still being routed. A story that waits for these by hand is one that
// grew its own deadline, and the four that did each picked a different one.
const BUSY = '.steps.is-working, .shimmer, .typing, .system-line.is-pending'

/** Waits until nothing is routing or answering, then lets the last frame draw. */
export async function idle(target, options = {}) {
  const page = pageOf(target)
  if (!page) throw new Error('idle: no page')
  const step = options.step ?? 400
  const quiet = options.quiet ?? 3
  const deadline = Date.now() + (options.timeout ?? 90_000)
  let still = 0
  while (Date.now() < deadline && still < quiet) {
    await page.waitForTimeout(step)
    still = (await page.locator(BUSY).count()) === 0 ? still + 1 : 0
  }
  if (still < quiet) throw new Error(`idle: app remained busy after ${options.timeout ?? 90_000}ms`)
  await settle(page, options.ms ?? 700)
}

/**
 * The computed style and the box of every element a selector matches, with the selector recorded on
 * each row. A class name is not evidence: `is-open` can be there while the panel is invisible, so a
 * story measures what the browser resolved instead of asking an element what it thinks it is.
 */
export async function measure(target, selector, props = [], options = {}) {
  const page = pageOf(target)
  if (!page) throw new Error(`measure: no page for ${JSON.stringify(selector)}`)
  const rows = await page.evaluate(measureInPage, { selector, props })
  if (!rows.length && options.optional) return []
  if (!rows.length) throw new Error(`measure: nothing matched ${JSON.stringify(selector)}`)
  return rows.map((row) => ({ selector, index: row.index, props: row.props, box: row.box }))
}

const GIT = (args) => {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return null
  }
}

// The story that is calling, for a run that did not come through the runner (a direct
// `node scripts/screens-foo.mjs` while iterating). One stack frame, parsed once.
function callerScript() {
  const frames = String(new Error().stack ?? '').split('\n').slice(1)
  for (const frame of frames) {
    const found = /((?:file:\/\/)?\/?[A-Za-z]:[\\/][^:()]+|file:\/\/[^:()]+|\/[^:()]+\.mjs)/.exec(frame)
    if (!found) continue
    const path = found[1].replace(/^file:\/\//, '')
    if (path.endsWith('/screens/lib.mjs') || path.endsWith('\\screens\\lib.mjs')) continue
    const absolute = decodeURIComponent(path)
    return isAbsolute(absolute) ? inTree(absolute) : absolute
  }
  return null
}

// One row of frames.json: the story and the library version go on every row, so a row that is pasted
// into an issue still says where it came from. A row without a selector is refused, because a
// measurement that cannot say what it measured is a class name in a JSON file.
function stampRow(row, index, { story, script }) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`frames row ${index} is not an object`)
  if (typeof row.selector !== 'string' || !row.selector.trim()) {
    throw new Error(`frames row ${index} has no selector: measure() records the selector, and a row without one proves nothing`)
  }
  const { selector, frame = null, props = null, box = null, data = null, note = null, ...rest } = row
  return { ...rest, story, script, libSha256: LIB_SHA, index, frame: frame ? basename(frame) : null, selector, props, box, data, note }
}

const storyName = (script) => (script ? basename(script).replace(/^screens-/, '').replace(/\.mjs$/, '') : null)

/**
 * Writes `frames.json` and returns its path. Every row is stamped with the story's path and this
 * library's sha256, so two runs can be told apart by data and not by folder names.
 *
 * A row without a selector is refused: a measurement that cannot say what it measured is a class
 * name in a JSON file, which is the thing this harness exists to stop.
 */
export function writeFrames(out, rows, meta = {}) {
  const dir = outDir(out, meta.tag ?? run.tag, meta.area ?? run.area)
  const script = treePath(meta.script ?? run.script ?? callerScript())
  const story = meta.story ?? run.area ?? storyName(script)
  const frames = (rows ?? []).map((row, index) => stampRow(row, index, { story, script }))
  const payload = {
    story,
    script,
    lib: inTree(LIB),
    libSha256: LIB_SHA,
    mode: meta.mode ?? run.mode ?? 'library',
    tag: meta.tag ?? run.tag ?? 'after',
    size: meta.size ?? run.size ?? null,
    app: meta.app ?? run.app ?? '.',
    out: dir,
    head: meta.head ?? GIT(['rev-parse', 'HEAD']),
    dirty: meta.dirty ?? Boolean(GIT(['status', '--porcelain', '--untracked-files=no'])),
    at: new Date().toISOString(),
    data: meta.data ?? null,
    rows: frames
  }
  const file = join(dir, 'frames.json')
  writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`)
  run.writes = [...(run.writes ?? []), file]
  return file
}

/**
 * Closes the app: the window and the Electron process, even when the story threw. The database
 * folder stays until the run ends, because a story that restarts the app on the same database closes
 * it on purpose, and a locked temp folder on the second launch is worse than a late delete.
 */
export async function close(target) {
  const session = sessionOf(target)
  if (!session || session.closed) return
  session.closed = true
  sessions.delete(session)
  byPage.delete(session.win)
  try {
    await session.app.close()
  } catch {
    // An app that is already gone is closed enough, and a story that threw must not fail here too.
  }
}

/** Closes everything a run still has open, for the runner's `finally`. */
export async function closeAll() {
  for (const session of [...sessions]) await close(session)
}

/** Removes the temp databases this process made. Called by the runner, and again at process exit. */
export function cleanup() {
  for (const dir of tempDirs) {
    try {
      if (process.platform === 'win32') {
        execFileSync('powershell.exe', ['-NoProfile', '-File', join(HERE, 'recycle.ps1'), '-Path', dir], { stdio: 'pipe' })
      } else {
        execFileSync('gio', ['trash', dir], { stdio: 'pipe' })
      }
      tempDirs.delete(dir)
    } catch {
      console.error(`screens: could not recycle temporary data at ${dir}`)
    }
  }
}

process.once('exit', cleanup)

/** Every page error and console error this run saw, from every window it opened. */
export function runErrors() {
  return everySession.flatMap((session) => session.errors)
}

/** The frames and the frames.json files this run wrote, in the order it wrote them. */
export function runOutput() {
  return { frames: run.frames ?? [], framesJson: run.writes ?? [] }
}
