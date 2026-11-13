# Develop autonomous bots in Tucano

Prepared 13 November 2026. Status: implementation proposal; no runtime work has
started. This is the delivery plan for TucanoNext, with product changes kept
suitable for focused upstream PRs.

## Intended behavior

A person selects an existing bot as their proactive coordinator and gives it
standing responsibilities. While the person is away, the bot periodically resumes
its home conversation, reviews unfinished work and relevant changes, and decides
whether to investigate, advance authorized work, delegate, ask, or remain quiet.
It messages the person when a finding, decision, approval, or completed result
deserves attention. It can act during a heartbeat; merely offering suggestions
does not complete this feature.

The heartbeat supplies an opportunity to reconsider the situation. Existing
routines continue to express predetermined scheduled or event-triggered requests.
Both use the same execution, permissions, accounting, and delivery infrastructure.

## Scope and decisions

- Start with one explicitly enabled coordinator per person per workspace, using
  that person's DM with an existing agent. Additional proactive agents and channel
  homes are later work. Specialists remain available through existing delegation.
- Keep initiative separate from `Autonomy` in `src/shared/actions.ts`. That type
  already controls action permissions. Enabling initiative grants no tool access,
  visibility, budget exemption, or approval exemption.
- Support both observing and suggesting, and advancing authorized work. The latter
  is required for the first release. A responsibility carries its allowed work
  scope; a model-generated idea does not become an authorized mission by itself.
- Resume the existing engine session when valid. Preserve the same conversation
  across session expiry, compaction, configuration changes, and restart by
  rebuilding context from persisted history and commitments.
- Keep the coordinator's model, reasoning configuration, and tool definitions
  stable across heartbeat and human turns. A cheaper triage model is deferred;
  changing the model currently changes the session configuration hash.
- Use Tucano's installed engines and existing runner. Introduce no separate agent
  framework, scheduler service, or model-provider dependency.
- Run while the desktop core or server is running. A closed application or sleeping
  machine performs no checks. On resume, coalesce missed opportunities into one
  review. An always-on external service is outside this release.
- Preserve TucanoNext identity, isolated data and ports, and updates off.

## Baseline and implementation boundaries

Planning baseline: local `next` and fetched `origin/next` both
`d860f8da1d19a58bac817a0a4b1e385a6dcd8f45`; upstream main
`73b724bec8a576d316a5dd5f46a07e3bf83cbe75`; fork main
`c42d1f323a2927084d0cc06366160ea21aa0788b`. Neither main contains commits absent
from this planning baseline. The working checkout has unrelated edits; this
document was prepared in an isolated worktree.

| Existing surface | Extend it for this feature |
| --- | --- |
| `src/core/runs.ts`, `followups.ts` | Admit heartbeat turns through the existing queue and agent/conversation/thread key; preserve human priority and cancellation. |
| `src/core/sessions.ts` | Reuse valid engine sessions. The current registry is in memory, with a 55-minute idle TTL and context limits; persist initiative independently. |
| `src/core/routines.ts`, `index.ts` | Reuse lifecycle and wake/sleep conventions without fabricating a user routine or another execution scheduler. |
| `src/core/db.ts` | Add versioned initiative configuration, commitments, pending wakes, and outcome storage using existing migration conventions. |
| `src/core/people.ts`, `policy-people.ts`, shared action rules | Preserve requester identity, visibility, delegation reach, approval recipients, and runtime permission checks. |
| `src/core/delegations.ts`, shared organization types | Reuse delegation records and result routing; carry initiative lineage and shared limits. |
| `src/shared/rpc.ts`, `rpc-shapes.ts`, `types.ts` | Define each new contract once, validate it, and enforce target ownership in core handlers. |
| Renderer agent settings, conversation, work drawer, asks and approvals | Expose controls and outcomes using existing components and navigation. |
| Existing notice and push path | Deliver meaningful messages without a second notification inbox or transport. |

Keep scheduling and commitment logic in small core modules, provisionally
`initiative.ts` and `initiative-state.ts`. Keep policy calculations pure where
possible. These are proposed boundaries, not instructions to reproduce data or
logic that existing modules already own.

## Persistent state and authority

Use the following logical records; settle physical tables in the first slice.
Configuration edits are revisioned so a queued wake cannot apply an old brief.

| Record | Required information |
| --- | --- |
| Initiative configuration | Workspace, requesting person, agent, home DM, enabled/paused state, standing brief, observation scope, authorized work scope, cadence, notification preference, limits, and revision. |
| Commitment | Source conversation/message, owner, description, allowed scope, status, next check, evidence references, and optional existing run/delegation/question/approval IDs. |
| Pending wake | Target, reason(s), source event IDs, due time, configuration revision, claim token, lease, and retry state. Multiple reasons can share one pending review. |
| Review outcome | Attempt/run IDs, trigger, start/end, terminal outcome, reason, commitment changes, usage attribution, and links to visible output. |
| Observation and delivery state | Source cursors, stable finding IDs, previous material state, dismissal state, and delivery retry information. |

Commitment states are `open`, `in_progress`, `waiting_external`, `waiting_user`,
`done`, and `dismissed`. A proposed new mission remains a proposal until accepted.
Existing approvals and delegations remain authoritative for their own state; the
commitment stores links, not a competing copy of their lifecycle.

Record a wake as `skipped`, `quiet`, `advanced`, `waiting`, `reported`, `failed`, or
`interrupted`. These describe initiative outcomes and do not replace `RunStatus`.
A failed connector read is a failure with stale observations, never evidence that
nothing changed.

Authority is the intersection of the person's visibility, the agent's permissions,
the responsibility's scope, and any delegating parent scope. The coordinator title
confers no administrative rights. Check authority at admission, immediately before
execution, at tool use, and before publishing findings. Removal of the person,
agent archival, deleted home, cleared history, or revoked access invalidates the
affected pending work. A configuration revision alone cannot invalidate actions
already completed; record what happened and stop further unauthorized work.

## Wake and execution contract

1. A periodic due check or an existing application event records a pending wake.
   Initial event sources are a linked delegation finishing, an approval decision,
   an answered question, and a relevant run ending. External connectors come later.
2. An application-level eligibility check skips model invocation when disabled,
   paused, asleep, outside allowed hours, over budget, unavailable, or blocked by
   pending human work. Waiting on a person wakes only for a relevant answer,
   changed condition, or an explicitly configured reminder.
3. The existing runner admits one review per session key, below human work. Merge
   pending reasons, claim atomically, and recheck configuration and authority after
   any queue wait. Maintain one initiative review workspace-wide in the first
   release, while normal conversations retain their existing concurrency.
4. Resume the home session with a bounded task block describing the wake reason,
   current brief, relevant commitment changes, elapsed time, and source references.
   Do not mutate the system prompt or present the wake as an instruction authored
   by the person. An unchanged periodic review is still allowed to reconsider an
   aging commitment.
5. Execute bounded work through the ordinary tools and runner. A narrowly scoped
   outcome operation records quiet completion, progress, or a report request.
   Keep its definition stable across interactive and heartbeat turns; reject its
   initiative-only operations outside a matching admitted review.
6. Commit outcome, commitment changes, consumed observations, and publication
   intent consistently. A persisted delivery intent owns transport retries; a
   failed notification must not rerun completed work.
7. Schedule the next eligible review. Missed ticks never become a backlog. Ordinary
   no-change reviews back off; meaningful new events reset that backoff.

Provisional cadence: 15 minutes initially, doubling after consecutive quiet
reviews up to two hours, with bounded jitter. Debounce ordinary event bursts for
30 seconds. These are tuning defaults, not time guarantees. Respect existing
workspace quiet hours, and store timezone information for daily limits. Do not
add an urgency bypass in the first release.

Reserve headroom under a configured daily allowance before starting work; charge
actual usage using the existing token/cost accounting semantics. Include child
delegations, retries, and model fallback. Add a configurable 24-review daily cap
as an independent initial safeguard. Daily usage remains aggregated across pause,
disable/re-enable, model change, and replacement coordinator. Unknown monetary
prices require token limits; do not report unknown cost as zero. Check provider
availability and quota without silently selecting a more expensive fallback.

Each mission carries lineage, deadline, maximum delegation depth and child count,
and remaining allowance. Children cannot broaden its scope or establish their own
recurring heartbeat. Repeated exchanges without progress suspend that mission and
produce one actionable diagnostic. Long work may remain in the existing task or
delegation path while the coordinator returns to waiting.

Human messages take the next available session slot. Queue priority alone cannot
preempt a model call or external action already running: bound review duration,
retain existing stop/interrupt controls, and test queued versus interrupt sends.
Disabling initiative cancels pending reviews and requests cooperative cancellation
of active initiative descendants; independently human-started work stays active.

## Quiet work and user experience

Quiet reviews write an inspectable activity record but create no conversation
message, temporary unread count, typing indicator, toast, sound, or generic
completion notification. Preserve the session transcript required by the engine;
omitting a turn from the UI must not break session bookkeeping or replay.

Questions, approvals, artifacts, proposals, and meaningful failures cannot be
discarded by a silence marker. Extend the current routine-silence handling to a
shared background-output policy while preserving existing routine behavior. Buffer
ordinary heartbeat narration until a report is admitted. Reuse current asks and
approval flows for decisions; return their answers to the originating commitment.

Before reporting, require a finding source and a reason it matters now. Deduplicate
by source and material state, including findings returned by specialists. An
unchanged dismissed finding stays suppressed; a material change can reopen it.
Batch ordinary findings. Notification preference controls interruption separately
from permission to execute reviews. Keep approval and question delivery consistent
with the person's existing notification preferences.

The agent page provides enable/pause, standing responsibilities, observation/work
scope, interval, allowance, notification preference, and check now. The DM shows a
compact status with the last review and reason for waiting, plus access to activity
and commitments. Check now bypasses cadence only, never permissions, pause, quiet
hours, budget, or an occupied session. Do not add a second task board or inbox.

All proposed interface wording is provisional. Final English and Portuguese copy
must follow `docs/interface-copy.md`, editorial review, and rendered wrapping
checks at the required widths before acceptance.

## Implementation sequence

Each slice includes focused regression tests. Keep unfinished behavior disabled;
do not expose a setting that cannot execute its advertised path.

### 1. Establish the contract and persistence

- [x] Refresh main refs and the exact heads of overlapping feature PRs. Check for
  an existing initiative issue/PR before choosing its implementation branch.
- [x] Base product work on current upstream main. Explicitly map which capabilities
  only exist on next and place changes to unmerged features on their own PRs.
- [x] Add canonical shared types, migrations, validated RPCs, ownership checks,
  configuration revisions, and an explicitly disabled default for all workspaces.
- [x] Add commitment provenance and links to existing work; no chat-wide automatic
  extraction or private-DM aggregation in this slice.
- [x] Prove migration/reopen, revision conflict, unauthorized access, missing
  targets, backup/restore policy, and empty-workspace behavior on scratch data.

Exit: configuration and commitments survive restart and remain visible only to
their authorized person. Existing agents and action-permission settings are unchanged.

Result: `feat/autonomous-initiative` from upstream `main` at `73b724b`, commit
`2881cb4`. See [the completion record](#slice-1-contract-and-persistence).

### 2. Resume one conversation from a heartbeat

- [x] Implement periodic eligibility, coalescing, atomic admission, idle priority,
  pause/sleep handling, and session reconstruction through the current runner.
- [x] Supply a bounded heartbeat task block without system/tool-definition churn.
- [x] Add review caps, daily allowance reservations, accounting, and quiet backoff.
- [x] Handle quiet results from the start of execution, including streaming and
  unread/activity bookkeeping, with retained internal evidence.
- [x] Verify repeated ticks, human queue priority, pause races, session expiry, and an
  engine without resumable sessions.
- [ ] Verify context rollover and a changed model or tool set on a session a check-in
  resumes: the runner's own rules, not yet exercised from a check-in.

Exit: with no further human message, the bot reviews the correct conversation,
performs an authorized tool action, and either reports a meaningful result or
finishes with no visible disturbance.

Result: commit `c95ee9d` on `feat/autonomous-initiative`. See
[the completion record](#slice-2-resume-one-conversation-from-a-heartbeat).

### 3. Advance commitments and delegate safely

- [x] Connect commitments to existing delegation, approval, question, and run events.
- [x] Enforce parent scope: a responsibility narrows what the person authorized, and is
  narrowed again when a conversation leaves their reach.
- [x] Keep execution lineage: a check-in's reply carries the wake it came from, and the
  work it links to keeps its own record of where it was asked from.
- [ ] Count what a check-in triggers against the person's own allowance: a delegation it
  starts spends the specialist's limit, not the initiative budget yet.
- [x] Reuse the existing fan-out and depth limits rather than adding a second set.
- [x] Persist waiting states; resume once when the relevant dependency changes.
- [x] Prevent recursive wakes, duplicate results, and repeated reminders for unanswered
  questions. Detect bounded no-progress cycles.
- [x] Recheck permission revocation and private provenance across the entire chain.

Exit: the coordinator advances an authorized multi-step responsibility, receives
a specialist result, asks only for an actual decision, and continues after the answer.

Result: commit `0cec877` on `feat/autonomous-initiative`. See
[the completion record](#slice-3-the-work-a-responsibility-rests-on).

### 4. Present controls and meaningful interventions

- [x] Add agent settings, DM status, check now, activity, and commitment navigation.
- [x] Reuse existing proposal/next-step, ask, approval, notice, and push surfaces.
- [x] Add material-change deduplication, dismissal, and delivery through existing
  transports.
- [ ] Back every report's claim with the message or file it came from: the record
  links evidence to a responsibility, but a report's own sentences are still prose.
- [x] Verify keyboard access, both languages, rendered copy, long histories, and
  denied/missing targets with real DOM interactions.
- [ ] Verify narrow layouts by measurement: the window collapses at 640px in CSS,
  and no rendered check has run against it yet.

Exit: a person can explain why the bot woke, what it did, what it is waiting on,
how much allowance remains, and how to stop it without reading internal logs.

Result: commit `4370641` on `feat/autonomous-initiative`. See
[the completion record](#slice-4-the-page-a-person-actually-uses).

### 5. Recover and integrate

- [x] Persist claim fencing and recover orphaned queued/running reviews. Reconcile
  linked work before permitting new actions; stale workers cannot finish a new claim.
- [x] Commit session/commitment progress before publishing a terminal completion
  that can admit a dependent wake. Separate delivery retry from execution retry.
- [x] Interrupt at each external-effect boundary in tests. Reconcile effects by
  tool identifiers where supported; ambiguous effects wait for inspection instead
  of automatic replay. Do not promise exactly-once external execution.
- [x] Exercise restart, sleep, simultaneous event delivery, quota failure, model
  failure, permission changes, person removal, history clearing, and coordinator
  replacement. Disable/re-enable and restore never duplicate a scheduler owner.
- [x] Refresh upstream and next, merge intervening work normally, and repeat
  affected checks against the final combined tree.

Exit: recovery produces neither duplicate actions nor a flood of checks, questions,
or notifications, and independent user work remains usable.

Results: `b4074dd` (the merge of `origin/next`, 345 commits, and the behaviour it
forced) and `5396d38` (recovery) on `feat/autonomous-initiative`. See
[the completion record](#slice-5-what-the-app-did-not-survive).

### 6. Verify and deliver the feature

- [ ] Run locked dependency installation sequentially, typecheck, the entire test
  suite, build, and focused built-app behavior checks. Report skips separately.
- [ ] Add `scripts/screens-initiative.mjs` using `qa-background.mjs` and the nearest
  existing screen harness. Use fake engines, scratch data, isolated profiles/ports,
  and a hidden, unfocusable window; save source SHA, traces, captures, and errors.
- [ ] Verify installed-app behavior using the built installer and the mandated
  self-build install helper. Inspect the actual installed process/window and
  verify the installed bundle against the built source.
- [ ] Perform synthetic initiative checks only in scratch data. Confirm the regular
  workspace, navigation, expected controls, and updates off without seeding work.
  Use background inspection; prepare and request bounded foreground access only
  if a required check cannot be completed without taking over the desktop.
- [ ] Add the user-facing changelog entry, update feature/audit records, integrate
  the tested source into next, push, and read the remote SHA back.
- [ ] Treat this as a major feature: rebuild the inherited version's fork release,
  update the existing `next-v<version>` tag and notes, and verify uploaded installer
  and blockmap digests and download behavior under the repository delivery rules.
- [ ] Close scratch instances and leave the regular installed TucanoNext running.

Exit: source, installer, installed runtime, and fork release identify the same
delivered build. Any blocked smoke check remains explicitly incomplete.

## Acceptance scenarios and evidence

| Scenario | Required observable result |
| --- | --- |
| Independent initiative | After setup, no user input is needed for an eligible heartbeat to inspect and advance a responsibility. |
| Same conversation | A fact supplied only in the home DM is available to the review; a valid engine session resumes. Expiry/restart reconstructs continuity in that DM. |
| Quiet outcome | No message, unread flicker, typing, sound, toast, or completion notice; activity records the check and usage. |
| Authorized action | A fake tool records an allowed action before any new user prompt; a denied or out-of-scope action never executes. |
| Approval or question | Exactly one existing decision item appears with the correct recipient; related work waits and resumes once. |
| Human priority | A queued user turn precedes a not-yet-admitted review; interrupt/stop reaches active work according to existing semantics. |
| Delegation | A specialist completes bounded work and its result advances the parent commitment without recursive heartbeat creation. |
| Budget and quota | Parent, children, retries, and fallbacks cannot independently spend the same reserved allowance; provider exhaustion causes waiting. |
| Privacy and injection | Another person's DM, held wiki content, and untrusted connector instructions cannot expand observation, authorization, or reporting scope. |
| Duplicate events | Replayed completion events and repeated ticks produce one eligible follow-up and one material report. |
| Crash after side effect | Restart inspects existing effect state; an ambiguous result is surfaced without repeating the action. |
| Quiet hours and sleep | No review executes during the blocked period; resumption produces one bounded review rather than missed ticks. |
| Disable and replace | Pending work is canceled, active initiative work cooperatively stops, and a replacement coordinator cannot inherit expanded authority. |
| Coexistence | Routines, steering, queued/parallel sends, follow-ups, restart recovery, silence, and normal notifications retain their behavior. |

Use fake clocks and scripted engines for deterministic lifecycle tests. Extend
`kept-session`, `routine-silent`, `delegations`, `restart-runs`, people/policy, and
renderer interaction coverage where the shared contract changes; add dedicated
initiative tests for new behavior. A bounded live-engine compatibility check is
still required for each engine advertised as session-resumable: fake engines
cannot prove its native transcript or compaction behavior. Record any unavailable
engine explicitly and preserve the conversation-reconstruction fallback.

Initial usability trials should cover an uneventful workday, a blocked mission,
and a mission progressing through specialist work. Record useful interventions,
duplicate/dismissed findings, quiet-check usage, human-turn delay, and recovery
failures. Tune cadence and notification thresholds from this evidence; do not
claim value from a count of heartbeat executions.

## Deferred work

Multiple independently proactive agents, channel homes, external connector watch
registrations, automatic commitment extraction from old conversations, alternate
triage models, learned notification thresholds, cross-machine execution, and
running while the application is closed are later features. None is required to
prove useful autonomous action in the first release.

## Research informing the choices

These projects are design references, not dependencies or runtime certifications.
Review licensing and the current implementation before copying code.

- [Hermes session heartbeats](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/heartbeat.md): continuing an idle conversation.
- [hermes-swarm agent implementation](https://github.com/linenoize/hermes-swarm/blob/1139b5b0dacd0a2f1b2782e44f440ac13dde81d0/swarm_server/agent.py): autonomous coordinator admission and adaptive backoff.
- [coworkers bot implementation](https://github.com/fayazara/coworkers/blob/8cc548bdb86c0a68b25f8b4629db2c4f5c3f3352/src/agents/bot-agent.ts): persistent open items, reported findings, and contextual check-ins.
- [Paperclip heartbeat protocol](https://github.com/paperclipai/paperclip/blob/a762b6bffd5bc944af8d7b10c25e4f1432158ea7/docs/guides/agent-developer/heartbeat-protocol.md): claimed work, durable progress, and waiting states.
- [OpenBot proactive engine](https://github.com/CopilotKit/OpenBot/blob/f8af37ab73e96784f174a11104505a965e722cab/server/src/proactive/engine.ts): evidence-backed proposals and deduplicated delivery from separate investigations.
- [OpenMausBot proactive design](https://github.com/milind-soni/OpenMausBot/blob/e36e20d3134a96e068ea67801bf950f65c235453/docs/proactive-routines.md): cheap observations, batching, and cursor discipline.
- [Scion heartbeat service](https://github.com/annex-ai/scion/blob/8a3e21f7d624e13eb5f14a18728c6f98172a5c55/src/mastra/gateway/heartbeat/service.ts): application-level blocker detection and alert suppression.

## Completion record

Completing this plan means the development work is specified. Record exact source
revisions, per-slice results, remaining checks, and delivery evidence here as
implementation proceeds. A slice is recorded when its tests run, not when its
code is written.

### Slice 1: contract and persistence

Branch `feat/autonomous-initiative`, forked from upstream `main` at `73b724b`
(Release 0.2.28); commit `2881cb4`, pushed to the fork. Nothing is enabled in any
workspace, so the branch changes no shipped behavior on its own.

- No initiative issue or pull request existed on `eduwxyz/tucano`, so the slice took
  its own branch. `next` was at `131151f`, the commit that carries this plan.
- Capabilities that only exist on `next` and touch this work, each reconciled on its
  own PR when the slice that needs it lands: silent routines (#366) for slice 2's
  quiet results; deleted sessions (#375) and cleared history (#249) for slice 5's
  invalidation; resumed interrupted replies (#391) for slice 5's recovery; the
  notification centre (#417) for slice 4's interventions. Both records are written
  through cascading foreign keys, so a conversation, agent or person that goes
  takes its initiative row and commitments with it on either branch.
- `src/shared/initiative.ts` holds the contract: `InitiativeConfig`, `Commitment`,
  the two scopes (`observe`, `work`), cleaning, shape refusals and scope narrowing.
  `src/core/initiative.ts` holds the core's checks: the bot and its DM, every named
  conversation reachable by the person, the source message and each link present,
  and the revision the page read.
- The migration in `src/core/db.ts` adds `initiative` (one row per person) and
  `commitments`. No row means off, so a new workspace and one that upgrades into
  this build both start with nothing.
- API: `initiative`, `saveInitiative`, `saveCommitment`, each reading or writing
  only the asking person's records. Shapes are in `rpc-shapes.ts` and admissions in
  `NEEDS`, so the fuzz test covers them like every other method.
- Provenance is the source conversation, its message and who wrote it. Evidence and
  links are ids to a message, a file an agent showed, a run, a delegation, a
  question or an approval. No chat-wide extraction in this slice.
- Tests: `test/initiative.test.ts` (record, restart, revision, ownership, missing
  targets, states, copy, restore, empty and upgraded workspace) and
  `test/initiative-core.test.ts` (the same through the real core over its API).
  `test/db-queries.test.ts` and `test/antigravity-migration.test.ts` now find their
  starting migration by what it does instead of counting backwards, so adding a
  migration no longer breaks them.
- Evidence: `npm run typecheck` clean; `npx vitest run test/initiative.test.ts
  test/initiative-core.test.ts` 19 passed; the full suite ran 1713 passed with two
  load-dependent failures (`test/delegations.test.ts`, `test/engine-setup.test.ts`)
  that pass in isolation on the same commit.
- Decisions: a copy of a workspace drops its commitments and starts with initiative
  off, because the runs, questions, approvals and delegations they point at do not
  come along; a restored backup keeps both records and runs neither; a removed
  person's row is paused and a purge deletes it.
- Deviations from the sketch: no `initiative-state.ts` yet, because nothing holds a
  wake or an outcome until slice 2; the pending-wake and outcome tables land with
  the code that writes them rather than standing empty.
- Remaining in this slice: the refusals it returns are drafted and rendered nowhere,
  so their copy and layout check belongs to the slice that draws the screen.

### Slice 2: resume one conversation from a heartbeat

Commit `c95ee9d` on `feat/autonomous-initiative`. Nothing runs in a workspace until
someone turns a coordinator on, so the branch still changes no shipped behavior by
itself.

- `src/core/initiative-heartbeat.ts` is the clock: once a minute it asks each
  person whose coordinator exists whether a check-in is due, admits one at a time,
  and records what came of it. The claim is taken before the first await, so a tick
  that finds work under way cannot start a second one and repeated ticks coalesce.
- `src/core/initiative-state.ts` holds the rules as pure functions: due a cadence
  after the last check-in, doubling for each in a row that found nothing up to two
  hours; not during quiet hours, not while paused, not past the day's reviews or the
  token allowance; and the day is the person's own, from their stored time zone.
  It also writes the bounded request: the brief, what is owed, and the one rule that
  keeps a quiet check-in quiet. Nothing is added to the system prompt or the tool
  set, so a resumed session sees the same definitions as before.
- A check-in runs through `Runner.checkIn`, the same path as every reply: the same
  session, the same queue, the same limits and permissions. Its message is written
  hidden, so nothing streams into the conversation while it thinks; when it reports,
  it leaves the hiding and arrives as any message does, with its unread and activity
  as usual. When it finds nothing, the hidden message stays behind as internal
  evidence and the conversation is untouched.
- `initiative_wakes` keeps each attempt: revision, when, what came of it, what it
  said, what it cost in counted tokens, and why it was skipped. A month is kept.
  An edit to the brief between admission and start records a skip and runs nothing.
- Verification, in `test/initiative-heartbeat.test.ts` (14 tests, fake engine): a
  quiet check-in leaves no message and no unread; a report becomes a visible
  message; six ticks run one check-in and the next waits 30 minutes; the review cap
  and the allowance refuse; an edit before start skips; pause refuses at admission
  and at the runner; a session let go runs again; a failed check-in stays hidden and
  keeps its words; and a person's own turn in the same DM is asked first (proved by
  the order the engine saw the two prompts).
- Open in this slice: context rollover, and a changed model or tool set on a session
  a check-in resumes, are the runner's own rules and are not yet exercised from a
  check-in. The plan's exit also asks for an authorized tool action; this slice
  proves the check-in runs through the gated path, not that it called a connector.

### Slice 3: the work a responsibility rests on

Commit `0cec877` on `feat/autonomous-initiative`. Still inert until someone turns a
coordinator on.

- `src/core/initiative-links.ts` reads a link and nothing else: a delegation by its
  own state and whether it is asking something, a question by whether the person
  answered, an approval by whether it was decided, a reply by how it ended. Each
  returns a version string of everything that moves when the work moves, and a short
  clause for the request (`in progress: Nico, #engenharia`,
  `waits for your answer`).
- The state of a responsibility is derived, not stored twice: what waits on the
  person outranks what waits elsewhere, a failure leaves it open with its own note,
  a returned result opens it again. It is written at save and on every tick, so a
  page shows the honest state from the first render.
- `initiative_resumes` keeps the version last read per link. A moved version wakes
  the coordinator once, and only after a check-in actually ran, so a pause, a
  failure or the daily cap cannot swallow the news: the next tick still finds it.
  A resumed check-in waits five minutes after the previous one, so nothing becomes
  a hot loop, and the request says what changed.
- Repetition is bounded mechanically, not by asking the model nicely. While a
  question or approval of the bot's waits on the person, its wait is at least two
  hours. A responsibility no check-in has moved across six is named as stalled,
  with one instruction: take a concrete step, close it, or say what is blocking it.
- What the person can no longer reach, nothing rests on: a scope that lost a
  conversation is narrowed, evidence that cannot be read any more is dropped, and
  one coordinator holds at most twelve open responsibilities.
- Verification: `test/initiative-links.test.ts` (11 tests) covers the four link
  kinds, the derived states, the note a failure leaves, narrowing, dropped evidence,
  the stall counter resetting on a person's edit, and the twelfth-and-thirteenth
  responsibility. `test/initiative-heartbeat.test.ts` adds three: a returned
  delegation wakes the coordinator once and the request names the change, the same
  version never wakes it twice, and an unanswered question holds the wait to two
  hours. The upgraded-database test now also reads a responsibility saved on the
  older schema.
- A column added here lives in `COLUMNS` rather than in a migration, because a
  database built by these tests rewinds its version and replays migrations over
  tables that already have the column. Two tests caught exactly that.
- Open in this slice: a delegation a check-in starts spends the specialist's own
  limit, not the person's daily allowance. Sharing that budget needs an attribution
  at delegation creation, which belongs to the delegation's lifecycle.

### Slice 4: the page a person actually uses

Commit `4370641` on `feat/autonomous-initiative`. This is the slice that makes the
feature reachable: before it, a coordinator could only be turned on through the API.

- The DM carries a line in the topbar: what its bot is doing (`next in 12 min`,
  `waits on you`, `checking now…`, `everything paused`, `initiative off`), with a
  dot that pulses while a check-in runs, and a count of what is open. It opens the
  window below. A DM whose bot does not look after this person has no line at all.
- `src/renderer/src/components/Initiative.tsx` is the whole surface: the brief, the
  cadence, when to interrupt, the daily check-ins and token ceiling, the
  conversations it may look at and the actions it may take, each a checkbox that
  narrows what Autonomy already allows. Below it, what the coordinator is carrying,
  each with its state, its note, the work it rests on and a way to the conversation
  it was read in, plus done, dismiss and reopen. Below that, what it did.
- "Conferir agora" is a real admission path (`checkInNow`), not a shortcut: it skips
  the person's own cadence and quiet hours, and keeps the caps, the pause, the
  allowance and one-at-a-time. It returns as soon as the check-in starts, and the
  window polls the record while it runs so the page shows what it did instead of
  freezing. Every refusal is named in words a person can act on.
- The window reports today's usage against the person's own limits, and the whole
  page is their own: the RPC reads only `ctx.person`.
- Delivery reuses what exists: a report is a normal message, so unread, desktop
  notice and phone push all follow from the transports already in place; a question
  a check-in asks is an ordinary `ask_user`; an approval is the approval it always
  was. Nothing new was invented for delivery.
- Three defects the surface exposed, fixed here: a quiet check-in used to send the
  same "Lia terminou" notification as any reply (the runner now leaves delivery to
  the coordinator, which notifies once for a report and never for a quiet one); the
  same finding twice used to be delivered twice (a report matching the last one
  within a day now stays out of the conversation, keeps its record, and says why);
  and a refusal from a page left open now shows in place instead of leaving the old
  brief on screen as if it had saved.
- Verification: `test/initiative-ui.test.tsx` (15 tests) drives the real components
  in a linkedom DOM with real clicks and keys: the line's four states and its
  absence, both languages, saving against the revision the page read, the disabled
  save on an empty brief, check-now and each refusal, a disabled button while one
  runs or the app is paused, dismissal and completion by state, the activity list's
  wording including a deduped report and a skipped one, twenty check-ins folding to
  six and back, the conversations offered as checkboxes, Esc closing and every
  action being a real button. `test/initiative.test.ts` adds the view's own numbers,
  and the core test proves `checkInNow` refuses when nothing is set up.
- Two limits this slice does not close, both recorded above: a report's sentences are
  not yet backed by the message or file they came from, and the narrow layout is a
  CSS rule nobody has measured. The screenshot harness in the last slice is where a
  rendered, measured check belongs.

### Slice 5: what the app did not survive

Commits `b4074dd` (the merge) and `5396d38` (recovery) on `feat/autonomous-initiative`.

- The branch was 345 commits behind `next`, so it was merged before this work rather
  than after, and the merge was resolved by behaviour on both sides: routines still
  author messages, so their request is not unread while their answer is; paging
  keeps both the tree's `cleared_at` rule and a check-in's `hidden`; saving a
  message carries both columns; and the two runner notifications keep the message
  id the tree now passes, still silent for a check-in.
- The merge forced one behaviour and it is now explicit: the tree gives every
  person's message its own session, so a due check-in could start beside an
  exchange the person was in the middle of. A check-in steps back while the last
  word in that DM is theirs and the bot has not answered, and the review happens
  when the exchange is quiet again.
- A check-in the app did not survive is closed as interrupted at the next start and
  on every tick, and the linked work is read again at that moment, before anything
  new is allowed. Before this, such a run left a record with no end and a page that
  said "checking now" forever.
- A late run cannot finish a claim the app already closed: what comes back from a
  lost run changes nothing, appears nowhere and notifies no one.
- Delivery is its own step after the record. A report is saved before it is shown,
  so a window that goes away between the two leaves a report the next tick delivers
  alone, with `delivered` as its flag. Execution is never repeated for delivery.
- A check-in cut short does not settle the ledger: only a finished run marks news as
  read, so what it came for can wake the coordinator again. The timer starts once,
  whatever a person does to the switch.
- Verification: `test/initiative-recovery.test.ts` (9 tests) covers an orphan closed
  and a live run left alone, a late finish refused, a report delivered after the app
  closed it, a reveal that throws and is delivered on the next tick with one turn
  total, an interrupted run that leaves the ledger alone, one timer across a
  disable and an enable, one check-in across two simultaneous ticks after a ten-hour
  sleep, an archived bot, a person who left, and a replaced coordinator. Restart,
  sleep, simultaneous delivery, model and quota failure, permission changes, history
  clearing and person removal are covered across this file, the links file and the
  heartbeat file; the merged tree passes 257 files and 2430 tests with 67 skipped and
  none failed.
- Honest about effects: this never promises exactly-once execution of anything
  external. A check-in that was interrupted leaves whatever it did as it left it,
  and a person inspects the record rather than an automatic replay happening. The
  one effect that is reconciled by identifier is the work a responsibility links to,
  whose own record says how it ended.
