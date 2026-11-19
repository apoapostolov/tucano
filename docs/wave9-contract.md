# Wave 9 contract: upstream 0.2.40

Base: `upstream/main` `2c071863` (Release 0.2.40). Fork delta source: `c705e912..42121d27`
(the verified 0.2.39 checkpoint). Published fork state: `origin/next` `d1b01915`. The shared
checkout `C:/git-ext/tucano` carries unrelated uncommitted work and is not a worktree for this wave.

## Integrated checkpoint

`C:/git-ext/tucano-wt/ingest-0240` is the only writer for the integrated tree. Apply the delta with
`git diff --binary c705e912 42121d27 -- . | git apply --3way --binary`, resolve by union, keep the fork
identity with version 0.2.40, then gate with typecheck, `npm run check:settings` and the full suite.

## Upstream PR slices

Each slice is prepared from the integrated series, not by re-resolving shared conflicts. Old heads get
a backup tag before any force push. Parent verifies gates, ancestry, pushed tip and MERGEABLE before
posting a compatibility comment. Hold #435 and #424 stay excluded. #32 stays superseded by #411.

| PR | Branch | Worktree | Scope |
| --- | --- | --- | --- |
| #411 | `feat/reply-shortcut-stacked` | `C:/git-ext/tucano-wt/w9-411` | reply series, stacked on #32 |
| #247 | `feat/asks-section` | `C:/git-ext/tucano-wt/w9-247` | full asks port |
| #417 | `feat/notification-center` | `C:/git-ext/tucano-wt/w9-417` | notification windows and language |
| #379 | `feat/classifiers` | `C:/git-ext/tucano-wt/w9-379` | classifiers section |
| #305 | `feat/provider-quotas` | `C:/git-ext/tucano-wt/w9-305` | quota cards |
| #279 | `feat/jev-listen` | `C:/git-ext/tucano-wt/w9-279` | listen mode, stacked on #272 |
| #272 | `feat/mention-mode` | `C:/git-ext/tucano-wt/w9-272` | mention mode |

## Requests polish

The three changes belong to the owning upstream PRs and to the integrated tree:

1. Settings > Agents > Replies. When Parallel is selected, a field sets the maximum number of
   working sessions per channel. Sessions past the limit wait in the queue.
2. Remove Steer and Interrupt from the Agent replies options. Steer becomes a sub-button on sessions;
   interrupting stays the existing stop-session action.
3. A queued prompt pill gets a subline that says the prompt is queued.

Owners: #338 (`feat/steer-followup`) for the send-mode options, cap and queued prompt; #332
(`feat/steer-pill`) for the session steer sub-button. Both are upstream PRs in the wave 1 chain;
each must be rebased onto `2c071863` before its polish is pushed. No polish is published before
the integrated tree is green and the owning branch is verified.

## Known flakes

`test/thought-boundary.test.ts` fails in a full suite even on clean `1c0e4b82`;
`tuca-keep-and-batch-core` and `team-stress` fail under parallel load and pass alone. Children do not
rerun the full suite or build scratch trees to prove those failures. Gate with typecheck, the touched
tests and `npm run check:settings`; the parent runs the full suite and reports the isolates.

## Delivery order

Ingest gates, PR rebases and polish, combined checkpoint, build and install, `doctor --json` with
window `TucanoNext` and a matching asar hash, then push `next`, tag `next-v0.2.40`, release with the
installer, and resume cron `5d2a00418dc2` only after the release is verified.
