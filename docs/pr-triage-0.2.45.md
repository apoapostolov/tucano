# PR triage — upstream 0.2.45 (`8dc2d074`, tag `v0.2.45`)

Apo's rule for this ingest (22 Nov 2026): **Eduardo's commits win over the fork's implementation and
UI/UX.** "If I see some massive discrepancy we will triage between his and my implementations, and we
will open rebased PRs for our implementations."

So the merge took upstream's version of every surface both sides had built, kept the fork's own
features where upstream has no counterpart, and this sheet is the list of what is now *missing* from
the window. Each row is one decision: what upstream now does, what the fork did, and what the wave
would cost. Answer by number ("do 1-4; 5 your rec").

## What this ingest kept from the fork, untouched

- Identity: `tucanonext` / `TucanoNext` / `dev.tucano.next`, version 0.2.45 (identity gate prints it).
- Every personal settings key in all four places (`Settings` type, `RULES`, `PERSONAL_SETTINGS`,
  `keepOnly`), plus upstream's new `repliesAtOnce`, `oneAtATime` and the three order keys.
- The browser lane's source (`chrome.ts`, `chrome-addons.ts`, `browser.ts`, `wall.ts`, `web-tools.ts`),
  the notice surfaces, the Vault import, the copy registry (`scripts/data/english-copy-overrides.json`),
  `self-build.mjs`, the English-copy CI, the Asks page (moved to its own file, `components/AsksPage.tsx`).
- Upstream's own surfaces were taken whole: `Conversation.tsx`, `Pages.tsx`, `Wiki.tsx`,
  `settings-structure.ts`, `runs.ts`, `core/index.ts`'s send path, `SettingsLayout.tsx`, `Harness.tsx`,
  `Panel`'s new expand button (re-added where rerere had kept the fork's file), and the English wording.
- `db.ts` is the fork's superset (reply column, `queue_pos`, the migrations) **plus** upstream's
  `one_at_a_time` column and `oneAtATime` mapping; migrations: 43 on the base, 43 here.

## The rows

1. **A prompt's four send modes and the queue drawer** — upstream replaced the composer's
   parallel/queue/steer/interrupt modes with a cap per conversation (Settings › Agents › Replies) and
   an agent that goes one at a time, and steers only from a reply's own sub-button. The fork's work
   drawer (rows with a grip to drag the queue order, Start, drop, the queued pill under the message)
   is not in the window now, and its socket is gone from the core (`startQueued`, `reorderQueued`,
   `dropQueued` were removed with the fork's scheduler). *Recommendation: accept upstream's, and keep
   the drag-to-reorder of waiting prompts as the one piece to re-apply on top of it if the queue still
   shows in practice.*
2. **Follow Up, and Continue between Try Again and it** — upstream has Continue and Try again on a cut
   reply, in its own footer; the fork's Follow Up pill (an instruction added to a finished reply that
   wakes the same session) and its placement of Try again between Continue and Follow Up are not there.
   *Recommendation: re-apply Follow Up as a wave on upstream's footer; it is a fork-only capability.*
3. **Hold and pause/resume** — the fork could hold a running reply between two tool calls and resume it.
   Upstream's runner has no hold. *Recommendation: drop unless Apo misses it; nothing else reads it.*
4. **The fork's own settings cards** — the five groups show upstream's subjects only. Gone from
   Settings: Quotas (`quotaView`, `quotaHidden`), Recovery (`resumeInterrupted`, `runStallMinutes`),
   Classifiers and Classifier Uses (`classifiers`, `classifierJobs`, `classifierKeys`, `jevNextSteps`),
   Router (`routerEffort`), Routing (`routing`), Wiki capture/resolver/folder/import/rules
   (`wikiCapture`, `wikiResolve`, `wikiDir`…), Session names (`sessionNameModel`, `sessionNameEffort`),
   Browser Extensions (`browserAddOns`), Skill folders (`skillFolders`, `skillFoldersOff`),
   Collaboration (`teamUpDays`), and the conversation extras (thinking size, steps mode, reply
   shortcut, clock, hide-empty asks/approvals). Their keys still exist and still persist.
   *Recommendation: one wave per group, added as extra subjects inside the five groups (not as tabs),
   Quotas and Browser Extensions first — they are the two used every day.*
5. **The steps disclosure and the thinking block's sizes** — upstream's run block folds its own way and
   the thought has no size setting. *Recommendation: accept upstream's; the fork's steps-mode trio
   (all / latest / one line) is worth re-offering only if Apo asks for it.*
6. **Reply to message** — the fork's quote-and-reply (`ReplyTarget`, the `reply` column in the
   database, the composer's quote strip) has no upstream counterpart, so its card and strip left with
   the conversation footer. The column and the type are still there, with nothing writing them.
   *Recommendation: re-apply; it is fork-only and the schema already carries it.*
7. **Pictures in a notification** — the fork passed the message id so a notification carried its
   picture. Upstream's runner hands six arguments, so the seventh is gone. *Recommendation: skip, or
   re-apply by carrying the id on the notify payload upstream already sends.*
8. **A classifier per job in the runner** — upstream asks the classifier dep for its key with no job
   name, so the per-job classifier choice (`classifierJobs`) only reaches the core's own calls.
   *Recommendation: re-apply inside the settings wave (row 4), together with the Classifiers card.*
9. **The asks page's spec** — the page itself is back (`components/AsksPage.tsx`), on upstream's
   `QuestionCard` and `questionDrafts`; its five tests are quarantined because they assert the fork's
   card and its own history rows. *Recommendation: re-point the tests at the page as it now renders;
   small, do it in the same wave as row 4's dialogs.*

## Where the replaced behaviour's spec lives

`quarantine/0.2.45/README.md` lists all 78 test files by group, with the upstream feature that
superseded each. They are excluded from `vitest` and from `tsc` until a wave moves them back.
