import assert from 'node:assert/strict'

// Portuguese source text identifies meaning; exact English variants authorize an override.
export function planOverrides(rows, entries) {
  const approved = [], restore = [], review = [], ambiguous = []
  for (const row of rows) {
    if (row.kind !== 'localized') continue
    const matches = entries.filter(entry => entry.source === row.source && entry.files.includes(row.file) && (!entry.contexts || entry.contexts.includes(row.context)))
    if (!matches.length) continue
    const targets = [...new Set(matches.map(entry => entry.approved))]
    if (targets.length !== 1) {
      ambiguous.push({ file: row.file, line: row.line, source: row.source, targets })
      continue
    }
    const target = targets[0]
    if (row.english === target) approved.push(row)
    else if (matches.some(entry => entry.previous.includes(row.english))) restore.push({ ...row, decision: 'replace', replacement: target, englishExpressionLiterals: matches.some(entry => entry.englishExpressionLiterals), reason: 'Restore tracked, reviewed English after integration.' })
    else review.push({ ...row, approved: target, reason: 'Unfamiliar wording: review meaning before registering or replacing it.' })
  }
  return { approved, restore, review, ambiguous }
}

export function registerReview(rows, entries, review, provenance) {
  assert.ok(review.strings.length, 'Review must contain strings')
  const next = structuredClone(entries)
  let registered = 0
  for (const item of review.strings) {
    assert.ok(['replace', 'retain'].includes(item.decision), `Unreviewed string ${item.id}`)
    if (item.kind !== 'localized') continue
    const approved = item.decision === 'replace' ? item.replacement : item.english
    const current = rows.filter(row => row.kind === 'localized' && row.source === item.source && row.file === item.file)
    assert.ok(current.some(row => row.english === approved), `Approved text is absent: ${item.file}:${item.line}`)
    assert.ok(current.every(row => row.english === approved), `Context-dependent source requires a distinct key: ${item.file}:${item.line}`)
    let entry = next.find(entry => entry.source === item.source && entry.files.includes(item.file))
    if (!entry) {
      entry = { source: item.source, files: [item.file], approved, previous: [], reviews: [] }
      next.push(entry)
    }
    entry.previous = [...new Set([...entry.previous, entry.approved, item.english, item.previous].filter(text => typeof text === 'string' && text !== approved))]
    entry.approved = approved
    if (item.englishExpressionLiterals) entry.englishExpressionLiterals = true
    entry.reviews = [...new Set([...entry.reviews, provenance])]
    registered++
  }
  return { entries: next, registered }
}
