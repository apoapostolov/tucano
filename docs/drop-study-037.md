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

## Waves 3 and 4

Pending.

## Waves 5 and 6

Pending.
