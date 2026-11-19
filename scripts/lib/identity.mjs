// One definition of what makes a checkout TucanoNext, checked before anything is packaged or installed.
//
// The two apps are separate installs of the same source: `%LOCALAPPDATA%\Programs\tucano` holds the
// released **Tucano**, `%LOCALAPPDATA%\Programs\tucanonext` holds **TucanoNext**, and each has its own
// data folder and its own shortcuts. Every one of those separations is a string in package.json or in
// src/main/index.ts, and an upstream merge that brings its own values back puts the fork's build where
// the released app lives: the installer then replaces Tucano, the desktop shortcut opens the wrong fork,
// and the person's Tucano is gone with no trace of why. So the strings live here as one expectation, and
// self-build (the build), tn-install.py (the shared lock) and test/app-identity.test.ts (the suite) all
// read this file instead of spelling the names again.
//
//   node scripts/lib/identity.mjs [root]     exit 0 when the checkout is TucanoNext, 1 with every reason
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const IDENTITY = {
  package: 'tucanonext',
  product: 'TucanoNext',
  appId: 'dev.tucano.next',
  shortcut: 'TucanoNext',
  artifact: 'tucanonext-setup-',
  exe: 'TucanoNext.exe',
  installDir: 'tucanonext',
  // The released app, which a TucanoNext build must never land in or replace.
  releasedDir: 'tucano',
  releasedExe: 'Tucano.exe'
}

const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : null)

// Every reason the checkout would install as something other than TucanoNext, each one naming the file
// and the value it found, so the report is the fix and not a riddle.
export function identityProblems(root) {
  const problems = []
  const pkgText = read(join(root, 'package.json'))
  if (pkgText === null) return [`package.json is missing in ${root}`]
  let pkg
  try {
    pkg = JSON.parse(pkgText)
  } catch (e) {
    return [`package.json in ${root} is not JSON: ${e.message}`]
  }
  const build = pkg.build ?? {}
  const nsis = build.nsis ?? {}
  const want = (what, found, expected) => {
    if (found !== expected) problems.push(`${what} is ${JSON.stringify(found)}, and TucanoNext needs ${JSON.stringify(expected)}`)
  }

  // package.json decides the install folder, the window name and the shortcut the installer writes.
  want('package.json › name', pkg.name, IDENTITY.package)
  want('package.json › build › productName', build.productName, IDENTITY.product)
  want('package.json › build › appId', build.appId, IDENTITY.appId)
  want('package.json › build › nsis › shortcutName', nsis.shortcutName, IDENTITY.shortcut)
  if (!String(nsis.artifactName ?? '').startsWith(IDENTITY.artifact)) {
    problems.push(`package.json › build › nsis › artifactName is ${JSON.stringify(nsis.artifactName)}, and every install script looks for a setup named ${IDENTITY.artifact}*.exe`)
  }
  // No update feed: a fork build that carries one updates itself into the released app.
  if (build.publish !== undefined && !(Array.isArray(build.publish) && build.publish.length === 0)) {
    problems.push(`package.json › build › publish is ${JSON.stringify(build.publish)}, and a TucanoNext build ships no update feed`)
  }

  // The id the window registers and the name the app gives itself, in code rather than in the manifest.
  const appId = read(join(root, 'src/shared/app-identity.ts'))
  if (appId === null) problems.push('src/shared/app-identity.ts is missing')
  else {
    const found = /APP_ID\s*=\s*'([^']+)'/.exec(appId)?.[1]
    want('src/shared/app-identity.ts › APP_ID', found, IDENTITY.appId)
  }
  const main = read(join(root, 'src/main/index.ts'))
  if (main === null) problems.push('src/main/index.ts is missing')
  else {
    want('src/main/index.ts › NAME', /const NAME = '([^']+)'/.exec(main)?.[1], IDENTITY.product)
    if (!main.includes('app.setName(NAME)')) problems.push('src/main/index.ts does not call app.setName(NAME): the window and its data folder would take the package name instead')
  }
  return problems
}

// Where a build goes, and what must still be standing beside it. Called with the local Programs folder.
export function installProblems(programs, { releasedWasInstalled = false } = {}) {
  const problems = []
  const mine = join(programs, IDENTITY.installDir)
  const released = join(programs, IDENTITY.releasedDir)
  if (!existsSync(join(mine, IDENTITY.exe))) problems.push(`${join(mine, IDENTITY.exe)} is missing: the install did not land in TucanoNext's own folder`)
  if (existsSync(join(mine, IDENTITY.releasedExe))) {
    problems.push(`${join(mine, IDENTITY.releasedExe)} exists: a released-app executable was installed into TucanoNext's folder, and its uninstaller would take that app's shortcuts`)
  }
  if (releasedWasInstalled && !existsSync(join(released, IDENTITY.releasedExe))) {
    problems.push(`${join(released, IDENTITY.releasedExe)} is gone: this install replaced the released Tucano, which has to be reinstalled from its own setup`)
  }
  return problems
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const root = resolve(process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), '..', '..'))
  const problems = identityProblems(root)
  if (problems.length) {
    console.error(`not TucanoNext: ${root}`)
    for (const problem of problems) console.error(`  - ${problem}`)
    process.exit(1)
  }
  console.log(`TucanoNext: ${IDENTITY.product} ${IDENTITY.package} ${IDENTITY.appId} in ${root}`)
}
