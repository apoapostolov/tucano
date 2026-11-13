// A finding handed to an agent has to be closeable by that agent, or the list keeps a problem nobody is
// working on any more. The tools are the agent's side of it: list what is open, close what it settled.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { Wiki, wikiCall, wikiClose } from '../src/core/wiki'
import { handOffText } from '../src/core/wiki-handoff'

function wiki(): Wiki {
  const root = mkdtempSync(join(tmpdir(), 'tucano-wiki-close-'))
  const w = new Wiki({ dir: join(root, 'wiki'), indexPath: join(root, 'wiki.db') })
  w.init(false)
  const save = (title: string, body: string, kind = 'Projeto'): void => void w.save({ title, body, kind, by: 'me', byName: 'Ana' })
  save('Marcos Lima', 'Cliente da [[Reforma do apto 302]].', 'Pessoa')
  save('Reforma do apto 302', 'Do [[Marcos Lima]].\n\n## Situação\nAguardando resposta do orçamento.')
  save('Andamento da obra', 'A obra do [[Marcos Lima]] começou em novembro.')
  return w
}

const finding = (w: Wiki, kind: 'contradiction' | 'orphan' | 'missing' = 'contradiction', pages = ['Reforma do apto 302', 'Andamento da obra']): string => {
  w.setFindings([{ key: `${kind}:${pages.join('|')}`, kind, pages, text: 'Uma página diz que espera resposta, a outra que a obra começou.' }])
  return w.findings().find((f) => f.kind === kind)!.id
}

describe("an agent closing a finding it settled", () => {
  it('lists what is open, with the id it takes to close it', () => {
    const w = wiki()
    const id = finding(w)
    const listed = wikiCall(w, 'wiki_avisos', {})
    expect(listed.text).toContain(id)
    expect(listed.text).toContain('[[Reforma do apto 302]]')
    expect(listed.step.detail).toBe('1 aviso')

    // Nothing open: the agent is told so rather than given an empty line to guess about.
    w.dismissFinding(id)
    expect(wikiCall(w, 'wiki_avisos', {}).text).toMatch(/Nenhum aviso aberto/)
  })

  it('takes it off the list, and says who closed it and what changed', () => {
    const w = wiki()
    const id = finding(w)
    const closed = wikiClose(w, { name: 'Lia' }, { aviso: id, nota: 'A obra começou: a página da reforma diz isso agora.' })
    expect(closed.error).toBeUndefined()
    expect(closed.step.label).toBe('Fechou um aviso da wiki')
    expect(w.findings().some((f) => f.id === id)).toBe(false)
    expect(w.findings()).toHaveLength(0)
  })

  it('keeps it quiet on the next review, and says what was done if it comes back', () => {
    const w = wiki()
    const key = 'contradiction:Reforma do apto 302|Andamento da obra'
    const id = finding(w)
    wikiClose(w, { name: 'Lia' }, { aviso: id, nota: 'As duas páginas concordam agora.' })
    // The same review again: a closed finding is not said twice.
    w.setFindings([{ key, kind: 'contradiction', pages: ['Reforma do apto 302', 'Andamento da obra'], text: 'Uma página diz que espera resposta, a outra que a obra começou.' }])
    expect(w.findings()).toHaveLength(0)
  })

  it('refuses an id that is not an open finding, and says where to look', () => {
    const w = wiki()
    const id = finding(w)
    wikiClose(w, { name: 'Lia' }, { aviso: id })
    const again = wikiClose(w, { name: 'Lia' }, { aviso: id })
    expect(again.error).toBe(true)
    expect(again.text).toMatch(/wiki_avisos/)
    const missing = wikiClose(w, { name: 'Lia' }, {})
    expect(missing.error).toBe(true)
  })

  it('stays in the list while it is with an agent, and says whose hands it is in', () => {
    const w = wiki()
    const id = finding(w)
    w.handOffFinding(id, 'lia')
    const [open] = w.findings()
    expect(open?.id).toBe(id)
    expect(open?.note).toMatch(/@lia/)
  })

  it('tells the agent, in the request itself, to close it and which id to close', () => {
    const w = wiki()
    const id = finding(w)
    const f = w.findings()[0]!
    const text = handOffText(f, (t) => w.page(t))
    expect(text).toContain(id)
    expect(text).toContain('wiki_fechar')
    expect(text).toMatch(/só sai da lista quando você fecha/i)
  })
})
