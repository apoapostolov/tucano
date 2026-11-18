# Settings overhaul delivery

Completed 14 November 2026. The installed application and release assets were built from `6d6b0a961a0acaca62d9ee553094199593c42d52`. Later commits add development-only native-scale measurement helpers and this delivery record; the packaged runtime is unchanged.

## Result

Settings has six maintained pages: App, Workspace, Agents, Models, Knowledge and Connections. Section links remain visible while scrolling, follow the reading position, support keyboard input and reduced motion, and use an interruptible ease-in-out transition for pointer navigation. Related controls share understated rounded containers without heavy shadows. The danger zone retains its red border. Memory and Wiki configuration share Knowledge, using the same Wiki controls as the contextual dialog.

The typed registry declares 33 sections and 54 setting keys. The source check follows 57 literal settings writes through shared components. Dynamic patches, RPC-only actions and authorization still require review. AGENTS.md and the architecture guide require placement decisions before implementation and keep new settings out of arbitrary cards. These files and their tools are tracked on `next` and present in `C:/git-ext/tucano`.

## Upstream and feature PRs

[PR #446](https://github.com/eduwxyz/tucano/pull/446) is ready for review at `ea0f090c2be51671ab71f71293100ce3ff6cb345`. It uses current upstream capabilities, keeps original product/update identity, and builds on the copy work in #410. Its registry has 28 sections. Its final published head was checked in a fresh worktree. [Current proposal screenshots](https://github.com/apoapostolov/tucano/tree/ef0a1b60bfaad5816fd469059f7348152f7d3417/settings-organization/upstream-ready) replace the interim flat presentation.

Eighteen feature PR revisions were updated in place: #261, #274, #284, #288, #298, #311, #332, #333, #338, #379, #383, #385, #391, #395, #411, #417, #432 and #437. They retain the nearest compatible location in the existing upstream tabs rather than require the unaccepted redesign. PRs already in suitable locations and object-specific editors retain those locations. The architecture proposal records all 89 authored PRs in the reviewed snapshot, including merged and closed dispositions.

Each revised published head received typecheck, focused tests, a fresh-worktree rebuild and rendered checks at 900/1280 pixels. Later rebases retain the placement according to the recorded source checks; earlier screenshots are not attributed to newer heads. #417, #432 and #437 were rebuilt and recaptured after their later revisions. [Per-head validation and measurements](https://github.com/apoapostolov/tucano/tree/e3516b18d1b57f6c21a64059758626a78ad7655d/settings-organization/features) records these distinctions. This is a placement review, not a complete feature-quality signoff.

## Verification

- TucanoNext full suite: **2,577 passed, 61 skipped, zero failed**. Typecheck, build, 14 navigation/structure cases and affected upstream cases passed.
- Upstream proposal full suite: **1,757 passed, 60 skipped, zero failed**. Typecheck, build and settings checks passed.
- Browser checks cover 1280, 900 and 760 CSS pixels, English hints, Portuguese navigation, section geometry/focus, reduced motion, Wiki import/schema entry points and dependent routing/resolver states.
- Native Electron checks cover all six pages at their initial size and 900/1280 CSS pixels, preserving the desktop's **150% scale** through native sizing of the hidden QA window. They also check conversation labels and preference persistence. The installed executable passes seven hidden runtime checks with no renderer errors or visible/focusable QA windows.
- Role/capability and legacy-route behavior is covered by the settings tests and existing backend permission tests. The screenshot tour uses a synthetic owner workspace; it is not represented as a live tour of every role.

One earlier full run timed out at the unchanged Wiki Git read-only-key case after 60 seconds. The case passes individually in a clean baseline worktree and in the candidate; neither its source nor the Wiki Git implementation changed. The final full runs use an isolated Git configuration and four workers, with the original assertions and timeout intact. The earlier timeout remains recorded in `C:/tmp/tucano-settings-overhaul/polish-final-tests.json`.

The native harness initially reset device scaling through viewport emulation. It now resizes only its isolated hidden Electron window in native device-independent pixels. Every final native-page measurement records devicePixelRatio 1.5; smaller 760-pixel layouts are checked in the browser because the desktop window's supported minimum is 900.

## Two-line evidence

Actual rendered widths and text determine fit. These are observed samples at 150% scale, not universal character caps:

| Available hint width | Font / line height | Sample characters on two lines |
| --- | --- | --- |
| 258.3 CSS px | Inter Variable 12 / 18.6 px | 75 |
| 309.8 CSS px | Inter Variable 12.5 / 18.125 px | 84 |
| 348.7 CSS px | Inter Variable 12 / 18.6 px | 102 |
| 528.7 CSS px | Inter Variable 13 / 20.15 px | 163 |

Full restore replacement consequences retain the documented exception. Copy is never hidden or truncated to pass. [Native source-renderer measurements and captures](https://github.com/apoapostolov/tucano/tree/e3516b18d1b57f6c21a64059758626a78ad7655d/settings-organization/electron-native-150) precede the installed-executable confirmation. The final installed report is `C:/tmp/tucano-settings-overhaul/installed-polish-150/report.json`.

## Installed app and release

The user explicitly authorized interrupting the active reply and restarting for installation after the idle wait. The fresh verified installer was run silently, and the installed executable was launched and observed. No direct writes were made to the live database. Read-only inspection found the existing 19 agents, 26 conversations and 956 messages; counts can continue changing as the app is used. The regular installed window and process path were observed separately from the synthetic QA instance.

- Executable: `C:/Users/theap/AppData/Local/Programs/tucanonext/TucanoNext.exe`, version 0.2.29.
- Installed ASAR: **37,347,780 bytes**, SHA-256 `94a3bbf97d184e8c8bbc0e0b869aa25128aef7d1f907a056c85d5e76fea93b98`; it matches the packaged ASAR. Doctor reports 114 packages, no missing dependencies and a running window.
- Installer: **132,364,688 bytes**, SHA-256 `c54163d9f82854cfa58518178278976782a83b2d1e2dd93e073bb902cf3205a8`.
- Blockmap: **139,254 bytes**, SHA-256 `cd423fe85055d078fad99c91248e9a59c3ee8141c89d7ae048e07048f7b2aa54`.
- [Release next-v0.2.29](https://github.com/apoapostolov/tucano/releases/tag/next-v0.2.29) points to the build source. Server asset sizes/digests match both local files, and ranged downloads return HTTP 206 with actual bytes. Upstream tags/releases remain untouched. Updates stay off.

The next work is the requested editorial pass over new and changed application strings since the previous English-copy delivery. It has its own before/after proposal and evidence; the placement changes above remain the maintained baseline.
