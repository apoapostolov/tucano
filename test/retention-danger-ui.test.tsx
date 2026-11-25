// The workspace's danger area is where the decision is made: the period beside the wipe, and the wipe
// that says what survives. A member is not offered any of it.
import { parseHTML } from 'linkedom'
import { act, type ReactNode } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { setLang } from '../src/shared/lang'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
Object.assign(window, { tucano: { workspaces: { delete: vi.fn(async () => {}) } } })
vi.mock('open-bot-avatar/dom', () => ({ mountAvatar: () => new Proxy({}, { get: () => () => {} }) }))

const mocks = vi.hoisted(() => ({ wipe: vi.fn(), update: vi.fn(), confirm: vi.fn() }))
let state: Record<string, unknown>
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return {
    ...real,
    useStore: <T,>(select: (s: Record<string, unknown>) => T): T => select(state),
    wipeHistory: (id?: string) => mocks.wipe(id),
    updateSettings: (patch: Record<string, unknown>) => mocks.update(patch),
    backupNow: vi.fn(async () => 'backup.zip'),
    openBackups: vi.fn()
  }
})
vi.mock('../src/renderer/src/components/Dialogs', () => ({
  confirmDialog: (o: unknown) => mocks.confirm(o),
  confirmDeleteAgent: vi.fn(),
  ContextMenu: () => null,
  Dialogs: () => null
}))

const { createRoot } = await import('react-dom/client')
const { WorkspaceDangerArea } = await import('../src/renderer/src/components/Pages')
const { settingsStructure } = await import('../src/renderer/src/settings-structure')
let root: ReturnType<typeof createRoot>

const button = (name: string): HTMLButtonElement => [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === name) as HTMLButtonElement
const click = async (element: Element): Promise<void> => {
  await act(async () => { element.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true })) })
}

beforeEach(() => {
  setLang('en')
  state = { you: 'ana', people: [{ id: 'ana', name: 'Ana', role: 'owner', about: '' }], settings: { workspaceName: 'Ana', retentionDays: 0 }, defaultWorkspace: true }
  mocks.wipe.mockReset().mockResolvedValue(6)
  mocks.update.mockReset()
  mocks.confirm.mockReset().mockResolvedValue(true)
  root = createRoot(document.getElementById('root')!)
})
afterEach(async () => act(async () => root.unmount()))

it('shows the period and both destructive controls in the Data and deletion area', async () => {
  const section = settingsStructure({ admin: true, owner: true, team: false, servers: false }).find((s) => s.id === 'workspace-danger')!
  expect(section.label).toBe('Data and deletion')
  await act(async () => root.render(<WorkspaceDangerArea />))
  const card = document.querySelector('.workspace-danger')!
  expect(card.getAttribute('aria-label')).toBe('Danger zone')
  expect(card.textContent).toContain('Keep sessions for')
  const days = card.querySelector('input[type="number"][aria-label="Days"]')
  expect(days).toBeTruthy()
  expect(days!.getAttribute('value') ?? (days as HTMLInputElement & { value: string }).value).toBe('0')
  expect(card.textContent).toContain('Zero keeps everything, for good. With 30, anything said or answered more than 30 days ago leaves the database in the daily cleanup.')
  expect(button('Wipe all conversations')).toBeTruthy()
  expect(button('Delete workspace and all data')).toBeTruthy()
  expect([...card.querySelectorAll('.workspace-danger__section h3')].map((h) => h.textContent)).toEqual(['Backups', 'History', 'Delete workspace'])
})

it('asks what survives before the wipe takes every message', async () => {
  let answer!: (ok: boolean) => void
  mocks.confirm.mockImplementation(() => new Promise<boolean>((resolve) => { answer = resolve }))
  await act(async () => root.render(<WorkspaceDangerArea />))
  await click(button('Wipe all conversations'))
  expect(mocks.confirm).toHaveBeenCalledWith(expect.objectContaining({
    title: 'Wipe all conversations?',
    body: 'Every message in every conversation is deleted. Agents, channels, memories and usage receipts stay. This cannot be undone.',
    confirm: 'Wipe all conversations',
    danger: true
  }))
  // Nothing goes before the person confirms, and the page asks for no agent: it is the whole workspace.
  expect(mocks.wipe).not.toHaveBeenCalled()
  await act(async () => { answer(true); await new Promise((resolve) => setTimeout(resolve, 0)) })
  expect(mocks.wipe).toHaveBeenCalledWith(undefined) // no agent id: the whole workspace
  expect(document.querySelector('[role="status"]')?.textContent).toBe('6 message(s) deleted.')
})

it('does not offer a member the danger area or the wipe', () => {
  const member = settingsStructure({ admin: false, owner: false, team: false, servers: false })
  expect(member.find((s) => s.id === 'workspace-danger')?.visible).toBe(false)
})
