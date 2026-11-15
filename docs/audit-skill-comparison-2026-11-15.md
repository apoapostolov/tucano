# S-454: bounded Skills comparison, 15 November 2026

Scope: the #454 follow-up within Apo's #311 Skills review. Upstream base is
`d175567b0a12d885544d74c45792717a883287f5`; #311 remains at `35e98635`. No existing bug-fix PR
for #454 was found. This repair is based on current main, not the integrated feature branch.

- [x] Read current issue, feature context and immediate queue; preserve concurrent source edits.
- [x] Confirm current main retains the original unbounded matrix; establish maintainability baseline.
- [x] Reproduce the current-main failure and save resource/complete-content regressions.
- [x] Implement a fixed detailed-comparison budget and readable, complete-content fallback.
- [ ] Verify both history and proposal entry points, copy/layout, resource bounds and tests.
- [ ] Open the focused upstream PR with immutable public captures and actual-head evidence.
- [ ] Integrate, test, install and verify the combined application; finish source/release records as required.
- [ ] Remove this completed repair from the immediate queue without marking the entire #311 audit complete.

## Baseline and proposed behavior

The current main Skills.tsx is identical to the previously reproduced main revision. Its renderer
allocates `(n+1)*(m+1)` ordinary numeric cells before drawing the comparison. Entanglement 1.0.1
baseline: Skills.tsx has 532 NLOC and file MI 0. A repair cannot leave that edited file red under
the applied maintainability gate. Split the existing screen at its established component boundaries
without adding #311's unrelated discovery changes; use the same paths to compose integration later.

Proposed exact fallback copy, reviewed before implementation:
- Hint: “Large change: both versions are shown in full.”
- Labels: “Before” and “After”.

The fallback keeps both complete strings selectable in bounded scrolling blocks. Detailed output
keeps the existing add/remove/context presentation for inputs within a fixed matrix/DOM budget.
No instructions are silently truncated. The budget is an implementation bound, not a new setting.
Public evidence uses the current-main branch and synthetic data; the installed check uses isolated
background QA. Constrained Node heap failure is not an assertion about Electron's heap size.

## Repair checkpoint

Public current-main repair commit: `f02e729a`. Typecheck and 19 focused cases pass. All 11
non-Diff function bodies are unchanged by extraction. Detailed comparisons are limited to 262,144
matrix cells (at most 1 MiB of typed-array cells) and 2,000 combined input lines; line interning
keeps the inner loop on integer IDs. Larger input is checked before splitting/allocating and renders
two full text nodes, not a node per line. The result is memoized for unchanged versions.

Current-main reproduction: 500-line control about 33 ms / 7.5 MB heap; 6,000-line case exits 134
under the deliberate 128 MiB Node cap. The existing immutable script's banner says 04539404;
the target file was read from d175567b and is byte-identical to that earlier source. This does not
claim an Electron crash. Captured logs and current-base metadata are in the task's temporary evidence.

Entanglement baseline-to-repair gate passes: +139 NLOC, +35 summed CC, +13 CogC, including the
new helper, tests and module boundaries. Parent Skills file MI is 17.43; extracted components are
above 20 and helper MI is 36.90. Structural matching after extraction has uncertain/removed evidence,
so no claim of eliminated cycles or whole-project maintainability clearance is made. Comparator
uses UTF-8 Python 3.14 through uv; the default Windows Python/shim did not produce valid comparison
output and is not counted as a passing run.

The public full suite is running. Real proposal/history QA, screenshots and installed verification
are still pending; this checkpoint is not a complete feature audit or completed delivery.
