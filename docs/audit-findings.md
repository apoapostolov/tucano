# Tucano audit findings and proposals

Maintain this register with [the master plan](audit-plan.md). Use a stable ID, exact source/range,
observed/expected behavior, reproduction/evidence, confidence/severity, public issue/PR, owner or
current task, status, next action and closure evidence. Do not label a hypothesis as a reproduced
bug, a proposed feature as a defect, or a targeted repair as a full feature audit.

## Confirmed findings

| ID | Finding and evidence boundary | State | Next action / closure |
| --- | --- | --- | --- |
| F-001 | Large skill comparisons allocate a quadratic LCS matrix. Reproduced on current main `d175567b`, 6,000 lines / 12,000 characters per side exceeds a constrained 128 MiB Node heap; this is not an observed Electron crash. [Issue #454](https://github.com/eduwxyz/tucano/issues/454). | Repaired in [PR #468](https://github.com/eduwxyz/tucano/pull/468), public head `2d15a277`; integrated, installed and verified; upstream merge pending | Public full suite: 1,771 passed, 60 skipped; combined: 2,634 passed, 61 skipped. Installed proposal/history, full-content, keyboard and layout checks pass at 150% scaling. Broader #311 audit remains open. [Completed packet](audit-skill-comparison-2026-11-15.md). |
| F-002 | The installed-QA archive inspector used a forward-slash lookup on Windows, where @electron/asar expected native separators. Existing file listing established the file was present. | Repaired in `7564fa41`, included in 0.2.32 source; development tool only | Installed source inspection and hidden runtime checks pass. Keep the repair separate from any claim that installer contents were missing. |
| F-003 | Pause gate mishandled a pre-aborted signal, overwrote concurrent waiters and retained abort listeners across resume. All three regressions failed at the original feature head. | Repaired on existing [PR #457](https://github.com/eduwxyz/tucano/pull/457), public head `925c557a`; integrated and installed | Targeted repair verified by public and combined tests plus pause/resume UI. Broader real-provider and full feature audit remain open; see the [evening record](audit-evening-2026-11-14.md). |
| F-004 | #245's temporary reasoning remained readable from the renderer cache after disable, conversation removal and replacement snapshot. Each reply was bounded, but reply count was not: a 250-run fixture retained all entries. Five regressions fail on `5f4a1a21`; an unrelated-transition control passes. No cross-person disclosure is established. | Repaired on existing [PR #245](https://github.com/eduwxyz/tucano/pull/245), head `c35e802c`; integrated in `8b508004`, installed check pending | Public full suite: 1,756 passed, 60 skipped; combined: 2,656 passed, 61 skipped. Public and combined browser lifecycle checks pass. Cache now keeps at most 200 recently streamed replies, each at most 20,000 UTF-16 code units. Store maintainability remains blocked; full feature audit stays open. [Packet](audit-reasoning-245-2026-11-15.md). |
| F-005 | The public #245 block supports manual and automatic folding, but the integrated reading-line/size implementation is always expanded. Merging the older block cleanly inserted a second Thought implementation, so ancestry and a clean merge did not preserve the feature. | Confirmed integration gap; duplicate discarded before delivery | Compose folding with reading-line ownership, size controls and completion behavior, then run public fold and native scrolling regressions together. Keep the stronger reading-line implementation until that composition is verified; do not mark #245 fully audited. |

The daily workflow also had a provenance gap: cached diffs were named from an earlier head query,
then downloaded from the live PR without checking it stayed the same. The updated cache checks head
and base before/after capture, stores a hash sidecar and reuses only matching verified bytes. A
changing-head fixture now aborts without writing a mislabeled diff; a live #457 capture verifies the
normal path. This is a workflow repair, with no claim that a historical cache was actually mislabeled.

## Questions and risks requiring evidence

| ID | Observation | Status and next action |
| --- | --- | --- |
| Q-001 | The live workspace's conversation/message aggregate changed during the upgrade session, after an earlier exact-preservation check. Agent IDs remained unchanged and read-only database quick_check passed. | Cause not established; not a demonstrated migration defect. Do not infer lost content or exact preservation from aggregate hashes. If investigating, use authorized read-only provenance and a safe consistent baseline. See [0.2.32 verification limits](upstream-reconciliation-0.2.32.md). |
| Q-002 | Historic maintainability measurements flagged large runner/Wiki/Git test files; some platform/provider tests are skipped. | Existing debt/coverage limits, not current metrics for every file. FS-01/18 must establish current coverage and resolve or explicitly record required gaps before a production-readiness claim. |
| Q-003 | #355 has targeted future-provenance repairs, with historical and in-flight permission paths still needing review. | High review priority; severity and remaining defects require concrete cases. FS-03/11 owns the follow-up. |

## Improvement proposals and feature completion

- [ ] **P-001 — Room access, existing #423/#424.** Separate visibility to people from read access for agents; private defaults, consistent persistence/authorization and Tuca proposals through the same controls. Complete the existing feature rather than open a competing story.
- [ ] **P-002 — Representative performance and recovery evidence.** Define workloads and acceptance thresholds from measured use, then fill the gaps in streaming, queue fairness, large histories and restore/restart. Link concrete defects to modular fixes; keep large architectural proposals separate.

## Handling and closure

Independent non-Apo work requires the approval recorded in [the approval register](audit-approvals.md)
before review or changes. Apo-related investigation and authorized upgrade compatibility retain
their scope.

- [ ] For each new confirmed original-code bug, reproduce it on current `upstream/main`, check existing reports and open a focused issue/PR against `eduwxyz/tucano:main`.
- [ ] For a defect owned by an open feature, repair that PR at its existing head/base unless a specific fix requires a base change.
- [ ] For an improvement, write the user decision, proposed behavior, alternatives, dependencies, costs and acceptance criteria before implementing the important change group.
- [ ] Close a finding only with regression evidence, pushed/integrated source and installed verification when code delivery is required. Keep wider feature/package coverage open.

This register is seeded from established evidence, not a claim that all historical findings have
been imported. Link older records and migrate their unresolved work during methodical review.
