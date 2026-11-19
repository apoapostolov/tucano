// Text sitting between two elements in JSX is children, not code: a `//` line written there is painted
// on the panel. That is what happened to the thread panel's rail note at 0.2.41, and it read as a stray
// sentence with a trailing `rail=` in the middle of the thread. The syntax is legal, so tsc and the
// renderer tests never see it; this walks every .tsx in src and fails on any JSX text that opens like a
// comment. Comments belong in `{/* … */}` inside JSX, or in a `//` line above the `return`.
import fs from 'node:fs'
import path from 'node:path'
import { parse } from '@babel/parser'
import { describe, expect, it } from 'vitest'

const SRC = new URL('../src', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

function tsxFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!/^(node_modules|out|dist|build)$/.test(entry.name)) tsxFiles(full, out)
    } else if (entry.name.endsWith('.tsx')) out.push(full)
  }
  return out
}

// Every JSXText node that opens like a comment, as `file:line: text`. The line is the one the first
// visible character sits on: a JSX text node starts right after its parent's `>`, newline included.
function leaks(file: string, code: string): string[] {
  const ast = parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
  const found: string[] = []
  const walk = (node: any): void => {
    if (node.type === 'JSXText') {
      const text = String(node.value).trim()
      if (text.startsWith('//') || text.startsWith('/*')) {
        const at = node.start + (String(node.value).length - String(node.value).trimStart().length)
        const line = code.slice(0, at).split(/\r?\n/).length
        found.push(`${path.basename(file)}:${line}: ${text.replace(/\s+/g, ' ').slice(0, 96)}`)
      }
    }
    for (const key of Object.keys(node)) {
      if (/comments$/i.test(key)) continue
      const value = node[key]
      if (Array.isArray(value)) value.forEach((child) => child && typeof child.type === 'string' && walk(child))
      else if (value && typeof value.type === 'string') walk(value)
    }
  }
  walk(ast.program)
  return found
}

describe('no JSX line is painted like a comment', () => {
  it('finds no `//` or `/*` in the children of any element in src', () => {
    const offenders = tsxFiles(SRC).flatMap((file) => leaks(file, fs.readFileSync(file, 'utf8')))
    expect(offenders).toEqual([])
  })

  it('catches one when it is there', () => {
    const caught = leaks('probe.tsx', 'const A = () => (<div>\n  // a note\n  <b>x</b>\n</div>)\n')
    expect(caught).toHaveLength(1)
    expect(caught[0]).toContain('probe.tsx:2')
  })
})
