# Evening audit, 14 November 2026

The fork default branch was changed from `main` to `next`, verified through GitHub's repository
metadata, and the local origin HEAD now names origin/next. The original project's settings were
not modified. The primary checkout was clean and detached at `444d6c69`; that commit is contained
in published `cf9d34fa`. It was safely returned to local next and fast-forwarded. A concurrent
copy task then created uncommitted edits there; this audit leaves them untouched.

The former audit worktree had been removed, but its commits survived at `f2a91b6a`. A new isolated
worktree recovered that source and merged published next through `cf9d34fa`, retaining the newer
pause and reasoning work. The old candidate's final report is also preserved: 2,588 passed,
61 skipped, zero failures. This is historical evidence, not verification of the newer combined tree.
Current upstream remains `04539404`; the refreshed authored inventory at 19:02 UTC has 90 PRs,
62 open, 18 merged and 10 closed. Commit ancestry remains an intake signal, not feature proof.

## #457: pause gate safety

The original public head `faa41fdc` has three reproducible defects:

1. A signal aborted before `Hold.wait` is called never emits another abort event. The wait remains
   pending instead of permitting stop to finish.
2. Multiple simultaneous waits overwrite the stored resolver. Resume wakes only the last call.
3. A normal resume leaves the once-only abort listener registered until a later abort, so repeated
   holds accumulate listeners during a long reply.

All three regression cases fail on the old head. The repair checks pre-aborted signals, retains
all waiters in a Set, and removes each waiter's listener when it resolves. Public repaired head:
`925c557a9583a5b5b67466cd206e947ada0be928`. Typecheck passes; the full public suite passes
1,756 tests, with 60 skipped and zero failures. A fresh checkout of the pushed SHA passes
TypeScript and 13 focused hold/boot/pill cases. The edited source and test pass the maintainability
gate: +2 NLOC, +2 summed CC and +2 CogC against the pre-repair tree, which already includes the
new regression cases. This is a targeted gate result, not clearance of existing repository debt.

Six fresh headless browser captures from the public source show Pause, disabled Pausing, Resume
at 1280/900/420 CSS pixels, and the question appearing only after resume. Metadata is pinned to
`7b4a25326649be7ddafb0d62759093349d81417a`. The PR description now reports this public evidence
and current tests instead of relying on a private integration's different footer or an obsolete
PATH failure. The gate cases are direct cancellation/concurrency regressions; the browser flow
is one tool call and does not establish real-provider quota or parallel-provider behavior.

## Combined source

The public pause head was merged by behavior: preserve private steering/follow-up/recovery RPC
parameters, restartPending, reasoning position and the shared footer; replace the defective Hold;
retain its regression cases. The public standalone pause footer and its CSS were deliberately
not duplicated beside the composed footer. The original pause capture script opened a visible
app with default ports. It now routes through the hidden, scratch-profile runner with allocated
ports, focus/visibility guards and a reusable pause-flow check.

Application source `ab5cd58f` passes typecheck, 41 focused interaction/restart cases and the full
combined suite: **2,603 passed, 61 skipped, zero failures**. No timeout or assertion was weakened.
Built-app smoke passes seven checks; the pause fixture shows Pause plus Steer, disabled Pausing,
Resume with no premature question or ceiling warning, and the question after resume. Native
Settings/Skills QA preserves 150% display scaling. Browser Skills checks cover 420px; native
Electron checks respect the window's 900px minimum. A timed-out native attempt at 420px was a
harness sizing error and was corrected without weakening the supported-width checks.

The recovered #311 repair and component split are included in this candidate. The larger skill
diff allocation bug remains tracked separately in upstream #454, with its immutable clean-main
reproduction. Room-sharing persistence and access enforcement remain pending on #423/#424.

## Installed delivery

`node scripts/self-build.mjs install` completed from `eafde861d4ac3a15cca788bd0a36ab0c67e2a33e`.
The installed archive is **37,360,777 bytes**, SHA-256
`7655fed31d1107db2a2bdb436e69c2bee3fa9865e8ad77256f566c5fc061fcbc`, equal to the packaged
archive. The normal installed executable was observed at its TucanoNext install path, with a
fresh visible, unfocused window. Its accessibility tree exposed only one ref, so normal-workspace
navigation is not claimed. The installed executable separately passed the complete hidden scratch
flow: seven smoke checks, 18 Settings page/width measurements, native 150% scaling, supported
900/1280 desktop widths, eight skill-source imports with edit/archive/reactivate, and pause/resume
with the question withheld until resume. Browser source captures separately cover 420px.

The first combined installed style check returned empty computed styles for one Wiki card; an
unchanged build passed a repeat. The probe used separate selector resolution and style reads.
It now queries and measures the current DOM in one page task, requires connected/nonempty groups,
and saves the group styles with measurements. This avoids the separate reference lookup without filtering a failing group or relaxing the layout
assertion; the intermittent empty-style result does not establish a product defect or its cause. It is a harness
repair; no application source changed after the passing full suite.

Evidence: `C:/tmp/tucano-evening-audit-full.json`,
`C:/tmp/tucano-pause-audit-full.json`, `C:/tmp/tucano-evening-final-installed/report.json`,
and `C:/tmp/tucano-evening-audit-installed-identity.json`. The public #457 CI run `43627010425`
passes macOS, Linux and all four Windows shards. The primary checkout's concurrent copy work
remains untouched. Audited integration `77286bf46c6fcaa9140517c7b3ad29151ad5e501` was published
with a normal push. The fork release `next-v0.2.29` now points to installed source `eafde861`.
Both uploaded assets match local sizes and SHA-256 digests: installer 132,366,905 bytes and
blockmap 139,039 bytes. A real ranged installer download returns HTTP 206 and bytes 0–31 of
132,366,905. The original project's release and tags were not changed.

At final reconciliation, another task had committed six local copy-review changes through
`cbe06953bd3119c20bb796c86d82d2f26b1baa49`. They contain the published audit plus new application
copy and QA changes. They have not been published by this audit, and the passing suite and installed
archive recorded above do not verify those new changes. Their review and delivery remain separate
work. The original cohort remains 6/43 with targeted repairs and 0/43 fully audited.
