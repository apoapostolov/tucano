# Rebase plan: fork features onto the 0.2.37 overhaul base

This is the work order after upstream 0.2.37 rebuilt the app UX. The fork's code was moved aside to
`C:/Users/theap/AppData/Local/hermes/cache/trash/v0.2.37-fork-features-to-rebase/` and its tests to
the sibling `.../v0.2.37-unadopted-tests/`. Nothing there was deleted. PR decisions live in
`docs/pr-triage-v0.2.37.md`.

## Order

The person's stated priorities decide the order: **settings and strings, steer button, next steps
(asks)**, then the remaining feature groups. Build and install after every two to four landed
changes so the installed TucanoNext can be tested between waves.

| Wave | Changes | Build |
| --- | --- | --- |
| 0 (done) | Restore all fork settings RULES (`src/core/settings-patch.ts`), `db.keepOnly`, `Settings` fields, `PERSONAL_SETTINGS`, `Agent.steps`, `Step.kind`, `src/shared/steps.ts`, `src/core/step-text.ts` | after wave 1 |
| 1 (in flight) | Settings controls and strings in the new settings UX; steer button; next steps / asks | checkpoint 1 |
| 2 | Send modes, hold/reply recovery and resetting, thinking display, **settings organization (#446)**: wire `SettingsLayout`/`settingsStructure` into the new tabbed settings page, navigation under the active tab, not a replacement for `SETTINGS_TABS` | checkpoint 2 |
| 3 | Jev, classifiers, routing, smart routing | checkpoint 3 |
| 4 | Quotas, retention | checkpoint 4 |
| 5 | Wiki resolver and wiki tools | checkpoint 5 |
| 6 | Images, connector icons, notices | checkpoint 6 |
| 7 | Team-ups, mentions, sidebar ordering | checkpoint 7 |
| 8 | Remaining individual fixes and PR tails; sweep the open-PR backlog | final build |

## Waves 3+ (planned detail)

The table above is the skeleton. This section is the working detail, so the next ingest starts with
the chains, placement choices and checkpoint checks instead of rediscovering them. Every wave keeps
the same loop: rebase PR branches in isolated worktrees, verify gates and pushed tips, push with a
pinned lease, comment with the Lite Desktop wording, build a checkpoint, then hand over the hash and
the visible checks.

### Wave 3 — Jev, classifiers and routing

| PR | Role | Branch |
| --- | --- | --- |
| #279 | listen mode, leaf base | feat/jev-listen |
| #284 | Jev-recommended tick, leaf base | feat/jev-recommended |
| #333 | six routing pools and the reason line | feat/jev-routing-pools |
| #379 | Classifiers section | feat/classifiers |
| #383 | classifiers on all six jobs, stacked on #279, #284, #298, #333 | feat/classifiers-six |
| #385 | next-steps ticks from the classifier | feat/next-steps-ticks |

#385 is in wave 1 because next steps is a top priority; its classifier half only becomes meaningful
once #379 lands, so it is rechecked here for the full job wiring. Rebase bottom up: #279, #284,
#333, #379, then #383; push each branch before starting the next so the stack bases stay real.
#383 is draft and held for Apo's decision: only the isolated artifact `rb/iso-383` exists locally
(`2fe0d025`), so wave 3 pushes #279, #284, #333 and #379 and leaves the six-job stack untouched.
#385 is already pushed in wave 1 and is only rechecked here for the full job wiring.
Quarantined source: `src/core/jev-fake.ts`, `src/renderer/src/components/Routing.tsx`; tests:
`classifiers`, `classifiers-router-row`, `jev-fake`, `jev-listen`, `jev-listen-ui`,
`jev-recommend`, `jev-recommend-ui`, `model-routing-run`.

Placement rule: the thin reason line stays attached to the existing Jev line rather than getting its
own rail. The Classifiers section goes where the new base already groups agent intelligence, using
the base's section and row primitives; the old settings screen is not restored. With multiple
classifiers, the separate **Jev as a classifier** card is removed: `Mark the recommended option`
becomes one role inside **Classifier Uses**, while the models and keys stay under **Classifiers**.
The branch had also lost the option-marking behavior when the Classifiers section landed, so #379
restored it and the switch now writes `jevRecommend` from Classifier Uses. Final #379 head
`99fb3b7a` with comment `6989254592`. Checkpoint 3 checks:
a routed reply carries a visible reason line, the Classifiers section is reachable, and a question
card can show Jev's recommended option.

Pushed 2026-11-18, verified at the pushed tip and **MERGEABLE**:

| PR | Branch | New head | Tests | Comment |
| --- | --- | --- | --- | --- |
| #279 | feat/jev-listen | `d6da9578` | 31/31 | [6982046893](https://github.com/eduwxyz/tucano/pull/279#issuecomment-6982046893) |
| #284 | feat/jev-recommended | `495976ed` | 13/13 | [6982047553](https://github.com/eduwxyz/tucano/pull/284#issuecomment-6982047553) |
| #333 | feat/jev-routing-pools | `f6607651` | 92/92 | [6982048457](https://github.com/eduwxyz/tucano/pull/333#issuecomment-6982048457) |
| #379 | feat/classifiers | `26c88ab1` | 12/12 | [6982049166](https://github.com/eduwxyz/tucano/pull/379#issuecomment-6982049166) |

#379 dropped one commit, `e614d4e6`, because its single hunk was a strict subset of #284's
`7d8e5561`: both move the browser card to Models and shorten its English lead. Every other commit
survived. The single full-suite failure seen on #333 and #379 is the known `tuca-keep-and-batch-core`
timeout under load; it reproduces on pristine upstream/main and passes solo on both branches.

Checkpoint 3 installed from union tree `274e043b` in `C:/git-ext/tucano-wt/ckpt3-build`: asar
**37499824** bytes, SHA-256 `c64c6fe5add2a8dae896c80734669182d9ca9bd4d874283182c32e00d525adb7`.
Verify with `cd C:/git-ext/tucano-wt/ckpt3-build && node scripts/self-build.mjs doctor --json`; it
reports `sameAsBuild: true`, `verdict: running`, window "Tucano". The installed binary was refreshed
at tree `2235b9cd` after Apo caught one more #446 detail: the "Show the microphone" checkbox belongs
immediately after "Turn dictation on" on the same row; asar **37500147** bytes, SHA-256
`fd43b7b80cce61575678cd71f314ef289ae2097379b3aed5505ac1f5eaf0bc57`. It was refreshed again at
tree `9b5c7183` after Apo's wave 3 polish: Models now shows Classifiers before Router, the add and
router-model forms use the same indented row as their entries with the glyph column reserved, and
"Where each one is used" became its own **Classifier Uses** card (`models-classifier-uses`); the
dictation microphone and Advanced controls share one row, with Advanced at the card's right edge.
Current asar **37502515** bytes, SHA-256
`1f9d69839cf572682b02af80a642da4df6e85088f44a98971f0f6ceeff97dd8a` (tree `64e6fc16`). Gate: typecheck 0 errors and 91/91
across the seven wave-2 and wave-3 suites, plus 51/51 on the wider listen, recommend, routing and
settings suites. Visible checks: a routed reply carries a reason line, the Classifiers card sits
beside the Router card in Models, a channel can be put in listen or mention mode, a question can
show Jev's recommended option, and all wave 2 checks still hold.

### Wave 4 — Quotas, retention and storage hygiene

| PR | Role |
| --- | --- |
| #305 | provider quotas in Usage and limits, plus session header strip |
| #432 | history retention periods and wipe for all bots or one |
| #437 | database vacuum and soundness report |
| #249 | clear a conversation's history without deleting it |

Prep measured 2026-11-18: #305 `217d4026` (5 commits, 22 files, +2204), #432 `35070e86` (9,
25, +1113), #437 `a31233ed` (4, 12, +402), #249 `acef2d74` (3, 12, +375). #437 is already
MERGEABLE on the old base; the other three are CONFLICTING. #432 and #437 each contain a commit
titled "Group settings by their user decision", but they are different copy edits: `13fa902d`
rewrites the retention label and hint, `47db7bad` rewrites the database storage label and hint.
Keep both. The #446 correction was pushed as `737e9c34` with comment `6983648996`, so its section
rail and dictation layout are the baseline these PRs must fit into.

Quarantined source: `src/core/quota-cache.ts`, `src/core/quota-parsers.ts`, `src/core/quotas.ts`,
`src/core/retention.ts`, `src/renderer/src/components/QuotaStrip.tsx`. The quota rule is fixed: a
single core cache polls every 20 minutes whether or not the page is open; the Usage page renders the
held reading immediately and animates from stale to fresh on refresh. Do not fetch on page open and
do not let an explicit refresh join a second request. Checkpoint 4 checks: quota values appear with
no loading gap, an explicit refresh animates the same block, retention settings are reachable, and
the database action reports whether the file is sound.

The header-strip polish was a fork change but never a PR: `ec37eceb Give every bar in a header the
width of the longest name drawn` exists only on `feat/quota-strip-even`, and no wave 4 branch
contains it. It is being ported onto #305, the PR that adds the strip: each provider's name goes
above its bar, and a CSS grid with equal columns gives every bar the width of the longest name in
the conversation. The old hover box and focus peek stay out of this port.

Quota presentation shipped with checkpoint 4: the selector between **Circle ratios**, the native
Tucano treatment, and **Table**, the view #305 brings, lives in Settings › General, in the same card
as the provider checkboxes. One setting decides the shape for all providers, replacing the old mixed
rule that drew Codex as circles and every other provider as a table. The checkbox row for each
recognized provider configured in a harness controls whether its quota is shown in the conversation
and in Usage and limits; unknown or unconfigured harness entries get no row.

Wave 4 PRs were pushed and verified on 2026-11-18: #305 `72541a7f` (53 quota tests, clean build and
three screen probes; usage lives in the Operations hub), #432 `c2445ee9` (60 retention + 18
team-round3 + 67 people tests), #437 `b48f73fa` (27 database tests and 3 skips; the OpenCode timeout
commit was an exact duplicate and was dropped), and #249 `ba627116` (12 clear-history tests; action
in the sidebar row menu, emptied conversations say "Histórico limpo."). Each is MERGEABLE and has a
Lite Desktop compatibility comment. The wave 3 polish was pushed afterwards to #379 `331d2740` and
#333 `5c945503` with correction comments, so the PR heads now match the installed layout.

Checkpoint 4 is installed at source tree `08f0497c`, asar **37571321** bytes, SHA-256
`c154368e3b803620bc2a5ee098c93e1aa8b4b3374183d4a7b685d7deea10bd2a`. Gate: 0 conflict markers, 0
TypeScript errors and 34 files / 345 passed with 6 skipped across the wave 4 union and settings
suites; `self-build doctor` reports `sameAsBuild: true` and `verdict: running`. Confirm the wave on
screen by opening Settings › General: **Quotas** sits between Workspace context and Dictation, with
the Table/Circle ratios selector and one checkbox per configured harness provider. In Operations ›
Usage and limits the quota block shows the cached reading immediately, and switching the selector
redraws every provider in the chosen shape. An emptied conversation says "Histórico limpo.", the
the history-retention field is in the workspace danger card, and the database card reports soundness.

Apo's wave 4 polish is in this build: the Table/Rings selector sits to the right of its row, provider
subtitles are tight to their titles, provider rows come from the reader's cached snapshot so Grok,
Z.ai and DeepSeek get switches, rings are grouped in one card per provider, and the old "What each
provider has left" heading is replaced by a Month-style header with the provider count as the large
figure and the read time in the muted line. The polish gate was 7 files / 64 tests passed, with the
known `thought-boundary` full-suite failure reproduced on clean HEAD.

Two later polish fixes are in the same build. Provider columns in the quota table now show the title
only; the error or login detail stays on the column's `title` for hover. The Classifiers section
anchor starts at the Classifiers card, with Router given its own `models-router` section, and the
rail follows the card order Classifiers, Router, Classifier Uses. Gate after both fixes: typecheck 0
errors and 6 files / 57 settings and quota tests passed.

### Wave 5 — Wiki and skills

| PR | Role |
| --- | --- |
| #258 | Write the page hands a missing page to a chosen agent |
| #259 | Nothing links to them hands orphan pages to an agent |
| #268 | Resolve button and built-in resolver for unsettled findings |
| #355 | wiki tool card on the agent's Tools tab, with write level |
| #311 | Hermes skill library layout: categories, versions, facets |
| #319 | Tuca-selected skills shown in ver_estado |

The overhaul rewrote the wiki, so these are behavior ports, not markup restores. Each action needs a
clear entry point on the new wiki card and a confirmation that shows which agent was handed the job.
Skills layout and Tuca skills share the skill-library files, so they are one build unit. Checkpoint 5
checks: a missing page offers Write the page, an orphan list can be handed off, a finding can be
resolved, and the skill library reads with its categories and versions.

Wave 5 PRs were pushed and commented on 2026-11-18: #258 `f130d5d6`, #259 `8d696ed2`, #268
`cd11c7fd`, #355 `12a785a0`, #311 `30395df6` and #319 `b528d365`, all MERGEABLE. #259 sits on the
rebased #258 head and carries only the orphan-page delta. Checkpoint 5 is installed at source tree
`90bb8a48`, asar **37626447** bytes, SHA-256
`2953699f8dc6e07eecd2aaf742d2d1c53f3b833d957d4a81b2a818f700417d24`. A later polish at tree
`7fb5a029` keeps the wiki sidebar in place when a finding is handed to an agent: the request shows a
"Request sent" line instead of navigating to the conversation. Its asar is **37626697** bytes,
SHA-256 `b70e8b9e34619628e58265a53fdacf4c6d751a706c058c0fc542ca4a4b2c4358`. A second polish at tree
`44a5e61d` names each provider above its header bar and makes all bars the width of the longest name
in the conversation, preserving rings mode and hidden-provider filtering. Its asar is **37627846**
bytes, SHA-256 `7045d486eba1089ce651273d16377b81a5fa5474f45813f916531416f8daf4e7`. A third polish at
tree `fa1c1f40` limits the header strip to the providers configured as a conversation member's primary
or fallback model, so a logged-in provider nobody there uses has no bar. Its asar is **37630102**
bytes, SHA-256 `84ffbf4de64705f4a2a1a4a923ff8e257809ecb25f15262870012bd65d0347e9`. Gate: 0
TypeScript errors and 6 files / 53 quota tests passed. The #305 PR is receiving the same filter.
`self-build doctor` reports `sameAsBuild: true` and `verdict: running`. Confirm the wave on screen
by opening the wiki: a missing page offers Write the page, an orphan can be handed off, an unsettled
finding offers Resolve with a built-in resolver, an agent's Tools tab has the three-level wiki switch,
and the skill library in Settings › Agents shows categories and versions. Tuca's ver_estado shows the
skills a bot follows. The full suite has two known load flakes, `thought-boundary` and
`tuca-keep-and-batch-core`, both reproduced outside this change.

### Wave 6 — Images, connector icons, notices and guide

| PR | Role |
| --- | --- |
| #303 | reply pictures drawn as one album |
| #336 | right-click a picture: save, copy, put back in the prompt |
| #353 | connector picture instead of a black terminal |
| #417 | notices over every window |
| #451 | guide's 24 pages in English, per workspace |

0.2.37 ships system notifications of its own. When #417 is ported, add a **Native / Enhanced**
selector in Settings > Notifications: Native uses the 0.2.37 system notifications unchanged, and
Enhanced turns on this PR's cross-window notices. Our notification settings must render only when
Enhanced is selected, so the two systems never stack their controls or duplicate a notice. Keep the
selector beside the existing notifications card and use the new settings row and tab idioms.
Apo also caught a colour defect in the old branch: successful response notices drew the bottom time
bar in success green. It is fixed on `feat/notification-center` at `21845284` by giving `.nc--done`
the signature `--toast-ink` orange; the wave 6 rebase keeps that fix. That earlier push was found to
be on the 0.2.29 base despite the fix, so it is being replaced: the corrected branch must have
`4522704e` as an ancestor before it is pushed or commented on again. The corrected branch is now
`73a33d6c` (MERGEABLE, comment `6988846348`): all 12 PR commits replayed onto 0.2.37 with the orange
bar intact, plus a Native / Enhanced selector in Settings › Notifications. Native keeps 0.2.37's
system notifications; Enhanced shows the cross-window settings, with legacy `on: false` mapped to
Native and existing users defaulting to Enhanced. Gate: 0 TypeScript errors and 24 notice tests.

Wave 6 prep heads on the real 0.2.37 base: #303 `eeaed571`, #336 `987efddf`, #353 `451f29d0` and
#451 `ba2f238f`, all clean, 0 TypeScript errors and pushed/MERGEABLE with compatibility comments.
Their own gates passed: 11, 23, 18 and 13 tests respectively; #353's full suite also passed with
2103 tests and 61 skipped. #303 and #336 were verified as a pair: without a union the album cells
lose the image-menu right-click, so checkpoint 6 must attach the same `openImageMenu` handler to
`artifact-image gallery__cell` that `ArtifactCard` uses. The verified union is saved at
`C:/Users/theap/AppData/Local/hermes/cache/scratch/wave6-303-336-combined.patch`. Screenshots
belong on the frames branch pinned by commit, not in the code diff. Checkpoint 6 checks: a reply with
several pictures shows one album, the image menu works on album cells, connectors show their icons,
and a notice can be raised from any window.

Checkpoint 6 installed from `589e1aec` (union `f6753ef2`, 0.2.38 delta `c8da6cf3`, subtitle fixes
`08fd5965` and `88ca2d01`, modal mode rows `2477ad44`, plain circled `?` `502a8f0b`, classifier fold
`6ccb8aee`, quota hover cards `589e1aec`): asar **37828614** bytes, SHA-256
`9485c3136474d83b188b5241cd00507bb55b05dc655d42c337e5eb828f82c0dc`.
Doctor: `cd C:/git-ext/tucano-wt/ckpt6-build && node scripts/self-build.mjs doctor --json` reports
`sameAsBuild: true`, `version: "0.2.38"`, `verdict: running`. To confirm on screen: the app reports
0.2.38; a reply with several pictures shows one album and the image menu opens on album cells;
connectors show their icons; Settings › Notifications offers Native / Enhanced with enhanced rows
only in Enhanced and an orange time bar on done notices; the English guide carries the new
folder/Docker hint; the Usage quota table keeps the provider's login or plan under its column title,
while Settings › Quotas lists providers by name with no sentence under each row;
quota header bars show only the conversation agents' primary/fallback
providers, with names above equally wide bars; hovering one opens a card under the strip that clears
the routines pill and other topbar buttons, and focus lists all bars. Settings › Classifiers has one
Classifier Uses card with `Mark the recommended option` inside it and no separate Jev-as-classifier
brick. A wiki request stays in the wiki sidebar. In
**Agents in #channel**, mention and listen modes appear on a second row under each elected agent,
each with a circled `?` hover explanation, never beside the name. Version strings stay fixed across fork
builds, so the hash is the real marker.

Upstream released **0.2.38** at `9c246bac` during wave 6 with only two commits: the Canva-on-server
fix and the release bump. Apo decided to ingest them into this wave rather than leave them for a
later ingest, so checkpoint 6 now carries the 0.2.38 delta (9 files) on top of the wave 6 union,
with TucanoNext identity preserved and the version bumped. Locally all wave 6 branches merge cleanly
against the new head except #305, whose only conflict was the CHANGELOG; that branch was rebased
onto 0.2.38 and is MERGEABLE at `63bf0ff9` with comment `6989194954`. The other PR branches merge
cleanly and keep their 0.2.37 base until their own rebase is due.

### Wave 7 — Team, mentions and accounts

| PR | Role |
| --- | --- |
| #274 | team-ups: an outside agent gets a channel that carries the work |
| #467 | one agent answers to more than one boss |
| #272 | mention mode: answer only when mentioned |
| #416 | Grok login as another account in the new account code |
| #424 | room visibility and agent read access |
| #250 | accessible channel reorder: hold a row, see where it lands, move it by keyboard |
| #435 | **Held, obsolete in the current implementation, pending redesign. Do not port.** |

Wave 7 is complete on upstream 0.2.38 at `9c246bac`: #274 `0aa2d2bc`, #467 `14bf8edc`, #272
`5be98db0`, #416 `04f709b7` and the narrowed #250 `012ae5d6`, all clean, 0 TypeScript errors,
pushed, MERGEABLE and commented (`6990937835`, `6990938503`, `6990939205`, `6990939867`,
`6990940594`). #305 later gained the 0.2.36 custom quota hover cards at `8a3336e4` with comment
`6990982155`, still MERGEABLE. #274's interoperability assessment found one real 0.2.38 gap: team-up rooms now go
through `agentsFor(requester, …)` and grant the room to restricted people who could see the source
conversation. #467's multi-boss exclusion is a noted coordination item, not a defect on this base.
Draft #424 was
rebased locally for study only (`8b851981`) and stays unpushed and uncommented until Apo decides
whether it is dropped; #435 stays excluded. The shared contract, including gates, is
`C:/Users/theap/AppData/Local/hermes/cache/scratch/wave7-contract.md`.

Both older gaps are closed in the live checkpoint: the Jev-as-classifier fold at `6ccb8aee` and the
0.2.36 quota hover cards at `589e1aec`, including the measured fix that clears 0.2.37's routines pill.
Wave 8 can start from checkpoint 6 at `589e1aec` / asar `9485c313...`.

Apo's 2026-11-18 narrowing, from the Lite Desktop model: hiding core sidebar features is upstream's
job (`sidebarHidden` with Undo in `sidebar-top.ts`), so that half is dropped. Reordering applies to
**channels only**, on top of upstream's existing `moveChannel`/`nudgeChannel` context menu in
`Sidebar.tsx`: bring the hold-a-row, show-where-it-lands and keyboard interaction to channel rows.
Freeform agent reordering is dropped entirely, because agents are now ordered by their sector in a
team. Sidebar screen ordering is dropped as well. `agentOrder` and `navOrder` stay as restored
settings keys for backward compatibility, but no new UI writes them.
Apo's 2026-11-18 ruling: the initiative feature was never completed well enough to migrate. It is
draft-only, obsolete in the current implementation and pending a full redesign. Do not rebase its PR,
do not port any of its files, do not build it into a checkpoint, and do not post a compatibility
comment on it. `src/core/initiative.ts` and `src/core/initiative-heartbeat.ts` stay in quarantine as
an archive of the old design. `src/core/team-up.ts` is separate and still belongs to this wave.
Quarantined source:
`src/shared/team-up-privacy.ts`, `src/renderer/src/components/Initiative.tsx`. Checkpoint 7 checks:
a team-up creates a carry-over channel, a shared specialist serves two teams, mention-only agents stay
quiet until named, the Grok account appears in the new accounts UI, and a channel row can be
reordered by hold and keyboard.

### Wave 8 — Tail and tooling

#334 (approval card) is a drop candidate per triage; #411 reply shortcut stacked on #32, #288 work
drawer, #290 prompt-before-session and #512 Windows skill hash land here if still open. The deferred
tooling debt is fixed in this wave: `scripts/check-settings-placement.mjs` and `npm run check:settings`
still expect the old `SettingsPage` content map, so adapt the guard to `pane()` blocks. Never rebuild
the old shape to make the check pass. Final build closes the wave chain, then the weekly
`tucano-pr-weekly-rebase` job keeps every rebased PR moving with upstream.

## Rules for every wave

0. **Design first.** After this overhaul, the new UI is the design system. For each reincorporated
   element: choose its new section, the control it sits beside, its label and density, its state
   behavior, and its narrow-width reading. Reuse the new primitives and spacing; old markup is a
   description of behavior, never something to paste back. Report the placement decisions.
1. Port behavior into upstream's component. Do not restore an old screen over a new one.
2. One owner per file. Two changes touching one file are one change for build purposes.
3. Gate: `npx tsc --noEmit -p tsconfig.json` at zero errors, then the changed feature's tests.
4. A test whose shape no longer exists on the new base (for example the old `SettingsPage` content
   map) is obsolete. Report it; do not rebuild the old shape to satisfy it.
5. After a checkpoint, run `node scripts/self-build.mjs install` and confirm the installed
   `app.asar` hash matches the built one before telling the person it is testable.
6. Keep every decision and every refused port in this file so the next ingest starts with evidence.

## Checkpoint log

- Wave 0 landed: 27 fork RULES keys restored, `db.keepOnly`, `Settings` fields, `Agent.steps`,
  `Step.kind`, `src/shared/steps.ts`, `src/core/step-text.ts`. Typecheck clean.
- Wave 1 partial: settings controls placed in the new Conversations and Routines cards (7 tests
  pass); steer/steps/follow-up UI placed in the chain and reply footer (59 tests pass); clock and
  launch-minimized readers wired across core, main and renderer. Typecheck clean.
- Known tooling debt: `scripts/check-settings-placement.mjs` and `npm run check:settings` still
  expect the old `SettingsPage` content map, which 0.2.37 removed. Adapt the guardrail to `pane()`
  blocks; do not restore the old shape. Not a user-facing defect, deferred to wave 8.
- Checkpoint 0 build installed from an isolated snapshot at
  `C:/Users/theap/AppData/Local/hermes/cache/scratch/tucano-build-0` so the running streams could not
  change the test target mid-build. Installer `node scripts/self-build.mjs install` exited 0,
  `doctor --json` reported `verdict: running`, window "Tucano", and the installed asar matched the
  built one at 37,317,527 bytes / sha256 `dd04932782ec9afc588ba0117ce6ce55bfc11904bf9ce819c04d7a1b70ddba6c`.
- Steer core landed and verified: `sendMessage` forwards `mode`/`steerTo`, `SteerNote` is taken before any message is posted, handed over at the next tool call, and marked unread if the reply ends first; `pauseRun`/`resumeRun`/`followUpRun` are declared, permitted and handled. Typecheck 0 errors, 5 files / 24 tests pass. `test/team-stress.test.ts` had one false failure from a CRLF-only regex against the new `Conversation.tsx`; the regex now accepts `\r?\n`, 33/33 pass.
- Asks landed and verified: `AsksWaiting` now renders first on both the solo and team waiting-on-you screens, reusing `QuestionCard` and the base's card/list primitives; next-steps parsing and the classifier helper are ported. Typecheck 0 errors, 16 tests pass in its two files, 53 pass across asks, steer, team-stress. `Run.held` is set on hold and cleared on resume, so the window no longer calls a person-held reply a budget pause.
- Ask history, mention mode, the `next_steps` tool and the solo badge count remain blocked on RPC/RPC-shape additions; exact lines are recorded in the wave-1 stream report and belong to a later slice.
- Checkpoint 1 build installed from the same isolated snapshot refreshed with the full wave-1 tree: installer exited 0, `doctor --json` reported `verdict: running`, window "Tucano", installed asar matched the built one at 37,323,434 bytes / sha256 `a89076e7146f4448e490e0869ad547ee8ac2cc3c4d085dfedaad7bfebcacaee9`.
- Checkpoint 2 (wave 2) pending; PR-prep stream still running.

## Confirming a wave on the live install

Every wave handoff includes this. The version stays 0.2.37 across builds, so identify the build by
asar hash. Command from `C:/Users/theap/AppData/Local/hermes/cache/scratch/tucano-build-0`:

```
node scripts/self-build.mjs doctor --json
```

### Wave 0 (checkpoint 0)
- asar 37,317,527 bytes, sha256 `dd04932782ec9afc588ba0117ce6ce55bfc11904bf9ce819c04d7a1b70ddba6c`
- Foundation only: the fork's settings keys exist again, so settings survive a restart and a partial
  workspace restore. No new control is visible yet; this is the base the later waves build on.

### Wave 1 (checkpoint 1)
- asar 37,323,434 bytes, sha256 `a89076e7146f4448e490e0869ad547ee8ac2cc3c4d085dfedaad7bfebcacaee9`
- Settings › General › Conversations: Time format, Reply steps (all / last N / one-line with a number
  field), Show reasoning, Reasoning panel height. Times in chats/routines/Board follow Time format.
- Settings › Agents › Routines: Open minimized, gated on Open when the computer starts.
- Running reply: steps fold rail, fold remembered per conversation, Steer pill beside Pause.
  Steer text appears as its own chain row, not a posted message; with no reply running it becomes a
  normal prompt.
- Finished reply: Follow-up pill on the footer line. Paused-by-person replies say they are on hold,
  not that they hit a spending ceiling; Resume continues the same session.
- Waiting-on-you screen: a Questions block first, above approvals, on both solo and team screens,
  answerable in place. No new sidebar item.

The 0.2.36 **Agent replies** settings card (send mode and consecutive replies) was fork work from
#338, not an upstream core setting: `v0.2.36` has the fixed `MAX_CONCURRENT` core limit but no
`sendMode` setting, while `next-v0.2.36` exposes the four-way select and the 1–10 consecutive-replies
number. Upstream 0.2.37 removed the UI, and no later wave restored it. Wave 1 only carried the
server-side steer half of #338, so the setting is being restored on #338 under the existing
`agents-replies` section of the new settings rail. There is no maximum-parallel number to restore;
0.2.36 never exposed one. PR #338 now carries the restored card at `5eb0226c` (MERGEABLE, comment
`6989254000`): four modes, the 1–10 consecutive-replies field, and one chain-depth control instead of
a duplicate in Limits.

### Wave 2 (done)

Checkpoint 2 installed 2026-11-18 from the union tree `42ca16bb` in
`C:/git-ext/tucano-wt/ckpt2-build`: installed asar **37354220** bytes, SHA-256
`95fa99bd88c62b0fc3f46f3412b1e14bdc0c4a538a6adba9214f80300e4588fc`. Verify with
`cd C:/git-ext/tucano-wt/ckpt2-build && node scripts/self-build.mjs doctor --json`; it reports
`verdict: running`, window "Tucano", `sameAsBuild: true`.

Visible checks: Settings tab bars stay the same, and each tab gains a sticky section strip that
scrolls to its card and highlights the current one; Settings > Models shows the thinking effort
pick in the bulk row and on each agent; Settings > Agents has a Recovery toggle, off by default;
a reply's steps show dim live thinking text that can be folded; a stopped reply offers Try again
and Try with instructions; after a restart, an interrupted reply with tool results resumes when
Recovery is enabled.

Gate for the union tree: typecheck 0 errors and 40/40 across thinking lifecycle, thinking setting,
restart runs, settings organization, steer and steps. Full suite had two known load flakes, both
reproducing on unmodified branches. The Recovery card has no section anchor, so the Agents rail
keeps its live-tested link list.

Apo rejected the first rail build: it was a narrow pill strip inside the 720 px `agent-form` column.
A follow-up commit moved it between the tabs and the cards, gave it the full-width tab treatment,
put Workspace name and What agents call you side by side, and put the two dictation model choices
side by side. A second correction rendered both dictation choices in the active card with the
current one marked, instead of collapsing them into one "switch to the other" button. The live install now carries that fix; the same changes are being baked into #446 and
the wave 3 checkpoint tree. Both are recorded in `tucano-next-dev`/layout-rulings.

The live main checkout now mounts #446's section navigation inside each existing `SETTINGS_TABS`
pane: a sticky strip of section links that scrolls to the card, focuses it and tracks the reading
on scroll. `SettingsLayout` gained an `embedded` prop so it renders no second tablist; sections
without a card are omitted. Verified here with typecheck 0 errors and 54/54 across
`settings-organization-live`, `settings-navigation`, `settings-conversations` and `team-stress`.
`npm run check:settings` still fails on 0.2.37's removed content map, a pre-existing check.

Add its hash and visible checks when checkpoint 2 installs.

Pushed 2026-11-18, each verified at the pushed tip and **MERGEABLE**:

| PR | Branch | New head | Tests | Comment |
| --- | --- | --- | --- | --- |
| #313 | feat/models-thinking | `b7ceafc3` | 15/15 | [6980808030](https://github.com/eduwxyz/tucano/pull/313#issuecomment-6980808030) |
| #321 | feat/try-with-instructions | `37c803e4` | 59/59 | [6980808704](https://github.com/eduwxyz/tucano/pull/321#issuecomment-6980808704) |
| #391 | codex/resume-interrupted | `0a3ab392` | 17/17 | [6980874388](https://github.com/eduwxyz/tucano/pull/391#issuecomment-6980874388) |
| #446 | feat/settings-organization | `5895240a` | 15/15 | [6981524951](https://github.com/eduwxyz/tucano/pull/446#issuecomment-6981524951) |
| #245 | feat/thinking-stream | `0dfb0e46` | 15/15 | [6981525673](https://github.com/eduwxyz/tucano/pull/245#issuecomment-6981525673) |

#313 needed one conflict resolved in `src/shared/rpc.ts`: upstream's 0.2.37 type list was kept and
`Effort` appended. Its bulk effort pick sits in `AgentModelsPanel` under Settings > Models. 0.2.37
already has a per-agent effort row, so the branch adds a second per-agent entry point alongside the
new bulk control. Kept deliberately, since drops are Apo's call.

#321 combined both sides of two conflicts: upstream's `assertReplyVisible` guard in `retryRun` and
the new `note` argument, and upstream's `AskedFromHere` line alongside the new `TryAgain` control.
Upstream's status gate, continue path and raise-limit controls are untouched.

#446 is one squashed commit because the old PR carried its work twice plus merges. It drops the
old page tablist and keeps the section rail inside the active pane, with per-pane remembered
section and keyboard and reduced-motion jumps. Its placement check passes with 23 sections and 27
owned writes across 19 files. #245 folds thinking into the current `RunSteps` view, keeps upstream's
`node` and `tasks` events beside `thinking`, and uses only its own show-thinking control.

Checkpoint 2 is being built from a temporary tree that unions the live wave-1 settings changes with
the #245 and #391 branches; `C:/git-ext/tucano-wt/ckpt2-build` is not a live feature branch.

#391 is pushed at `0a3ab392` and MERGEABLE, with 17/17 restart tests and a full suite of 2106
passed / 61 skipped. Its rebase was clean. Two changelog defects were fixed in the branch: the
recovery note now sits under Unreleased instead of the released 0.2.35 section, and a duplicated
"Bring your Hermes Agent over" bullet was removed. Comment:
[6980874388](https://github.com/eduwxyz/tucano/pull/391#issuecomment-6980874388).

#261 is **not** superseded by #338. Nine of its 16 commits map into #338, but four carry behavior
#338 does not have: parallel by default (`const mode = opts.mode ?? 'parallel'`), waiting marks that
survive the window closing, steer targeting, and their tests. #338 deliberately keeps a serial
default and asserts `max() === 1` per agent and thread. Decision on #261 is pending Apo.

## Wave-0 PR update (in progress)

Wave 0 covers settings rules, keep sets, shared types and step helpers. Its PRs:

| PR | Branch | Head before update |
| --- | --- | --- |
| #446 | feat/settings-organization | `ea0f090c` |
| #410 | fix/english-interface-copy | `2a303dee` |
| #395 | feat/clock-setting | `e5e1a18e` |
| #322 | feat/steps-mode | `6edcf8ce` |
| #327 | feat/steps-rail | `c68294cb` |
| #329 | feat/steps-remember | `e7dae3e8` |
| #245 | feat/thinking-stream | `6f3479ff` |
| #313 | feat/models-thinking | `ed0f2b71` |

Apo expects no wave-0 drops. Rebases are prepared in worktrees; the parent pushes after verifying
each gate and the pushed tip. PR heads were fetched from `upstream` as `refs/remotes/upstream/pr-N`.

Pushed 2026-11-18, all verified at the pushed tip and now **MERGEABLE** on GitHub:

| PR | Branch | New head | Tests | Comment |
| --- | --- | --- | --- | --- |
| #327 | feat/steps-rail | `aca85bc1` | 6/6 | [6978572912](https://github.com/eduwxyz/tucano/pull/327#issuecomment-6978572912) |
| #329 | feat/steps-remember | `7b62a2d7` | 7/7 | [6978573385](https://github.com/eduwxyz/tucano/pull/329#issuecomment-6978573385) |
| #322 | feat/steps-mode | `e02be453` | 30/30 | [6978573877](https://github.com/eduwxyz/tucano/pull/322#issuecomment-6978573877) |
| #410 | fix/english-interface-copy | `1fb81df7` | 10/10 | [6978574456](https://github.com/eduwxyz/tucano/pull/410#issuecomment-6978574456) |

Pushed 2026-11-18. Second batch, all verified at the pushed tip and **MERGEABLE**:

| PR | Branch | New head | Tests | Comment |
| --- | --- | --- | --- | --- |
| #298 | feat/next-steps | `cf823d35` | 83/83 | [6979284537](https://github.com/eduwxyz/tucano/pull/298#issuecomment-6979284537) |
| #385 | feat/next-steps-ticks | `0ef761f6` | 97/97 | [6979285077](https://github.com/eduwxyz/tucano/pull/385#issuecomment-6979285077), [6979571136](https://github.com/eduwxyz/tucano/pull/385#issuecomment-6979571136) |
| #248 | feat/ask-strip | `9a12a7a8` | 3/3 | [6979285605](https://github.com/eduwxyz/tucano/pull/248#issuecomment-6979285605) |
| #395 | feat/clock-setting | `a3701393` | 154/154 | [6979286224](https://github.com/eduwxyz/tucano/pull/395#issuecomment-6979286224) |

#385 is stacked on #298. GitHub refused `--base feat/next-steps` because that branch lives in the
fork and cannot be an upstream PR base, so its diff shows #298's commits until #298 merges; the
comment says to merge #298 first. #395 carries one extra commit extending the clock to pages added
in 0.2.37 (Board, servers log, approval times, routine spans); it is separate and can be dropped
for a byte-faithful port.

Pushed 2026-11-18. Third batch, all verified at the pushed tip and **MERGEABLE**:

| PR | Branch | New head | Tests | Comment |
| --- | --- | --- | --- | --- |
| #332 | feat/steer-pill | `b37827ab` | 13/13 | [6979380958](https://github.com/eduwxyz/tucano/pull/332#issuecomment-6979380958) |
| #457 | feat/pause-reply | `2c2605c9` | 35/35 | [6979381435](https://github.com/eduwxyz/tucano/pull/457#issuecomment-6979381435), [6979440800](https://github.com/eduwxyz/tucano/pull/457#issuecomment-6979440800) |

The steer and hold tests that live only in the main checkout (`steer-run`, `steer-followup`) are not
gate material for these single-feature branches: the hold test needs #457 and the follow-up test
needs #338. Each branch was gated with its own tests.

#457 was re-pushed after review: the original rebase kept the PR's addition of `paused` to
`RETRYABLE`, which would let `retryRun` start a second run on a held reply. That word is removed in
`2c2605c9`, so a held reply resumes through `resumeRun` only.

#332's PR head was a 17-commit stack carrying wave-2 send-mode work and #446's settings grouping.
Only the steer half was rebased; the queue and settings commits stay on their own PR branches. Its
frames were shot on the pre-0.2.37 chain and may need re-shooting. When #332 and #457 are merged,
each draws its own row under the chain while the reference draws one shared `.steps__hold` row, so
the CSS should be reconciled then. `Step.kind` is `'steer'` on #332 and gains `kind?: 'thinking'` on
#322, a one-line union conflict when both land.

Old heads are kept as `pr-backup/<branch>-20261118` tags on origin. Every branch was clean, based
on `upstream/main` `4522704e`, and typechecked at 0 errors from the main checkout. #322 dropped one
commit whose patch is already upstream (`6edcf8ce`). #410 re-applied 129 English strings and
reported 33 whose Portuguese source no longer exists upstream. Its CHANGELOG bullet landed in the
already-released 0.2.37 section and should be moved to a new heading before merge.

Pushed 2026-11-18. Final wave-1 batch, all verified at the pushed tip and **MERGEABLE**:

| PR | Branch | New head | Tests | Comment |
| --- | --- | --- | --- | --- |
| #338 | feat/steer-followup | `0d66114c` | 40/40 | [6980451855](https://github.com/eduwxyz/tucano/pull/338#issuecomment-6980451855) |
| #247 | feat/asks-section | `4a997228` | 85/85 | [6980452361](https://github.com/eduwxyz/tucano/pull/247#issuecomment-6980452361) |

#338 carries the whole send-mode series (steer, queue, parallel, enter keys) with Follow Up, since
they share the send path. Its rebase fixes a double-queue bug where wrapping `startReply` in `runIn`
stalled six simultaneous sends at three. On #247 the sidebar Asks entry was rebuilt on 0.2.37's own
top-item system, so it gets "Take out of the sidebar" and comes back while a question waits.
`test/tuca-keep-and-batch-core.test.ts` is a known pre-existing flake on 0.2.37, failing at the
same rate on a pristine base worktree.

The `tucano-next-backport` cron was paused at 15:46 on Apo's request while this manual work is in
flight; re-enable it after the wave chain is done.

**#446 is not in this batch.** Apo moved it to wave 2 with the reply-recovery/reset work. Its
section navigation is currently dead code on the new base: `settingsStructure`/`settingsPages` are
used only by `SettingsLayout.tsx`, which nothing renders. Push it only after wave 2 wires the
navigation under the new `SETTINGS_TABS`, so the PR carries a live feature rather than an orphan.
#410 (English copy) stays in the wave-0 batch because it is copy-only.

## Wave-1 PR update (started)

Wave 1 covers the visible settings controls, steer and asks. Its PRs, prepared in worktrees by two
streams and pushed only after gates and pushed-tip verification:

| PR | Branch | Scope |
| --- | --- | --- |
| #332 | feat/steer-pill | steer pill in the steps chain |
| #338 | feat/steer-followup | finished reply goes on with Follow Up |
| #457 | feat/pause-reply | hold and resume |
| #298 | feat/next-steps | next-steps card base |
| #385 | feat/next-steps-ticks | next-steps ticks (depends on #298) |
| #247 | feat/asks-section | Questions section above Approvals |
| #248 | feat/ask-strip | open question beside the composer |
| #395 | feat/clock-setting | time format control and readers |

#410 is copy-only and stays in the wave-0 batch. #446 is wave 2.

Each pushed PR gets the Lite Desktop compatibility comment from the section above. Apo's standing
call: push each wave's PRs as soon as its gates are green, without asking again. Verify each worktree
yourself, tag the old head, force-push with an explicit lease, read the pushed tip back, confirm
MERGEABLE, then comment.

## Compatibility comment on rebased PRs

Apo asked for a comment on every PR we rebase, stating it is compatible with the Lite Desktop
introduced in 0.2.37. Post only after the verified branch is pushed, never before. One comment per
PR, using the factual wording below; add the branch's real gate results when they differ.

> Rebased onto the 0.2.37 base. This branch is now compatible with the Lite Desktop introduced in
> 0.2.37: the lighter app with grouped Direct messages and Agents, the Knowledge and Operations
> hubs, the Board, and the new settings layout. The feature was ported into that UI rather than
> restoring the old screens. Verified on this base with typecheck and the branch's own tests.

Source: CHANGELOG 0.2.37, "A lighter desktop app, same identity" (#525). Do not claim this on a PR
whose rebase is blocked, skipped, or still in preparation.
