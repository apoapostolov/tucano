import type { ElectronApplication, Locator, Page } from 'playwright'

export interface ScreenRun {
  area: string | null
  script: string | null
  out: string | null
  size: string | null
  tag: string
  app: string | null
  mode: string
  allowErrors: string[]
  frames?: string[]
  writes?: string[]
}

export interface ScreenSession {
  app: ElectronApplication
  win: Page
  data: string
  out: string
  size: string
  tag: string
  errors: string[]
  frames: string[]
  closed: boolean
  ownsData: boolean
}

export type ScreenTarget = ScreenSession | Page

export interface ScreenBox {
  x: number
  y: number
  w: number
  h: number
}

export interface ScreenMeasurement {
  selector: string
  index: number
  props: Record<string, string | null>
  box: ScreenBox
  frame?: string
  data?: unknown
  note?: string
}

export interface ScreenMeta {
  script?: string
  story?: string
  size?: string
  tag?: string
  area?: string
  mode?: string
  app?: string
  head?: string
  dirty?: boolean
  data?: unknown
}

export const ROOT: string
export const LIB: string
export function libSha256(): string
export function setRun(patch?: Partial<ScreenRun>): void
export function runInfo(): ScreenRun & { lib: string; libSha256: string }
export function parseSize(size: string): { width: number; height: number }
export function measureInPage(input: { selector: string; props?: string[] }): Array<Omit<ScreenMeasurement, 'selector'>>
export function openApp(options?: {
  size?: string
  out?: string
  tag?: string
  data?: string
  seed?: number
  locale?: string
  env?: Record<string, string>
  fake?: boolean
  app?: string
  profile?: boolean
}): Promise<ScreenSession>
export function shot(target: ScreenTarget, name: string, element?: string): Promise<string>
export function settle(target: ScreenTarget, ms?: number): Promise<void>
export function until(target: ScreenTarget, selector: string, options?: { nth?: number; state?: 'visible' | 'attached' | 'hidden' | 'detached'; timeout?: number }): Promise<Locator>
export function idle(target: ScreenTarget, options?: { step?: number; quiet?: number; timeout?: number; ms?: number }): Promise<void>
export function measure(target: ScreenTarget, selector: string, props?: string[], options?: { optional?: boolean }): Promise<ScreenMeasurement[]>
export function writeFrames(out: string, rows: Array<Partial<ScreenMeasurement> & { selector: string }>, meta?: ScreenMeta): string
export function close(target: ScreenTarget): Promise<void>
export function closeAll(): Promise<void>
export function cleanup(): void
export function runErrors(): string[]
export function runOutput(): { frames: string[]; framesJson: string[] }
