# English interface copy delivery

Delivered 13 November 2026. The installed source is `7ba091c217eb6e3dab28b637c555de0126e560b5`; subsequent delivery-record commits change documentation only.

The fork now contains 376 revised English string occurrences across 17 source files, covering Settings, Wiki, Memory, Skills, Routines, onboarding, conversations, dialogs, routing, agents, servers, workspaces and updates. The Wiki model picker also has four scoped CSS rules so its hint and controls fit inside the dialog. “Use the memory's” is now “Use memory model”. Portuguese strings and application behavior were preserved by the copy edits.

## Proposal and upstream delivery

The [original proposal](english-copy-proposal.md) was committed before implementation. It records the old and proposed wording, rationale, character counts, screenshots and measured layout budgets. The [fork supplement](english-copy-fork-proposal.md) covers additional integrated features and the installed-font correction. The [upstream validation record](english-copy-validation.md) retains the initial failures and subsequent verification rather than presenting only successful runs.

- Upstream issue: [#409](https://github.com/eduwxyz/tucano/issues/409).
- Upstream PR: [#410](https://github.com/eduwxyz/tucano/pull/410), head `96095da60fa4e3ee160f1a87a94d8f80e5c7da04`, with 267 English string occurrences in 15 files. Its six latest CI jobs passed: [run 43435787012](https://github.com/eduwxyz/tucano/actions/runs/43435787012).
- Public before/after screenshots: [immutable capture tree](https://github.com/apoapostolov/tucano/tree/5543887461d2370e5eb33f6d1d8a038bdd02b53d/docs/screenshots/english-copy).

Copy belonging to existing feature PRs was delivered on those branches and verified from fresh worktrees at their published heads:

| PR | Published head |
| --- | --- |
| [#268](https://github.com/eduwxyz/tucano/pull/268), Wiki resolver | `710a1589681a6ca7a939b8de8498d0f877c26c50` |
| [#322](https://github.com/eduwxyz/tucano/pull/322), steps mode | `7813b0e7e1e3312824ca5b7e6ef5e7b7c7f4fdb9` |
| [#395](https://github.com/eduwxyz/tucano/pull/395), clock | `bff2d26e57793ef4e8b470c77e9a796b86d255ee` |
| [#247](https://github.com/eduwxyz/tucano/pull/247), questions | `0aa0982616edbc9ec8bda3b580779ca0a3b2cf81` |
| [#391](https://github.com/eduwxyz/tucano/pull/391), interrupted runs | `9b3dc02dc97e1d63a51eb9bf2ed8903737089bfa` |
| [#383](https://github.com/eduwxyz/tucano/pull/383), classifiers | `b58ca55fcfae1f2a5db9a3fe02383ef893bdff21` |

Their reviewed copy changes were ported into the maintained integration where branch histories had diverged or been rebased. Merging those older feature stacks wholesale would have replaced newer runtime implementations. These targeted checks do not mark the features fully audited.

## Two-line evidence

The rendered hint width, font and words determine wrapping; character counts are useful budgets, not universal limits. At the tested 1280- and 900-pixel viewports, Inter Variable produced these calibration examples:

| Hint width | Font / line height | Sample characters fitting two lines |
| --- | --- | --- |
| 678 px | 13 / 20.15 px | 203 |
| 538 px | 13 / 20.15 px | 162 |
| 333 px | 12 / 18.6 px | 116 |
| 263 px | 12 / 18.6 px | 88 |
| 327.2 px, original Wiki row | 12.5 / 18.125 px | 116 |

Wiki's edit hint changed from 126 characters across three lines to 84 across two; consecutive replies changed from 122 across three to 48 on one; dictation changed from 256 across three to 135 across two. The full-backup replacement warning intentionally retains more than two lines to preserve the consequences of replacing existing data.

The upstream harness recorded 36 screenshots and 88 measurements. The expanded integration check recorded 61 captures, five section images and 184 measurements, including enabled classifiers and custom Wiki models. A final check in the installed Electron renderer caught a display-scaling difference: the resolver-assignment hint was shortened to “An agent uses its own instructions, model, and effort.” It renders in two lines in the installed build. Model reset also persisted after reload.

## Final verification and installation

- Final source `7ba091c`: typecheck passed; full suite **2,306 passed, 66 skipped, zero failed**. The process used an isolated Git configuration and four workers; assertions and timeouts were not relaxed.
- Build and `node scripts/self-build.mjs install --json` passed. The helper verified the packaged application, installed it, compared the installed ASAR with the built ASAR, and observed a TucanoNext window.
- Installer: `C:/git-ext/tucano-english-next/dist/tucanonext-setup-0.2.28.exe`, SHA-256 `28b47c3b34e4b555b53d4a28bf6e57826b646805c8a35c28c7295b0ce93ebf9a`.
- Installed executable: `C:/Users/theap/AppData/Local/Programs/tucanonext/TucanoNext.exe`, version 0.2.28. Installed ASAR SHA-256: `b3b76915d65b9c7042f2aa313db2861ee5e6e5f134c6e6e78d676cf1192ebdf0`.
- Seven hidden checks against that installed executable passed: workspace, agent profile, agent DM, Settings, Wiki model, Team and Usage. They used throwaway seeded data, fake engines and isolated ports. No renderer errors were recorded; updates were off; the resolver hint occupied two lines and model reset worked.
- Read-only inspection of the normal workspace retained 19 active agents, seven channels and 894 messages. The regular installed process and TucanoNext window were observed. Its minimized window prevented completing regular-workspace navigation through background accessibility; installed-app navigation was verified in the isolated instance instead. No foreground input was used.

The initial next head was `481814e9a01e0669ce69ef2371a8c88a0a720789`; current upstream main `73b724bec8a576d316a5dd5f46a07e3bf83cbe75` is included. Integration retained concurrent parallel replies, Wiki resolver-agent selection, steer placement and Team attachments, including `5d5b7e3`. Product identity, installation/data separation and updater policy remain intact. This copy delivery does not bump the version or replace release assets.

Machine-readable evidence remains under `C:/tmp/tucano-copy-audit/`: `combined-final-tests.json`, `final-layout/report.json`, `upstream-final-captures/report.json`, `final-installed-verification/report.json`, `feature-checks.json`, `feature-published.json` and `published-verification.json`. The installed verification report's dirty flag refers solely to the regenerated inventory document; runtime source was unchanged.
