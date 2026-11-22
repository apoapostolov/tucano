# English interface copy, phase 2

The audit starts at upstream `98554fdd007637409696f98e061973b5ca9338c6`, after accepted #410. It reviews English interface copy while preserving Portuguese, interpolation, permissions and behavior. Model-facing prompts remain outside this work; Skills-dialog copy belongs to #608. Versioned locale catalogs are proposed separately in [#618](https://github.com/eduwxyz/tucano/issues/618).

## Delivery checklist

- [x] Review candidates against behavior and adjacent controls; record exact replacements.
- [x] Publish the proposal and 16 annotated frames in [#622](https://github.com/eduwxyz/tucano/pull/622).
- [x] Verify acceptance: upstream merged #622 as `e44b688213f1ec70868d685d5a336b3772f1810d` on 22 November 2026.
- [x] Preserve compatible wording and the existing TucanoNext layout on next.
- [x] Review newer concurrency/server wording separately from accepted changes.
- [x] Publish and verify the nine-string follow-up, including the conditional desktop button: [#628](https://github.com/eduwxyz/tucano/pull/628), ready for review.
- [x] Update the copy registry and verify the published integration head.
- [x] Build and install TucanoNext 0.2.44; verify a fresh regular launch and archive identity.
- [x] Complete installed renderer checks at native display scaling and record final evidence.

## Upstream result and follow-up

The original proposal contained 195 replacements. Before merge, #626 removed five composer strings, leaving **190 merged replacements**. The historical 16-frame evidence remains pinned to `c548ff8ae7c5c999abf4d174e20d95868721bcb5`; frame 05 describes superseded composer controls. It must not be presented as current concurrency behavior.

Nine later replacements clarify concurrency, its per-agent override and server/computer scope. They are based directly on accepted `e44b6882`, on `codex/english-copy-concurrency`, published as [#628](https://github.com/eduwxyz/tucano/pull/628). Pushed head `43d110e55bab1c00619aa5d14bc06d9509f98b84` differs from verified source `7c4f2e04` only in its proposal. The final source passed typecheck and 15 server UI tests; the preceding unchanged concurrency/server selection passed all 45 tests. Eight paired frames and original-image hashes are pinned to evidence commit `dd0dda5318db1d7b35545c883b5354e446a3b012`. Its proposal and exact inventory live under `docs/english-copy-concurrency/`. The conditional desktop button narrows the server banner and exposed an additional wrapping failure. Shortening that hint to 107 characters retained server scope, local settings, agent lending and the relevant computer's app; the actual button state now fits two lines at 900 pixels.

The cumulative candidate `e9ac47e0` passed typecheck and the full suite: **255 files / 2,463 tests passed; four files / 61 tests skipped**. Earlier calendar and Tuca polling failures remain historical results; the latest run passed without changes to hide them. This is cumulative candidate evidence, not an exact-head full-suite claim for the upstream squash or subsequent nine-string PR.

## TucanoNext integration

Published source `6d3f7e266986e9225896a3cbbefab4ca53a74375` preserves concurrent browser-extension and settings-placement work. `phase2-next-review.json` records 148 replacement occurrences; `phase2-native-review.json` records 18 subsequent native-renderer refinements, some revising the same occurrences. These counts do not mean 166 unique strings.

Native rendering at DPR 1.5 exposed wrapping missed by browser-only checks. Shorter reasoning, dictation, export, account, classifier and extension hints address it. The reply shortcut hint uses the full field width and preserves the fork's actual keyboard behavior. The complete Tuca Apply/Undo disclosure retains a three-line exception at 900 pixels: it explains application timing, the 24-hour undo period, confirmation exceptions and the off-state action.

Typecheck passed; the final affected selection passed **14 files / 91 tests**. Stale English assertions and the changed Replies order were corrected after deciding the expectations, rather than application behavior, were wrong. A fresh detached checkout of the pushed head passed typecheck, **six files / 37 tests**, and the registry check: **634 approved occurrences, zero regressions, zero unfamiliar variants**. The Portuguese-leak pass scanned 292 files with zero defects.

## Package and installation evidence

`node scripts/self-build.mjs build --json` and `node scripts/self-build.mjs install --json` exited 0. The 0.2.44 archive contains 114 runtime packages with none missing. After explicit approval to interrupt the active reply, installation completed and the helper confirmed a fresh TucanoNext window. `node scripts/self-build.mjs doctor --json` reports `running`, `sameAsBuild: true`, `missing: []`.

Installed and packaged app.asar SHA-256: `5928bc242dd5fa93c186e31ff8469e9a9f6b262de4a23b9186728b95ff139e9e`. Hidden package QA passed **72 captures, zero errors**, at 900 and 1280 CSS pixels and DPR 1.5. Ordinary checked hints fit two lines, checked labels fit one line, and no overflow was found. Evidence: `.tucano-local/copy-20261122/packaged-native-v4/`; separate final installed verification: `installed-final/`, also 72 captures with zero errors at DPR 1.5. The installed executable hash matches the tested executable, and the regular installation remains running after hidden QA closes.

All captures use isolated synthetic data and separate loopback ports. The regular database is not edited. Coverage is limited to recorded states, rather than every dynamic tooltip, failure or dependency combination.

## Outside this delivery

This bounded copy integration does not certify full upstream parity. Newer upstream settings architecture and unrelated main changes require their own reconciliation. Preserve the existing TucanoNext UI and concurrent features during that work. Character counts estimate space; rendered line counts, widths and screenshots establish fit.

The approved-copy gate now runs in self-build before packaging and on every GitHub push to next. Safety tests and both source checks pass; these development-only changes do not alter the installed application bundle.
