# Concurrent-agent intake review

Updated 13 November 2026. Private audit context; this is not an upstream feature brief.

The earlier intake reviewed `74ed877..ec6f95f` (18 commits, seven integration groups).
Its baseline passed typecheck and the full suite: 2,233 passed, 66 skipped, zero failed.
The current intake is `2af4407`; upstream remains `73b724b` (0.2.28). The latest metadata
lists 79 authored PRs: 57 open, 12 merged, 10 closed. Refresh the full inventory before
using these counts for a later report.

## Confirmed findings and repairs

- [x] **P1, #377:** a delegated reply legitimately queued behind six active replies was nudged,
  duplicated and marked failed. The watchdog called `execute` directly. The new public
  Runner/Gateway regression fails before the repair and passes when reservations are respected
  and recovery uses `startReply`. Repair committed in candidate `c172181`; public PR update pending.
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
  deleted messages. A real-core API regression failed on `0121733`. The uncommitted repair
  worktree was subsequently removed; reconstruct and validate against current head `32d8ddc`.
- [ ] **Privacy lead, #274:** a DM team-up copies private conversation text into a channel without
  an explicit private audience. Reproduce through the team visibility contract before deciding
  the repair; do not count this as verified runtime evidence yet.
- [ ] **Doctor limitation:** no titled window does not establish a dead process. Healthy tray-only
  operation and hidden QA need distinguishing before trusting automatic process termination.

## Intake checklist

- [x] Fetch current upstream, fork branches and PR metadata; preserve concurrent source work.
- [ ] Refresh full inventory after the large GitHub file-list query failed.
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

The original 43-PR cohort remains 4 targeted repairs and zero complete feature audits.
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
