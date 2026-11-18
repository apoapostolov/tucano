# Concurrent-agent intake review

Updated 14 November 2026. Private audit context; this is not an upstream feature brief.

The earlier intake reviewed `74ed877..ec6f95f` (18 commits, seven integration groups).
Its baseline passed typecheck and the full suite: 2,233 passed, 66 skipped, zero failed.
The November 14 intake started at `8c2d098`, then included sidebar visibility `8025930`
and per-bot initiative `8d8342d`. Upstream remains `73b724b` (0.2.28); no additional
upstream commits or unaccounted fork-main commits were found. The refreshed inventory
contains 83 authored PRs: 61 open, 12 merged and 10 closed. Ancestry in the generated
report uses the named local ref and is not a semantic feature audit.

## Confirmed findings and repairs

- [x] **P1, #377:** a delegated reply legitimately queued behind six active replies was nudged,
  duplicated and marked failed. The watchdog called `execute` directly. The new public
  Runner/Gateway regression fails before the repair and passes when reservations are respected
  and recovery uses `startReply`. Public repair is `d696bdf` on #377; a fresh pushed-SHA worktree passed typecheck and 27 focused tests.
- [x] **P1, self-build helper:** launch inherited scratch data/fake-engine/update-feed variables
  and omitted `--background`. Sanitized child environment and inactive launch are committed
  in candidate `bfe8fa1`; two regressions pass. Integration and installed validation pending.
- [x] **P2, #386:** widened independent timers still emit exit before output after a deterministic
  70 ms delay before subscription. Updated the existing PR to causal ordering at `7e5c0bc`;
  all 14 tests pass. The daily integration already had this behavior.
- [x] **P2, expanded Asks:** an older pending-wiki refresh could finish last and restore an approved
  change. Regression fails before the request-order guard and passes afterward. Candidate
  `e97e47d`; existing feature PR update and integration pending.
- [x] **P1, #375:** deleting a completed parent while a thread reply runs lets the child recreate
  deleted messages. A real-core API regression failed on `0121733`. The active/queued repairs were published through `3398044` and passed 16 focused tests in a fresh pushed-SHA worktree; #375 has since advanced and needs renewed review.
- [x] **P1, #274:** a real-core multi-person test reproduced private DM text reaching another
  person through a team-up. Public repair `0605a11` preserves the originating audience,
  migrates identifiable legacy rooms, denies unresolved provenance and purges the context
  with its person. Existing recipients' knowledge cannot be recalled.
- [ ] **Doctor limitation:** no titled window does not establish a dead process. Healthy tray-only
  operation and hidden QA need distinguishing before trusting automatic process termination.

## Intake checklist

- [x] Fetch current upstream, fork branches and PR metadata; preserve concurrent source work.
- [x] Refresh the inventory using separately cached per-head file lists.
- [ ] Reconcile candidate repairs with the latest integration and interface-copy rules.
- [ ] Review Classifiers #379/#383 and next-step selection #385 as overlapping stacks.
- [ ] Review #391/#401/#402/#412 restart recovery and manual continuation together.
- [ ] Review session deletion #375 and routine-post deletion from the room.
- [ ] Review clock #395, Memory tabs #397 and wiki parsing #392.
- [ ] Review reply shortcut #411, account #416, notifications #417, map #419 and toast #422.
- [ ] Review English copy #410, including expanded/narrow layout evidence.
- [ ] Finish #355's live write checks and integrate the upstream read repair #373.
- [ ] Run the final combined suite, hidden UI checks, self-install and installed verification.
- [ ] Update per-head evidence, public PR bodies and the user-facing findings.

The original 43-PR cohort has 5 targeted repairs (11.6%) and zero complete feature audits.
Ancestry, a passing baseline and this intake review do not establish a full feature signoff.


## Room sharing requested during the audit

Opened upstream issue #423 and draft PR #424 from `upstream/main`. The user chose separate
controls for visibility to people and agent read access, private defaults, and Tuca support
when discussing a room's purpose. Tuca proposes changes; the person confirms sharing history.
The initial shared permission rules have five passing tests. The feature is not enabled and
is not part of this security-fix delivery until end-to-end enforcement and UI validation pass.

- [x] Create the issue and a concrete draft PR with permission rules and design/checklist.
- [ ] Implement persistence, RPC validation and current-permission checks across every read path.
- [ ] Add room controls, Tuca proposals and explicit widening-of-visibility confirmation.
- [ ] Verify inherited team-up privacy, client revocation, artifacts, purge/export and restart.
- [ ] Measure copy at 900/1280, capture synthetic screenshots and check installed scaling.


## November 14 reconciliation and retention audit

- [x] Read the current checkout, worktrees, upstream and fork refs before editing. The main
  checkout was detached with concurrent edits; all work here uses `codex/audit-nov14-intake`.
- [x] Review the last five hours: initiative lifecycle and per-bot controls (#435), retention
  (#432), database maintenance (#437), sidebar order/visibility, quota columns, prompt actions
  and their screenshot harnesses. Intake is not full behavioral signoff for those groups.
- [x] Restore the prior audit candidate `c16933d`, whose published privacy/concurrency fixes
  were absent from the current integration. Preserve busy-timeout maintenance and all newer
  initiative/settings/sidebar fields. The first restored batch passed typecheck and 35 tests.
- [x] Reproduce two automatic-retention defects: deleting an old root also deleted active
  descendants and bypassed a child's keep-forever override. Both tests failed before repair.
- [x] Repair automatic selection at `47d9cce`: retain ancestors of any ineligible descendant,
  including recent messages, active work, pending questions and longer per-bot periods.
- [x] Reproduce active history returning after a wipe through the real core API. Repair at
  `d15cd5e` marks every removed active run deleted and rejects queued replies whose root is
  missing. The cancellation primitive matches #375's purpose; integration retains one method,
  uses current database existence for queued work, and avoids an unbounded tombstone set.
- [x] Pass public retention typecheck and 27 focused tests; the combined deletion/retention
  interaction passes 19 focused tests. UI strings and layouts were unchanged by these repairs.
- [x] Pass the public retention suite: 1,730 passed, 60 skipped, zero failed.
- [x] Pass the final combined-tree suite: 2,537 passed, 61 skipped, zero failed.
- [x] Push #432 at `455d7f5`, verify its pushed SHA in a fresh worktree (typecheck and 30 tests), and update its description.
- [ ] Run built hidden QA, install through the helper and verify the installed app and hash.
- [ ] Refresh current-head review evidence and publish the reconciled integration without
  overwriting intervening work.

Room sharing #424 remains a draft. Its access policy must also constrain initiative observation
and work scopes. The new per-bot configuration does not authorize bypassing the requesting
person's source-room visibility. Implement this alongside every other retrieval path before
turning on the feature.


### Summary invalidation and background evidence

Three additional regressions reproduced saved summaries surviving cleanup and pending
conversation/thread consolidation restoring deleted context. Repair `07e6bcc` resets derived
summaries in affected conversations and checks a per-conversation history revision before
publishing model output or learning from it. Existing durable memories, wiki pages, artifacts
and receipts retain the feature's documented behavior. The memory/retention selection passed
38 tests before the full public run.

The history harness previously opened ordinary windows and wrote fixtures between launches.
It now refuses a bundle without background QA support, reserves separate ports, uses fake
engines in one empty scratch profile, and asserts hidden/unfocusable windows. Five history
captures passed; generic hidden QA passed seven checks including notification isolation.
No interface strings or styles changed in this repair batch. A fresh #274 pushed-SHA checkout
passed typecheck and its five privacy/migration tests; #355 passed typecheck and 15 live-access
tests. Broader feature audits remain open.

Entanglement's final comparison still blocks the gate: the edited existing database, memory
and runner modules have file MI 0. The new selection module has MI 59.90, the retention
coordinator 34.68, the privacy helper 46.17 and the summary regression file 33.60. Across the
whole intake, including other agents' new per-bot controls, NLOC grew 1,091, summed CC 392
and CogC 216. These totals are not the size of the retention repair alone. No structural
cleanup or production-readiness signoff is implied.


### Database-maintenance interaction

The first final combined run passed 2,536 tests, skipped 61 and failed one assertion:
`test/db-file.test.ts` required zero free bytes in a fresh database. Per-bot initiative
legitimately rebuilds an empty table and frees two pages (8,192 bytes); the reported value
was correct. Preserve the migration, and verify size/free bytes through a separate read-only
SQLite connection instead. This test-only repair is published on #437 at `6434860`; a fresh
pushed-SHA worktree passed typecheck and 11 checks, and its interaction with initiative passed
16. The full combined rerun remains required; the focused selection is not a replacement.

The normal installed workspace had a working reply during delivery preparation. Its database
was inspected read-only for status counts only. Do not close that instance for an installer
until the work finishes; no live data was edited and no foreground action was used.

The final combined run passed at application source `37d0c63`: 2,537 passed, 61 skipped,
zero failed. Later record commits do not change the packaged application source.


### Packaging preflight

The first package from this worktree used the shared dependency junction. Electron-builder
could not resolve transitive packages outside the checkout; the helper rejected the incomplete
archive at its verification stage and no install occurred. No dependency installer was running,
so the former error's diagnosis (an install running during packaging) was too narrow. The helper
now rejects shared junctions before building and reports incomplete discovery without inventing
its cause. The real CLI regression and two launch-policy tests pass. The junction was unlinked
with its target preserved, and a separate locked `npm ci` completed with 718 packages. Source
and public PR validation used the same lockfile and versions; the installer is being rebuilt
from the worktree's own install. This maintenance helper stays in the fork.


### Upstream advanced during delivery checks

Upstream moved from `73b724b` to `e0a5496` while the final dependency run was being
investigated. It contains #438 (forward the live Codex session capability), #439 (Supabase
catalog entry/logo) and #440 (request refresh-token scope when advertised by the OAuth server).
All three are the maintainer's own PRs, not changes in the original Apo cohort. They merged
into the candidate at `9c7e81b`; the only conflict was the Unreleased changelog. Both Added
lists and both Fixed lists were retained under one section of each, including the Portuguese
entries. Existing connector image/account behavior and the fork's identity were preserved.
Typecheck and 24 focused session/catalog/OAuth/wiki-Git checks pass.

The previous installer and its 21 successful packaged checks are now historical evidence,
not verification of this newer upstream source. No installation or fork release was performed.
The local-dependency full run had 2,535 passing assertions, none failed, but one failed setup
hook left three additional tests unrun (64 skipped/unrun total). The timed-out wiki-Git suite
passes alone on the candidate (3 tests) and on a clean current-upstream worktree (3 tests).
That does not prove a host cause. A full upstream baseline is running before the next final
combined validation; timeouts and assertions remain unchanged.

### 0.2.29 delivery supersedes the pending 0.2.28 install

Upstream `68cf5da` is contained in installed and published `28ad4f2`. The final full suite passes
2,563 tests, with 61 skipped and zero failures. Installed archive and packaged archive hashes
match; seven hidden installed runtime checks and native 150%/1280/900/760 copy checks pass.
The normal installed executable has a visible unfocused window. See the
[0.2.29 reconciliation record](upstream-reconciliation-0.2.29.md) for exact receipts and the
84-PR intake, including #445's unsupported CI explanation and the #311 source-label regression.
