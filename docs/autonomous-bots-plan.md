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

- [ ] Refresh main refs and the exact heads of overlapping feature PRs. Check for
  an existing initiative issue/PR before choosing its implementation branch.
- [ ] Base product work on current upstream main. Explicitly map which capabilities
  only exist on next and place changes to unmerged features on their own PRs.
- [ ] Add canonical shared types, migrations, validated RPCs, ownership checks,
  configuration revisions, and an explicitly disabled default for all workspaces.
- [ ] Add commitment provenance and links to existing work; no chat-wide automatic
  extraction or private-DM aggregation in this slice.
- [ ] Prove migration/reopen, revision conflict, unauthorized access, missing
  targets, backup/restore policy, and empty-workspace behavior on scratch data.

Exit: configuration and commitments survive restart and remain visible only to
their authorized person. Existing agents and action-permission settings are unchanged.

### 2. Resume one conversation from a heartbeat

- [ ] Implement periodic eligibility, coalescing, atomic admission, idle priority,
  pause/sleep handling, and session reconstruction through the current runner.
- [ ] Supply a bounded heartbeat task block without system/tool-definition churn.
- [ ] Add review caps, daily allowance reservations, accounting, and quiet backoff.
- [ ] Handle quiet results from the start of execution, including streaming and
  unread/activity bookkeeping, with retained internal evidence.
- [ ] Verify repeated ticks, human queue priority, pause races, session expiry,
  context rollover, changed model/tools, and an engine without resumable sessions.

Exit: with no further human message, the bot reviews the correct conversation,
performs an authorized tool action, and either reports a meaningful result or
finishes with no visible disturbance.

### 3. Advance commitments and delegate safely

- [ ] Connect commitments to existing delegation, approval, question, and run events.
- [ ] Enforce parent scope, execution lineage, shared allowance, fan-out and depth.
- [ ] Persist waiting states; resume once when the relevant dependency changes.
- [ ] Prevent recursive wakes, self-delegation loops, duplicate results, and repeated
  reminders for unanswered questions. Detect bounded no-progress cycles.
- [ ] Recheck permission revocation and private provenance across the entire chain.

Exit: the coordinator advances an authorized multi-step responsibility, receives
a specialist result, asks only for an actual decision, and continues after the answer.

### 4. Present controls and meaningful interventions

- [ ] Add agent settings, DM status, check now, activity, and commitment navigation.
- [ ] Reuse existing proposal/next-step, ask, approval, notice, and push surfaces.
- [ ] Add source-backed reports, material-change deduplication, dismissal, and
  batched delivery through existing transports.
- [ ] Verify keyboard access, narrow layouts, both languages, rendered copy,
  long histories, and denied/missing targets with real DOM interactions.

Exit: a person can explain why the bot woke, what it did, what it is waiting on,
how much allowance remains, and how to stop it without reading internal logs.

### 5. Recover and integrate

- [ ] Persist claim fencing and recover orphaned queued/running reviews. Reconcile
  linked work before permitting new actions; stale workers cannot finish a new claim.
- [ ] Commit session/commitment progress before publishing a terminal completion
  that can admit a dependent wake. Separate delivery retry from execution retry.
- [ ] Interrupt at each external-effect boundary in tests. Reconcile effects by
  tool identifiers where supported; ambiguous effects wait for inspection instead
  of automatic replay. Do not promise exactly-once external execution.
- [ ] Exercise restart, sleep, simultaneous event delivery, quota failure, model
  failure, permission changes, person removal, history clearing, and coordinator
  replacement. Disable/re-enable and restore never duplicate a scheduler owner.
- [ ] Refresh upstream and next, merge intervening work normally, and repeat
  affected checks against the final combined tree.

Exit: recovery produces neither duplicate actions nor a flood of checks, questions,
or notifications, and independent user work remains usable.

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

All implementation checkboxes are intentionally unchecked. Completing this plan
means the development work is specified; it establishes no tested runtime behavior.
Record exact source revisions, per-slice results, remaining checks, and delivery
evidence here as implementation proceeds.
