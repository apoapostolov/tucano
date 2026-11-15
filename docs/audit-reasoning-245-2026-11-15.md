# R-245: reasoning and reading-position audit

Scope: Apo #245, head `5f4a1a2170adaf88745a509adcebe498937cb90d`, base
`68cf5da1cb5a1f589926ac819c46d9ffd7645988`; all 12 feature commits and 20 changed files.
Integration started at `7dce2af8`. Upstream advanced to `3e8162eb`; the release remains 0.2.32.
Other-contributor checks in this packet are limited to upstream ingestion compatibility.

Continuation: the [delegated boundary batch](audit-245-boundary-batch-2026-11-15.md) at current
public head `6e383851` reproduces F-006 in the integrated renderer: prefix trimming moves a
still-retained passage by -241.71875 CSS pixels; the below-limit control has zero drift.
A bounded role/preference transition probe passes. No product repair or completed audit is
claimed; folding, broader audience paths and installed repair checks remain open.

- [x] Identify exact feature head/base, read its discussion and enumerate the complete commit range.
- [x] Read the engine, event, audience, setting and renderer-cache changes across that range.
- [x] Inspect incoming main commits and resolve overlapping integrated behavior without dropping features.
- [x] Validate and deliver the upstream reconciliation, including its built and installed UI.
- [ ] Exercise reasoning lifecycle, audience changes, setting transitions and retention under sustained use.
- [ ] Check folding, reading position, tail trimming, thread widths and neighboring reply controls.
- [x] Repair the confirmed retention defects on the existing feature branch and verify the published head.
- [x] Record exact-head findings, residual gaps and the next checkpoint; keep the full-audit box unchecked while criteria remain open.

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

## Installed delivery and exact remaining boundary

Application tree `8b508004` passes typecheck, build and the complete suite: **2,656 passed,
61 skipped, zero failed**. Later commits through build source `37a139ea` change only instructions,
audit records and development QA scripts. Subsequent changelog/documentation/privacy commits also
leave src/package/lock bytes unchanged; the changelog is not packaged in app.asar.
Public application source `c35e802c` passes 1,756/60/0 and all six CI jobs; current public head
`6e383851095949ba45f098f0eab7548721dc5997` adds only the bilingual changelog. The workflow excludes
Markdown-only changes, so the lack of new checks on that documentation commit is not a green CI
claim. A fresh checkout of c35e802c passes typecheck and 42 focused cases. Public evidence remains
bound to its actual source; no installed-fork results are presented as public-PR validation.

The concurrent maintainer batch was preserved through `75b474ec`, followed by the private-context
instruction update through `70289872`. Both leave packaged source unchanged. #468 is now published
at `74f64aed`, its extraction is #472, and older-retry filtering is split to #471. That new revision
work was removed from the immediate queue after its completed record was ingested. It remains a
set of targeted revisions, not six certified feature audits. Canonical current intake is 94 Apo
PRs (60 open, 22 merged, 12 closed), with zero complete full audits.

Self-install succeeded at source `37a139ea60aad80d624739f8d0ff2965a56e5d48`. Installed and built
archives match: **37,413,908 bytes**, SHA-256
`d6ddc42ef9af516f5a7a64c2c97511c827b81094f612d1c582c946e90f392a42`.
Native-path extraction confirms tucanonext 0.2.32 and the main bundle matches the build. The fresh
regular executable is under Programs/tucanonext, PID 10316, `--background`, window w-15732940.
Agent-desktop status and window identity were checked; no physical input, pointer movement or
clipboard operation was used. The ordinary window was observed focused; no attribution is made
about whether that resulted from user activity or launch. The isolated QA windows stayed hidden
and unfocusable, with their guards passing.

Installed reasoning QA measures **zero CSS-pixel drift**, during streaming and completion, for
small, medium and large. Returning to the end resumes following within subpixel rounding. Its
new lifecycle check disables and re-enables reasoning and confirms the discarded text does not
return. The installed general run passes Settings, Skills origins, proposal approval/history,
complete restoration, pause, updater-off and background-notification guards, with zero renderer
errors. New artifact empty-state copy and its Show in Explorer button fit at 900/1280 CSS px,
device scale 1.5; the file manager was never invoked. Rendered captures were reviewed. The narrow
screenshot also exposes chat-header/composer crowding beside the panel; this is recorded as a
neighboring layout gap, not hidden by the new control's passing copy measurement or independently
repaired outside this packet.

Evidence: C:/tmp/tucano-245-installed-thinking/report.json,
C:/tmp/tucano-245-installed-general/report.json, C:/tmp/tucano-245-install.json.
Their source is 37a139ea; dirty state records audit documentation only. Scratch data, fake engines
and ports are separate; no writes were made to the regular database or released Tucano directories.
The regular app stays running after scratch processes exit. A read-only pre-install query found no
working/queued/waiting runs; only completed, failed, interrupted, paused and stopped statuses.

Because this reconciliation introduces the artifact reveal RPC/control, the fork's existing
next-v0.2.32 release was refreshed under the major-surface delivery rule. The inherited package
version is unchanged. Tag target is exactly 37a139ea. Published assets match local sizes/digests:
installer 132,377,054 bytes, SHA-256 90165b461901af9b3abb9f2d201343b8084fae7f99bee11ace6037f9cf6f9767;
blockmap 139,386 bytes, SHA-256 21591094ec2c5d8cd7fa16e895c4fd335aaefa5a25ee4e956c870de84339d30d.
A ranged download returned HTTP 206, 1,024 bytes and an MZ executable header. Upstream releases and
tags are untouched. Notes name this build, checks, unsigned-installer warning and updates off.

R-245 has six of eight packet checkpoints complete. Its full-feature acceptance remains open:
compose folding without dropping reading-line protection, check retained-text trimming, exercise
audience/role transitions and neighboring controls, and address the blocked store maintainability
gate. The integration metric comparison includes incoming main and concurrent development tools;
its global gate remains blocked. New artifact helper MI 42.55, background driver 19.72, streaming
QA 14.94 and cache 46.72 pass individually. Do not report a whole-project gate or production-readiness
pass. The master immediate queue contains these remaining actions, not the completed retention repair.
