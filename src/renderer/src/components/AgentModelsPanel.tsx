import { useRef, useState, type ReactNode } from 'react'
import { L } from '../../../shared/lang'
import { ENGINES, modelInfo, type Agent, type Effort } from '../../../shared/types'
import { amAdmin, setAgentModels, useStore } from '../store'
import { ModelPicker } from './Harness'
import { AgentAvatar } from './ui'

export function AgentModelsPanel(): ReactNode {
  const agents = useStore((s) => s.agents)
  const admin = useStore(amAdmin)
  const [search, setSearch] = useState('')
  const [archived, setArchived] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [model, setModel] = useState('')
  const [fallback, setFallback] = useState('')
  const [effort, setEffort] = useState<Effort | null>(null)
  const [busy, setBusy] = useState(false)
  const saving = useRef(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const scope = agents.filter((a) => !a.deleted && (archived || !a.archived))
  const visible = scope.filter((a) => `${a.name} ${a.handle}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
  const targets = scope.filter((a) => selected.includes(a.id))
  const allVisible = visible.length > 0 && visible.every((a) => selected.includes(a.id))
  // Each field left empty is left alone: a level alone moves only levels, and a fallback alone moves
  // only reserves. A row's Save sends just its own choices.
  const save = async (ids: string[], value: string, level?: Effort | null, reserveModel?: string): Promise<boolean> => {
    const main = value.trim()
    const reserve = reserveModel?.trim() ?? ''
    if (saving.current || !admin || !ids.length || (!main && !reserve && !level) || (main && !modelInfo(main)?.id) || (reserve && !modelInfo(reserve)?.id)) return false
    saving.current = true
    setBusy(true)
    setError('')
    setResult('')
    try {
      const count = await setAgentModels(ids, main, level ?? undefined, reserve || undefined)
      setResult(
        count
          ? !main && reserve
            ? L(`Modelo reserva atualizado em ${count} ${count === 1 ? 'agente' : 'agentes'}.`, `Fallback model updated for ${count} ${count === 1 ? 'agent' : 'agents'}.`)
            : !main
              ? L(`Esforço atualizado em ${count} ${count === 1 ? 'agente' : 'agentes'}.`, `Thinking level updated for ${count} ${count === 1 ? 'agent' : 'agents'}.`)
              : level
              ? L(`Modelo e esforço atualizados em ${count} ${count === 1 ? 'agente' : 'agentes'}.`, `Model and thinking level updated for ${count} ${count === 1 ? 'agent' : 'agents'}.`)
              : L(`Modelo atualizado em ${count} ${count === 1 ? 'agente' : 'agentes'}.`, `Model updated for ${count} ${count === 1 ? 'agent' : 'agents'}.`)
          : level || reserve
            ? L('Os agentes já estavam assim.', 'The agents were already like this.')
            : L('Os agentes já estavam usando esse modelo.', 'The agents were already using this model.')
      )
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      return false
    } finally {
      saving.current = false
      setBusy(false)
    }
  }
  if (!admin) return null
  return (
    <section className="card agent-models" aria-label={L('Modelos dos agentes', 'Agent models')}>
      <div className="card__head">
        <h2>{L('Modelos dos agentes', 'Agent models')}</h2>
        <p className="muted">{L('Troque o modelo de cada agente e o esforço dele, ou aplique o mesmo a vários de uma vez. Vale para as próximas respostas; as que já começaram seguem como estão.', 'Change each agent’s model and its thinking level, or apply the same to several at once. Applies to future replies; replies already running continue as they are.')}</p>
      </div>
      <fieldset disabled={busy} className="agent-models__controls">
        <div className="agent-models__bulk">
          <strong>{L('Alterar em lote', 'Bulk change')}</strong>
          <strong className="agent-models__subhead">{L('Modelo principal', 'Main model')}</strong>
          {/* Keep stays a pick of its own here: a level alone moves levels, not models. */}
          <ModelPicker value={model} onChange={setModel} effort={effort} keepEffort onEffort={(e) => setEffort(e)} />
          <strong className="agent-models__subhead">{L('Modelo reserva', 'Fallback model')}</strong>
          <ModelPicker value={fallback} onChange={setFallback} />
          <p className="hint">{L('Ao trocar de harness, o agente passa a usar o login padrão dele. Mais esforço pensa mais e gasta mais do plano. Sem modelo principal escolhido, só o esforço e a reserva escolhidos mudam; o resto fica como está.', 'When switching harnesses, the agent uses its default login. More effort thinks longer and uses more of your plan. With no main model picked, only the level and fallback picked here change; the rest stays as it is.')}</p>
          <div className="row">
            <button type="button" className="btn btn--primary btn--sm" disabled={!targets.length || (!modelInfo(model)?.id && !modelInfo(fallback)?.id && !effort)} onClick={() => void save(targets.map((a) => a.id), model, effort, fallback)}>
              {L(`Aplicar aos selecionados (${targets.length})`, `Apply to selected (${targets.length})`)}
            </button>
            <span className="muted small">{L(`${scope.length} ${scope.length === 1 ? 'agente disponível' : 'agentes disponíveis'}`, `${scope.length} ${scope.length === 1 ? 'agent' : 'agents'} available`)}</span>
          </div>
        </div>
        <div className="agent-models__filters">
          <input type="search" aria-label={L('Buscar agentes', 'Search agents')} placeholder={L('Buscar por nome ou @identificador', 'Search by name or @handle')} value={search} onChange={(e) => setSearch(e.target.value)} />
          <label className="row"><input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} />{L('Incluir arquivados', 'Include archived')}</label>
        </div>
        <div className="row row--between">
          <label className="row"><input type="checkbox" checked={allVisible} disabled={!visible.length} onChange={() => setSelected((ids) => allVisible ? ids.filter((id) => !visible.some((a) => a.id === id)) : [...new Set([...ids, ...visible.map((a) => a.id)])])} />{L('Selecionar todos os exibidos', 'Select all displayed')}</label>
          {selected.length > 0 && <button type="button" className="link" onClick={() => setSelected([])}>{L('Limpar seleção', 'Clear selection')}</button>}
        </div>
        <p className="hint">{L('A aplicação em lote inclui os selecionados que estiverem fora da busca. Arquivados só entram com a opção acima marcada.', 'Bulk changes include selected agents outside the search. Archived agents are included only when the option above is checked.')}</p>
        <div className="agent-models__list">
          {visible.map((agent) => <AgentModelRow key={agent.id} agent={agent} selected={selected.includes(agent.id)} onSelect={() => setSelected((ids) => ids.includes(agent.id) ? ids.filter((id) => id !== agent.id) : [...ids, agent.id])} onSave={save} />)}
          {!visible.length && <p className="muted">{agents.length ? L('Nenhum agente encontrado.', 'No agents found.') : L('Crie um agente para escolher o modelo dele aqui.', 'Create an agent to choose its model here.')}</p>}
        </div>
      </fieldset>
      <div aria-live="polite" role="status">{busy ? L('Salvando modelos…', 'Saving models…') : result}</div>
      {error && <p className="field__error" role="alert">{error}</p>}
    </section>
  )
}

function AgentModelRow({ agent, selected, onSelect, onSave }: { agent: Agent; selected: boolean; onSelect: () => void; onSave: (ids: string[], model: string, effort?: Effort | null) => Promise<boolean> }): ReactNode {
  // Only unsaved choices live here; external updates remain visible when no edit is pending.
  const [draft, setDraft] = useState<string | null>(null)
  const [level, setLevel] = useState<Effort | null>(null)
  const value = draft ?? agent.modelId
  const effort = level ?? agent.effort
  const current = modelInfo(agent.modelId)
  return (
    <div className="agent-models__row" role="group" aria-label={agent.name}>
      <div className="agent-models__identity">
        <input type="checkbox" aria-label={L(`Selecionar ${agent.name}`, `Select ${agent.name}`)} checked={selected} onChange={onSelect} />
        <AgentAvatar agent={agent} size={32} />
        <div><strong>{agent.name}</strong><div className="muted small">@{agent.handle}{agent.archived ? L(' · Arquivado', ' · Archived') : ''}{agent.kind === 'tuca' ? L(' · Assistente do app', ' · App assistant') : ''}</div></div>
      </div>
      <div className="agent-models__choice">
        <span className="muted small">{L('Em uso:', 'Current:')} {current ? `${ENGINES[current.engine].label} · ${current.label}` : agent.modelId}</span>
        <ModelPicker value={value} onChange={setDraft} effort={effort} onEffort={(e) => setLevel(e)} />
      </div>
      <button type="button" className="btn btn--sm" disabled={(value === agent.modelId && effort === agent.effort) || !modelInfo(value)?.id} onClick={async () => { if (await onSave([agent.id], value, level)) { setDraft(null); setLevel(null) } }}>{L('Salvar', 'Save')}</button>
    </div>
  )
}
