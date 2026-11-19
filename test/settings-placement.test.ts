import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { inspectSettingsPlacement } from '../scripts/lib/settings-placement.mjs'

// The check runs over the real page and structure files; each case below breaks one of them in
// memory (the overrides map) so the failure is proved without editing the tree.
const root = fileURLToPath(new URL('..', import.meta.url))
const PAGES = 'src/renderer/src/components/Pages.tsx'
const STRUCTURE = 'src/renderer/src/settings-structure.ts'
const source = (path: string): string => readFileSync(join(root, path), 'utf8').replace(/\r\n/g, '\n')
const pages = source(PAGES)
const structure = source(STRUCTURE)

const broken = (path: string, from: string, to: string): Record<string, string> => {
  const current = path === PAGES ? pages : structure
  const next = current.replace(from, to)
  expect(next, `fixture text not found in ${path}: ${from.slice(0, 80)}`).not.toBe(current)
  return { [path]: next }
}
const failures = (files: Record<string, string> = {}): string[] => inspectSettingsPlacement(root, { files }).failures

describe('settings placement', () => {
  it('passes on the pane layout, with no content map', () => {
    const report = inspectSettingsPlacement(root)
    expect(report.failures).toEqual([])
    expect(report.passed).toBe(true)
    expect(report.sections).toBe(36)
    expect(report.tabs).toBe(7)
    expect(report.renderedSections).toBe(25)
    expect(report.panes).toEqual(['agentes', 'atividade', 'geral', 'integracoes', 'modelos', 'pessoas', 'servidores'])
    expect(report.unownedCards).toEqual(['Talk to the people who make Tucano', 'Sidebar', 'Recovery', 'Browser Use', 'Skill folders'])
  })

  it('fails when a declared section loses its anchor', () => {
    const files = broken(PAGES, 'section="app-notifications">', '>')
    expect(failures(files)).toContain('Section app-notifications is listed for tab geral, but no card renders its anchor')
  })

  it('fails when a section is rendered twice', () => {
    const files = broken(
      PAGES,
      '        {pane(\'modelos\') && (\n          <Card\n            title="Harnesses"',
      '        {pane(\'modelos\') && <Card title="Copy" section="app-appearance" />}\n\n        {pane(\'modelos\') && (\n          <Card\n            title="Harnesses"'
    )
    const found = failures(files)
    expect(found.some(failure => failure.startsWith('Section is rendered 2 times: app-appearance'))).toBe(true)
    expect(found.some(failure => failure.startsWith('Section app-appearance belongs to tab geral but is rendered in pane modelos'))).toBe(true)
  })

  it('fails when a card is drawn in the wrong pane', () => {
    const files = broken(
      PAGES,
      '        {pane(\'modelos\') && (\n          <Card\n            title="Classifiers"',
      '        {pane(\'geral\') && (\n          <Card\n            title="Classifiers"'
    )
    const found = failures(files)
    expect(found.some(failure => failure.startsWith('Section models-classifiers belongs to tab modelos but is rendered in pane geral'))).toBe(true)
  })

  it('fails when a card claims a section the structure does not declare', () => {
    const files = broken(PAGES, 'section="models-router"', 'section="models-route"')
    const found = failures(files)
    expect(found.some(failure => failure.startsWith('Undeclared section rendered: models-route'))).toBe(true)
    expect(found).toContain('Section models-router is listed for tab modelos, but no card renders its anchor')
  })

  it('fails when a settings card has no section', () => {
    const files = broken(
      PAGES,
      '        {pane(\'geral\') && admin && (\n          <Card title={L(\'Atualizações\', \'Updates\')} section="app-updates">',
      '        {pane(\'geral\') && <Card title="Brand new" />}\n\n        {pane(\'geral\') && admin && (\n          <Card title={L(\'Atualizações\', \'Updates\')} section="app-updates">'
    )
    expect(failures(files).some(failure => failure.startsWith('Settings card is not owned by a section: Brand new'))).toBe(true)
  })

  it('fails when a card writes a setting no section declares', () => {
    const files = broken(PAGES, 'updateSettings({ hideEmptyApprovals: v })', 'updateSettings({ hideEmptyApproval: v })')
    expect(failures(files).some(failure => failure.startsWith('hideEmptyApproval is written in') && failure.includes('declares no section for it'))).toBe(true)
  })

  it('fails when a tab in the structure is not a tab of the page', () => {
    const files = broken(STRUCTURE, '  geral: [', '  geral2: [')
    expect(failures(files)).toContain('settings-structure.ts lists sections for tab geral2, which the Settings page does not declare in SETTINGS_TABS')
  })

  it('fails when two sections claim the same setting', () => {
    const files = broken(STRUCTURE, "keys: ['hideEmptyAsks', 'hideEmptyApprovals', 'navOrder', 'navHidden', 'sectorOrder']", "keys: ['hideEmptyAsks', 'hideEmptyApprovals', 'navOrder', 'navHidden', 'theme']")
    expect(failures(files)).toContain('theme is owned by both app-appearance and app-sidebar')
  })
})
