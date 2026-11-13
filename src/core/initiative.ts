// A person's proactive coordinator: the record of what their bot looks after between messages, and
// the checks that keep it theirs. This slice stores and validates; nothing runs a review yet (slice 2
// admits them through the runner), so this module is the only place a page writes either record.
//
// Authority is what the person can already reach and what their agent may already do. Initiative adds
// nothing: a responsibility narrows a scope, and Autonomy keeps deciding every tool call.
import { randomUUID } from 'node:crypto'
import {
  cleanCommitment,
  cleanInitiative,
  closedAtFor,
  commitmentError,
  inReach,
  initiativeError,
  within,
  type Commitment,
  type CommitmentInput,
  type InitiativeConfig,
  type InitiativeInput,
  type InitiativeView
} from '../shared/initiative'
import { L } from '../shared/lang'
import type { Person } from '../shared/types'
import type { Db } from './db'
import type { People } from './people'

const gone = (): string => L('Isso não existe mais.', 'That record no longer exists.')
const staleRevision = (): string =>
  L('Isso mudou enquanto a página estava aberta. Recarregue e tente de novo.', 'This changed while the page was open. Reload and try again.')

export class Initiative {
  constructor(
    private db: Db,
    private people: People
  ) {}

  // What this person's page shows: their own records, and only theirs.
  view(person: Person): InitiativeView {
    return { config: this.db.initiative(person.id) ?? null, commitments: this.db.commitments(person.id) }
  }

  // A configuration edit, against the revision the page read. A save in between is refused instead
  // of overwriting what the other window wrote: a queued review must never apply an old brief.
  save(person: Person, input: InitiativeInput, expectedRevision: number): InitiativeConfig {
    const prev = this.db.initiative(person.id)
    if ((prev?.revision ?? 0) !== expectedRevision) throw new Error(staleRevision())
    const clean = cleanInitiative(input)
    const why = initiativeError(clean)
    if (why) throw new Error(why)
    this.targets(person, clean)
    const now = Date.now()
    const saved: InitiativeConfig = {
      ...clean,
      personId: person.id,
      revision: (prev?.revision ?? 0) + 1,
      createdAt: prev?.createdAt ?? now,
      updatedAt: now
    }
    this.db.saveInitiative(saved)
    return saved
  }

  // A responsibility: one bot's, on this person's word, inside what they authorized for it.
  saveCommitment(person: Person, input: CommitmentInput): Commitment {
    const clean = cleanCommitment(input)
    const prev = clean.id ? this.db.commitment(clean.id) : undefined
    // Someone else's record is not this person's to know exists, whatever else they have set up.
    if (prev && prev.personId !== person.id) throw new Error(gone())
    const config = this.db.initiative(person.id)
    if (!config) throw new Error(L('Ligue a iniciativa de um bot primeiro.', 'Turn on initiative for a bot first.'))
    const why = commitmentError(clean)
    if (why) throw new Error(why)
    // A new one belongs to the coordinator; an old one stays with the bot that took it on, so a
    // replaced coordinator cannot inherit it or stop it being closed.
    const agentId = prev ? prev.agentId : config.agentId
    if (!prev && clean.agentId !== agentId) throw new Error(L('Só o bot responsável pode assumir isso.', 'Only the bot looking after this can take this on.'))
    // Where it came from is a conversation the coordinator may read, and its scope cannot pass what
    // the person authorized: on a new one, the brief's scope; on an old one, its own.
    if (!inReach(config.observe, config.conversationId, clean.conversationId)) throw new Error(L('Isso veio de uma conversa fora do que o bot pode ler.', 'That came from a conversation outside what the bot may read.'))
    if (prev ? !within(prev.scope, clean.scope) : !within(config.work, clean.scope)) {
      throw new Error(L('Isso passa do que você autorizou pro bot.', 'That goes beyond what you authorized for the bot.'))
    }
    this.pieces(person, clean)
    const now = Date.now()
    const state = clean.state ?? prev?.state ?? 'open'
    const closedAt = closedAtFor(state, now, prev?.closedAt)
    const saved: Commitment = {
      id: prev?.id ?? randomUUID(),
      personId: person.id,
      agentId,
      conversationId: clean.conversationId,
      ...(clean.messageId ? { messageId: clean.messageId } : {}),
      by: clean.by,
      description: clean.description,
      scope: clean.scope,
      state,
      ...(clean.note ? { note: clean.note } : {}),
      ...(clean.nextCheckAt ? { nextCheckAt: clean.nextCheckAt } : {}),
      evidence: clean.evidence ?? [],
      links: clean.links ?? [],
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
      ...(closedAt ? { closedAt } : {})
    }
    this.db.saveCommitment(saved)
    return saved
  }

  // Who and where it works: a bot they can talk to, and their own DM with it, since a review resumes
  // that conversation. Anything named to look at or act in must be theirs to reach already.
  private targets(person: Person, c: InitiativeInput): void {
    const agent = this.db.agent(c.agentId)
    if (!agent || agent.archived) throw new Error(L('Esse bot não existe mais.', 'That bot no longer exists.'))
    const dm = this.db.conversation(c.conversationId)
    const owner = this.db.conversationOwner(c.conversationId)?.owner ?? this.db.ownerId()
    if (!dm || dm.kind !== 'dm' || !dm.members.includes(agent.id) || owner !== person.id) {
      throw new Error(L('Escolha a conversa direta com esse bot.', 'Choose your direct conversation with that bot.'))
    }
    for (const id of [...c.observe.conversations, ...c.work.conversations]) {
      const why = this.people.conversationError(person, id)
      if (why) throw new Error(why)
    }
  }

  // What a responsibility rests on, and what it links: each must be there, and be theirs to see.
  private pieces(person: Person, c: CommitmentInput): void {
    const message = (id: string, conversationId?: string): void => {
      const m = this.db.message(id)
      if (!m || (conversationId && m.conversationId !== conversationId) || !this.people.visibleAt(person, m)) throw new Error(L('Essa mensagem não existe mais.', 'That message no longer exists.'))
    }
    if (c.messageId) message(c.messageId, c.conversationId)
    for (const e of c.evidence ?? []) {
      if (e.kind === 'message') message(e.id)
      else {
        const a = this.db.artifact(e.id)
        if (!a || !this.people.artifactVisible(person, a)) throw new Error(L('Esse arquivo não existe mais.', 'That file no longer exists.'))
      }
    }
    for (const l of c.links ?? []) {
      const there =
        l.kind === 'run' ? this.db.message(l.id)?.run !== undefined
        : l.kind === 'delegation' ? this.db.delegation(l.id) !== undefined
        : l.kind === 'question' ? this.db.question(l.id) !== undefined
        : this.db.approval(l.id) !== undefined
      if (!there) throw new Error(L('O que isso acompanhava não existe mais.', 'What this was following no longer exists.'))
    }
  }
}
