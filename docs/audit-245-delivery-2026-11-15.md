# R-245 retention and folding delivery, 15 November 2026

This is a targeted repair of F-005 and F-006. It does not complete the feature audit.

## Ownership and workflow

The earlier run was stopped at the user's direction. This chat owns delivery in
`C:/git-ext/tucano-r245-delivery`, with a real local `npm ci` install. The primary checkout's
older local next and concurrent copy edits remain untouched except for the owned AGENTS.md
workflow paragraph. Existing junction targets were never deleted.

The local handoff guard now distinguishes context preservation from final delivery. Seven
unittests pass: warning behavior cannot close delivery, child reports do not complete parent
work, checkpoint order and early completion are enforced, authored handoffs survive warnings,
and completed tasks above 200k request an end-of-task handoff. Stop and PreCompact registration
remain separate. Local global instructions, handoff skill, repository instructions and this
plan use the same ordered parent checkpoints. No credentials were read.

## Reproduction and repair

At published next `19ca815edfc924b75104159db9a482906f88571f`, the parent reran
`node scripts/qa-reasoning-retention-boundary.mjs control`: zero drift. Without `control`, the
correct assertion failed with -241.71875 CSS pixels after trimming 1,000 retained-prefix units.
The test was correct; the product anchor was wrong. Integrated source `5097498b` retains the
text origin atomically with the bounded cache and composes manual/completion folding with
reading ownership, sizes and steps. Repaired boundary drift was 0.28125 CSS pixels.

Public PR #245 was refreshed at head `6e383851095949ba45f098f0eab7548721dc5997`, base
`68cf5da1cb5a1f589926ac819c46d9ffd7645988`. Its existing folding already worked, but prefix
trimming also displaced the reading passage. The new browser regression fails against its
preceding renderer with 929.6875 CSS pixels of displacement. Repair commit
`899933e57c795b75a2e00068460f5090f424178b` was pushed normally to `feat/thinking-stream` and
the existing PR description updated. A fresh checkout of that pushed SHA passed typecheck
and all 20 focused public tests in headless Edge. No private fork details were posted upstream.

Composition `71f27afcaa1cf7b9b408afeff87951402921b3f3` joins that public repair to the
canonical integrated implementation. Independent review found no duplicate implementation;
its repeated-trim and cache tests passed 6/6. The parent owns the combined delivery candidate
`a0537d763ef3700dfc8f223b65ff5ab1051efebd`.

## Validation before installation

- Parent full suite: 298 files passed, 4 skipped; 2,660 tests passed, 61 skipped, zero failures.
  Command: `npm test`; log: `C:/tmp/r245-owned-full-tests.log`.
- Typecheck, three-size retention/eviction, nine folding width/size cases, and seven workflow
  checks passed. The initially failing completion mocks were stale tests; their expected
  automatic-fold contract was corrected before the successful full run.
- `node scripts/self-build.mjs build --json` succeeded with a real local install, NSIS packaging
  with publish disabled, 37,416,601-byte app.asar and 114 packaged runtime dependencies.
- Unpacked native checks pass all three sizes at display scale 1.5: 3,596–3,736 units trimmed
  during reading, maximum drift below 0.33 CSS pixels, following resumed, manual/completion
  folding and disable clearing passed. Native widths were 900, 1280 and minimum 886 CSS pixels;
  the requested 360 width was clamped by Electron, and is not claimed as native 360 coverage.
  The separate headless component fixture covers actual 360. Installed reasoning checks also pass, as recorded below.

## Delivery checkpoints

- [x] Child reports read; findings reproduced by parent.
- [x] Repair and existing public PR updated; pushed public head verified in a fresh checkout.
- [x] Integration pushed to origin/next at `5efb3b44f05cf7b5dabe3a8995766ac3e06d018f`;
  remote SHA verified. A fresh detached checkout passed typecheck, 27 focused tests, control
  drift zero and trimmed boundary drift 0.28125 CSS pixels.
- [x] Build and package produced with real node_modules.
- [x] Installed into Programs/tucanonext after graceful quit; installer exited zero. Identity
  remains tucanonext / TucanoNext / dev.tucano.next, updater off. Built and installed app.asar
  SHA256 both `ecd8f3d93dc091e4586d7c63f495dae9584595abde02e3509b602ad9c6cc73fe`.
  Package has 114 runtime dependencies and none missing.
- [x] Fresh hidden installed launch verified in the adjacent background check.
- [x] Installed reasoning behavior verified; all ten parent checkpoints have evidence.

Broader audience, concurrency, real-provider, backend steering and full-audit dimensions remain
open. The native fixtures use synthetic throwaway data, separate ports and hidden unfocusable
windows. They never target the live database, released app or user's foreground desktop.

## Installed adjacent controls

`node scripts/qa-background.mjs C:/tmp/r245-installed-adjacent --pause` passed from
`Programs/tucanonext/TucanoNext.exe`, with synthetic data and separate ports. Pause → Pausing… →
Resume → resumed was exercised; Steer remained available during active/pausing states. Labels
fit one line at 900/1280 CSS pixels and scale 1.5. Workspace, profile, DM, Settings, Team, usage,
background notification actions and updater-off checks passed with no renderer errors.
The package doctor's temporary "dead-at-load" verdict during hidden QA is a visible-window
heuristic; these deliberate hidden windows were running successful tests. No repair or process
kill was based on that heuristic.

## Installed reasoning and final launch

`TUCANO_ELECTRON=Programs/tucanonext/TucanoNext.exe node scripts/qa-streaming-thought.mjs
C:/tmp/r245-installed-thought` passed in a fresh hidden instance at scale 1.5. All windows stayed
hidden and unfocusable. Retention removed 3,665 / 3,596 / 3,736 units for sm/md/lg; maximum
reading-line drift was 0.03125 / 0.32294 / 0.3125 CSS pixels. Completion drift was zero in each
size. Returning to the end resumed following. Explicit open survived completion; manual folding,
automatic completion folding and disable/re-enable clearing passed. No renderer errors occurred.

The report includes source SHA, exact installed executable, version, display scale, real viewport,
font, available width, character/line counts and overflow results. Evidence lives at
`C:/tmp/r245-installed-thought/report.json` and adjacent PNG captures. Native label measurements
pass at actual 900, 1280 and minimum 886 CSS pixels; requested 360 is explicitly clamped to 886.
The fresh pushed-source component fixture separately passes all nine size/width combinations
at actual 360/900/1280. English labels Thinking/Thought are unchanged established wording;
the restored folding flow and rendered screenshots were reviewed, with no new hint or warning.

After the scratch runs closed, the regular installed app was restarted with `--background` and
its normal environment, without test variables. `node scripts/self-build.mjs doctor --json`
reported `running`, window TucanoNext, sameAsBuild true, 114 packages and zero missing runtime
dependencies. No foreground input, live database edits or released-app changes were made.

The intervening local-next instruction commit `bb6af43c` was preserved through merge `71ed863e`.
That merge changes instructions only. Application source/package manifests remain byte-identical
to build source `a0537d763ef3700dfc8f223b65ff5ab1051efebd`. The primary checkout retains its
16 concurrent copy edits; its local branch was not advanced by this delivery task. No release,
tag or asset was published for this targeted repair.
