# Afternoon audit intake, 14 November 2026

The release upgrade is complete; this record covers the following audit batch. Current upstream
is `04539404`, after server-view updater forwarding (#444), per-account Composio approvals
(#426), and safe monthly limits / the unlimited-agent reply budget (#450). Concurrent published
integration advanced to `f5ae97a7`, including notification hit testing/focus, test cards and
reasoning reading-position fixes. Both histories are preserved in the audit candidate.

## #311: discovery and source labels

The rebase replaced broader harness labels with a three-origin helper and missed `.hermes`.
The repaired public head is `35e98635fad7a560d417877cbb8dcffbaf16b6c4`, containing current
upstream. It recognizes Hermes, OpenCode, Copilot, Gemini, Codex, Pi, Agents and Claude Code;
unknown paths keep a neutral date fallback. The shared icon-origin helper recognizes `.hermes`.

The former Skills component was split into navigation, import, details, editing, people and
review components. The extraction preserves markup and permissions, adds 24 NLOC, and leaves
summed function CC and CogC unchanged against the preserved pre-extraction tree (which already
contains the label repair). Main component MI is 17.94; extracted components range 21.01–42.74.
The task's Skills boundaries pass the gate. The wider integrated tree still contains low-MI core
and renderer files; this is not an overall maintainability or production-readiness pass.

Public validation: typecheck; 1,769 passed, 60 skipped, zero failures in the full suite; typecheck
and 49 focused cases in a fresh checkout of the pushed SHA. Built UI imports all eight harnesses,
opens a detail view, opens/cancels editing, archives and reactivates. Source labels fit within two
lines at 1280/900/420 CSS pixels with no overflow. Exact labels and captures were reviewed.
Evidence is pinned to `7ded81df9082e9b16fe160c6a65fbd6dc9f60f93` on the screenshot branch.
The description no longer calls closed #308 an open prerequisite or repeats an obsolete PATH
failure that current upstream has fixed.

## #445 and the new test PRs

#445's source and description incorrectly said all four Windows matrix shards share a runner.
The CI workflow assigns a separate runner to each shard. Revised head `13440052` corrects the
claim and distinguishes within-shard contention as a hypothesis. A clean current-main checkout
passes all four boot/fuzz tests without increased budgets; startup took 3,158 ms here. The revised
PR passes its four focused tests too. This does not reproduce the cited CI condition. Proposed
budget increases remain unintegrated, and no timeout was changed to obtain this audit's result.

The 13 previously recorded rewritten heads were compared with feature-range diffs, rather than
whole-tree diffs that mix in upstream work. Several changes are inherited context (stepsOpen,
Composio imports, normalized limits and changelog positioning); newer tips also carry settings
placement changes. #245 adds static-markup reasoning protection and reading-position behavior,
already preserved through the concurrent integration. These comparisons do not establish a
full quality review of each feature. The exact refreshed inventory is authoritative for heads.

New PRs since the prior 84-PR snapshot: #446 Settings organization, #447 OpenCode retry fixture,
#448 forwarder port/readiness fixture, #451 English guide pages, and #453 delegation fixture.
#447 uses the production parser's retry window instead of a 200 ms test override; its process
integration cases are skipped on Windows and still require other-platform evidence. #453 replaces
a 2-second parked request with 8 seconds and raises that test's budget; its own report reproduces
the earlier race, but it still uses wall-clock ordering. An explicit controlled engine gate would
make the ordering causal. #448 and #451 need their own semantic and runtime review. None is
marked fully audited merely because its checks are green.

## New upstream defect: #454

The clean-main `Diff` component allocates `(n+1) × (m+1)` numeric cells synchronously during
skill proposal and history comparisons. The saved body ceiling is 1,000,000 characters, so a
12,000-character / 6,000-line body is valid. Running the original algorithm statements in an
isolated Node process requests 36,024,004 cells and exits 134 under a deliberate 128 MiB heap
cap. A 500-line control completes in about 39 ms at about 7.5 MB heap used. This is an allocation
reproduction, not a claim that Electron uses that cap or that a live renderer was crashed.

[Issue #454](https://github.com/eduwxyz/tucano/issues/454) records the source, limits and expected
full-content fallback. Its standalone extraction script is pinned to screenshot/evidence commit
`30a8a917`. The repair is pending and should be prepared against current main separately from
#311. Do not duplicate that issue or silently truncate instructions to avoid the allocation.

## Integration validation still in progress

Candidate application source `51b4e79` preserves approval-card busy/hold behavior and wrapping,
adds account-aware always-allow labels, retains one flat canonical Settings surface, normalizes
limits without losing retention/step/routing columns, and keeps all compatible changelog entries.
Typecheck and 83 affected account/limit/updater/reasoning/source cases pass. The rendered Settings
harness passes 52 captures and 96 section checks with zero copy failures, including the concise
10-million-token fallback explanation inherited from upstream.

The first combined full run passed 2,587 tests, skipped 61, and failed one wiki-Git read-only-key
case at its existing 60-second budget. That case passes on clean current main at about 52 seconds;
the public branch passed it at about 46 seconds. The candidate's entire wiki-Git file then passed
all 18 cases in isolation. These results do not prove a host cause. A full two-worker control run
is in progress with unchanged source, assertions and timeouts. Installation remains pending.
