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

## Entry-point copy review

Rendered QA found the imported English entry-point hint occupies three lines, exceeding the two-line
secondary-copy rule. Before: “You talk to it, and it passes each part to the right sector. The teams
below it are the sectors.” Reviewed replacement: “Routes your requests to sector heads. Each team
below it is a sector.” This retains the delegation target and the meaning of the child teams without
repeating the conversation setup. Portuguese is unchanged. The in-progress final suite was stopped
before applying this edit so the final report can describe one stable source tree.

## Built UI evidence

`C:/tmp/tucano-0231-final-built/report.json` passes at application source `04580456`: seven smoke
checks, 18 Settings page/viewport measurements, pause/resume with no premature question, two sector
zones that do not overlap, entry-point routing and a persisted off/on toggle, and Team attachments.
The new entry-point label and revised hint pass at 900 and 1280 CSS pixels at native 150% display
scaling; sector-panel labels and hints pass too. Fresh captures wait for the panel's finite opening
animation to complete, rather than saving an intermediate translucent frame. No window is shown,
focused or made focusable. Scratch data, fake engines and separately reserved ports are enforced.

`C:/tmp/tucano-0231-browser-files-2/report.json` proves an ordinary browser file attaches, sends and
survives renderer reload, while a 21 MiB file uploads and inserts its server path. This uses a
headless browser, loopback server and scratch home/data. The first attempt was blocked by a name
prompt after renderer reload; dismissing that prompt fixed the harness without bypassing file checks.

The first sector fixture attempted to reopen seeded data; the QA startup guard correctly refused
it. Fixtures now go through a separate normal authorized renderer RPC port after startup. The
entry checkbox requires waiting for the asynchronous core update; clicks are followed by observed
badge transitions instead of assuming the state changes synchronously inside Playwright's check().
