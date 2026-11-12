#!/usr/bin/env node
// Rebuilds and reinstalls TucanoNext on Windows without the failure that killed it once: a package
// built from an incomplete node_modules, which dies while loading (no window, processes left
// holding the single-instance lock, so every later launch does nothing).
//
//   node scripts/self-build.mjs install         build, check, package, close, install, open, verify
//   node scripts/self-build.mjs build           build and package only (leaves the app alone)
//   node scripts/self-build.mjs doctor          say whether the installed package and instance are sane
//   node scripts/self-build.mjs doctor --fix    also close instances that have no window
//
// Flags: --json (one JSON line as the result), --test (run the suite first), --no-typecheck.
// Exit codes name the stage that stopped it, so a caller never has to read prose:
// 0 ok, 1 preflight, 2 typecheck, 3 build, 4 package, 5 package check, 6 close, 7 install,
// 8 launch, 9 usage.
import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { closeSync, existsSync, openSync, readFileSync, readSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const NAME = 'TucanoNext'
const WIN = process.platform === 'win32'
const EXIT = { ok: 0, preflight: 1, typecheck: 2, build: 3, package: 4, verify: 5, stop: 6, install: 7, launch: 8, usage: 9 }

const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => a.startsWith('--')))
const command = args.find((a) => !a.startsWith('--')) ?? 'install'
// `doctor --asar <file>` checks a package anywhere, such as one an installer has not been run on.
const asarAt = args.indexOf('--asar')
const asarOverride = asarAt >= 0 && args[asarAt + 1] ? resolve(args[asarAt + 1]) : undefined
const asJson = flags.has('--json')
const log = (...parts) => {
  if (!asJson) console.log(...parts)
}
const stop = (message, stage) => Object.assign(new Error(message), { stage })

// ---------------------------------------------------------------- facts about this checkout

const manifest = () => JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const version = () => manifest().version
const installedDir = () => join(process.env['LOCALAPPDATA'] ?? '', 'Programs', 'tucanonext')
const installedExe = () => join(installedDir(), `${NAME}.exe`)
const installedAsar = () => join(installedDir(), 'resources', 'app.asar')
const builtAsar = () => join(ROOT, 'dist', 'win-unpacked', 'resources', 'app.asar')
const setupFile = () => join(ROOT, 'dist', `tucanonext-setup-${version()}.exe`)
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex')

function run(command, commandArgs, stage) {
  log(`\n$ ${command} ${commandArgs.join(' ')}`)
  const result = spawnSync(command, commandArgs, { cwd: ROOT, stdio: asJson ? 'pipe' : 'inherit', encoding: 'utf8', windowsHide: true, shell: WIN })
  if (result.status !== 0) {
    const output = asJson ? `${result.stdout ?? ''}${result.stderr ?? ''}`.slice(-2000) : ''
    throw stop(`${command} exited ${result.status ?? result.signal}${output ? `\n${output}` : ''}`, stage)
  }
  return result.stdout ?? ''
}

// ---------------------------------------------------------------- PowerShell, for the Windows side

function powershell(script) {
  const result = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8', windowsHide: true })
  if (result.status !== 0) throw stop(`powershell failed: ${result.stderr?.trim() || result.status}`, 'preflight')
  return result.stdout.trim()
}

// One line per instance: pid | window title, empty for the windowless processes a failed load leaves.
function instances() {
  if (!WIN) return []
  const out = powershell(`(Get-Process -Name '${NAME}' -ErrorAction SilentlyContinue | ForEach-Object { "$($_.Id)|$($_.MainWindowTitle)" }) -join ([char]10)`)
  return out
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [pid, title = ''] = line.split('|')
      return { pid: Number(pid), title: title.trim() }
    })
}

const withWindow = () => instances().filter((instance) => instance.title)
const processCount = () => instances().length

async function until(check, timeoutMs, everyMs = 500) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const value = check()
    if (value) return value
    await new Promise((waited) => setTimeout(waited, everyMs))
  }
  return undefined
}

function killAll() {
  for (const { pid } of instances()) spawnSync('taskkill', ['/F', '/T', '/PID', String(pid)], { windowsHide: true, encoding: 'utf8' })
}

// ---------------------------------------------------------------- the package check

// What the asar carries: the package folders in it, and how many sit at its root node_modules.
function asarIndex(file) {
  const handle = openSync(file, 'r')
  try {
    const head = Buffer.alloc(16)
    readSync(handle, head, 0, 16, 0)
    const size = head.readUInt32LE(12)
    const header = Buffer.alloc(size)
    readSync(handle, header, 0, size, 16)
    const directories = []
    const walk = (node, path) => {
      for (const [key, child] of Object.entries(node.files ?? {})) {
        if (!child.files) continue
        const here = `${path}/${key}`
        directories.push(here)
        walk(child, here)
      }
    }
    walk(JSON.parse(header.toString('utf8')), '')
    const names = new Set()
    let topLevel = 0
    for (const path of directories) {
      const top = path.match(/^\/node_modules\/((?:@[^/]+\/)?[^/]+)$/)
      if (top) {
        names.add(top[1])
        topLevel += 1
        continue
      }
      const nested = path.match(/\/node_modules\/((?:@[^/]+\/)?[^/]+)$/)
      if (nested) names.add(nested[1])
    }
    return { names, topLevel, size: statSync(file).size }
  } finally {
    closeSync(handle)
  }
}

// Every package the app needs at runtime, walked from package.json through each package's own
// dependencies. A package built while node_modules was being rewritten carries the direct ones and
// none of their dependencies, and the app then dies importing electron-updater.
function missingRuntimeDeps(names) {
  const seen = new Set()
  const missing = []
  const queue = Object.keys(manifest().dependencies ?? {})
  while (queue.length) {
    const name = queue.shift()
    if (seen.has(name)) continue
    seen.add(name)
    if (!names.has(name)) {
      missing.push(name)
      continue
    }
    const own = join(ROOT, 'node_modules', name, 'package.json')
    if (existsSync(own)) queue.push(...Object.keys(JSON.parse(readFileSync(own, 'utf8')).dependencies ?? {}))
  }
  return missing
}

// ---------------------------------------------------------------- stages

function preflight() {
  log(`${NAME} ${version()} in ${ROOT}`)
  if (manifest().name !== 'tucanonext') throw stop('this is not the TucanoNext checkout', 'preflight')
  if (!existsSync(join(ROOT, 'node_modules'))) throw stop('node_modules is missing: run npm ci, with nothing else running', 'preflight')
  const absent = Object.keys(manifest().dependencies ?? {}).filter((dep) => !existsSync(join(ROOT, 'node_modules', dep)))
  if (absent.length) throw stop(`node_modules is incomplete (${absent.join(', ')}): run npm ci alone, then this again`, 'preflight')
  if (!WIN && command !== 'build') throw stop(`installing on ${process.platform} is not this script: use scripts/install-app.sh on macOS`, 'preflight')
}

function typecheck() {
  run('npx', ['tsc', '--noEmit', '-p', 'tsconfig.json'], 'typecheck')
  if (flags.has('--test')) run('npx', ['vitest', 'run'], 'typecheck')
}

function build() {
  run('npx', ['electron-vite', 'build'], 'build')
  if (!existsSync(join(ROOT, 'out', 'main', 'index.js'))) throw stop('out/main/index.js was not written', 'build')
}

function pack() {
  run('npx', ['electron-builder', '--win', 'nsis', '--x64', '--publish', 'never'], 'package')
  const setup = setupFile()
  if (!existsSync(setup)) throw stop(`${setup} was not written`, 'package')
  if (statSync(setup).mtimeMs < statSync(join(ROOT, 'out', 'main', 'index.js')).mtimeMs) throw stop('the installer is older than this build', 'package')
}

// Refuse to hand the installer a package the app cannot load.
function checkPackage() {
  if (!existsSync(builtAsar())) throw stop('dist/win-unpacked/resources/app.asar is missing', 'verify')
  const index = asarIndex(builtAsar())
  const missing = missingRuntimeDeps(index.names)
  log(`  asar ${(index.size / 1e6).toFixed(1)} MB, ${index.topLevel} packages at its root node_modules`)
  if (missing.length) {
    throw stop(`the package is missing ${missing.join(', ')}: node_modules was being rewritten while it was packed. Run npm ci alone, then this again`, 'verify')
  }
  return index
}

async function close() {
  const exe = installedExe()
  if (!processCount() && existsSync(exe)) {
    log('  nothing running')
    return
  }
  // The app's own quit, so its agents and databases stop the way they expect.
  if (existsSync(exe)) spawnSync(exe, ['--quit'], { windowsHide: true, stdio: 'ignore' })
  if (!(await until(() => processCount() === 0, 25_000))) {
    log(`  ${processCount()} instance(s) did not quit, closing them`)
    killAll()
    if (!(await until(() => processCount() === 0, 10_000))) throw stop(`${processCount()} TucanoNext process(es) survived taskkill`, 'stop')
  }
}

function install() {
  log(`  ${setupFile()}`)
  const result = spawnSync(setupFile(), ['/S'], { windowsHide: true, stdio: 'ignore', timeout: 600_000 })
  if (result.status !== 0) throw stop(`the installer exited ${result.status}`, 'install')
  if (!existsSync(installedExe())) throw stop(`${installedExe()} was not installed`, 'install')
  // The installer copies; the bytes on disk are what prove it copied this build and not an older one.
  if (sha256(builtAsar()) !== sha256(installedAsar())) throw stop('the installed app.asar is not the one just built', 'install')
}

async function launch() {
  spawn(installedExe(), [], { detached: true, stdio: 'ignore', windowsHide: true }).unref()
  const title = await until(() => withWindow()[0]?.title, 90_000)
  if (title) return title
  const count = processCount()
  throw stop(
    count
      ? `${count} process(es) run with no window: the app died while loading. "node scripts/self-build.mjs doctor" says what it sees`
      : 'the installed app did not start',
    'launch'
  )
}

// ---------------------------------------------------------------- doctor

function doctor(fix) {
  const target = asarOverride ?? installedAsar()
  const found = { version: version(), asar: target, installed: existsSync(installedExe()), processes: processCount(), window: withWindow()[0]?.title ?? '' }
  log(`${NAME} ${found.version}`)
  log(`  installed: ${found.installed ? installedDir() : 'no'}`)
  if (existsSync(target)) {
    const index = asarIndex(target)
    found.missing = missingRuntimeDeps(index.names)
    found.packages = index.topLevel
    found.bytes = index.size
    log(`  app.asar: ${(index.size / 1e6).toFixed(1)} MB, ${index.topLevel} packages, ${found.missing.length ? `MISSING ${found.missing.join(', ')}` : 'complete'}`)
    if (!asarOverride && existsSync(builtAsar())) found.sameAsBuild = sha256(builtAsar()) === sha256(target)
  } else {
    found.missing = []
    found.verdict = 'missing-asar'
    log(`  app.asar: ${target} is not there`)
  }
  log(`  processes: ${found.processes}, window: ${found.window || 'none'}`)
  if (found.verdict === 'missing-asar') {
    log('  verdict: there is no package at that path')
  } else if (found.missing.length) {
    found.verdict = 'broken-package'
    log('  verdict: the package cannot load; "node scripts/self-build.mjs install" puts a checked one back')
  } else if (found.processes && !found.window) {
    found.verdict = 'dead-at-load'
    log('  verdict: processes without a window, so the app died while loading and still holds the single-instance lock; nothing can start it')
    if (fix) {
      killAll()
      found.fixed = true
      log('  closed them; then run "node scripts/self-build.mjs install"')
    }
  } else {
    found.verdict = found.window ? 'running' : found.processes ? 'starting' : 'stopped'
  }
  return found
}

// ---------------------------------------------------------------- main

const report = { command, at: new Date().toISOString() }
try {
  preflight()
  if (command === 'doctor') {
    Object.assign(report, doctor(flags.has('--fix')))
  } else if (command === 'build' || command === 'install') {
    if (!flags.has('--no-typecheck')) typecheck()
    build()
    pack()
    const index = checkPackage()
    report.package = { setup: setupFile(), asarBytes: index.size, asarPackages: index.topLevel }
    if (command === 'install') {
      await close()
      install()
      report.installed = true
      report.window = await launch()
      log(`\nUp: ${NAME} ${version()}, window "${report.window}"`)
    } else {
      log(`\nBuilt and packaged ${setupFile()}`)
    }
  } else {
    throw stop(`unknown command ${command}: use build, install or doctor`, 'usage')
  }
  report.ok = true
  report.exit = EXIT.ok
} catch (error) {
  report.ok = false
  report.stage = error.stage ?? 'preflight'
  report.exit = EXIT[report.stage] ?? 1
  report.error = error.message
  if (!asJson) console.error(`\nFAILED at ${report.stage}: ${error.message}`)
}

if (asJson) console.log(JSON.stringify(report))
process.exit(report.exit)
