import { createContext } from 'react'

export const Reading = createContext<{
  hold: (el: HTMLElement | null, preserve: () => void, rebase: () => void) => void
  release: (el: HTMLElement | null) => void
  forget: (el: HTMLElement | null) => void
  preserve: () => void
  // Whether the list around the block is still following the reply's end: a block that keeps taking its
  // own stream up while the person reads by scrolling the page is the same fault one level in.
  follows: () => boolean
}>({
  hold: () => {},
  release: () => {},
  forget: () => {},
  preserve: () => {},
  follows: () => true
})
