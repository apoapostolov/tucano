export interface SettingsWrite {
  key: string
  section: string | null
  component?: string
  file: string
  line: number
}
export interface SettingsDrawnWrite {
  key: string
  card: string | null
  component: string
  owner: string
  file: string
  line: number
}
export interface SettingsUnownedCard {
  card: string
  reason: string
}
export interface SettingsUnsectionedKey {
  key: string
  reason: string
}
export interface SettingsPlacementReport {
  sections: number
  keys: number
  tabs: number
  renderedSections: number
  unownedCards: string[]
  checkedWrites: number
  scopedWrites: number
  unplacedWrites: number
  drawnOutsideOwner: SettingsDrawnWrite[]
  panes: string[]
  writes: SettingsWrite[]
  failures: string[]
  passed: boolean
}
export interface SettingsPlacementOptions {
  /** Source overrides keyed by repository-relative path, so a test can break the page in memory. */
  files?: Record<string, string>
}
export const UNOWNED_CARDS: readonly SettingsUnownedCard[]
export const UNSECTIONED_KEYS: readonly SettingsUnsectionedKey[]
export function inspectSettingsPlacement(workspace: string, options?: SettingsPlacementOptions): SettingsPlacementReport
