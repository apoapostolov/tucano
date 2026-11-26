// Manage workspaces: each row carries its own picture, and the picture window takes an image from a
// file, the clipboard or an https address. The same window clears it. Nothing here reads another
// workspace's picture, and a saved picture comes back through the workspace list.
import { readFileSync } from 'node:fs'
import { parseHTML } from 'linkedom'
import { act, type ReactNode } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { setLang } from '../src/shared/lang'
import type { WorkspaceList } from '../src/shared/workspaces'
const { window, document } = parseHTML('<html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })

const png = 'data:image/png;base64,AAAA'
let list: WorkspaceList
const updateSettings = vi.fn()
const toast = vi.fn()
vi.mock('../src/renderer/src/store', () => ({
  useStore: (select: (s: unknown) => unknown) => select({ settings: { onboarding: { done: true, workspaceManagerSeen: true } } }),
  updateSettings,
  toast
}))
vi.mock('../src/renderer/src/components/Workspaces', () => ({ useWorkspaceList: () => ({ list, error: '' }) }))
vi.mock('../src/renderer/src/components/Modal', () => ({
  Modal: ({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) =>
    <div className="modal" role="dialog" aria-label={title}><strong>{title}</strong>{actions}{children}</div>
}))
vi.mock('../src/renderer/src/components/ui', () => ({ Icon: ({ name }: { name: string }) => <span data-icon={name} /> }))
vi.mock('../src/renderer/src/connector-icon', () => ({
  iconFromFile: vi.fn(async (file: File) => `data:image/png;base64,${file.name}`),
  iconFromAddress: vi.fn(async (url: string) => `data:image/png;base64,${url}`),
  imageFromClipboard: vi.fn(async () => new File(['clip'], 'clipboard.png', { type: 'image/png' }))
}))

const { iconFromFile, iconFromAddress, imageFromClipboard } = await import('../src/renderer/src/connector-icon')
const { createRoot } = await import('react-dom/client')
const { WorkspaceManager } = await import('../src/renderer/src/components/WorkspaceManager')
let root: ReturnType<typeof createRoot>
const setPicture = vi.fn(async (id: string, picture: string): Promise<void> => {
  list = { ...list, workspaces: list.workspaces.map((w) => w.id === id ? { ...w, picture } : w) }
})
const work = (id: string, name: string, picture = ''): WorkspaceList['workspaces'][number] => ({ id, name, picture, isDefault: id === 'a', paused: false, unread: 0, approvals: 0, status: 'ready' })
const render = async (): Promise<void> => act(async () => root.render(<WorkspaceManager onClose={() => {}} />))
const view = (): Element => document.getElementById('root')!
const button = (scope: ParentNode, text: string): Element => [...scope.querySelectorAll('button')].find((b) => b.textContent?.includes(text))!
const click = async (el: Element): Promise<void> => act(async () => { el.dispatchEvent(new window.Event('click', { bubbles: true })) })
const change = async (el: Element): Promise<void> => act(async () => { el.dispatchEvent(new window.Event('change', { bubbles: true })) })
// linkedom does not carry a native `input` into React's onChange, so the field is filled through
// the handler React put on it, with what the person typed.
const type = async (el: Element, value: string): Promise<void> => {
  const props = Object.keys(el).find((k) => k.startsWith('__reactProps$'))!
  const onChange = (el as unknown as Record<string, { onChange: (e: unknown) => void }>)[props]!.onChange
  await act(async () => onChange({ target: { value } }))
}
const windowOf = (): Element => [...document.querySelectorAll('[role="dialog"]')].find((d) => d.getAttribute('aria-label') === 'Workspace picture')!
const thumb = (index: number): Element => view().querySelectorAll('.workspace-picture__thumb')[index]!

beforeEach(async () => {
  setLang('en')
  list = { selected: 'a', workspaces: [work('a', 'Alpha', png), work('b', 'Beta')] }
  setPicture.mockClear()
  toast.mockClear()
  vi.mocked(iconFromFile).mockClear()
  vi.mocked(iconFromAddress).mockClear()
  vi.mocked(imageFromClipboard).mockClear()
  Object.assign(window, { tucano: { workspaces: { setPicture } } })
  root = createRoot(document.getElementById('root')!)
  await render()
})
afterEach(async () => { await act(async () => root.unmount()) })

it('gives every row a thumbnail with its own picture or the neutral placeholder and an edit glyph', async () => {
  const thumbs = view().querySelectorAll('.workspace-picture__thumb')
  expect(thumbs).toHaveLength(2)
  expect(thumbs[0]!.querySelector('img')?.getAttribute('src')).toBe(png)
  expect(thumbs[1]!.querySelector('img')).toBeNull()
  expect(thumbs[1]!.querySelector('[data-icon="layers"]')).not.toBeNull()
  for (const t of thumbs) {
    expect(t.querySelector('.workspace-picture__face')).not.toBeNull()
    expect(t.querySelector('.workspace-picture__edit')).not.toBeNull()
    expect(t.getAttribute('aria-label')).toMatch(/imagem|picture/i)
  }
  // The glyph is shown on hover and on keyboard focus, and the new target is at least 32 px.
  const css = readFileSync('src/renderer/src/styles.css', 'utf8')
  expect(css).toContain('.workspace-picture__thumb:hover .workspace-picture__edit, .workspace-picture__thumb:focus-visible .workspace-picture__edit { opacity: 1; }')
  expect(css).toMatch(/\.workspace-picture__thumb\s*\{[^}]*width: 40px; height: 40px;/)
  expect(css).toContain('.workspace-picture__face img { display: block; width: 100%; height: 100%; padding: 2px; border-radius: 9px; object-fit: contain; }')
})

it('opens the picture window from a row and shows the dotted empty placeholder', async () => {
  await click(thumb(1))
  const modal = windowOf()
  expect(modal).toBeDefined()
  expect(modal.querySelector('.workspace-picture__placeholder')?.textContent).toContain('No picture')
  expect(button(modal, 'Use the default')).toBeUndefined()
  expect(modal.querySelector('input[type="file"]')?.getAttribute('accept')).toBe('image/png,image/jpeg,image/webp,image/gif,image/svg+xml')
})

it('takes a pasted image and a pasted address through the connector picture path', async () => {
  await click(thumb(1))
  const modal = windowOf()
  const clip = new window.Event('paste', { bubbles: true }) as Event & { clipboardData?: unknown }
  Object.defineProperty(clip, 'clipboardData', { value: { items: [{ type: 'image/png', getAsFile: () => new File(['clip'], 'pasted.png', { type: 'image/png' }) }] } })
  await act(async () => { modal.dispatchEvent(clip) })
  expect(iconFromFile).toHaveBeenCalled()
  expect(setPicture).toHaveBeenCalledWith('b', 'data:image/png;base64,pasted.png')

  const field = modal.querySelector('input[type="url"]')!
  await type(field, 'https://example.com/logo.png')
  await click(button(modal, 'Add'))
  expect(iconFromAddress).toHaveBeenCalledWith('https://example.com/logo.png')
  expect(setPicture).toHaveBeenLastCalledWith('b', 'data:image/png;base64,https://example.com/logo.png')
})

it('picks a file through the OS picker and toasts a refused address without saving it', async () => {
  await click(thumb(1))
  const modal = windowOf()
  const file = modal.querySelector('input[type="file"]') as unknown as HTMLInputElement
  Object.defineProperty(file, 'files', { configurable: true, value: [new File(['pic'], 'chosen.png', { type: 'image/png' })] })
  await change(file)
  expect(setPicture).toHaveBeenCalledWith('b', 'data:image/png;base64,chosen.png')

  vi.mocked(iconFromAddress).mockRejectedValueOnce(new Error('The image address must start with https://.'))
  await type(modal.querySelector('input[type="url"]')!, 'http://example.com/logo.png')
  await click(button(modal, 'Add'))
  expect(toast).toHaveBeenCalledWith(expect.stringMatching(/https/))
  expect(setPicture).toHaveBeenCalledTimes(1)
})

it('uses the clipboard button and clears a picture back to the placeholder', async () => {
  await click(thumb(0))
  const modal = windowOf()
  await click(button(modal, 'Paste image'))
  expect(imageFromClipboard).toHaveBeenCalled()
  expect(setPicture).toHaveBeenLastCalledWith('a', 'data:image/png;base64,clipboard.png')

  await click(button(modal, 'Use the default'))
  expect(setPicture).toHaveBeenLastCalledWith('a', '')
  expect(modal.querySelector('.workspace-picture__placeholder')?.textContent).toContain('No picture')
})

it('saves a picture to one workspace and reads it back there without touching the other', async () => {
  await click(thumb(1))
  await click(button(windowOf(), 'Choose image'))
  const modal = windowOf()
  const file = modal.querySelector('input[type="file"]') as unknown as HTMLInputElement
  Object.defineProperty(file, 'files', { configurable: true, value: [new File(['pic'], 'beta.png', { type: 'image/png' })] })
  await change(file)
  expect(setPicture).toHaveBeenCalledTimes(1)
  await render() // the workspace list the app publishes after the core saved the picture
  expect(thumb(0)!.querySelector('img')?.getAttribute('src')).toBe(png)
  expect(thumb(1)!.querySelector('img')?.getAttribute('src')).toBe('data:image/png;base64,beta.png')
})
