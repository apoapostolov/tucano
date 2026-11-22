# English interface copy, phase 2

The implementation starts at upstream `98554fdd007637409696f98e061973b5ca9338c6`, which includes the accepted English-copy PR #410. The 22 November audit supplies candidates; each still needs a behavior and layout check before approval.

## Scope

English interface labels, explanations, confirmations and user-facing errors only. Preserve Portuguese text, interpolation expressions, identifiers, settings placement, permissions and behavior. Model-facing prompts and tool output remain outside this PR. Skills-dialog wording belongs to open PR #608 and is deferred here. Locale catalogs are proposed separately in issue #618.

## Delivery checklist

- [x] Freeze the accepted upstream base and review the 202 candidates by surface.
- [x] Reproduce the implementation reports and validate that changes affect English only.
- [x] Measure the built replacement strings at 900 and 1280 CSS pixels, including expanded states and consequential warnings.
- [x] Publish a proposal with exact old/new wording and 12–16 annotated frames showing distinct existing defects and revised text.
- [x] Run type checking, affected tests, source checks and the upstream build.
- [ ] Open the phase-2 PR against current upstream main; verify its pushed head.
- [x] Integrate compatible wording into next while preserving already approved fork wording and layout.
- [ ] Update the copy registry and run its checks on the pushed integration head.
- [ ] Build, install, launch and inspect TucanoNext with the revised strings at native display scaling.

The frame gallery uses actual built UI with synthetic data. Character budgets are estimates; line and overflow measurements establish fit. Complete privacy and irreversible-action warnings can exceed two lines only with a recorded reason. The source-only change does not certify untranslated source forms or unrelated feature behavior.

## Verified checkpoints

- Upstream proposal: [PR #622](https://github.com/eduwxyz/tucano/pull/622), 195 English changes across 34 source files, based on accepted #410. Merged upstream 2e388641; the sole changelog conflict is resolved.
- [16 immutable paired frames and measurements](https://github.com/apoapostolov/tucano/tree/c2b8407b75fc61beea0e1b9f2b8cc473bc882ef6/docs/english-copy-phase2/evidence): 116 Settings/Wiki and 12 extra-state measurements per version at 900/1280 CSS pixels. No overflow; captured ordinary changed hints fit within two lines. Complete Tuca and restore consequences retain recorded three-line exceptions.
- `next` preserves 30 already polished differences and seven already matching entries. It applies 148 English occurrences, including relocated notification and classifier disclosures, without changing Portuguese, keys, layout or application logic. The tracked `phase2-next-review.json` records exact old/new wording and dispositions.
- `npm run typecheck`: exit 0. Affected tests: 26 files, 243 tests passed. Copy registry: 622 approved occurrences, zero regressions or unfamiliar variants. Portuguese-leak check: 288 files, zero defects. Copy override safety tests: exit 0.
- Upstream full suite: 239 files / 2,381 tests passed, two failures. The calendar fixture fails identically on the unchanged base. The Tuca batch fixture intermittently reaches its 20-second polling deadline; unchanged candidate and extended-deadline diagnostic runs both passed all 11 tests. No test or production behavior was changed to hide these results.
- Locale catalogs remain proposed separately in [#618](https://github.com/eduwxyz/tucano/issues/618). Skills copy stays on #608; model-facing text remains deferred.
