import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from '@babel/parser'

// Apply a reviewed inventory only to the exact source it describes. Dry-run by default.
const args = process.argv.slice(2)
const reviewPath = args[0] && !args[0].startsWith('--') ? args[0] : 'docs/english-copy-round2-review.json'
const review = JSON.parse(readFileSync(reviewPath, 'utf8'))
const root = args.includes('--root') ? args[args.indexOf('--root') + 1] : '.'
const parser = source => parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
const ignored = new Set(['start', 'end', 'loc', 'extra', 'comments', 'leadingComments', 'trailingComments', 'innerComments', 'tokens'])
function structure(value, restore = new Map()) {
  if (Array.isArray(value)) return value.map(item => structure(item, restore))
  if (!value || typeof value !== 'object') return value
  const original = restore.get(value.start)
  if (original && value.end === original.end) return structure(original.node)
  return Object.fromEntries(Object.entries(value).filter(([key]) => !ignored.has(key)).map(([key, child]) => [key, structure(child, restore)]))
}
function literal(row) {
  if (row.syntax === 'StringLiteral') return JSON.stringify(row.replacement)
  assert.equal(row.syntax, 'TemplateLiteral', `Unsupported syntax for row ${row.id}`)
  // Reviewed templates retain the exact expression text and order; never evaluate them.
  // Nested template literals belong to the interpolation syntax and must not be escaped.
  // Parsing below rejects any unescaped backtick in prose before a file can be written.
  return '`' + row.replacement + '`'
}
function englishExpressionStructure(value) {
  if (Array.isArray(value)) return value.map(englishExpressionStructure)
  if (!value || typeof value !== 'object') return value
  if (value.type === 'StringLiteral') return { type: value.type }
  if (value.type === 'TemplateElement') return { type: value.type, tail: value.tail }
  return Object.fromEntries(Object.entries(value).filter(([key]) => !ignored.has(key)).map(([key, child]) => [key, englishExpressionStructure(child)]))
}
const grouped = new Map()
for (const row of review.strings) {
  assert.ok(['retain', 'replace'].includes(row.decision), `Unreviewed row ${row.id}`)
  if (row.decision !== 'replace') continue
  assert.equal(row.kind, 'localized', `Only localized English replacements are supported: ${row.id}`)
  if (!grouped.has(row.file)) grouped.set(row.file, [])
  grouped.get(row.file).push(row)
}
const prepared = []
const omitted = []
for (const [file, candidates] of grouped) {
  const path = resolve(root, file)
  if (args.includes('--match') && !existsSync(path)) { omitted.push(...candidates.map(row => row.id)); continue }
  const source = readFileSync(path, 'utf8')
  const before = parser(source)
  let rows = candidates
  if (args.includes('--match')) {
    rows = []
    const printable = node => node.type === 'StringLiteral' ? node.value : node.type === 'TemplateLiteral'
      ? node.quasis.map((q, i) => q.value.cooked + (i < node.expressions.length ? '${' + source.slice(node.expressions[i].start, node.expressions[i].end) + '}' : '')).join('')
      : source.slice(node.start, node.end)
    const branch = (node, key) => {
      if (node.type === 'ConditionalExpression') { branch(node.consequent, key); branch(node.alternate, key); return }
      if (!['StringLiteral', 'TemplateLiteral'].includes(node.type)) return
      const row = candidates.find(row => row.source === key && row.english === printable(node))
      if (row) rows.push({ ...row, start: node.start, end: node.end })
    }
    const visit = node => {
      if (!node || typeof node !== 'object') return
      if (node.type === 'CallExpression' && node.callee.name === 'L' && node.arguments.length >= 2) branch(node.arguments[1], printable(node.arguments[0]))
      for (const [key, value] of Object.entries(node)) if (!ignored.has(key)) {
        if (Array.isArray(value)) value.forEach(visit)
        else if (value && typeof value.type === 'string') visit(value)
      }
    }
    visit(before)
    omitted.push(...candidates.filter(row => !rows.some(found => found.id === row.id)).map(row => row.id))
  }
  let cursor = 0
  let output = ''
  const restore = new Map()
  for (const row of rows.sort((a, b) => a.start - b.start)) {
    assert.ok(row.start >= cursor, `Overlapping rows in ${file}`)
    const oldText = source.slice(row.start, row.end)
    const oldNode = parser('(' + oldText + ')').program.body[0].expression
    assert.equal(oldNode.type, row.syntax, `Stale source: ${file}:${row.line}`)
    if (row.syntax === 'StringLiteral') assert.equal(oldNode.value, row.english, `Stale English: ${file}:${row.line}`)
    else assert.equal(oldText, '`' + row.english + '`', `Stale template: ${file}:${row.line}`)
    const text = literal(row)
    const nextNode = parser('(' + text + ')').program.body[0].expression
    if (row.syntax === 'TemplateLiteral') {
      const compare = row.englishExpressionLiterals ? englishExpressionStructure : structure
      assert.deepEqual(compare(nextNode.expressions), compare(oldNode.expressions), `Changed interpolation logic: ${row.id}`)
    }
    output += source.slice(cursor, row.start)
    restore.set(output.length, { end: output.length + text.length, node: oldNode })
    output += text
    cursor = row.end
  }
  output += source.slice(cursor)
  assert.deepEqual(structure(parser(output), restore), structure(before), `Non-copy AST change: ${file}`)
  if (rows.length) prepared.push({ file: path, output, count: rows.length })
}
// Finish every validation before any write, so a stale file leaves the source untouched.
if (args.includes('--write')) for (const item of prepared) writeFileSync(item.file, item.output)
console.log(JSON.stringify({ mode: args.includes('--write') ? 'applied' : 'validated', files: prepared.length, replacements: prepared.reduce((sum, item) => sum + item.count, 0), portugueseAndBehaviorUnchanged: true, omitted }))
