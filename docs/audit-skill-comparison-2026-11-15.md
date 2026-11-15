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

## Rendered review checkpoint

The initial browser fixture opened a second browser core connection through a bridge with a shared
client identifier. That redirected history replies away from the app's original port. The driver
now uses its own EventSource/client for fixture calls in browsers; Electron keeps an independent
IPC port. Proposal approval and history restoration then pass. This was a harness defect, not an
application-history failure.

Screenshot review found the existing long-recipe warning occupies three lines at 420px. Before:
“Long recipe: 12,021 characters, 2,021 over the 10,000-character recommendation. Consider shortening
it; the full recipe will be kept.” Reviewed English replacement, before implementation:
“Long recipe: 12,021 characters (2,021 above the recommended 10,000). Full text is kept.”
Actual/excess/recommended counts and the full-content assurance remain; Portuguese stays unchanged.
The new fallback hint and labels already fit. Fresh captures will measure the neighboring warning too.

The first public full suite reports one failure in the unchanged delegation timing case (1,770
passed, 60 skipped). No timeout or assertion is changed. A run mistakenly launched from the repair
worktree despite a base-named output is retained as repair-focused evidence only; a separate
clean-main worktree is now running the actual baseline case. Do not attribute that first output to main.

## Final public validation and new intake

Public repair head `2d15a2777e3447575dafdebc121a372b3f1666ef` passes the full suite:
1,771 passed, 60 skipped, zero failures. The unchanged delegation case passes all 26 cases
on clean main and on the repair branch; the earlier full-run failure remains recorded above.
Its cause is unresolved; no test, assertion or timeout was weakened.

Fresh built-browser evidence in `C:/tmp/tucano-skill-diff-public-final-ui` passes proposal
approval, full-content history comparison/restoration, keyboard focus/scrolling, and cancelling
a one-million-character edit without changing saved content. Screenshots and JSON measure actual
text at 1280, 900 and 420 CSS pixels. The longest count warning fits two lines at 420px; labels
fit one line and the fallback hint fits two. Rendered screenshots were inspected, including the
reachable approval actions and maximum-body warning. Native installed scaling remains pending.

The 07:01–07:02 UTC intake captured new Apo #467 and revised heads #412 (`7907872c`),
#402 (`fcd564ab`) and #305 (`75435831`). These remain queued for exact-head review; metadata
intake does not approve integration. Apo totals are 91 (63 open, 18 merged, 10 closed), other
contributors 236 (29 open). Upstream remains `d175567b` / 0.2.32. The concurrent reading-position
repair through `6f7229ff` was preserved in integration. No public aging branch was rebased.
