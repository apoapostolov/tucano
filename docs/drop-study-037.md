# Drop study against the 0.2.37 base

Apo asked (2026-11-18) for every wave after wave 1 to be studied for drop potential while wave 1
PRs are being prepared. Each PR is compared with its own merge base and with the current upstream
tree (`upstream/main` = `4522704e`) and the 0.2.37 changelog. Verdicts are evidence, not decisions:
nothing leaves the plan until Apo decides. Drop candidates are marked **D?**, narrow scope **N**,
clear keeps **K**.

## Waves 7 and 8 (studied, 2026-11-18)

Merge bases for #274, #272, #416, #424, #250, #411, #288 and #290 are `68cf5da1`; #334 starts at
`04539404`, #467 at `e326c70e`, #512 at `e61f6e46`. All predate the 0.2.37 sidebar and account
changes, so every keep needs a rebase, not just a retarget.

| PR | Verdict | Evidence and surviving scope |
| --- | --- | --- |
| #274 team-ups | K | `team-up.ts` (`TEAM_UP_GUESTS`, `TEAM_UP_REUSE_MS`, `staleTeamUps`, `fitTeamUpName`), `roster.ts` `EQUIPE`, `team-up-privacy.ts`, `TEAM_UP_DAYS`. Search for `teamup\|team-up\|team_up` on upstream `src/` returned nothing; upstream `pedir` in `delegations.ts:22` is a one-way request into the recipient's room, not a shared room. |
| #467 multi-boss | K | `Agent.alsoTo`, `agents.also_to`, `bossesOf()`/`kidsOf()`, team file `alsoAnswersTo`. Upstream `shared/org.ts:1-23` has one `reportsTo` tree; `db.ts:570` COLUMNS has only `reports_to`. |
| #272 mention mode | K | `mentionOnly`, `members.mention_only`, `setMembers(..., mentionOnly?)` and the routing hook. Upstream has no such symbol; `runs.ts:632` is still the block the PR patches. |
| #416 Grok accounts | K, reconcile with #538 | PR adds `'grok'` to `ACCOUNT_ENGINES`, `grokAccountEnv`, `GROK_HOME`/`GROK_AUTH_PATH`, plus `dropAccountDir`/`sweepAccountDirs` in `account-folders.ts`. Upstream `types.ts:577` has only claude/codex/antigravity and CHANGELOG:25 is the Antigravity account (#538). Both engines must survive as a union; the folder sweep is also absent upstream and fixes a Windows remove-account throw. |
| #424 room sharing | D? | No upstream equivalent, but the PR is a design doc plus optional type fields and a helper that nothing reads. It ships no user-visible capability; recommend keeping it only as the spec for #423, not as a wave feature. |
| #250 channel reorder | N | Upstream already has hide (`sidebar-top.ts` `setHidden`/`useHidden`/`Tucked`, CHANGELOG:22) and channel DnD with groups (`channel-layout.ts:52/62`, `Sidebar.tsx:331-376`, CHANGELOG:675). Surviving piece: `moveChannelTo()` in `shared/channel-layout.ts`, `useHoldReorder` from `reorder.ts` (350 ms hold, pointer capture after pickup, `elementFromPoint` hit testing), and the channel row wiring that drops `draggable`. Drop `list-order.ts`, `dmOrder`/`agentOrder`/`navOrder`/`navHidden`, the `NAV_HIDE` line, `moves()` glyphs and their tests; keep `channel-layout.test.ts` "moveChannelTo" and the generic gesture tests. |
| #334 approval card | D? | Earlier triage said drop, but this study found live behavior: `ApprovalResult`, `approvals.result`, `setApprovalResult`, `attempted` tracking, `approvalFace`/`approvalStatus`, `approvalsIn` and awaited `decideApproval`. Upstream still has a prose `approval__title` and void `decideApproval`, so the earlier drop call was too broad. Needs a decision. |
| #411 reply shortcut | K | `ReplyTarget`, `Message.reply` with excerpt, `messages.reply`, `replyShortcut`, `isReplyShortcut`, transcript quoting. No upstream symbol; migration must stay last in `MIGRATIONS` after rebase. Test names not captured, marked for manual check. |
| #288 work drawer | K | `SendMode`, `sendMode`, `send_mode`, `queuedMessages()`, `resumeQueued()`, `allWorkingIds`. Upstream `followups.ts` still enforces one reply per agent and thread with no override. Pairs with the send-mode commits dropped from #332's PR head; #261 carries the setting half. |
| #290 prompt-before-session | K | `asSaid()` keeps a working reply under its prompt; `JumpTo`, `promptAway`, `PromptJump`. Upstream `asSaid` still sorts naive lists and has only a `focus` effect. |
| #512 Windows skill hash | K, verify vectors | `cmpParts` lowercases `pathPart` in `hermes-import.ts`; upstream compares raw parts and skips the hash vector on win32 (`hermes-import.test.ts:317`). The two asserted hashes were not recomputed; run the PR's test before shipping. |

### Evidence gaps from this batch

- #411: source diff read, test names not verified.
- #512: hash vectors asserted, not recomputed.
- #424: spec-only behavior is a decision, not an evidence question.

## Waves 3 and 4 (studied, 2026-11-18)

No verbatim upstream implementation of any of the ten, so no full DROP. Merge bases: #279/#383
`90d144a4`, #333/#284 `2c4f0552`, #379/#385/#432 `04539404`, #305 `32468eb7`, #249/#437
`68cf5da1`.

| PR | Verdict | Evidence and surviving scope |
| --- | --- | --- |
| #279 listen mode | K | `members.mention_only`/`listen`, `Conversation.mentionOnly[]`/`listen[]`, `setMembers(..., mentionOnly?, listen?)`, `Runner.answering()/listening()/heard()`, `listenJev()`. Upstream `members` is only `(conversation_id, agent_id)` (`db.ts:79-84`); `Dialogs.tsx:217` calls `setChannelMembers(id, picked)` with no modes. |
| #284 jev-recommended | K | `jevRecommend`, `recommendOptions()`, `run.recommended`, `InboxQuestion.recommended`, `Runner.recommend()`. Upstream `Decisions.tsx` has no recommend; its "Recommended" tags are autonomy and voice only. |
| #333 routing pools | K | `shared/routing.ts`, `core/model-routing.ts`, `Settings.routing`, `Agent.smartRouting`, `RouteTrace` line, `RoutingPane`. Upstream has none of these files or panes; `tier` appears once for the OpenCode free tier. |
| #379 classifiers | K | `shared/classifiers.ts`, `core/classifiers.ts`, four providers, `CLASSIFIER_JOBS`, `setClassifierKey`. Upstream has zero `classifier` hits in `src`; `jev.ts` hardcodes the TypeSafe endpoint. |
| #383 classifiers-six | N, D? as a branch | Duplicate of #279/#284/#333/#379/#385; unique commits are `8112e1b8` (six jobs on one card), `842e286a` (router row and tab button), `bfc09ad9`, `a1aa088d`. It also carries a stale next-steps copy where `startsTicked` returns every index. Recommendation: drop the branch, cherry-pick the four unique commits onto the merged set. |
| #385 next-steps ticks | K, fix copy | `NEXT_STEPS` ToolDef, `Decision.nextSteps`/`ticked`, `parseNextSteps`, `startsTicked`, "Do these" button. Upstream tool list has no `next_steps`. The branch carries copies of #379 and #284, so merge #379 first or resolve those files. |
| #305 provider quotas | K, scope note | `quotas`/`quotasRefresh`, `ProviderQuota`, parsers, cache, logins discovery, `QuotaStrip` in the header. Upstream already has `Quota`/`CodexQuota` rings in `Usage.tsx` (lines 93-94, 240, 260); the new part is one strip for all providers and the header strip. |
| #432 history retention | K | `shared/retention.ts`, `core/retention.ts` daily sweep, `retentionDays`, `wipeHistory`, `history_wiped`, settings danger area. Upstream has zero `retention` hits and only `deletePerson`/`scrub()`. |
| #437 db optimize | K | `Db.size()/check()/statistics()/trim()/rebuild()`, `busy_timeout`, `dbHealth`/`optimizeDb`, file section in backup card. Upstream VACUUM lives only in `scrub()` and `wiki.ts`; `quick_check` only in `restore.ts:175`. |
| #249 clear history | K | `cleared_at`, `STILL_THERE` filter on every read, `clearConversation` RPC, sidebar action, `forgetSessions` and approval/question cleanup. Upstream has only `deleteConversation`, which removes the row. |

### Stacking risk in waves 3 and 4

- #383 cannot merge without #279, #284, #333 and #385; merging it instead of them ships the stale
  next-steps copy and a six-job set built on an older `questions.ts`.
- #385 carries #379 and #284 inside it. If #379 lands first there are conflicts in
  `classifiers.ts`, `jev.ts`, `index.ts` and `Pages.tsx`; if #379 is dropped, the module still
  travels with #385.
- #333 does not depend on #279 or #284, but under #383 its `smart` job moves behind the Classifiers
  card, so merge #333 before #383.
- All eight branches share one "Group settings by their user decision" commit, so merging several
  conflicts in the settings nav array. No behavior lost, UI grouping only.
- #249 and #432 both expire pending approvals, close questions and call `forgetSessions` through
  different paths. Merge both or unify the invariants, otherwise two history-clearing paths.

### Defects and thin evidence from this batch

- #385's `NEXT_STEPS.description` told the agent the card opens with everything ticked after
  commit `88ef4247` made it open clear. Fixed on the pushed branch in `0ef761f6` and re-gated at
  97/97. #383's `jobAbout.nextSteps` still carries the stale wording; fix it before merge.
- #279, #249 and #432 re-add COLUMNS entries upstream already has; check for duplicates after merge.
- #305 provider contracts and #379's vendor model ids were asserted in comments, not verified
  offline. #333's default six pools and ten roles are a product call, not a narrowing decision.

## Waves 5 and 6

Pending.
