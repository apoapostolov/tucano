# R-245: reasoning and reading-position audit

Scope: Apo #245, head `5f4a1a2170adaf88745a509adcebe498937cb90d`, base
`68cf5da1cb5a1f589926ac819c46d9ffd7645988`; all 12 feature commits and 20 changed files.
Integration started at `7dce2af8`. Upstream advanced to `3e8162eb`; the release remains 0.2.32.
Other-contributor checks in this packet are limited to upstream ingestion compatibility.

- [x] Identify exact feature head/base, read its discussion and enumerate the complete commit range.
- [x] Read the engine, event, audience, setting and renderer-cache changes across that range.
- [x] Inspect incoming main commits and resolve overlapping integrated behavior without dropping features.
- [ ] Validate and deliver the upstream reconciliation, including its built and installed UI.
- [ ] Exercise reasoning lifecycle, audience changes, setting transitions and retention under sustained use.
- [ ] Check folding, reading position, tail trimming, thread widths and neighboring reply controls.
- [ ] Repair confirmed defects on the existing feature branch and verify the published head.
- [ ] Record exact-head findings, residual gaps and the next checkpoint; check the full-audit box only if all criteria pass.

## Upstream reconciliation

Incoming range `d175567b..3e8162eb` has 14 commits, seven first-parent integration events.
It accepts Apo #412 continuation and #445/#448/#453 test work. It also includes #429 notice
alignment, #388 artifact reveal (plus the maintainer's traversal hardening) and #400 agent-card
scroll handling. These incoming changes are inspected for compatibility, not independently certified.

Conflict decisions:

- Keep one existing continuation predicate and handler. The shared run-progress helper is identical
  to main. Retain fork follow-up, recovery, retry-note and pause behavior; do not add a second button
  or replace the richer Try again control with the older simple button.
- Keep the integrated delegation fixture's deterministic release barrier and richer response checks.
  Incoming main's eight-second delay addresses the same race; a fixed delay would regress this
  fixture. Preserve main's extra test budget and the remaining test changes.
- Keep system-notice padding aligned with this tree's 28px message padding and 34px gutter/12px gap.
  Retain the common 860px centered column; main's 24px/70px padding belongs to its different spacing.
- Add artifact reveal once to the existing RPC, shape, policy, renderer and handler. Keep image menus,
  galleries and existing sendMessage mode/steerTo parameters. Reveal remains owner/local-only with
  conversation and artifact visibility plus traversal checks; tests do not invoke the real file manager.
- Keep existing startup/continuation regression cases in addition to the incoming tests. Replace the
  duplicated continuation changelog paragraph with maintained main's entry; preserve every other entry.

Typecheck and 62 focused compatibility cases across eight files pass on the resolved tree.
Full suite and installed delivery are pending. No main revision is claimed delivered yet.

## Feature contract and first questions

Pi thinking_delta is streamed separately from reply text and is not persisted. Audience filtering
uses the same conversation/message visibility path as answer deltas. showThinking is personal,
off by default; the renderer drops incoming events while off. The public block supports manual
folding, an automatic completed fold and follow-at-end. Existing integration has newer reading-line
anchoring and size controls; evidence from that implementation does not certify the public head.

The public cache caps each string at 20,000 characters but has no observed per-window entry bound
or clearing operation. Neither turning the setting off nor conversation_removed visibly clears it.
These are hypotheses awaiting executable reproduction. Tail trimming may also invalidate a reading
position even when scrollTop stays fixed; that needs a real rendered check rather than an offset test.

Maintainability baselines are fixed in C:/tmp/tucano-reasoning-audit-baseline.json (integration)
and C:/tmp/tucano-245-public-baseline.json (public head). Existing edited monoliths already have
known MI debt; any blocked gate will be reported rather than represented as a pass.
