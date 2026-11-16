# TucanoNext 0.2.35 reconciliation

Started 16 November 2026. Requested ingestion of the released/re-released 0.2.35, preserving
TucanoNext identity, interface and the installed secondary-boss preview.

## Delivery checklist

- [x] Inspect remotes, worktrees, clean starting next and installed-preview provenance.
- [x] Fetch fork main/next and upstream main; identify both 0.2.35 release commits.
- [x] Merge installed preview `658693b8` into an isolated candidate without changing the primary checkout.
- [x] Resolve version/changelog conflicts, inheriting 0.2.35 and retaining TucanoNext identity.
- [x] Review #502/#503 compatibility independently and reproduce the Windows hash-ordering defect.
- [x] Apply and verify the focused Windows stock-skill hash repair; submit it upstream as #512.
- [x] Complete combined checks and inspect built copy/layout and changed behavior.
- [x] Verify the pushed repair and integration from their exact remote heads.
- [x] Push and fast-forward next, preserving intervening work.
- [x] Build/package with real local dependencies and `--publish never`.
- [x] Install, freshly launch without taking focus and verify the installed changed behavior.
- [x] Record package/archive identity and current release availability.

## Starting refs and scope

Starting next: `b6a3461fadaad3db5b9899249434f17bc60ce54a`.
Fork main: `c42d1f323a2927084d0cc06366160ea21aa0788b`, already contained.
Fetched upstream main: `e61f6e463c1cf0d21c66f218a2e67acf1033663f`.
This includes Hermes review follow-ups #502 (`67b66d93`), site #501 (`2c4f0552`),
SOUL/gateway semantics #503 (`9901b9e5`), and release #504 (`e61f6e46`, retaining
`4255f0d6` and Portuguese changelog refinement `7aa4d7d8` in its history).

The first live API observations list 0.2.34 as latest and return 404 for release/tag `v0.2.35`,
while main already declares 0.2.35. This run ingests that source and rechecks publication before
completion. An unavailable tag or asset cannot establish which binary was re-released. Do not
infer replacement-asset identity from the version or commit subject alone. Raw observations are
saved under `.tucano-local/audit/release-0235-observation.json` in the primary checkout.

The installed 0.2.34 preview matches source checkout `658693b8` as recorded in
[the preceding audit](audit-deep-2026-11-16.md). Its two commits are merged into the candidate so
secondary bosses survive the upgrade. Existing feature defects F-010–F-012 remain separate open
work on [upstream #467](https://github.com/eduwxyz/tucano/pull/467); this ingestion does not certify
that feature. No PR is opened against the fork; integration goes directly into next.

## Compatibility decisions and evidence

- Preserve package `tucanonext`, product/executable `TucanoNext`, app ID `dev.tucano.next`,
  independent data/install paths and ports 47727/47728. Keep self-update off.
- Preserve the fork's Workspace transfer placement, selected-access controls, reviewed English,
  recovery defaults, reasoning component and steer/prompt layout. Incoming Hermes changes are
  core-only; do not replace the existing renderer with upstream's layout.
- Retain endpoint credential scoping and request/thread ownership repairs from the 0.2.34 build.
- Hermes's seeded SOUL is treated as no custom instructions; edited instructions still import.
  Gateway configuration follows enabled/disabled precedence and profile-scoped runtime names;
  runtime error text is not retained. Disabled MCP servers remain named in the summary.
- The Windows hash-order regression is code failure, not a bad test. The parent reran the child's
  Python-generated unchanged-skill fixture on exact #503 `61f51bae`: one failure, stock skill
  imported instead of excluded. The tracked upstream hash vector skips Windows. A repair must
  match Windows Python path ordering while preserving POSIX behavior and path/secret limits.

Initial candidate checks: `npm ci` exit 0 (718 packages; eight moderate audit findings, no automatic
breaking update); `npm run typecheck` passes; `npm run check:settings` passes 33 sections,
56 owned keys, 58 writes and 14 tests. Ten focused Hermes/endpoint/secondary-boss/UI files pass
107 tests with one skipped hash vector. These precede the new Windows regression and are not
final combined-source or installed evidence.

## Limits and remaining work

Only synthetic throwaway import sources and scratch application data are permitted in QA.
No credential file, real Hermes profile or live Tucano database is read by fixtures. All GUI checks
must remain hidden and unfocusable, with ephemeral ports and updater off. Real providers,
phone/server integration, broad feature audits and the existing maintainability debt remain open.
Release publication is separate from this requested local installation; upstream tags/releases
are untouched. The fork's currently published release remains `next-v0.2.33`.

## Late next reconciliation

The user requested a refresh before packaging. Published next `5525abfb` contains the
parallel 0.2.35 merge `a4c8156d`, site clarification #505 (`cc95e3c8`) and instruction-table
cleanup. Local next `124e95dd` independently contains that cleanup. Both histories are merged,
without replacing either side. The combined application source is unchanged from the tested
`db2ad2aa`: late changes affect instructions, changelog and the Hermes landing page only.
The conflict resolution retains one 0.2.35 changelog section in its upstream position.

The release API now confirms `v0.2.35`, published 2026-11-16T12:33:13Z, targeting
`e61f6e46`. This supersedes the earlier 404 observation; replacement binary provenance remains
unestablished. This build uses the verified source, not downloaded upstream installers.
Newer upstream main `d02bfeb3` is outside the requested 0.2.35/next intake and is deferred.

Checks on the late combined head: typecheck passes; seven Hermes/secondary-boss files pass
100 tests with one skipped POSIX vector. The unchanged application tree previously passed
312 test files (2800 tests, 62 skipped), build and hidden combined QA with no renderer errors.
Windows repair `dee18234` is published on upstream #512 and independently rechecked from the
remote head: 34 Hermes tests pass, one POSIX test skips, and typecheck passes.

## Installed delivery evidence

- [x] Final source `3d0d7b9b675ae9de265d07b3da4d341acb96a063` pushed to origin/next.
- [x] Fresh remote-head checkout: typecheck passes; 65 focused tests pass, one POSIX vector skips.
- [x] `node scripts/self-build.mjs install --json` exits 0, installer identity TucanoNext,
  version 0.2.35, 114 runtime packages, no missing dependencies, fresh normal background launch.
- [x] Installed archive equals the final packaged archive: 37,574,647 bytes,
  SHA256 `097bf6185669d8f75893723348cbd864bef847e696c2eb08b5701ff87c3a8e4f`.
- [x] Installed hidden combined QA passes with zero renderer errors: Settings placement/copy,
  pause, skill origins/comparison, artifact ingestion, sectors and upgrade dialogs.
- [x] Installed Hermes RPC excludes the unchanged Windows stock-skill fixture, includes the
  edited version and imports it into synthetic workspace data.
- [x] Installed primary/secondary boss values survive authorized RPC save and renderer reload.
- [x] Editorial review and screenshots confirm the revised secondary-boss hint at 900/1280 CSS
  pixels, native 150% scaling, Inter Variable 12px: two lines, no overflow, single-line labels.
- [ ] Full secondary-boss feature audit and existing F-010-F-012 repairs remain open.

The first packaged Team side-panel selection check briefly observed the secondary boss and then
read it as absent; its end-state assertion failed. This is retained as an open interaction result,
not hidden by the successful RPC persistence check. The preview's profile hint also failed with
three lines. Its wording was shortened from 203 to 122 characters without changing the action,
reply routing or board-placement meaning; Portuguese and labels are unchanged. Public feature
head `9b202e99` updates existing upstream #467, with typecheck and 26 tests re-run from the
pushed head. The combined tree passes 31 related UI/core tests after that single-string edit.
The final installed copy screenshots were inspected by the parent.

Commands and raw local evidence:

- `node scripts/self-build.mjs install --json`: `C:/tmp/tucano-0235-final-install.log`.
- `node scripts/qa-background.mjs C:/tmp/tucano-0235-installed-qa --upgrade-034 --pause --settings-overhaul --settings-copy --skill-origins --skill-comparisons --upstream-artifact --sectors`
  with process-scoped `TUCANO_ELECTRON` pointing to the installed executable: `report.json` passes.
- `node C:/tmp/tucano-0235-boss-persistence-qa.mjs C:/tmp/tucano-0235-installed-boss-hermes`
  with that installed executable: report passes, profile screenshots and JSON at both widths.
- Initial failed interaction/copy records remain at `C:/tmp/tucano-0235-boss-built-2/report.json`
  and `C:/tmp/tucano-0235-boss-persistence-built/report.json`.
- [Maintainability comparison](upstream-0.2.35-maintainability.md) remains red; the final rerun
  reports the same +1466 NLOC, +515 CC, +357 cognitive complexity and 15 red edited files.

This completes the bounded 0.2.35 local delivery, not the global feature/whole-tree audit.

Final metadata intake refresh succeeded with `--metadata-only --next HEAD`; canonical Apo
all-state/open queues include the new #467 head and #512. Full descriptions/check/file/patch
collection failed first with HTTP 502 and then a truncated GraphQL response. Those logs remain
at `C:/tmp/tucano-0235-final-pr-intake.log` and `C:/tmp/tucano-0235-final-pr-intake-retry.log`.
Metadata intake does not mark any PR fully audited. `node scripts/test-audit-workflow.mjs`
passes seven tests. Current exact-head review details for the two delivered changes are above.
