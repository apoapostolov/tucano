#!/usr/bin/env node
// Runs one screenshot story and reports what it wrote.
//
//   node scripts/screens.mjs <area> [--out <dir>] [--size WxH] [--tag before|after] [--app <dir|exe>]
//   node scripts/screens.mjs <area> -- <extra args for a legacy script>
//
// `<area>` is the name a story file already has: `session-buttons` runs
// `scripts/screens-session-buttons.mjs`. A story that imports `scripts/screens/lib.mjs` runs through
// the harness; one that still opens Electron itself is run as it always was, with its own out dir as
// the first argument, and the runner says which of the two it did.
//
// The exit code is non-zero when a story throws (a failed assertion) or when its windows logged a page
// error or a console error. A story that only prints a warning and carries on is not proof, so the
// harness has no way to report one.
import { spawnSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { cleanup, closeAll, runErrors, runInfo, runOutput, setRun } from './screens/lib.mjs'

const SCRIPTS = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(SCRIPTS, '..')

// Something the person typed wrong: the message is the whole answer, so no stack is printed.
class UsageError extends Error {}

const usage = () => {
  const areas = readdirSync(SCRIPTS)
    .filter((name) => name.startsWith('screens-') && name.endsWith('.mjs'))
    .map((name) => name.replace(/^screens-/, '').replace(/\.mjs$/, ''))
    .sort()
  return `usage: node scripts/screens.mjs <area> [--out <dir>] [--size WxH] [--tag before|after] [--app <dir|exe>]

areas: ${areas.join(', ')}
`
}

const FLAGS = { '--out': 'out', '--size': 'size', '--tag': 'tag', '--app': 'app' }

function parseArgs(argv) {
  const args = { area: null, out: null, size: null, tag: null, app: null, passthrough: [], help: false }
  // `--out=x` and `--out x` are the same flag, so one spelling is read here and the other never is.
  const separator = argv.indexOf('--')
  const ownArgs = separator < 0 ? argv : argv.slice(0, separator)
  args.passthrough = separator < 0 ? [] : argv.slice(separator + 1)
  const tokens = ownArgs.flatMap((arg) => {
    const at = arg.startsWith('--') ? arg.indexOf('=') : -1
    return at > 0 ? [arg.slice(0, at), arg.slice(at + 1)] : [arg]
  })
  const positional = []
  for (let i = 0; i < tokens.length; i += 1) {
    const arg = tokens[i]
    if (arg === '-h' || arg === '--help') args.help = true
    // The two ways a person already asks for a before run, kept working.
    else if (arg === '--before') args.tag = 'before'
    else if (arg === '--after') args.tag = 'after'
    else if (FLAGS[arg]) {
      const value = tokens[++i]
      if (!value || value.startsWith('--')) throw new UsageError(`${arg} requires a value`)
      args[FLAGS[arg]] = value
    }
    else if (arg.startsWith('-')) throw new UsageError(`unknown flag ${arg}`)
    else positional.push(arg)
  }
  args.area = positional[0] ?? null
  args.passthrough.push(...positional.slice(1))
  return args
}

const say = (...lines) => console.log(lines.join('\n'))

function fail(message) {
  console.error(`screens: ${message}`)
  process.exitCode = 1
}

// A story from before the harness: it launches Electron itself and takes its out dir as argv[2].
function runLegacy({ story, out, tag, passthrough, source }) {
  const extra = []
  if (tag === 'before' && source.includes("'--before'")) extra.push('--before')
  const argv = [story, out, ...extra, ...passthrough]
  say(`mode: legacy (${argv.slice(1).join(' ')})`)
  const child = spawnSync(process.execPath, argv, { cwd: ROOT, stdio: 'inherit' })
  if (child.error) return fail(`${story} did not start: ${child.error.message}`)
  return child.status ?? 1
}

async function runLibrary({ area, story, out, size, tag, app, passthrough }) {
  say(`mode: library ${story.slice(ROOT.length + 1).split('\\').join('/')}`)
  setRun({ area, script: story, out, size, tag, app, mode: 'library' })
  const module = await import(pathToFileURL(story).href)
  const steps = module.default
  if (typeof steps !== 'function') throw new Error(`${story} exports no default async function: a story is a function`)
  // A story may pin its own viewport; a `--size` on the command line wins over the file.
  const run = runInfo()
  if (!size && module.size) setRun({ size: module.size })
  await steps({ area, out: run.out, size: run.size ?? module.size ?? null, tag, args: passthrough ?? [] })
  return 0
}

function readStory(file) {
  try {
    return readFileSync(file, 'utf8')
  } catch {
    throw new UsageError(`no story at ${file}\n\n${usage()}`)
  }
}

// What every run ends with: the frames, the frames.json files, and any error nobody allowed.
async function report(story) {
  const { frames, framesJson } = runOutput()
  const module = await import(pathToFileURL(story).href)
  const allow = (module.allowErrors ?? []).map((pattern) => new RegExp(pattern))
  const unexpected = runErrors().filter((error) => !allow.some((pattern) => pattern.test(error)))
  if (frames.length) say(`frames (${frames.length}):`, ...frames.map((frame) => `  ${frame}`))
  else say('frames: none written')
  if (framesJson.length) say('frames.json:', ...framesJson.map((file) => `  ${file}`))
  if (unexpected.length) {
    console.error(`screens: ${unexpected.length} page error(s)`)
    for (const error of unexpected.slice(0, 20)) console.error(`  ${error}`)
    process.exitCode = 1
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || !args.area) {
    say(usage())
    if (!args.area && !args.help) process.exitCode = 1
    return
  }
  if (args.tag && !['before', 'after'].includes(args.tag)) throw new UsageError(`--tag takes before or after; got ${args.tag}`)
  const file = args.area.endsWith('.mjs') ? args.area : join(SCRIPTS, `screens-${args.area}.mjs`)
  const story = resolve(ROOT, file)
  const source = readStory(story)
  const tag = args.tag ?? 'after'
  const area = args.area.replace(/^screens-/, '').replace(/\.mjs$/, '')
  const out = resolve(ROOT, args.out ?? join('frames', area, tag))
  setRun({ area, script: story, out, size: args.size, tag, app: args.app, mode: 'library' })
  if (!/from\s+['"]\.\/screens\/lib\.mjs['"]/.test(source)) {
    process.exitCode = runLegacy({ story, out, tag, passthrough: args.passthrough, source })
    return
  }
  try {
    await runLibrary({ area, story, out, size: args.size, tag, app: args.app, passthrough: args.passthrough })
  } finally {
    try {
      await closeAll()
      await report(story)
    } finally {
      cleanup()
    }
  }
}

main().catch((error) => {
  console.error(`screens: ${error instanceof UsageError ? error.message : (error?.stack ?? error)}`)
  cleanup()
  process.exitCode = 1
})
