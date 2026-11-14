# Tucano audit development plan

Updated: 14 November 2026. This is private fork workflow context, not an upstream PR brief.

## Current priority and progress

### Upgrade to 0.2.29, 14 November 2026

Starting refs: published integration `41d0979`, prior audit candidate `d0fc185`, local
`next` in another worktree `dca0d36`, and upstream release `68cf5da`. The primary checkout
is on a feature branch; its work and the other worktrees remain untouched.

- [x] Identify the current branches, worktrees and unpublished audit work.
- [ ] Refresh authored PR heads, discussions, merge dispositions and cached diffs.
- [ ] Integrate upstream 0.2.29 while preserving fork behavior in conflicts.
- [ ] Review accepted PRs for duplicated settings, helpers, events, tests and UI controls.
- [ ] Verify committed instructions, settings ownership guides and primary-checkout delivery.
- [ ] Install locked dependencies in a dedicated packaging worktree; run typecheck and full suite.
- [ ] Build and exercise the reconciled app with isolated, hidden QA and affected copy checks.
- [ ] Package, install, launch and verify the installed 0.2.29 app and archive hash.
- [ ] Publish the fork's 0.2.29 release after installed verification.
- [ ] Resume the feature audit and record every new or revised PR disposition.

Earlier checkpoints below describe their named source revisions; they do not verify this upgrade.

### Current intake, 14 November 2026

- [x] Preserve concurrent edits and review new work through per-bot initiative `8d8342d`.
- [x] Refresh the PR inventory: 83 authored, 61 open, 12 merged, 10 closed.
- [x] Confirm upstream is still `73b724b` and restore previously published audit repairs.
- [x] Reproduce and repair retention cascades that bypass active/recent/keep-forever messages.
- [x] Reproduce and repair active and queued replies returning after a history wipe.
- [x] Finish the public revision, final combined suite (2,537 passed, 61 skipped), build and hidden runtime checks.
- [ ] Finish installed-app verification after the working live reply completes.
- [ ] Continue room sharing #423/#424 with persistence, enforcement and Tuca proposals.

See [the current intake record](agent-intake-review.md) for exact source revisions and remaining
checks. These are targeted repairs; fully audited features remain **0/43**.

### English copy delivery, 13 November 2026

- [x] Prepare the replacement proposal before implementation and measure two-line hint budgets with screenshots.
- [x] Deliver upstream issue #409 and PR #410, and update copy on the six existing feature PRs rather than duplicate their stories.
- [x] Integrate 376 English string revisions while retaining concurrent feature work; installed source is `7ba091c`.
- [x] Pass typecheck, build and final full suite: 2,306 passed, 66 skipped, zero failed.
- [x] Install 0.2.28 through the self-build helper, verify the installed package hash, and pass seven hidden installed-executable checks, including Wiki reset and two-line resolver text.
- [ ] Complete normal-workspace navigation when background accessibility can reach the minimized window. The isolated installed instance passed navigation; no foreground input was used.

See [the delivery record](english-copy-delivery.md) for exact heads, installer hashes, measurements and limitations. These copy checks do not change the feature cohort's full-audit counts below.

Upstream 0.2.28 through `73b724b` is integrated in `28eddc4`, including all 19 new commits
from the 0.2.27 intake baseline. The installed 0.2.28 executable passes six isolated hidden UI
checks, and its update state is `off`. Resume feature auditing with the privacy and concurrency
leads below. Regular-workspace Settings navigation is verified; live DM selection remains
unverified because duplicate accessibility names prevent a safe background click. Agent rows
currently open profiles, with Open DM as a separate action; this differs from the older smoke
check wording and was not silently changed.

The original audit cohort contains 43 open feature/fix PRs. Five have received targeted repairs
and browser or core checks: **5/43 (11.6%)**. None has yet passed every audit dimension below:
**0/43 fully audited (0%)**. Three additional standalone upstream PRs, #367, #368 and #372, were opened
with upstream-based validation. #367 and #368 are now merged. These figures distinguish useful progress from a release signoff.

An item is fully audited only after its current implementation and upstream disposition are
reviewed; correctness, permissions, persistence, concurrency and recovery are checked; applicable
UX, keyboard, narrow-window and performance checks are complete; regressions and screenshots are
current; and remaining blockers have a recorded resolution or an explicitly accepted scope.
Merged or closed PRs still need a disposition and integration check; closure alone is not a pass.

## 1. Reconcile upstream before resuming the audit

- [x] Create and maintain this checkbox plan and explicit progress measures.
- [x] Fetch current upstream main, fork next, PR states, reviews and discussions.
- [x] Inventory every upstream commit since the 0.2.27 baseline `b436f4a`.
- [x] Map accepted, rejected, superseded and changed features against Apo's PR cohort.
- [x] Review overlapping implementations and record the behavioral reason for each resolution.
- [x] Integrate upstream main while preserving TucanoNext identity and application isolation.
- [x] Pass typecheck, full suite (2,193 passed / 66 skipped), build and fresh installer.
- [x] Verify installed executable identity, existing workspace and Settings, updater off, and six hidden scratch UI checks.
- [ ] Complete live DM selection and reconcile the older agent-row smoke expectation; background accessibility refuses duplicate names.
- [x] Refresh the plan, inventory and progress counts before resuming feature work.

## 2. Maintain the evidence and delivery workflow

- [x] Establish upstream `eduwxyz/tucano` and fork `apoapostolov/tucano` identities.
- [x] Create a repeatable PR inventory with head SHAs, dependencies, file overlaps and patch cache.
- [x] Record per-head reviews and mark changed heads stale.
- [x] Establish focused upstream-main-based fixes and existing-feature PR updates.
- [x] Keep personal next/QA context out of upstream descriptions and comments.
- [x] Commit and preserve the operating documents and current inventory in the fork.
- [ ] Revalidate stacks and duplicates against the maintainer's new decisions.
- [ ] Keep each public PR description, test report and screenshot aligned with its final diff.

## 3. Audit the original 43-PR cohort

All boxes mean the complete audit criteria above, not merely a targeted fix or green test run.
The cohort stays stable for progress measurement; record changed upstream dispositions beside it.

- [ ] #244 — Skill filtering, grouping and bulk assignment.
- [ ] #245 — Reasoning streams and per-person visibility.
- [ ] #247 — Questions inbox and history.
- [ ] #248 — Active question beside the composer.
- [ ] #249 — Clear conversation history and dependent state.
- [ ] #250 — Sidebar reordering. Targeted capture repair and browser check completed; broader audit remains.
- [ ] #258 — Missing-page handoff. Write-tool stack repaired; completion and load behavior remain.
- [ ] #259 — Orphan-link handoff. Stack and browser checks completed; broader audit remains.
- [ ] #261 — Parallel, queued, steer and interrupt send modes.
- [ ] #268 — Wiki finding resolver.
- [ ] #272 — Mention-only channel agents.
- [ ] #274 — Cross-room team-ups and their lifecycle.
- [ ] #275 — Sticky thread entry during long runs.
- [ ] #279 — Selective listening and routing.
- [ ] #284 — Recommended question answer.
- [ ] #288 — Work drawer, active sessions and queued prompts.
- [ ] #290 — Prompt ordering and navigation back to the initiating prompt.
- [ ] #296 — Personal memory tab naming.
- [ ] #298 — Proposed next-step cards and their execution.
- [ ] #301 — Hermes harness, isolation and engine contracts.
- [ ] #303 — Artifact image galleries.
- [ ] #305 — Provider quotas, account scope, freshness and header presentation.
- [ ] #308 — Harness skill folders and folder management.
- [ ] #310 — Language-neutral model-facing context.
- [ ] #311 — Hermes skill categories and versions.
- [ ] #313 — Model thinking settings, individual and bulk.
- [ ] #319 — Assistant-controlled skill assignment.
- [ ] #321 — Retry with additional instructions.
- [ ] #322 — Steps presentation modes; a newer head was detected during the initial audit.
- [ ] #327 — Steps rail folding gesture.
- [ ] #329 — Remembered fold state.
- [ ] #332 — Live steering controls.
- [ ] #333 — Routing pools and specialist selection.
- [ ] #334 — Approval action, target and outcome presentation.
- [ ] #336 — Image context menu and attachment handling.
- [ ] #338 — Follow up from a finished reply.
- [ ] #339 — CI deadlines and distinguishing hangs from slow execution.
- [ ] #341 — Routed replies waiting on marked-busy slots.
- [ ] #343 — Routed replies whose reserved job never ran.
- [ ] #351 — Unlimited monthly budgets throughout the UI.
- [ ] #353 — Connector images, decoding, persistence and resource bounds.
- [ ] #355 — Wiki write tools. Prospective DM provenance repaired; historical and in-flight privacy review remains.
- [ ] #366 — Silent routines, badges, notifications and retained run history.

## 4. Hunt upstream bugs and prepare for heavy use

- [x] Reproduce and fix shell-dependent, cross-workspace key-cleanup assertions in #367.
- [x] Review locked dependencies and prepare focused runtime updates in #368.
- [x] Review the maintainer's disposition of #367 and #368 and reconcile the resulting code. Both merged.
- [ ] Audit run scheduling, routing, queues, resource bounds and cancellation under load.
- [ ] Audit permission changes during active runs, DM/wiki privacy and multi-user isolation.
- [ ] Audit startup, shutdown, crash recovery, database migrations and backup/restore.
- [ ] Audit engine adapters, tool-call contracts, approvals, credentials and external input handling.
- [ ] Audit growing histories, streaming/rendering costs, large wikis and skill libraries.
- [ ] Audit keyboard access, focus, narrow layouts, empty/error states and feature discoverability.
- [ ] Reproduce each new upstream defect on current upstream main before proposing its fix.
- [ ] Follow SECURITY.md for private vulnerability reports; do not publish unreviewed privacy findings.
- [ ] Review remaining moderate dependency findings without blanket major downgrades.
- [ ] Address or explicitly record existing maintainability gates and cross-platform coverage gaps.

## 5. Publish and verify each accepted group of changes

- [ ] Keep changes modular and target upstream main; update existing PRs for their own defects.
- [ ] Include regression evidence and fresh captures for visible changes.
- [ ] Integrate validated behavior into the personal build without changing its product identity.
- [ ] Finish with clean checks, a newer installer and the installed-app smoke check.
- [ ] Record remaining work and update both progress ratios at each substantive checkpoint.

## Evidence from the initial repair batch

- Before runtime dependency updates, the integrated suite passed 2,071 tests, with 65 skipped.
- #367's upstream-based suite passed 1,562 tests, with 59 skipped.
- #368's full suite passed the same 1,562 tests with #367's independent test repair applied for
  validation; that test repair is excluded from #368's diff. Electron 44.11.1 also passed a
  fresh-workspace smoke check. The dependency-updated integration's verification was in progress
  when upstream reconciliation became the priority.
- Some concurrent feature-branch runs produced host-command or wiki-Git timing failures. Keep
  them visible until investigated; isolated reruns are not proof of stability under heavy use.
- The original large runner, wiki and wiki-Git test files fail the selected maintainability
  threshold. This prevents an overall production-readiness claim despite targeted passing checks.


## 7. Background QA and current intake limits

- [x] Add hidden, unfocusable QA startup with fresh data, fake engines and isolated ports.
- [x] Add rendered navigation checks, screenshots, traces, renderer-error and focus guards.
- [x] Validate both the built source and the installed 0.2.28 executable.
- [x] Open upstream-main-based QA PR #372; 1,700 passed, 64 skipped, no failures.
- [x] Review and integrate revised #274 head `d2e21ed` and #305 head `06cecbf`; final tree unchanged from the tested delivery.
- [ ] Recheck in-flight wiki permission/provenance changes in #355 before expanding wiki workflows.
- [ ] Expand UI checks to keyboard access, narrow layouts and large histories per feature.

Latest inventory: 58 authored PRs, 38 open / 12 merged / 8 closed. Current #274 and #305 heads are integrated after comparing their behavior with the tested
tree. The final source tree is identical to `c50fe6c` (tree `74d7452`); merge-generated
duplicate gateway waits, quota types and provider panels were removed before delivery. #372 is independently integrated with the application-specific identity/port
adaptation. Neither ancestry nor these six smoke screens establishes a complete feature audit.

The maintainability gate remains blocked by edited large existing modules. The new background
options and runner score 41.06 and 26.00 respectively (green); broad production readiness remains
unclaimed. Metrics and test JSON are retained under the task's temporary audit directories.
