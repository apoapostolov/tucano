# Deep audit checkpoint — 16 November 2026

This run advances the global audit through two bounded Apo feature reviews, current inventories,
a first whole-tree file map and fresh hidden installed checks. It does not certify the product.
The [master plan](audit-plan.md) and [finding register](audit-findings.md) retain the remaining work.

## Progress

- [x] Inspect remotes, worktrees and concurrent edits; preserve other tasks and preview installation.
- [x] Fast-forward clean local next from `8ade33e4` to published `514c94be`.
- [x] Refresh all-state inventories: 94 Apo PRs (51 open, 31 merged, 12 closed), plus 260 other-contributor PRs (36 open).
- [x] Review exact heads of #245 and #467 through independent children; reproduce findings in the parent.
- [x] Identify the installed secondary-boss preview and open its fork PR.
- [x] Run fresh hidden installed QA and review screenshots and measurement results.
- [x] Enumerate 905 tracked paths and produce a provisional ownership map.
- [x] Document recent improvements and separate published integration from installed preview.
- [ ] Repair the newly reproduced findings on their owning feature branches.
- [ ] Complete secondary-boss permissions, delegation, persistence, keyboard and rendered-copy checks.
- [ ] Reconcile three newer upstream commits, preserving the current interface and feature union.
- [ ] Resolve 268 unassigned paths, review ownership and establish performance baselines.
- [ ] Complete any full feature or full-stack package audit: current counts remain 0/94 and 0/18.

## Source and installed state

| Reference | Observed revision |
| --- | --- |
| Published next and audit harness | `514c94bec373d8156845879968ffccb4efae2bd1` |
| Fork main, already contained | `c42d1f323a2927084d0cc06366160ea21aa0788b` |
| Fetched upstream/main | `9901b9e5f209433bcfc04f6bc05d90e580a888db` |
| Secondary-boss public PR #467 | `1f1fa3a5b358d5ffb1b4470817cae0cbcb859335` |
| Existing local secondary-boss repair | `3eba2507a897dfc5faa6c5aa6c8a6b7b85a19730` |
| Installed preview packaging checkout / fork PR #5 | `658693b87174f29a74bc5e8db0277ccc02e77cc7` |
| Reasoning public PR #245 | `749311e133dd52c31c9958bc4ca8991e32f5ef81` |

Installed TucanoNext is version **0.2.34**, with “Also answers to” in its renderer. Its 37,563,849-byte
`resources/app.asar` has SHA-256
`e2499bcb2fc77479452a7aeaa873f22b25e7a3b4be0dc6676f5745a737a18ce8`.
It matches the preview package at `C:/tmp/tucano-also/dist/win-unpacked/resources/app.asar` byte for
byte. That checkout is at `658693b8`, with tracked application source clean. This is package
provenance, not an embedded source-SHA attestation. The primary checkout's package differs.
The older `8962b690` installation record is historical; it does not identify today's archive.
The published fork release remains `next-v0.2.33`; no tag or release was published in this run.

The installed preview contains two commits above next: secondary-boss support and its connector/
picker revision. It is now preserved on origin as `feat/multi-boss-next`, with draft
[fork PR #5](https://github.com/apoapostolov/tucano/pull/5) against next. The remote head was
verified as `658693b8`. The repair at `3eba2507` is not included there. Keep this distinction
visible until repair, pushed-head checks and installed changed-behavior verification finish.

Upstream commits `67b66d93`, `2c4f0552` and `9901b9e5` are not in next: Hermes import follow-ups,
site content and SOUL/gateway semantics. Compatibility review and integration remain pending.
The open 0.2.35 release PR is not a published release. Independent other-contributor audits remain
subject to the existing [approval register](audit-approvals.md).

## Secondary bosses — #467

“Also answers to” assigns secondary bosses while retaining a single primary reporting line.
This allows a specialist to serve several teams. It is unrelated to multiline message input.

The parent reran three regression cases against exact public head `1f1fa3a5`, using tests from the
existing local repair in a disposable worktree:

```powershell
npx vitest run test/shared-bosses.test.ts test/org-chart-ui.test.tsx test/select-ui.test.tsx -t 'preserves secondary-only links through team export and import|keeps the side panel open while pointer selections save both boss fields|keeps rapid choices while earlier saves update the controlled values' --no-file-parallelism
```

Result: **3 failed, 32 skipped**, exit 1. The implementation is wrong in these cases; the tests
express the intended relationship and selection behavior. No assertion was weakened.

- **F-010:** export/import promotes a secondary-only relationship into the primary boss field
  (`src/core/team.ts:76`; regression at `test/shared-bosses.test.ts:132`).
- **F-011:** pointer interaction with the portalled selector closes the Team side panel
  (`src/renderer/src/components/OrgChart.tsx:296`; regression at `test/org-chart-ui.test.tsx:543`).
- **F-012:** controlled updates lose rapid pending selections
  (`src/renderer/src/components/Select.tsx:172`; regression at `test/select-ui.test.tsx:80`).

Parent command on existing local repair `3eba2507`:

```powershell
npx vitest run test/shared-bosses.test.ts test/org-chart-ui.test.tsx test/org-layout.test.ts test/select-ui.test.tsx
```

Result: **50 passed across four files**, exit 0. This is local regression evidence, not repair
delivery. No parent rendered secondary-boss verdict, provider delegation or installed feature
verification was completed. The child also flagged relationship-count and connector geometry
questions; those require independent parent reproduction before entering the confirmed register.

## Reasoning — #245

The public PR explicitly covers Pi. Lack of endpoint-engine thinking support is an unsupported
scope, not a demonstrated regression in this PR. Broader provider support needs a separate decision.
Two concrete cache boundaries remain defective:

- **F-008, integration-only:** on next `514c94be`, `message_removed` and `history_wiped` leave the
  deleted reply's text readable through `liveThought`; conversation removal clears it. Parent ran
  `C:/git-ext/tucano/node_modules/.bin/vitest.cmd run --root C:/tmp/r245-retention-probe-514c94be --config C:/tmp/r245-retention-probe-514c94be/vitest.config.mjs`:
  **2 failed, 1 passed**, exit 1. Source: `src/renderer/src/store.ts:628` and `:649`.
  These event paths are absent from the public PR head; do not attribute them to that revision.
- **F-009, public head:** retries reuse a reply ID and append to the prior attempt's cache.
  Parent ran `C:/git-ext/tucano/node_modules/.bin/vitest.cmd run test/thinking-attempt.test.ts`
  in `C:/tmp/r245-attempt-base-749311e1`: **3 failed, 1 passed**, exit 1. Thinking attempts produce
  `FIRST-ATTEMPTSECOND-ATTEMPT`; silent and rejected retries retain `FIRST-ATTEMPT`. The unrelated
  active-reply control passes. Source: `src/core/runs.ts:686` and renderer store `:575` at that head.

These synthetic store and runner fixtures correctly expose retained state. They do not demonstrate
cross-person disclosure or establish that deleted text remains visibly rendered. The retry fixture
was supplied by an existing concurrent audit checkout; this run preserved it and reran it.
No application code changed, and neither finding is repaired by this documentation update.
Prior F-004/F-005/F-006 repairs remain historical targeted closures, not guarantees for every event.

## Installed checks and verification limits

```powershell
node scripts/self-build.mjs doctor --json
$env:TUCANO_ELECTRON="$env:LOCALAPPDATA/Programs/tucanonext/TucanoNext.exe"
node scripts/qa-background.mjs C:/tmp/tucano-deep-audit-1116-installed --upgrade-034 --pause --settings-overhaul
```

Doctor: installed and running, no missing runtime dependencies; archive differs from the primary
checkout's build. Hidden QA: **exit 0, passed true, errors []**. The process used synthetic scratch
data and allocated ports 56271/56272; updater off. Existing normal/released workspaces were untouched.
Checks cover Settings, pause/resume, workspace/profile/DM/Team/Usage and background notifications.
Upgrade checks produced **12 passing measurements** at 900/1280 CSS pixels and 150% scaling,
including endpoint setup and Hermes preview/error/empty states. Parent inspected the Team and
900px Hermes screenshots. No foreground input or desktop takeover was used.

Evidence: `C:/tmp/tucano-deep-audit-1116-installed/report.json`, screenshots and trace.
The report's source SHA identifies the **harness**, not the installed binary. The archive hash
above binds the tested package. Endpoint network/picker/save and real Hermes import were not
invoked; fake engines do not certify real-provider behavior. The Team screenshot does not exercise
secondary bosses. No unchanged application was rebuilt or reinstalled in this documentation run.

Additional parent checks: steer width/prompt glyph/edit-prompt regressions **9 passed across three
files**; `node scripts/test-audit-workflow.mjs` **7 passed, 0 failed**. No new full-suite claim is made.

## Inventory and next checkpoint

Rich GitHub intake encountered malformed/timeout responses. Bounded per-state queries recovered
all 94 unique Apo records; duplicate merged/closed results were validated and deduplicated before
rendering. Metadata and patch refresh do not count as feature review. New other-contributor
#499–#505 entries stay in intake; merged status does not grant an independent audit.

[The file map](full-stack-file-map-2026-11-16.md) records 905 tracked paths at `514c94be`:
625 provisional package assignments, 12 evidence artifacts and 268 explicitly unassigned paths.
Assignments are filename/path heuristics pending semantic review. The CSV includes every tracked
path at that revision once; newly authored audit documents are outside that frozen tree.

Next: port the secondary-boss repair onto fork PR #5 and its owning upstream feature as appropriate;
repair retry/cache event boundaries with meaningful regressions; then complete their remaining
feature checks and required code delivery. Reconcile newer upstream commits before final integration.
None of those unfinished steps is closed by a successful documentation push.
