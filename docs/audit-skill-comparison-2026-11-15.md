# S-454: bounded Skills comparison, 15 November 2026

Scope: the #454 follow-up within Apo's #311 Skills review. Upstream base is
`d175567b0a12d885544d74c45792717a883287f5`; #311 remains at `35e98635`. No existing bug-fix PR
for #454 was found. This repair is based on current main, not the integrated feature branch.

- [x] Read current issue, feature context and immediate queue; preserve concurrent source edits.
- [x] Confirm current main retains the original unbounded matrix; establish maintainability baseline.
- [ ] Reproduce the current-main failure and save failing resource/complete-content regressions.
- [ ] Implement a fixed detailed-comparison budget and readable, complete-content fallback.
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
