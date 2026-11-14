import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { extractFile } from '@electron/asar'

// Check the bundle before launching it. A command-line flag cannot hide an older app
// that has no implementation of that flag.
export function supportsBackgroundCopyQA(executable) {
  const source = executable
    ? extractFile(join(dirname(resolve(executable)), 'resources', 'app.asar'), 'out/main/index.js').toString('utf8')
    : readFileSync(resolve('out/main/index.js'), 'utf8')
  return source.includes('--qa-background') && source.includes('Background QA requires fake engines')
}
