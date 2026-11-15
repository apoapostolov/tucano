# R-245: reasoning and reading-position audit

Scope: Apo #245, head `5f4a1a2170adaf88745a509adcebe498937cb90d`, base
`68cf5da1cb5a1f589926ac819c46d9ffd7645988`; all 12 feature commits and 20 changed files.
Integration started at `7dce2af8`. Upstream advanced to `3e8162eb`; the release remains 0.2.32.
Other-contributor checks in this packet are limited to upstream ingestion compatibility.

- [x] Identify exact feature head/base, read its discussion and enumerate the complete commit range.
- [x] Read the engine, event, audience, setting and renderer-cache changes across that range.
- [x] Inspect incoming main commits and resolve overlapping integrated behavior without dropping features.
- [ ] Validate and deliver the upstream reconciliation, including its built and installed UI.
- [ ] Exercise reasoning lifecycle, audience changes, setting transitions and retention under sustained use.
- [ ] Check folding, reading position, tail trimming, thread widths and neighboring reply controls.
- [ ] Repair confirmed defects on the existing feature branch and verify the published head.
- [ ] Record exact-head findings, residual gaps and the next checkpoint; check the full-audit box only if all criteria pass.

## Upstream reconciliation

Incoming range `d175567b..3e8162eb` has 14 commits, seven first-parent integration events.
It accepts Apo #412 continuation and #445/#448/#453 test work. It also includes #429 notice
alignment, #388 artifact reveal (plus the maintainer's traversal hardening) and #400 agent-card
scroll handling. These incoming changes are inspected for compatibility, not independently certified.

Conflict decisions:

- Keep one existing continuation predicate and handler. The shared run-progress helper is identical
  to main. Retain fork follow-up, recovery, retry-note and pause behavior; do not add a second button
  or replace the richer Try again control with the older simple button.
- Keep the integrated delegation fixture's deterministic release barrier and richer response checks.
  Incoming main's eight-second delay addresses the same race; a fixed delay would regress this
  fixture. Preserve main's extra test budget and the remaining test changes.
- Keep system-notice padding aligned with this tree's 28px message padding and 34px gutter/12px gap.
  Retain the common 860px centered column; main's 24px/70px padding belongs to its different spacing.
- Add artifact reveal once to the existing RPC, shape, policy, renderer and handler. Keep image menus,
  galleries and existing sendMessage mode/steerTo parameters. Reveal remains owner/local-only with
  conversation and artifact visibility plus traversal checks; tests do not invoke the real file manager.
- Keep existing startup/continuation regression cases in addition to the incoming tests. Replace the
  duplicated continuation changelog paragraph with maintained main's entry; preserve every other entry.

Typecheck and 62 focused compatibility cases across eight files pass on the resolved tree.
Full suite and installed delivery are pending. No main revision is claimed delivered yet.

## Feature contract and first questions

Pi thinking_delta is streamed separately from reply text and is not persisted. Audience filtering
uses the same conversation/message visibility path as answer deltas. showThinking is personal,
off by default; the renderer drops incoming events while off. The public block supports manual
folding, an automatic completed fold and follow-at-end. Existing integration has newer reading-line
anchoring and size controls; evidence from that implementation does not certify the public head.

The public cache caps each string at 20,000 characters but has no observed per-window entry bound
or clearing operation. Neither turning the setting off nor conversation_removed visibly clears it.
These are hypotheses awaiting executable reproduction. Tail trimming may also invalidate a reading
position even when scrollTop stays fixed; that needs a real rendered check rather than an offset test.

Maintainability baselines are fixed in C:/tmp/tucano-reasoning-audit-baseline.json (integration)
and C:/tmp/tucano-245-public-baseline.json (public head). Existing edited monoliths already have
known MI debt; any blocked gate will be reported rather than represented as a pass.

## Retention repair checkpoint

Five executable regressions fail on a fresh checkout of original head `5f4a1a21`: settings-event
disable, local disable, conversation removal, replacement snapshot and aggregate retention across
250 different runs. The unrelated-setting/conversation control passes. Evidence is in
`C:/tmp/tucano-245-lifecycle-original.json`; the three initial transition checks also failed before
implementation. These establish local retention, not another person's ability to retrieve data.

Public repair head `c35e802c9fb651eac195a1837d922b18c217e47e` is pushed to the existing #245,
without rebasing its aging branch. The new cache retains at most 200 recently streamed replies,
20,000 UTF-16 code units each, and notifies subscribers on eviction/clearing. Disabling clears all;
conversation removal clears its loaded replies; replacing the snapshot clears prior cache data.
Re-enabling does not restore old text. Older ephemeral reasoning can disappear before restart.
Answer text and database persistence are unchanged.

Typecheck, 42 focused cases in a fresh checkout of the pushed SHA, and the final public full suite
pass: 1,756 passed, 60 skipped, zero failed. The first full run hit the unchanged legacy delegation
timing fixture; no timeout/assertion was modified. The final full run passes. Main's separate #453
repair is already ingested; the older feature branch was not rebased for an unrelated fixture.

Public browser QA at `ff6364e7` passes the actual fake-engine stream, completed reasoning,
disable and re-enable path with zero renderer errors. `c35e802c` adds only a test to the same
application source. Immutable synthetic captures and original regression results are at
`9c382dc13447f1fdbdab9780e9397296f77bd1d7/frames/reasoning-cache`. The PR body now names the
current repair and preserves historical validation as history. CI is pending at this checkpoint.

Integration `8b508004` merges the actual feature head. It retains the newer reading-line/size
implementation, existing folding-rail/steering/follow-up behavior and personal settings. A clean
component merge inserted a second Thought implementation and call; those duplicates were removed.
The public-only fold tests remain on the public branch, where they pass; they cannot honestly be
counted as integration coverage of the different always-expanded component. This reveals F-005,
an unresolved integration gap. Restoring folding while preserving the stronger reading-line
ownership is the next composition task. No complete #245 audit is claimed.

The combined full suite passes: 2,656 passed, 61 skipped, zero failed. Built general/settings/Skills/
pause checks pass, and the hidden three-size reading-line fixture passes. The actual combined
browser also passes disable/re-enable without restoring text. Native installed checks remain pending.
The artifact compatibility fixture rendered and measured the incoming no-preview/reveal control,
but initially failed on its cleanup selector (.side-panel__header instead of .side-panel__head).
That is a harness mistake, corrected before the fresh full QA rerun; no product repair is inferred.

Maintainability remains BLOCKED: public store.ts is MI 0 before and after. New cache and test files
are MI 46.72, 30.55 and 40.94; growth +126 NLOC, +39 summed CC, +9 CogC includes the new regression
coverage. The integration comparison also flags ingested upstream monoliths/CSS and the existing
delegation test. It does not certify project-wide maintainability. Broader store decomposition is
still required; keeping the functional regression fix does not complete that acceptance criterion.

Intake: 92 Apo PRs (58 open, 22 merged, 12 closed), 236 other contributors' PRs (25 open).
New/revised #305 `135e3fcc` and #467 `1f1fa3a5` remain queued, not automatically integrated.
One initial gh inventory request returned truncated JSON; the retry completed without replacing
history with an incomplete capture. New maintainer feedback on #468 requests separating its refactor
and restoring existing English wording; candidate `74f64aed` is already in a concurrent worktree.
The master queue records that follow-up without overwriting that task's work or calling it delivered.
