# Quarantine 0.2.45 — the fork's tests for what upstream took over

Upstream Tucano 0.2.45 (`eduwxyz/tucano` `8dc2d074`, release `v0.2.45`) rebuilt the ground under a
large part of TucanoNext's own UI: the reply scheduler (its per-conversation cap and one-at-a-time
instead of the fork's four send modes and its queue), the run block in the conversation, the settings
pages (five groups with a search), the asks card, the steps disclosure and the sidebar order.

Per Apo (22 Nov 2026): **upstream's version wins over the fork's implementation and UI/UX**, and what
disagrees with it is triaged afterwards as rebased PRs. The tests here are the fork's specification of
the behaviour that was replaced. They are **kept, not run and not typechecked** — `vitest.config.ts`
excludes `quarantine/**` and `tsconfig.json` only includes `src` and `test` — so that a wave that
re-applies one of these features has its spec back verbatim, and so that nothing reads as a pass that
was never checked.

They fall into groups, each named with the upstream feature that superseded it:

| Group | Files | Superseded by |
| --- | --- | --- |
| Reply queue (start, reorder, drop, drain, forget, the queued pill) | `queue-drain`, `queue-drop`, `queue-forget`, `queued-pill`, `routed-reply-queue`, `retention-queued-wipe`, `retention-live-wipe` | #261/#626: a cap per conversation (`repliesAtOnce`) and an agent that goes one at a time (`oneAtATime`) |
| Hold, pause, resume, follow-up | `followup-run`, `follow-up-row`, `follow-up-row-field`, `steer-followup`, `steer-run`, `steer-row-field`, `runner`, `restart-runs`, `restart-many`, `recovery-again`, `orphan-sweep`, `reply-rpc`, `thread-opens-on-send` | #331/#332 steer sub-button; the fork's hold/pause/follow-up have no upstream counterpart |
| Run block, steps, thinking | `steps-disclosure`, `steps-rail`, `steps-mode`, `steps-remember`, `thinking-scroll`, `thinking-size-labels`, `thinking-levels`, `thought-line`, `thought-size`, `work-row-hover-colour`, `work-drawer-ui` | #245 thoughts, the `RunBlock`/`RunSteps` rewrite |
| Settings placement and structure | `settings-placement`, `settings-structure`, `settings-organization-live`, `settings-conversations`, `dm-settings-ui`, `agent-models-ui`, `quotas-settings` | #605 five groups with a search |
| Asks and questions | `ask-card`, `asks-page`, `asks-history`, `asks-waiting`, `asks-dismiss`, `people-roles`, `team-fixes-ui` | #584 Cancelar on the ask card |
| Classifiers, routing, listen, mention | `model-routing-run`, `routing-spent-quota`, `jev-listen`, `jev-listen-ui`, `jev-recommend`, `mention-mode`, `mention-mode-ui`, `classifier-uses-ui` | not replaced: their cards were drawn in the fork's settings pages, which the five groups rewrote |
| Wiki and Vault surfaces | `wiki-handoff-ui`, `wiki-resolver-ui`, `wiki-tools-card-ui`, `wiki-write-core`, `wiki-live-permissions` | not replaced: same reason (their cards lived in the fork's Pages.tsx) |
| Conversation extras | `continue-button`, `continue-killed`, `continue-silent`, `continue-survives`, `copy-markdown`, `edit-prompt`, `prompt-jump`, `composer-focus-ui`, `reply-composer-ui`, `thread-name`, `delete-session-ui`, `clear-history`, `ask-card` | the conversation footer rewrite |
| Browser lane | `browser-click-ui`, `chrome-headful`, `notice-mode`, `triggers`, `tuca-skills`, `ui-english`, `team-stress`, `sidebar-agents` | the browser card and the conversation that the lane's UI hung from |

Nothing here is deleted, and nothing here is a verdict: the triage sheet for this ingest is
`docs/pr-triage-0.2.45.md`, and a wave that brings a group back moves its tests out of here and into
`test/` in the same commit.
