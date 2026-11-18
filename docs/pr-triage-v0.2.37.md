# PR triage after upstream 0.2.37

Upstream 0.2.37 is a UX overhaul (#524 Board, #525 lighter app, #534 feedback, #535 team board,
#537 Tuca fix, #538 Antigravity account). It became the new base for `next`. Code for the fork's
own features that could not compile against that base was moved out of the tree, not deleted:

`C:/Users/theap/AppData/Local/hermes/cache/trash/v0.2.37-fork-features-to-rebase/`

The paths are preserved there, so any feature can be restored and rebased. Verdicts below are for
Apo's decision, not a final deletion.

## Superseded by 0.2.37 (recommend drop)

| PR | Feature | Upstream replacement | Evidence |
| --- | --- | --- | --- |
| #366 | Routine says nothing when it has nothing to report | A routine's no-news phrase folds consecutive runs into one line | `src/shared/routine-news.ts`; CHANGELOG 0.2.37 "Changed" (#525) |
| #395 | Read times as 24-hour or 12-hour | Clock type and setter in shared code | `src/shared/clock.ts` exports `Clock`, `setClock`, `hour12` |
| #248 | Reorder / hide sidebar screens | "Take out of the sidebar" with a hidden line and Undo | CHANGELOG 0.2.37 "Added" (#525) |
| #334 | Approval card: action and target first | Approvals grouped by day, repeated actions folded | `src/renderer/src/approval-history.ts`; CHANGELOG 0.2.37 "Added" (#525) |

## Needs a decision (upstream adjacent, not the same)

| PR | Feature | Why it is not a clean drop |
| --- | --- | --- |
| #435 | Proactive initiative bot | Upstream Board (#524) shows work as cards, but has no autonomous coordinator |
| #416 | Grok as another account | Upstream now has Antigravity accounts (#538); the account machinery changed, so this needs a fresh port, not a rebase of the old patch |
| #417 | Notifications over every window | Still fork-only; upstream has no equivalent in 0.2.37 |
| #432 | History retention | Still fork-only |
| #305 | Quota strip and parsers | Still fork-only |
| #375 | Delete a session | Still fork-only; upstream has no deleteSession |
| #268 | Wiki resolver | Still fork-only |
| #405 | Attachments when asking from Team | Upstream rewrote the Team page; the old patch cannot apply as-is |

## Quarantined feature groups still worth rebasing

These have no upstream equivalent in 0.2.37. Recover them from the trash directory when the new
base has settled:

- Jev and classifiers: #279, #284, #333, #379, #383, #385
- Send, steer, follow-up: #261, #332, #338, #288, #290
- Steps UI: #245, #322, #327, #329, #298
- Reply recovery: #321, #391, #457, #411
- Settings and copy: #410, #313 (English copy was partly adopted in the fork's strings)
- History and session: #249
- Images and connector: #336, #303, #353
- Agent, boss and skills: #467, #272, #274, #272, #319, #311, #512
- Standalone: #247, #250, #424, #437, #451

## Settings and strings protected in this ingest

The fork's settings keys were added to `Settings` in `src/shared/types.ts` (routing, classifiers,
dmOrder, agentOrder, navOrder, navHidden, sendMode, wikiResolve, retentionDays, launchMinimized,
resumeInterrupted, teamUpDays, hideEmptyAsks, hideEmptyApprovals, skillFolders, showThinking,
thinkingSize, clock, steps, stepsLatest, notice). The fork's placement document
`docs/settings-architecture-plan.md` and `src/renderer/src/settings-structure.ts` were kept.
Identity fields (package name `tucanonext`, app id `dev.tucano.next`, product name `TucanoNext`,
port pair 47727/47728, no update feed) were restored after taking upstream's tree.
