export interface ReadingLine { offset: number; top: number }

export function lineTop(block: HTMLElement, offset: number): number | null {
  const text = block.querySelector('.thought__text')?.firstChild
  if (!text || text.nodeType !== 3 || offset >= (text.textContent?.length ?? 0) || !document.createRange) return null
  const range = document.createRange()
  if (!range.getBoundingClientRect) return null
  range.setStart(text, offset)
  range.setEnd(text, offset + 1)
  const rect = range.getBoundingClientRect()
  return rect.height > 0 ? rect.top : null
}

// A character identifies the reading line even when wrapping or surrounding content changes.
export function captureLine(block: HTMLElement): ReadingLine | null {
  const length = block.querySelector('.thought__text')?.textContent?.length ?? 0
  if (!length) return null
  const target = Math.max(block.getBoundingClientRect().top, 0) + Math.min(30, block.clientHeight / 2)
  let low = 0
  let high = length - 1
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    const top = lineTop(block, middle)
    if (top === null) return null
    if (top < target) low = middle + 1
    else high = middle
  }
  const top = lineTop(block, low)
  return top === null ? null : { offset: low, top }
}
