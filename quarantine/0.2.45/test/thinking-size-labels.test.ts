// Settings › The conversation draws its choices from tables that call `L()`. A table built at import is
// written before the app knows which language it speaks, so an English window kept the Portuguese
// labels of the reasoning sizes. This imports the page first, then switches the language, which is what
// the app does on startup: the labels have to follow.
import { expect, it } from 'vitest'
import { setLang } from '../src/shared/lang'

// Imported while the language is still the default: a table frozen at this moment is the bug.
const { THINKING_SIZES } = await import('../src/renderer/src/components/Pages')

it('names the reasoning sizes in the language the window speaks, not the one it imported in', () => {
  setLang('en')
  expect(THINKING_SIZES().map((c) => c.label)).toEqual(['Small', 'Medium', 'Large'])
  expect(THINKING_SIZES().map((c) => c.hint)).toEqual(['6 lines before scrolling.', '12 lines before scrolling.', '18 lines before scrolling.'])

  setLang('pt')
  expect(THINKING_SIZES().map((c) => c.label)).toEqual(['Pequeno', 'Médio', 'Grande'])

  setLang('en')
})
