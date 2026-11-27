// The desktop registry exposes metadata and counts, never another workspace's content.
import { L } from './lang'
import type { Settings } from './types'

// What a workspace is called on screen: its own name, or else the person's (one workspace, as before).
export const workspaceLabel = (s: Pick<Settings, 'workspaceName' | 'workspaceLabel'>): string => s.workspaceLabel?.trim() || s.workspaceName

// The general settings: how things work, not what the workspace holds (never its context, wiki
// folder, accounts, keys or phone).
export const GENERAL_SETTINGS = ['workspaceName', 'workspacePicture', 'language', 'clock', 'routerModel', 'routerEffort', 'memoryModel', 'memoryEffort', 'memoryLearning', 'defaultFallbackModel', 'defaultLimit', 'approvalTtlHours', 'runBudgetPct', 'autoContinue', 'runStallMinutes', 'actionRules', 'autonomy', 'outsideGuard', 'tucaApplyNow', 'quietHours', 'harnesses', 'sounds', 'stepsOpen', 'steps', 'stepsLatest', 'showThinking', 'proceedButton', 'thinkingSize', 'replyShortcut', 'voice', 'browserJev', 'browserAddOns', 'browserAccessibility', 'classifiers', 'classifierJobs', 'wikiCapture', 'wikiEdits', 'wikiReview'] as const satisfies readonly (keyof Settings)[]
// What a new workspace takes from another, each picked when creating it (a duplicate takes it all).
// The wiki isn't copied: the new workspace uses the same one, and what one keeps the other reads.
// Never messages, memories, approvals, usage, computers' files, browser sessions or extra logins.
export const WORKSPACE_PARTS = ['general', 'context', 'wiki', 'agents', 'channels', 'skills', 'connectors', 'routines'] as const
export type WorkspacePart = (typeof WORKSPACE_PARTS)[number]
export type WorkspaceParts = Record<WorkspacePart, boolean>
export const ALL_PARTS: WorkspaceParts = { general: true, context: true, wiki: true, agents: true, channels: true, skills: true, connectors: true, routines: true }

export function workspaceParts(raw: unknown): WorkspaceParts {
  const from = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  const parts = Object.fromEntries(WORKSPACE_PARTS.map((p) => [p, from[p] === true])) as WorkspaceParts
  return { ...parts, routines: parts.routines && parts.agents } // a routine is an agent's
}

export function isTheme(value: unknown): value is Settings['theme'] {
  return value === 'system' || value === 'light' || value === 'dark'
}

export interface Workspace {
  id: string
  name: string
  dataDir: string
  webhookPort: number
  gitPort: number
  isDefault: boolean
}

export interface WorkspaceSummary {
  id: string
  name: string
  picture?: string // the workspace's own picture, a small data URL or an https address
  isDefault: boolean
  paused: boolean
  unread: number
  approvals: number
  status: 'starting' | 'ready' | 'failed'
}

export interface WorkspaceList {
  selected: string
  workspaces: WorkspaceSummary[]
}

// UUIDv7: bytes 0-5 (48 bits) = Unix timestamp in milliseconds.
export function workspaceCreatedAt(id: string): number {
  return parseInt(id.replace(/-/g, '').slice(0, 12), 16)
}

export function sortWorkspaces(workspaces: WorkspaceSummary[] | undefined | null): WorkspaceSummary[] {
  if (!workspaces) return []
  return [...workspaces].sort((a, b) => {
    const nameCmp = a.name.localeCompare(b.name)
    if (nameCmp !== 0) return nameCmp
    return workspaceCreatedAt(a.id) - workspaceCreatedAt(b.id)
  })
}

// The same picture kinds the connector icon accepts: a small data URL or an https address. The
// renderer shrinks bitmaps before they get here; every process that writes one checks the value again.
const PICTURE_DATA_URL = /^data:image\/(?:png|jpeg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/]+={0,2}$/
const PICTURE_HTTPS = /^https:\/\/\S+$/i
const PICTURE_UNSAFE_SVG = /<script|javascript:|<foreignObject|on\w+\s*=/i
const PICTURE_MAX_CHARS = 32_000
const PICTURE_URL_MAX_CHARS = 2_048

export function workspacePictureError(value: string): string | undefined {
  const picture = value.trim()
  if (!picture) return undefined // clearing goes back to the placeholder
  if (picture.length > (picture.startsWith('data:') ? PICTURE_MAX_CHARS : PICTURE_URL_MAX_CHARS))
    return L('A imagem é grande demais para um workspace. Escolha uma menor.', 'That image is too big for a workspace. Pick a smaller one.')
  if (PICTURE_DATA_URL.test(picture)) {
    if (picture.startsWith('data:image/svg+xml;base64,')) {
      const svg = atob(picture.slice('data:image/svg+xml;base64,'.length))
      if (PICTURE_UNSAFE_SVG.test(svg))
        return L('Esse SVG tem script ou HTML dentro, e uma imagem não pode ter.', 'That SVG carries a script or HTML inside, and a picture cannot.')
    }
    return undefined
  }
  if (PICTURE_HTTPS.test(picture)) {
    try {
      if (new URL(picture).protocol === 'https:') return undefined
    } catch {
      // the message below names what is allowed
    }
  }
  return L('Isso não é uma imagem (PNG, JPEG, WebP, GIF ou SVG) nem um endereço https.', 'That is not an image (PNG, JPEG, WebP, GIF or SVG) or an https address.')
}

export function suggestWorkspaceCopyName(name: string, existing: string[]): string {
  const taken = new Set(existing)
  for (let count = 2; ; count++) {
    const suffix = ` (${count})`
    const candidate = `${name.trim().slice(0, 120 - suffix.length).trimEnd()}${suffix}`
    if (!taken.has(candidate)) return candidate
  }
}
