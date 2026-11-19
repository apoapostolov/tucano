// A queued prompt says so at the foot of its own bubble: one dim full-caps line naming the queue and
// why it waits. Not a pill of its own under the message, and not two stacked lines.
import { readFileSync } from 'node:fs'
import { parseHTML } from 'linkedom'
import { act } from 'react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { setLang } from '../src/shared/lang'

setLang('en')

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
Object.assign(window, { innerWidth: 1280, innerHeight: 800 })

const { createRoot } = await import('react-dom/client')
const { QueuedNote } = await import('../src/renderer/src/components/Conversation')
const css = readFileSync(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')
const source = readFileSync(new URL('../src/renderer/src/components/Conversation.tsx', import.meta.url), 'utf8')

let root: Root
beforeEach(() => {
  root = createRoot(document.getElementById('root')!)
})
afterEach(() => act(() => root.unmount()))

it('says the prompt is queued and why, on one dim caps line', async () => {
  await act(async () => root.render(<QueuedNote />))
  const line = document.querySelector('.msg__queued-line')!
  expect(line.textContent).toBe('Queued · waiting for the reply above to finish')
  expect(line.getAttribute('title')).toBe('Goes when the reply above ends')
  // Dim, small, full caps: the house style for a label that is not the prompt itself.
  expect(css).toMatch(/\.msg__queued-line\s*\{[^}]*color:\s*var\(--text-3\)/)
  expect(css).toMatch(/\.msg__queued-line\s*\{[^}]*text-transform:\s*uppercase/)
  expect(css).toMatch(/\.msg__queued-line\s*\{[^}]*font-size:\s*10\.5px/)
  // And no second line under a first any more.
  expect(css).not.toMatch(/\.msg__queued-sub/)
  expect(document.querySelector('.msg__queued-sub')).toBeNull()
})

it('is drawn inside the prompt’s own bubble, not as a pill under the message', () => {
  // The mark comes after the prompt's own text, inside the `.md` bubble that carries it.
  expect(source).toMatch(/\{message\.sendMode === 'queue' && <QueuedNote \/>\}\s*<\/div>\s*\)\s*:\s*null\}/)
  // A prompt with no text at all has no bubble to carry it, so it keeps the mark on its own.
  expect(source).toMatch(/\{message\.sendMode === 'queue' && !text && <QueuedNote \/>\}/)
})
