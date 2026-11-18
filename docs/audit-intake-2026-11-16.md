# Daily intake and upgrade checkpoint, 16 November 2026

## Scope and refs

Starting local and published next: `3c539212af7e54e465ccc658de1e4f570f32efb7`.
The primary checkout was clean. Other worktrees, including R-245's uncommitted probes, were
left untouched. This checkpoint uses `codex/daily-intake-2026-11-16` in its own worktree.
Fork main remains `c42d1f323a2927084d0cc06366160ea21aa0788b`, already contained.

Upstream advanced from the delivered 0.2.33 revision `9474545f` to
`15370a0b41f54aec11d542bc2114d6acb9588535`. Release `v0.2.34` points to `ab1b9d0f`;
two later main events add endpoint setup refusal and Hermes import. Ten first-parent events
remain unintegrated. No application source, package, installation or release changed in this
documentation checkpoint. The verified local installation remains 0.2.33.

## Intake completed

- [x] Inspect remotes, worktrees, dirty/staged files and published divergence; fetch explicit refs.
- [x] Capture upstream versions/main, all Apo states and all-author metadata with dated history.
- [x] Regenerate canonical queues and the open-Apo view without advancing completion boxes.
- [x] Compare the previous snapshots and collect selected Apo discussions and exact heads.
- [x] Perform bounded compatibility reviews of #275, #397 and revised #245; parent reruns below.
- [x] Update the master queue with unfinished upgrade work first.
- [ ] Reconcile and validate 0.2.34 plus subsequent main changes; package, install and verify.
- [ ] Resume deeper R-245 audience/concurrency/provider/maintenance coverage after reconciliation.

Apo totals: **94**, comprising **51 open, 31 merged, 12 closed; 0/94 fully audited**.
No new Apo PR appeared. #275 and #397 moved from open to merged. #245 changed from
`359c199d` to `749311e133dd52c31c9958bc4ca8991e32f5ef81`; #391 changed from `f55ce3fb`
to `33dea61c9b29537e8fd17063bbffcaa36dc90e38`. Their bases also changed. #397's final
merged head is `05e15f2ba4d44acf6188ee6ed2ea900bbccec3a7`.

Other-author totals: **253, with 32 open**. Nine new records are #488–#496. #488, #489,
#490, #492 and #493 are merged; #491, #494, #495 and #496 remain open and approval-gated
for independent review. Necessary upgrade compatibility checks remain authorized. There is no
new independent non-Apo approval and no broader original-code audit certification.

## Bounded Apo compatibility results

Each child received one PR and exact head, remained read-only and returned its limits. Parent
checks below reproduce the evidence used here. These are partial review checkpoints.

**#397, head `05e15f2b`:** Memory tab paging is already present in the integration. Its merged
component and paging tests match the reviewed head; integration retains additional English copy.
Preserve that copy, the independent strip, selected-tab centering and conditional arrows.
`Memory.tsx:89,94` explicitly requests smooth scrolling; reduced-motion behavior remains an
unverified accessibility case. No rendered or installed paging coverage was added here.

**#275, head `3faac071`:** preserve the existing single ThreadButton and noReply suppression,
message-body-scoped pin, delete/prompt-jump controls and current offsets. The incoming run-only
wrapper predates these combined behaviors. The integration's old `screens-thread-btn.mjs:193–194`
still queries `.msg__anchor` and passes it to getComputedStyle, while the current renderer has
no such wrapper. This is a source-level evidence-harness mismatch, not a reproduced production
geometry failure. Do not run that legacy script: it also lacks the current hidden-launch protocol.
Its migration and fresh geometry evidence remain pending; existing screenshots cannot certify
the current combined placement.

**#245, head `749311e1`, base `15370a0b`:** the previous delivered public head `899933e5` is
not an ancestor. The child's scoped range comparison maps the retention and prefix-trim repairs
to equivalent rebased commits `fa729e49` and `cc590e2b`; the latest test change skips a
browser-dependent case when Chromium is absent. No loss was identified in that bounded source
comparison. Keep the stronger extracted Thought, folding, reading hold and cumulative trim
origin in the integration. Pi engine/type files are unchanged between integration and the new
public head. This does not establish reasoning support for the newly introduced endpoint engine;
that contract needs an explicit upgrade check. Current-head isolated execution, real providers,
broad concurrency and full revocation/reconnection coverage remain open.

## Parent verification

- `node scripts/test-audit-workflow.mjs`: **7 passed, 0 failed** in the intake worktree.
- `npx vitest run test/memory-tabs-scroll.test.tsx test/memory-tab-label.test.tsx
  test/thinking-lifecycle.test.ts test/thought-cache.test.ts`: **4 files, 16 passed, 0 failed**
  on clean primary source `3c539212`.
- `npx vitest run --config scripts/qa-audience.config.ts`: **1 passed, 0 failed**, same source.
  This is the existing bounded role/preference transition probe, not full audience certification.
- `git diff --quiet 05e15f2b 57624f28 -- src/renderer/src/components/Memory.tsx
  test/memory-tabs-scroll.test.tsx`: exit **0**. Integration's paging test also matches (exit 0).
- `git diff --quiet 3c539212 749311e1 -- src/core/engines/types.ts src/core/engines/pi.ts`:
  exit **0**. `git merge-base --is-ancestor 899933e5 749311e1`: exit **1**, confirming rewritten ancestry.
- `rg -n 'msg__anchor|ThreadButton|noReply|RunSteps|Thought|stepsWindow'
  src/renderer/src/components/Conversation.tsx src/renderer/src/styles.css` and
  `rg -n 'anchor|getComputedStyle' scripts/screens-thread-btn.mjs` reproduce the structural
  mismatch. `node --check scripts/screens-thread-btn.mjs` passes syntax only.

No full-suite, new installed behavior or production-readiness claim is made. The tests above run
against the maintained 0.2.33 source, not the rewritten public feature head or incoming 0.2.34 tree.
No desktop automation, foreground input, live database access or public communication occurred.

## Next bounded work

Reconcile the ten incoming main events before older feature work. In particular, check endpoint
execution/settings placement and thinking events, per-request delegation identity and thread
ownership, approval recovery, and local Hermes import boundaries. Preserve Apo's interface and
privacy protections through clean merges as well as conflict hunks. Then run the combined suite,
built UI/copy checks and installed hidden checks; verify actual fork release assets if published.
Until those steps finish, the 0.2.34 delivery box stays unchecked.
