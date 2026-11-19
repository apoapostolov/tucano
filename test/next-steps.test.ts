// Next steps: an agent proposes the work that comes after its reply as a card of checkboxes, none of
// them ticked — the same as a question. The only boxes that come ticked are the ones a classifier
// assigned to that job in Settings › Classifiers says are worth doing now.
import { describe, expect, it } from 'vitest'
import { answerLabel, MAX_STEPS, parseNextSteps, startsTicked, type Decision } from '../src/shared/questions'
import { JEV_CLASSIFIER, type ClassifierConfig } from '../src/shared/classifiers'
import { stepsWorthDoing } from '../src/core/jev'

const four = (): Decision => {
  const r = parseNextSteps({
    question: 'O que vem agora?',
    steps: [
      { label: 'Rodar a suíte inteira', description: 'o que já está escrito' },
      { label: 'Traduzir os rótulos novos' },
      { label: 'Escrever o teste do card' },
      { label: 'Publicar as capturas' }
    ]
  })
  if ('error' in r) throw new Error(r.error)
  return r.decision
}

// A stand-in for TypeSafe: one request per step, answering `do` or `later` by the step number the
// state ends with, and keeping every request so the test can read what was asked.
function typesafe(picks: ('do' | 'later')[], status?: number) {
  const bodies: { model: string; state: string; questions: Record<string, { type: string; instructions: string; criteria: Record<string, string> }> }[] = []
  const f = (async (_url: string, init: RequestInit) => {
    const body = JSON.parse(init.body as string) as (typeof bodies)[number]
    bodies.push(body)
    if (status) return new Response('no', { status })
    const last = [...body.state.matchAll(/^(\d+)\. /gm)].pop()
    const i = Number(last?.[1] ?? 1) - 1
    return Response.json({ answers: { pick: { type: 'choice', choice: picks[i] ?? 'do', probabilities: {} } } })
  }) as unknown as typeof fetch
  return { f, bodies }
}

describe('what next_steps takes', () => {
  it('makes one multiple decision, marked as steps, with the question it was given', () => {
    const d = four()
    expect(d).toMatchObject({ question: 'O que vem agora?', kind: 'multiple', nextSteps: true })
    expect(d.options?.map((o) => o.label)).toEqual(['Rodar a suíte inteira', 'Traduzir os rótulos novos', 'Escrever o teste do card', 'Publicar as capturas'])
    expect(d.options?.[0]?.description).toBe('o que já está escrito')
    // Nothing says which side of the list is ticked: with no subset, no box starts ticked.
    expect(d.ticked).toBeUndefined()
  })

  it('takes a step as a bare string, and titles the card when it is not told one', () => {
    const r = parseNextSteps({ steps: ['Rodar os testes', 'Traduzir os rótulos'] })
    expect('decision' in r && r.decision.question).toBe('Por onde eu sigo?')
    expect('decision' in r && r.decision.options?.map((o) => o.label)).toEqual(['Rodar os testes', 'Traduzir os rótulos'])
  })

  it('refuses an empty list, too many steps, a repeated step and a label that is too long', () => {
    expect(parseNextSteps({ steps: [] })).toMatchObject({ error: expect.any(String) })
    expect(parseNextSteps({ steps: Array.from({ length: MAX_STEPS + 1 }, (_, i) => `Passo ${i + 1}`) })).toMatchObject({ error: expect.any(String) })
    expect(parseNextSteps({ steps: ['Rodar os testes', 'rodar OS testes'] })).toMatchObject({ error: expect.any(String) })
    expect(parseNextSteps({ steps: [{ label: 'x'.repeat(81) }] })).toMatchObject({ error: expect.any(String) })
    expect(parseNextSteps({ steps: [{ description: 'sem label' }] })).toMatchObject({ error: expect.any(String) })
  })

  it('a step written by hand reads as another step, not as something else', () => {
    expect(answerLabel(four(), { chosen: [0], other: 'Escrever a nota de lançamento' })).toBe('Rodar a suíte inteira, Outro passo: Escrever a nota de lançamento')
    expect(answerLabel({ question: 'Qual?', kind: 'multiple', options: [{ label: 'a' }, { label: 'b' }] }, { chosen: [0], other: 'c' })).toBe('a, Outra coisa: c')
  })
})

describe('which boxes start ticked', () => {
  it('none of them, on a next-steps list as on a question', () => {
    expect(startsTicked(four())).toEqual([])
    expect(startsTicked({ question: 'Qual?', kind: 'multiple', options: [{ label: 'a' }, { label: 'b' }] })).toEqual([])
  })

  it('only the ones ticked says, when the classifier picked a subset', () => {
    expect(startsTicked({ ...four(), ticked: [0, 2] })).toEqual([0, 2])
    // The classifier found nothing worth doing now: the card opens exactly as it does on its own.
    expect(startsTicked({ ...four(), ticked: [] })).toEqual([])
    // An index that no longer exists (a shorter list) is dropped rather than drawn.
    expect(startsTicked({ ...four(), ticked: [0, 9] })).toEqual([0])
  })
})

// A stand-in for OpenAI's Decisions API: the step is the last numbered line of `input`, and the
// answer comes back as an array, in the order the questions were asked.
function luna(picks: ('do' | 'later')[]) {
  const requests: { url: string; input: string }[] = []
  const f = (async (url: string, init: RequestInit) => {
    const body = JSON.parse(init.body as string) as { input: string }
    requests.push({ url, input: body.input })
    const last = [...body.input.matchAll(/^(\d+)\. /gm)].pop()
    const i = Number(last?.[1] ?? 1) - 1
    return Response.json({ answers: [{ type: 'choice', name: 'pick', choice: picks[i] ?? 'do' }] })
  }) as unknown as typeof fetch
  return { f, requests }
}

describe('the classifier and the steps', () => {
  const ask = (picks: ('do' | 'later')[], status?: number, target: ClassifierConfig = JEV_CLASSIFIER) => {
    const api = typesafe(picks, status)
    return { api, run: stepsWorthDoing({ target, key: 'ts-key', decision: four(), context: 'Terminei a issue #286.', fetch: api.f }) }
  }

  it('asks one question per step, each carrying the whole list and the step itself', async () => {
    const { api, run } = ask(['do', 'later', 'do', 'later'])
    const r = await run
    expect('ticked' in r && r.ticked).toEqual([0, 2])
    expect(api.bodies).toHaveLength(4)
    expect(api.bodies.every((b) => b.questions.pick?.type === 'choice')).toBe(true)
    // The step is in its own request: four calls over one identical state would be four blind guesses.
    const about = api.bodies.map((b) => [...b.state.matchAll(/^(\d+)\. /gm)].pop()?.[1]).sort()
    expect(about).toEqual(['1', '2', '3', '4'])
    expect(api.bodies.some((b) => b.state.includes('Publicar as capturas'))).toBe(true)
    expect(api.bodies.every((b) => b.questions.pick?.criteria['do'] && b.questions.pick?.criteria['later'])).toBe(true)
  })

  it('when every step can wait, nothing is ticked: the card opens as it does on its own', async () => {
    const { run } = ask(['later', 'later', 'later', 'later'])
    const r = await run
    expect('ticked' in r && r.ticked).toEqual([])
  })

  it('a failure is an error the caller can ignore, not a list of ticks nobody asked for', async () => {
    const { run } = ask(['do', 'do', 'do', 'do'], 500)
    expect(await run).toMatchObject({ error: expect.any(String) })
  })

  it('runs on whichever classifier the job is set to, not on TypeSafe by name', async () => {
    const api = luna(['do', 'later', 'do', 'later'])
    const r = await stepsWorthDoing({ target: { id: 'luna', name: 'Luna', provider: 'openai', model: 'gpt-6-luna' }, key: 'sk-o', decision: four(), fetch: api.f })
    expect('ticked' in r && r.ticked).toEqual([0, 2])
    expect(api.requests).toHaveLength(4)
    expect(api.requests.every((q) => q.url === 'https://api.openai.com/v1/decisions')).toBe(true)
  })
})
