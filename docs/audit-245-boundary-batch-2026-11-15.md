# R-245 boundary review batch

This bounded batch continues the existing reasoning packet. It does not certify the whole
feature or expand into independent reviews of other contributors' work.

## Source and isolation

- Public PR: #245, head `6e383851095949ba45f098f0eab7548721dc5997`, base
  `68cf5da1cb5a1f589926ac819c46d9ffd7645988`. The description and discussion were captured
  again before dispatch; the head and base match the existing packet.
- Starting primary `next`: `4bf641bf806380e17bd6ea197622cb85d064e8bc`, with the concurrent
  uncommitted copy task preserved. Starting published `next`:
  `152a32cc4b86642bf1f786265b07291e96edc4f7`.
- Upstream main: `3e8162ebbb8c1d432d6973cedde7444a21910f4f`; fork main:
  `c42d1f323a2927084d0cc06366160ea21aa0788b`. Neither contains commits missing from the
  published integration baseline.
- Review candidate: `93c2a5a36d351219e8c3267fd2c2ee28cdd38d4e`, in
  `C:/git-ext/tucano-245-boundary`. It merges the two local delegation-instruction commits
  with published next. Its packaged application source is byte-identical to published next.
- One leaf review child owns #245 at the recorded head, with `fork_turns="none"`,
  `gpt-6.1-terra`, effort `high`. The parent receives its report and reruns proving commands;
  no other PR is delegated in this batch.

## Batch checkpoints

- [x] Confirm refs, PR identity, concurrent edits and instruction reconciliation.
- [x] Check the audit-workflow tools: `node scripts/test-audit-workflow.mjs`, seven passed,
  zero failed or skipped.
- [x] Review retained-text trimming, a bounded audience-transition scenario and folding requirements.
- [x] Reproduce reported findings in the parent and record the remaining acceptance boundary.
- [x] Publish the development evidence and updated audit records to the fork's next branch.

## Confirmed retained-text defect: F-006

The cache trims a prefix at `src/renderer/src/thoughts.ts:17`, while the integrated Thought
component restores a character offset from the previous string at
`src/renderer/src/components/Conversation.tsx:2216`. After trimming, that offset no longer
identifies the same passage. The marked passage in this reproduction remains retained, but
moves out of view. This is a reading-position defect; it does not establish data loss or a
privacy disclosure.

Run from the task worktree:

```powershell
node scripts/qa-reasoning-retention-boundary.mjs control
node scripts/qa-reasoning-retention-boundary.mjs
npx vitest run --config scripts/qa-audience.config.ts
```

The first command passes with zero drift: 19,000 units plus 500, without trimming. The second
intentionally fails the reading-position assertion: adding 2,000 units trims 1,000 to retain
20,000, and the same marked passage moves from y=51.25 to y=-190.46875 CSS pixels, a drift of
**-241.71875 pixels**. The parent independently reproduced both outcomes, including after the
final harness filenames and metadata were established. The expectation is correct because the
marked passage remains in the cache; the product must preserve its reading position.

The headless Chromium harness renders the real integrated Thought component and cache at
900 × 700, with 12px text and 18.6px line height. It writes source SHA, viewport, font,
marker, character offsets, trim amount and coordinates to
`C:/tmp/qa-reasoning-retention-control.json` and
`C:/tmp/qa-reasoning-retention-boundary.json`. Copies from the parent run are retained under
`docs/evidence/reasoning-boundary-2026-11-15/`. The source SHA describes the application and
instruction merge; the new opt-in probe files were uncommitted during that run. These are
component-harness observations, not a new installed-app verdict or proof about the older
public renderer's implementation.

## Audience and folding boundary

The parent reran the opt-in audience probe: **one passed, zero failed**. The exercised
heritage/role transitions filter each new delta, and disabling/re-enabling reasoning clears
retained text and drops deltas received while off. This bounded scenario establishes no
privacy defect. Its `.probe.ts` filename keeps it outside default Vitest test discovery;
the dedicated config selects it explicitly. The child additionally reports 20 passing
existing cache, lifecycle and setting cases.

F-005 remains open. Folding must compose with the independent steps toggle, remembered steps
state, reading hold/release, steering and hold controls. Preserve the person's explicit fold
choice while streaming, apply the intended completion fold, and release a reading hold when
the thought is folded or removed. Do not restore the older renderer wholesale and lose the
newer reading-line and panel-size behavior.

The next repair packet should correct F-006's anchor across prefix eviction and compose F-005,
then run the boundary/control pair with folding, all three sizes and neighboring controls.
Full audience revocation/reconnection, concurrent runs, termination races, stale rendered
subscriptions, real providers, keyboard/narrow folding and installed verification remain
uncovered. Store maintainability also remains blocked. No feature-completion checkbox advances.

The installed application is unchanged in this batch. No build, installation or new installed
runtime verdict is claimed. Product repairs, if needed, retain the existing feature's ownership
and require their own regression and installed verification before closure.

## Published verification

Commit `d80f3ba92a6aed58cd3adbeee93650bb5facd985` was pushed to `origin/next`, and the remote
head was read back. A fresh detached worktree at that SHA passes `npm run typecheck`, the
audience probe (1/1), and `node scripts/test-audit-workflow.mjs` (7/7). Both browser commands
reproduce their earlier results from the published files: control passes at zero drift;
the boundary command exits 1 with the expected -241.71875-pixel defect assertion.

The primary checkout stays on its existing local `next` with the concurrent copy edits
untouched. Source reconciliation was performed in the isolated integration worktree, and the
published branch includes both sets of starting commits. Do not build the older primary
source as though it were the delivered integration candidate.
