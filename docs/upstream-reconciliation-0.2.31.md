# TucanoNext 0.2.31 reconciliation

Started 15 November 2026. Original release and main: `5da3d7e10472208e72c67386395a27b0d7759a7d`.
Starting published integration: `a6ca5b4d359610148ea279643b9f8895bae738dd`.
Starting local committed integration: `f6e0d04f`; uncommitted copy work in the primary checkout is preserved.

- [x] Fetch upstream release and both fork refs; inspect intervening changes.
- [x] Reconcile published audit records with local committed copy-review work in an isolated worktree.
- [x] Merge all upstream changes through 0.2.31 and inspect semantic overlaps.
- [x] Refresh PR intake and record changed heads without routinely updating their source branches.
- [ ] Pass settings checks, typecheck, full suite and built-feature verification.
- [ ] Package, install, launch and verify the installed build with isolated background QA.
- [ ] Publish and verify the fork's `next-v0.2.31` release.
- [x] Deliver a living daily intake and aging-PR audit plan, preserving explicit incomplete work.

## Reconciliation decisions

The 0.2.30/0.2.31 changes introduce sector names and purposes, direct handoff to sector heads,
browser message attachments and spacing between sector zones. Preserve the shared Team/Conversation
attachment implementation and port upstream's `withMessage` policy into it; do not restore a duplicate
composer implementation. Preserve parked delegation results, returned question context, retention,
steering, follow-up and restart controls. Product identity, ports, data and updates-off remain separate.

The final fetch found upstream `c06ab5479abb28acb0d3868abea7b0ad30eaa938` (#465), after the release.
It adds an explicit entry-point agent above sectors. This is included too. The shared Team composer
now chooses the entry point before a root fallback, retaining its attachments and failure recovery.
The control belongs to the agent's Team-board editor, not global Settings: `Agent.entry`, admin-only,
false by default, valid only for a non-Tuca agent without a boss, persisted in `agents.entry`, live
without restart. Sector heads remain the boundaries for cross-sector delegation. Existing callers
that omit the field preserve it. Name/purpose fields also remain object-scoped with their upstream
length limits and persistence.

The first combined release tree passes 2,616 tests, 61 skipped, zero failed. After the additional
entry-point commit, 82 focused org/delegation cases pass; a fresh final full-suite run is pending.
Settings placement has 33 sections, 54 owned keys, 57 checked writes and 14 passing tests. The new
browser-mode Team regression verifies ordinary files stay attached while oversized files upload.

## Living audit workflow

The inventory at 00:08 UTC on 15 November has 90 authored PRs, 62 open, 18 merged and 10 closed.
No count establishes quality. The generated open queue starts at 0/62 complete exact-head feature
audits, alongside the historical 6/43 targeted repairs and 0/43 complete cohort audits. A fixture
check proves completed boxes survive an unchanged head and reopen when that head changes.
Daily intake is scheduled at 09:00 Europe/Kyiv in the current chat. Public aging PR branches are
not routinely rebased or refreshed. Concrete findings still receive focused repairs on their own PR.

The primary checkout's uncommitted copy-review files are preserved and excluded from this installer.
Committed copy-review work through `f6e0d04f` is included. The newer uncommitted text remains its own
review and delivery task; this upgrade's evidence must not be attributed to it.
