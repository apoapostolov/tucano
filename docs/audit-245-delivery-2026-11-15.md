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
- Native and installed evidence is pending. Build success alone does not close delivery.

## Delivery checkpoints

- [x] Child reports read; findings reproduced by parent.
- [x] Repair and existing public PR updated; pushed public head verified in a fresh checkout.
- [ ] Integration pushed to origin/next and remote SHA verified.
- [x] Build and package produced with real node_modules.
- [ ] Installed into Programs/tucanonext; package identity/hash checked.
- [ ] Fresh installed launch and changed behavior verified at display scaling.

Broader audience, concurrency, real-provider, backend steering and full-audit dimensions remain
open. The native fixtures use synthetic throwaway data, separate ports and hidden unfocusable
windows. They never target the live database, released app or user's foreground desktop.
