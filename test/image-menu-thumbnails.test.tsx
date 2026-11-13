// A picture in a reply offers the same right-click menu whether it stands alone or is a cell of the
// album, and "Send to prompt" puts the picture's full size in that conversation's field, the way a
// dropped file would arrive.
import { parseHTML } from 'linkedom'
import { act } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Artifact } from '../src/shared/types'
import type { State } from '../src/renderer/src/store'

const { window, document } = parseHTML('<!doctype html><html><body><div id="root"></div></body></html>')
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, Element: window.Element, Node: window.Node, IS_REACT_ACT_ENVIRONMENT: true })
Object.assign(window, { innerWidth: 1280, innerHeight: 800 })
window.HTMLElement.prototype.getBoundingClientRect = () => ({ top: 100, bottom: 136, left: 100, right: 300, width: 200, height: 36, x: 100, y: 100, toJSON: () => ({}) })

let fake: State
vi.mock('../src/renderer/src/store', async (original) => {
  const real = await original<typeof import('../src/renderer/src/store')>()
  return { ...real, useStore: <T,>(select: (s: State) => T): T => select(fake) }
})
const { getState } = await import('../src/renderer/src/store')
const { onComposerImages } = await import('../src/renderer/src/composer-attach')
const { setLang } = await import('../src/shared/lang')
const { createRoot } = await import('react-dom/client')
const { ArtifactGallery } = await import('../src/renderer/src/components/Panel')
const { ImageMenu } = await import('../src/renderer/src/components/ImageMenu')

const art = (id: string, title: string): Artifact => ({
  id,
  agentId: 'a1',
  conversationId: 'd1',
  messageId: 'm1',
  kind: 'image',
  name: `${id}.png`,
  title,
  source: `C:/tmp/${id}`,
  size: 1000,
  createdAt: 1
})
let root: ReturnType<typeof createRoot>
const render = async (artifacts: Artifact[]): Promise<void> => {
  fake = { ...getState(), artifacts }
  root = createRoot(document.getElementById('root')!)
  await act(async () => {
    root.render(
      <>
        <ArtifactGallery ids={artifacts.map((a) => a.id)} />
        <ImageMenu />
      </>
    )
  })
}
// A right-click carries the pointer with it; linkedom takes those on the event object itself.
const rightClick = async (el: Element): Promise<void> => {
  const e = new window.Event('contextmenu', { bubbles: true, cancelable: true }) as Event & { clientX: number; clientY: number }
  e.clientX = 120
  e.clientY = 80
  await act(async () => {
    el.dispatchEvent(e)
  })
}
const menuItems = (): string[] => [...document.querySelectorAll('[role="menuitem"]')].map((b) => b.textContent ?? '')
const pressItem = async (label: string): Promise<void> => {
  const item = [...document.querySelectorAll('[role="menuitem"]')].find((b) => b.textContent === label)
  expect(item, `a menu item reading “${label}”`).toBeTruthy()
  await act(async () => {
    item!.dispatchEvent(new window.Event('click', { bubbles: true }))
  })
}

beforeEach(() => {
  setLang('en')
  // The installed app supplies Downloads before the first save, so the menu already offers
  // a one-click destination as well as the dialog. Keep that path available in this fixture.
  Object.assign(window, { tucano: { image: { folder: async () => ({ folder: 'C:/Users/someone/Downloads' }), read: async () => ({ mime: 'image/png', data: 'AAAA' }) } } })
})
afterEach(async () => {
  await act(async () => root.unmount())
})

// The single picture always had the menu; the album's cells are the ones that were silent.
it('opens the menu on a cell of the album, with every way out of it', async () => {
  await render([art('i1', 'Primeira'), art('i2', 'Segunda'), art('i3', 'Terceira')])
  const cell = document.querySelector('.gallery__cell:not(.gallery__cell--hero)')!
  expect(cell, 'a cell beside the large one').toBeTruthy()
  await rightClick(cell)
  expect(menuItems()).toEqual(['Save as…', 'Save to Downloads', 'Copy to clipboard', 'Send to prompt'])
})

it('offers the same menu on a picture that stands alone', async () => {
  await render([art('i1', 'Primeira')])
  await rightClick(document.querySelector('.artifact-image')!)
  expect(menuItems()).toEqual(['Save as…', 'Save to Downloads', 'Copy to clipboard', 'Send to prompt'])
})

// The point of the last item: the picture arrives in the field of the conversation it came from, at
// its full size, as the composer holds an attachment.
it('sends the full picture to the composer of its conversation', async () => {
  const arrived: { name: string; mime: string; data: string; url: string }[][] = []
  const stop = onComposerImages('d1', (images) => arrived.push(images))
  try {
    await render([art('i1', 'Primeira'), art('i2', 'Segunda')])
    await rightClick(document.querySelector('.gallery__cell:not(.gallery__cell--hero)')!)
    await pressItem('Send to prompt')
  } finally {
    stop()
  }
  expect(arrived).toHaveLength(1)
  expect(arrived[0]).toHaveLength(1)
  expect(arrived[0]![0]).toMatchObject({ name: 'Segunda.png', mime: 'image/png', data: 'AAAA' })
})
