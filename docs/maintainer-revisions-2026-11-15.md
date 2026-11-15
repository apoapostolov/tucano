# Maintainer-requested Tucano revisions, 15 November 2026

The user authorized the linked Tucano revisions first, with TucanoNext ingestion deferred.
During this run, they additionally authorized migrating repairs that preserve Apo's interface
choices. Maintainer requests to restore upstream strings or change upstream defaults do not
authorize replacing TucanoNext's copy, layout or recovery behavior.

Starting refs: primary `next` was `1fd2a6a7`, published `next` was initially `7dce2af8`, and
current Tucano main is `3e8162ebbb8c1d432d6973cedde7444a21910f4f`. The selective migration
started from `78c6d1b8`, preserving the concurrent reasoning audit and reconciliation.
The primary checkout's uncommitted copy work was left intact.

## Delivery checklist

- [x] Read every linked maintainer request and the current PR heads and discussions.
- [x] Preserve the completed upstream dispositions: #447 is covered by #448; #401 by merged
  #412; issues #340 and #342 were closed as fixed by #358; #429 is merged.
- [x] Rebase the four active feature branches onto current Tucano main.
- [x] Publish the requested splits as #471 and #472, rather than duplicating the feature PRs.
- [x] Run type checks, full suites, builds, focused regressions and isolated runtime checks.
- [x] Verify the published heads in a separate worktree.
- [x] Review the safe migration boundary against current TucanoNext source.
- [x] Port the background kill/restart harness and verify all 20 assertions on TucanoNext.
- [x] Refresh the exact-head Apo queues without claiming completed full feature audits.

## Upstream results

All branches use main `3e8162eb`. Every full suite below has zero failures and 60 skipped tests.

| PR | Published source | Revision | Full-suite passes |
| --- | --- | --- | ---: |
| [#391](https://github.com/eduwxyz/tucano/pull/391) | `f55ce3fb` | Default-off opt-in; shared Continue eligibility/context; paused queues retain their interruption marker; history repair split out. | 1,787 |
| [#392](https://github.com/eduwxyz/tucano/pull/392) | `20570b53` | Resolved dismissals reset only for missing pages and broken links. Other kinds remain dismissed permanently. | 1,791 |
| [#402](https://github.com/eduwxyz/tucano/pull/402) | `ac3dd191` | Only kill/restart tests and fake-engine support remain; hidden windows, separate ports and source-bound JSON evidence. | 1,781 |
| [#468](https://github.com/eduwxyz/tucano/pull/468) | `74f64aed` | Bounded comparison repair, existing screen retained, original upstream length warning restored. | 1,791 |
| [#471](https://github.com/eduwxyz/tucano/pull/471) | `dd9f86c3` | Older-retry SQL timestamp bounds and exclusion of newer summaries, split from #391. | 1,781 |
| [#472](https://github.com/eduwxyz/tucano/pull/472) | `9d2ea252` | Pure Skills extraction, split from #468; all 11 function bodies match main byte for byte. | 1,779 |

#402's full suite predates its test-only harness refinements; its final published head passes
typecheck, nine focused tests, a production build and all 20 kill/restart assertions. The other
five source heads have passing full suites and separate published-head type/focused checks.
Locked dependencies were installed in the isolated refactor worktree; published-head checks
used that installation. Earlier complete suites, except the final #391 and #472 runs, used the
existing shared dependency installation. This is not six independent clean-install CI results.

The hidden Electron recovery check exercises default-off startup, persistent opt-in, meaningful
tool progress, thinking-only interruptions, manual stops and skipped older interruptions.
Skills checks exercise proposal approval, history comparison, complete restoration, keyboard
scrolling and cancelling a one-million-character edit. Narrow browser evidence covers 420,
900 and 1280 CSS pixels; Electron evidence covers 900 and 1280 CSS pixels at 150% scaling.
The extracted screen also passes proposal, approval, history and restoration smoke checks.

[Immutable captures, copy measurements, exact source identities and validation notes](https://github.com/apoapostolov/tucano/tree/440f69724a5852aed53323af40c105faa8c18ed1/frames/maintainer-revisions-2026-11-15).

Editorial and visual review passed for the recovery label/hint and new comparison text. The
unchanged upstream Skills warning occupies three lines at 420 pixels. It remains fully visible;
that existing layout debt is recorded rather than silently shortening the requested wording.
The extraction passes the maintainability gate: +33 NLOC, unchanged summed CC and cognitive
complexity. The focused #391, #392 and #468 revisions still touch baseline red modules. Their
maintainability gates remain blocked; they are targeted repairs, not completed full audits.

## Selective TucanoNext migration

| Change | TucanoNext disposition |
| --- | --- |
| Bounded matrix, full large comparisons and complete version retention | Already present; the shared comparison helper matches #468. Keep the existing extracted components and improved warning copy. |
| Older-retry timestamp filtering and newer-summary exclusion | Already present. Preserve the additional history-revision guards in TucanoNext's memory module; replacing the upstream file wholesale would remove them. |
| Skills component extraction | Already present. No second extraction is needed. |
| Opt-in default and new startup-continuation presentation | Upstream product choice. Retain TucanoNext's current default and in-place recovery implementation. Its existing paused queue does not prematurely complete the interrupted row. |
| Reset dismissals for only two alert kinds | Upstream product choice. Retain TucanoNext's current broader reset behavior pending a separate preference decision. |
| Hidden kill/restart harness, ephemeral ports, synthetic reviewer and JSON assertions | Migrated. It disables automatic recovery only in its throwaway fixture so manual Continue can be tested. All 19 assertions pass; TucanoNext still offers its additional Try with instructions action. |

The harness initially detected a notification window becoming focusable. Its test-only bootstrap
now keeps focusability disabled throughout every window's lifetime; no show/focus event was
observed in the failed run or the passing rerun. No foreground input was used.

This migration changes a development-only script, instructions and audit records. It changes no
packaged application source, interface strings, settings defaults, database implementation or
installed files. Under AGENTS.md's development-script exception, no installer or release is
required. The built TucanoNext was run with scratch data to validate the migrated harness.

Final GitHub checks: all six published heads have successful CI and are mergeable against main `3e8162eb`. The migrated harness passes 20 assertions at clean source `f0d88b68`; later commits change documentation only.

The next review trigger is a maintainer reply or a changed PR head/base. A future Tucano release
must still be ingested selectively, preserving the decisions recorded here.


