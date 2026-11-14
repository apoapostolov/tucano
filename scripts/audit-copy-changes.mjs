import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { parse } from '@babel/parser'

const args = process.argv.slice(2)
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback
const base = option('--base', '7ba091c217eb6e3dab28b637c555de0126e560b5')
const output = resolve(option('--output', '.tucano-local/copy-round2/inventory.json'))
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
const head = git('rev-parse', 'HEAD')
const files = git('ls-files', 'src').split('\n').filter(file => /\.[cm]?[jt]sx?$/.test(file))
const children = node => Object.entries(node)
  .filter(([key]) => !['loc', 'extra', 'comments', 'leadingComments', 'trailingComments', 'innerComments'].includes(key))
  .flatMap(([, value]) => Array.isArray(value) ? value.filter(child => child && typeof child.type === 'string') : value && typeof value.type === 'string' ? [value] : [])
const printable = (node, source) => node.type === 'StringLiteral' ? node.value : node.type === 'TemplateLiteral'
  ? node.quasis.map((part, index) => part.value.cooked + (index < node.expressions.length ? '${' + source.slice(node.expressions[index].start, node.expressions[index].end) + '}' : '')).join('')
  : source.slice(node.start, node.end)

function collect(source, file) {
  const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
  const rows = []
  const add = (node, kind, key, parents) => {
    const english = node.type === 'JSXText' ? node.value.trim().replace(/\s+/g, ' ') : printable(node, source)
    if (!english || !/[A-Za-z]/.test(english)) return
    const context = [...parents].reverse().find(parent => parent.type === 'FunctionDeclaration' || parent.type === 'VariableDeclarator')
    const attribute = [...parents].reverse().find(parent => parent.type === 'JSXAttribute')
    rows.push({ file, line: node.loc.start.line, context: context?.id?.name || 'module', kind,
      attribute: attribute?.name?.name || null, source: key, english, characters: [...english].length,
      start: node.start, end: node.end, syntax: node.type })
  }
  const englishBranch = (node, key, parents) => {
    if (['StringLiteral', 'TemplateLiteral'].includes(node.type)) add(node, 'localized', key, parents)
    else if (node.type === 'ConditionalExpression') {
      englishBranch(node.consequent, key, parents)
      englishBranch(node.alternate, key, parents)
    }
  }
  function visit(node, parents) {
    if (node.type === 'CallExpression' && node.callee.name === 'L' && node.arguments.length >= 2) {
      englishBranch(node.arguments[1], printable(node.arguments[0], source), [...parents, node])
    }
    const insideLocalized = parents.some(parent => parent.type === 'CallExpression' && parent.callee.name === 'L')
    if (!insideLocalized) {
      if (node.type === 'JSXText') add(node, 'jsx', '', parents)
      if (node.type === 'JSXAttribute' && ['title', 'aria-label', 'placeholder', 'label', 'hint', 'lead', 'description'].includes(node.name.name) && node.value?.type === 'StringLiteral') add(node.value, 'attribute', node.name.name, [...parents, node])
      if (node.type === 'ObjectProperty' && (node.key.name || node.key.value) === 'en' && ['StringLiteral', 'TemplateLiteral'].includes(node.value.type)) add(node.value, 'english-property', '', parents)
      if (node.type === 'NewExpression' && node.callee.name === 'Error' && node.arguments[0]?.type === 'StringLiteral') add(node.arguments[0], 'error', '', parents)
    }
    for (const child of children(node)) visit(child, [...parents, node])
  }
  visit(ast, [])
  return rows
}

const strings = []
for (const file of files) {
  const current = collect(readFileSync(file, 'utf8'), file)
  let before = []
  try { before = collect(execFileSync('git', ['show', base + ':' + file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }), file) } catch {}
  const pairs = new Set(before.map(row => [row.kind, row.source, row.english].join('\0')))
  for (const row of current) {
    if (pairs.has([row.kind, row.source, row.english].join('\0'))) continue
    const previous = row.source ? before.find(old => old.kind === row.kind && old.source === row.source) : null
    strings.push({ id: strings.length, ...row, change: previous ? 'changed' : 'new', previous: previous?.english || null, decision: 'pending', replacement: null, reason: null })
  }
}
const counts = {}
for (const row of strings) counts[row.file] = (counts[row.file] || 0) + 1
mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, JSON.stringify({ base, head, capturedAt: new Date().toISOString(), strings }, null, 2) + '\n')
console.log(JSON.stringify({ base, head, total: strings.length, kinds: Object.fromEntries([...new Set(strings.map(row => row.kind))].map(kind => [kind, strings.filter(row => row.kind === kind).length])), files: counts, output }, null, 2))
