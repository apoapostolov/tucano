# Developing and maintaining TucanoNext

This checkout maintains `apoapostolov/tucano:next`, which supplies the installed **TucanoNext**.
It combines current upstream behavior, reviewed feature PRs, and the changes that let it run
beside the released **`Tucano`**. Preserve that combination throughout development and delivery.

**A build or install is never the final step. Run the resulting app and verify its behavior.**
A successful build, an installer exit code, or a process left from an earlier installation
does not establish that the new app launched or that the changed feature works.

## Repositories and branches

Check `git remote -v` before fetching, merging, or pushing. In this checkout:

| Reference | Meaning |
| --- | --- |
| `upstream` | Original project, `https://github.com/eduwxyz/tucano.git` |
| `upstream/main` | Original project's current main branch; base for upstream bug fixes |
| `origin` | Apo's fork, `https://github.com/apoapostolov/tucano.git` |
| `origin/main` | Fork's main branch; inspect whether it mirrors upstream or has additional commits |
| `origin/next` | Published integration branch for TucanoNext |
| Feature branches | Individual PR sources, including later revisions of already integrated PRs |

When a request says "origin main" to mean the original project, resolve the repository identity
before choosing a ref. Keep `next` current with `upstream/main` and account for additional work
on `origin/main`. Do not reset or force-push either main branch to align their histories.

## Protect the user's desktop

The user works on this desktop continuously. **Do not use computer-use automation by default.**
Do not take focus, raise windows, move the physical pointer, inject keys, replace the clipboard,
or interfere with the user's current app to get screenshots or run tests.

Use the **agent-desktop** skill and tools for background screenshots, inspection, and testing.
Read its installed skill and version-matched documentation, call `desktop_status`, and identify
the returned app and window before acting. Prefer background window capture, accessibility
snapshots, semantic `click_ref`, and `set_value`. Keep operations headless and verify their result.
For Electron web-content tests, use a task-scoped headless or isolated Playwright/CDP session
when appropriate; preserve the data, profile, and port isolation rules below.

The tool name alone does not guarantee background operation. In agent-desktop, `headed: true`,
`focus_window`, physical typing, key presses on Windows, and pointer gestures can interrupt the
user. Do not switch to them to recover from a headless failure. If agent-desktop is unavailable
or a control has no background action, record the limitation and try another non-interfering
test path. Do not silently fall back to `@oai/sky`, CUA, or other foreground computer-use tools.

Only when foreground computer use is necessary:

1. Finish the code, build, test fixtures, and all checks that do not need the desktop first.
2. Prepare a short test script before requesting access: exact target executable/window,
   actions and selectors, expected results, captures, time limit, cleanup, and stop conditions.
   Resolve exploratory questions beforehand. Use fresh observations to validate targets during
   execution, but do not spend the takeover period planning or investigating unrelated failures.
3. Ask the user explicitly for permission to take over the PC, explain why background testing
   cannot complete the check, and give the expected duration. Wait for the user's agreement.
   Authorization to develop, build, install, or test does not itself authorize a desktop takeover.
4. Execute the prepared sequence quickly within that window. If a state is unexpected, stop and
   return control rather than improvising a long investigation. If the user presses Escape,
   resumes using the desktop, or withdraws permission, stop input immediately.
5. Release control promptly and report the result. An interrupted or omitted check stays
   incomplete; do not claim that it passed.

The requirement to launch the installed app does not override this rule. Launch without taking
foreground focus where supported. If the required launch or verification would interrupt the
user and cannot be done in the background, request the bounded takeover only after preparation.

## Application isolation and hard rules

The released app and `TucanoNext` remain independent:

| Surface | Released `Tucano` | `TucanoNext` |
| --- | --- | --- |
| Windows install | `%LOCALAPPDATA%\Programs\tucano` | `%LOCALAPPDATA%\Programs\tucanonext` |
| Application data | `%APPDATA%\Tucano` | `%APPDATA%\TucanoNext` |
| Executable | `Tucano.exe` | `TucanoNext.exe` |
| Default webhook / Git ports | `47717` / `47718` | `47727` / `47728` |

1. **Never rename the product during integration.** Preserve `NAME = 'TucanoNext'` in
   `src/main/index.ts`, package name `tucanonext`, product name `TucanoNext`, app ID
   `dev.tucano.next`, and NSIS shortcut name `TucanoNext`. These separately control the data
   directory, instance lock, install folder, executable, shortcuts, and uninstaller.
2. **Never write to the released app's install or data directories.** Check installer identity
   before running it. Installing into `Programs\tucano` can replace the released app and give
   the wrong uninstaller ownership of that directory.
3. **Never edit the live database.** `%APPDATA%\TucanoNext\tucano.db` uses WAL and the running app
   holds a lockfile. Inspect it only through a read-only connection. Use a throwaway `TUCANO_DATA`
   directory for seeded conversations, migrations, test writes, and fake-engine captures.
   Set this variable only on the test process; never redirect the regular app to scratch data.
4. **Keep test ports and profiles separate.** Inspect workspace allocation before running
   instances together. If a scratch instance uses TucanoNext's default ports, close the regular
   TucanoNext first. Leave the released app alone.
5. **Keep one definition per surface.** Extend existing RPC methods, settings keys, types,
   database columns, and SQL statements. Duplicate declarations and parallel implementations
   of the same feature are integration defects.
6. **Do not bump versions, move tags, publish releases, or enable self-update.** Releases belong
   to the maintainer. Package with `--publish never`; do not run `scripts/release.sh` during
   integration. An authorized source-branch push is separate from release publication.
7. **Do not commit generated products.** `out/`, `dist/`, `node_modules/`, and `build/whisper/`
   stay ignored. If they appear in status, inspect the destination paths.

## Start each task

1. Read this file, [the fork workflow](docs/fork-audit.md), and the current
   [audit plan](docs/audit-plan.md). Consult `C:/git/_notes/tucanonext-pr-triage.md` for historical
   decisions, then confirm them against current PR heads and discussions.
2. Inspect branch, worktrees, status, and recent commits. Preserve user edits and concurrent
   tasks. Do not stash, reset, clean, or commit unrelated files to get a clean checkout.
   Create an isolated `codex/` worktree branch when needed.
3. Fetch current refs explicitly and compare local and remote work:

   ~~~powershell
   git fetch origin refs/heads/next:refs/remotes/origin/next refs/heads/main:refs/remotes/origin/main
   git fetch upstream refs/heads/main:refs/remotes/upstream/main
   git log --oneline --left-right next...origin/next
   git log --oneline next..upstream/main
   git log --oneline next..origin/main
   ~~~

   Fast-forward a clean local `next` if behind. Inspect and preserve unpublished commits.
   Reconcile divergence through a reviewed merge; never overwrite one side.
4. Record the starting `next`, upstream main, and relevant PR head SHAs. For PR intake or
   upstream reconciliation, refresh the inventory:

   ~~~powershell
   node scripts/audit-prs.mjs --fetch --patches --report docs/pr-inventory.md
   ~~~

   Reports and cached patches live in `.tucano-local/audit/`. Key review records to the exact
   head SHA; a changed head makes the earlier review stale. Avoid fixed PR-count claims.
5. Maintain a checkbox plan for long audits. A merged PR, a repaired defect, and a fully audited
   feature are different states. Record completed work and remaining checks separately.

## Keep next current with upstream and the fork's main

Reconcile upstream before continuing older feature work. New upstream commits may accept a PR,
replace it, change its contract, or make part of it unnecessary.

1. Read new upstream commits, relevant diffs, and linked discussions. Map accepted, rejected,
   superseded, and revised PRs to their integrated behavior. Inspect fork-only `origin/main`
   commits too; do not assume the two main refs are interchangeable.
2. Start an integration worktree from current reconciled `next`. Merge fetched `upstream/main`
   there without committing until conflicts are inspected. Integrate reviewed `origin/main`
   changes that upstream or `next` does not already contain.
3. When main contains a previously integrated PR, migrate to the maintained upstream
   implementation where it serves the behavior better. Preserve useful functionality and
   compatibility rather than retaining Apo's code merely because it came first. Keep unrelated
   features and TucanoNext's identity and isolation.
4. Inspect overlaps even after a clean merge. Squash merges and rewritten commits may implement
   the same feature without sharing ancestry. Remove redundant helpers, settings, events, UI
   controls, and obsolete tests only after identifying their replacements. Retain regression
   coverage for the behavior that must survive.
5. Validate the combined tree and app as described below. If a conflict requires a product
   decision, keep published `next` unchanged and describe the concrete alternatives.
6. Refresh inventory and dispositions. Check `git merge-base --is-ancestor upstream/main HEAD`
   on the candidate and account for remaining `HEAD..origin/main` commits. Record anything
   deferred; do not claim parity with a main revision that was not integrated.

A daily sync may also advance `next`. Before final integration or push, fetch again and compare
the candidate against current local and remote heads. Merge intervening work and repeat affected
checks. Never force-push `next` to bypass a rejected push or assume a scheduled sync succeeded.

## Ingest new PRs and revisions

1. Read the description, replies, review threads, current diff, dependencies, and checks.
   Suggestions in a reply can change the intended behavior before code reaches the PR head.
2. Fetch the exact current head, including from the contributor's fork when necessary. Record
   PR number and head SHA. Do not rely on a stale local branch or a merge commit subject.
3. Compare with the previously integrated revision and current upstream main. Keep repairs to
   unmerged features on their existing PRs. Reproduce a new upstream bug in an isolated worktree
   based on current `upstream/main`, then open a focused fix against the original project.
4. Review the full path: user action, renderer state, RPC contract, permissions, persistence,
   engine execution, cancellation, failures, and visible result. Check settings scope, restarts,
   concurrent work, keyboard access, narrow layouts, and large histories where applicable.
5. Merge dependencies before dependents. Historical stacks include `#261 -> #332 -> #338`,
   `#355 -> #258 -> #259`, and `#327 -> #329`. `#352` was superseded by `#353`.
   Confirm their current disposition before relying on those relationships.
6. Merge the feature head into the integration candidate. For an already integrated PR, merge
   its newer head so the added commits and contributor attribution enter the history. Port
   behavior manually only when the histories or implementations require it, and record why.
7. Verify the feature in `next`: its setting or entry point is reachable and its handler,
   backend, persistence, and output remain connected. Commit ancestry, a clean merge, type checking,
   and screenshots from another branch do not prove that the feature survived integration.
8. Test neighboring features together. Steps presentation, for example, must coexist with
   remembered folding, the folding rail, steering, follow-up replies, and silent routines.
9. Align the PR description, validation, and fresh screenshots with its final implementation.
   Use a screenshot branch and immutable commit URLs for public captures. Send thanks, comments,
   or other messages only when the user authorized that communication.

## Resolve conflicts by behavior

Take the union of compatible features instead of selecting entire files from one side:

| Surface | Resolution |
| --- | --- |
| Settings and permission lists | One list retaining all applicable keys and their intended scopes |
| Schema and persistence | One definition, migration, SQL statement, and row mapping per field |
| RPC and shared types | One declaration preserving compatible parameters, events, and validation |
| Shared React components | Compose behaviors in their intended render and interaction order |
| Competing implementations | Choose the maintained behavior, migrate callers and data, remove redundancy |
| Product metadata and startup | Preserve TucanoNext identity, data separation, locks, ports, and updates off |

Read the resolved code after removing markers. Add regression cases for interactions introduced
by resolution. Check for losses outside conflict hunks, including a settings control moved to
another card or a callback disconnected during a component rewrite.

## Validate the source being delivered

Run these in the candidate worktree after installing its locked dependencies:

~~~powershell
npm ci
npx tsc --noEmit -p tsconfig.json
npx vitest run
npm run build
~~~

Run focused regressions during development, then the full suite on the final combined tree.
Require no TypeScript errors and zero failed tests; report skipped tests separately. Diagnose
failures instead of disabling assertions or increasing timeouts to get a green result.
If the host lacks a required shell, correct the test process's PATH and record that setup.
A focused rerun does not replace the full-suite result.

**Run the app built from this source.** Exercise the changed behavior with throwaway data and
fake engines where suitable, using the background testing policy above. Never put destructive
or synthetic test data into the live workspace. DOM tests cover behavior; inspect the built UI
for layout, focus, and overflow because `linkedom` cannot verify those visual properties.

Repeat affected checks after source changes. Record the checked commit or tree and outcomes
so evidence from another worktree is not attributed to this build. Documentation-only changes
need a content and diff review; they do not require rebuilding or installing the app.

## Build, install, launch, and verify

For an authorized TucanoNext code delivery, finish the entire sequence. Compilation, packaging,
and installation alone are incomplete.

1. Confirm identity and install destination. Complete type checking, the full suite, the build,
   and the changed-feature check against that built app.
2. Prepare whisper assets and create a fresh installer without publishing:

   ~~~powershell
   node scripts/whisper.mjs win x64
   npx electron-builder --win nsis --x64 --publish never
   ~~~

   Output is `dist/tucanonext-setup-<package version>.exe`. Keep the current package version.
   Check the installer timestamp against source changes; an older installer cannot deliver the
   fix. Cached whisper assets are valid only when their version matches the script.
3. Close scratch instances, then the regular TucanoNext, before installation. Do not kill the
   released `Tucano.exe`. Use PowerShell to avoid Bash argument conversion:

   ~~~powershell
   taskkill /F /IM TucanoNext.exe
   $nextVersion = (Get-Content -LiteralPath package.json -Raw | ConvertFrom-Json).version
   $nextInstaller = Join-Path (Get-Location) "dist/tucanonext-setup-$nextVersion.exe"
   $nextInstall = Start-Process -FilePath $nextInstaller -ArgumentList '/S' -WindowStyle Hidden -Wait -PassThru
   if ($nextInstall.ExitCode -ne 0) { throw "TucanoNext installation failed: $($nextInstall.ExitCode)" }
   ~~~

   A missing process before installation is harmless. Resolve other shutdown or installer errors.
4. **Always launch and observe the installed app after installation.** Silent installation may
   finish with no app running. Use an environment without scratch-only `TUCANO_DATA`,
   `TUCANO_SEED`, or `TUCANO_FAKE_ENGINES` overrides and launch the installed executable:

   ~~~powershell
   Start-Process -FilePath "$env:LOCALAPPDATA\Programs\tucanonext\TucanoNext.exe" -WindowStyle Hidden
   ~~~

   Verify its process path and actual window in the background. Do not substitute a source
   Electron app, an unpacked build, a splash screen, or a pre-install instance. A hidden launch
   request is not proof that the app will never take focus; honor the takeover policy if needed.
5. Complete the installed-app smoke check:
   - Title bar reads `TucanoNext`; process path is under `Programs\tucanonext`.
   - Existing workspace still lists its agents, channels, and settings.
   - Clicking a sidebar DM opens it; clicking an agent opens its DM.
   - Settings exposes the expected controls, and Updates reads `off`.
   - The changed feature works in the installed build. Use a scratch instance for synthetic
     runs or writes; close another instance if its ports would conflict.
   - No startup error, failed migration, broken navigation, or unexpected data reset occurs.
6. Leave the regular installed app running on its normal workspace unless the user asks
   otherwise. Close scratch instances; never leave fake engines as the daily app. If a launch
   fails, the user stops automation, or a check cannot run without unapproved takeover, report
   the incomplete step. Do not describe delivery as fully verified.

### Rebuilding and reinstalling itself: the helper, not a hand-made recipe

An agent asked to rebuild and reinstall this app runs `node scripts/self-build.mjs install` and
nothing else. It typechecks, builds, packages, checks the package, closes the app, installs,
launches, and requires a window; a failure exits with the stage's own code and `--json` gives one
line a caller can parse.

- **Never pack while `node_modules` is being rewritten.** `npm ci` in one shell and
  `electron-builder` in another ships a package holding the direct dependencies and none of their
  dependencies. The app then dies while loading (`Cannot find module 'fs-extra'`) with no window,
  and the processes left behind hold the single-instance lock, so every later launch, including the
  taskbar shortcut, does nothing at all. Run `npm ci` alone and wait for it to finish.
- **`node scripts/self-build.mjs doctor` after any launch that shows no window.** It names a
  package that cannot load and instances that run without a window; `doctor --fix` closes those
  instances so the next launch can start.
- **The installed `app.asar` is compared to the built one by hash.** An installer that copied
  nothing, or an older build, is a failure, not a success.
- Do not copy `dist/win-unpacked` over the installed folder and do not edit the installed package
  in place: both leave a build no installer knows about, and the next install silently reverts it.

## Integrate and report completion

Commit only task-related source and evidence. Bring the tested candidate into local `next` by
ordinary merge or fast-forward, preserving intervening work. When authorized to update the fork,
push to `origin/next` and verify the remote head. Preserve unrelated user files.

Report the integrated commit, upstream/PR heads included, checks and counts, installer used,
installed-app launch and smoke result, and remaining limitations. Update audit and inventory
records where relevant. A successful push establishes source delivery, not installation or
runtime health.

## Code locations and conventions

| Path | Responsibility |
| --- | --- |
| `src/core/` | RPC handlers, run lifecycle, database schema, permissions, per-turn context |
| `src/shared/` | RPC contracts and shapes, shared types, settings rules, helpers |
| `src/main/` | Electron identity, startup, workspaces, data paths, ports, updates |
| `src/renderer/src/` | UI components, state, RPC calls, sidebar gestures |
| `test/` | Behavior tests; renderer tests use `linkedom` |

- Use plain imperative commit subjects about behavior, without conventional-commit prefixes.
- Ship a regression with a behavior change. Drive renderer interactions through real DOM events;
  `test/steer-pill.test.tsx` is a pattern.
- `linkedom` has no `MouseEvent` or layout. Dispatch `new window.Event(...)`, define React's
  required fields with `Object.defineProperty`, and stub `document.elementFromPoint` for geometry.
- Capture pointers only after a gesture starts and release capture in its ending handler.
  Capture on `pointerdown` can send the next click to the capturing element and disable a child button.
- Comments explain why a choice was made rather than restating code.

## Public PRs and writing

Open focused product PRs against `eduwxyz/tucano:main`, never against the fork. Reproduce new
upstream defects on current upstream main and document stack dependencies and validation.
`next` is private integration and QA context. Keep its importance and personal workflow out
of upstream issues, PR descriptions, and review comments. Use upstream-main or feature-branch
evidence in public reports. Do not copy this fork-local guide into upstream feature PRs.

Read `C:/git/self-profile/profile/operational.md` before substantial prose. Apply its supported
writing habits while preserving facts, attribution, uncertainty, obligations, and exact syntax.
The profile's examples and learning records remain private.
