# S-454: bounded Skills comparison, 15 November 2026

Scope: the #454 follow-up within Apo's #311 Skills review. Upstream base is
`d175567b0a12d885544d74c45792717a883287f5`; #311 remains at `35e98635`. No existing bug-fix PR
for #454 was found. This repair is based on current main, not the integrated feature branch.

- [x] Read current issue, feature context and immediate queue; preserve concurrent source edits.
- [x] Confirm current main retains the original unbounded matrix; establish maintainability baseline.
- [x] Reproduce the current-main failure and save resource/complete-content regressions.
- [x] Implement a fixed detailed-comparison budget and readable, complete-content fallback.
- [x] Verify both history and proposal entry points, copy/layout, resource bounds and tests.
- [x] Open the focused upstream PR with immutable public captures and actual-head evidence.
- [x] Integrate, test, install and verify the combined application; finish source/release records as required.
- [x] Remove this completed repair from the immediate queue without marking the entire #311 audit complete.

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

## Upstream publication and integration checkpoint

Focused upstream PR: https://github.com/eduwxyz/tucano/pull/468, source `2d15a277`.
Immutable public evidence: `cfa1b73a54ab6eee74e2c25d6bcdfa796f3485e8`,
`frames/bounded-skill-diff` on the fork. A fresh worktree from the verified published SHA passes
typecheck and 19 focused cases. GitHub CI is running; no checks are represented as complete yet.

Integration merge `c2829873` preserves the existing #311 library/components, discovery behavior
and approved interface copy. The public extraction is a pure move of that older screen; importing
those old bodies would regress newer features. Only the bounded comparison, shared helper,
length warning, tests and changelog behavior are retained from the public repair. The actual
public head is merged into ancestry. Focused comparison, reading-anchor and reasoning-setting
regressions pass: 32 tests across five files. Build succeeds. Hidden Electron QA passes the actual
proposal/history workflows, Skills origins, pause and settings navigation at native 150% scaling;
no show/focus event or visible/focusable QA window occurred. Source was `c2829873`; its dirty flag
comes from inventory documentation refresh, not application edits. Installed verification is pending.

The fixed integration maintainability baseline includes the other chat's scrolling changes.
Its global comparator therefore fails on that chat's edited red `Conversation.tsx`; this is a
reported integration debt, not a green project gate. All files authored for this repair pass:
comparison MI 44.63, helper 36.90, shared copy 50.50, tests 39.90/41.81, QA driver 20.05,
QA helper 17.06. The helper's yellow score warrants care; it centralizes the proposal/history and
maximum-body checks rather than duplicating browser and installed flows. No structural-cycle
removal or whole-project maintainability clearance is claimed.

## Installed delivery and closure

S-454's eight packet checks are complete. This is a targeted defect repair; #311's complete
exact-head audit stays unchecked, as do the other 91 captured Apo PRs. The immediate queue now
starts with the full #245 reasoning/reading-position review. Intake rose to 92 Apo PRs (64 open,
18 merged, 10 closed), including new fix #468; other-author reviews remain approval-gated.

The combined application suite completed with **2,634 passed, 61 skipped, zero failed** on the
application tree at `c2829873`. Typecheck and build pass. Later commits through `db5aef86` change
only audit documentation. All six upstream #468 CI jobs pass (macOS, Linux and four Windows shards).

`node scripts/self-build.mjs install --json` completed packaging, identity verification, installation
and a fresh background launch. Source at start was `b7a90baa`; later inventory/docs commits did not
change packaged application code. Installed `app.asar` is **37,410,317 bytes**, SHA-256
`1690f9fedb533fb123a2a298a9bcef579d074511906a3246194a6a7493b8c8c5`, identical to the built archive.
Native-path extraction confirms package `tucanonext`, version 0.2.32 and a main bundle identical
to the build (`befdc943d05f23783dd8dbb52726e4bfd4189e8fb9349c2e569a73c2e52f7438`).
The regular app is the newly launched installed executable, PID 32040, argument `--background`;
agent-desktop identifies its visible, unfocused window `w-6492594`. No foreground input was used.

Installed scratch QA at `db5aef86` reports a clean tree, the actual installed executable,
Electron 44.11.1, isolated fake-engine data/ports and zero renderer errors. Proposal approval,
complete history/restoration, keyboard scrolling, maximum-body cancel, Skills origins, pause,
settings navigation, update-off and notification background guards pass. Both 900 and 1280 CSS
pixel captures measure at device scale 1.5; inspected installed screenshots keep labels and hints
within their budgets. Browser evidence additionally covers 420px. No native 420px support is claimed.
Reports/captures: `C:/tmp/tucano-skill-installed-ui`, install report
`C:/tmp/tucano-skill-diff-install.json`; built checks at `C:/tmp/tucano-skill-integration-ui`.
Scratch QA closed its own process; the regular app remains running against its regular data.
No test writes were made to that workspace or the released Tucano installation.

This single bug fix inherits 0.2.32 and does not require refreshing the fork release. The existing
release asset/tag stays untouched. The initial unchanged delegation-case failure and global
integration MI failure remain recorded, rather than being represented as universally green checks.
