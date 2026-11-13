# Upstream 0.2.28 reconciliation

Target: `73b724bec8a576d316a5dd5f46a07e3bf83cbe75`, the maintainer's 0.2.28 release.
Baseline: `b436f4af311e31259e50fc466c4289e32fb51b3e`, the 0.2.27 release.
Nineteen upstream commits were reviewed. This document is private integration context.

## Commit disposition

| Upstream commit | Change | Reconciliation |
| --- | --- | --- |
| `b912d8b` / #369 | Composio account linking with read access | Adopt. Account linking remains an explicit approval; ordinary write tools still need write access. |
| `670c3ee` / #370 | Codex subscription windows through the app-server | Adopt the native data source and arbitrary plan windows. Retain other providers from #305, suppress the duplicate generic Codex column only while its native subscription view is active, and keep the refresh on Usage access. |
| `b30b3f3` / #8 | Hermes harness | Adopt the maintainer's per-agent execution hold, stable gateway token and archival revocation. The maintainer incorporated #301's bring-forward and credited Apo; #301 stays closed. |
| `90a70a3` / #358 | One reply per agent and thread on every entry path | Prefer upstream's reserved queue and one scheduling entry point. Remove the polling and cancellation assumptions from #341/#343, which the maintainer reproduced as unsafe. |
| `add0356` / #364 | Preserve long agent instructions | Adopt lossless imports and edits, with a length warning rather than truncation. Retain the skill-assignment and routing controls in the same forms. |
| `a3443a1` / #351 | Unlimited budgets on all screens | Already implemented locally; retain upstream acceptance and the shared limit rules without duplicate declarations. |
| `c98e658` / #357 | Stable wiki map as the wiki grows | Adopt. Preserve the resolver, write-tool and handoff controls elsewhere in the Wiki component. |
| `b3c2575` / #345 | Avoid opening the phone keyboard on conversation navigation | Adopt the focus policy and its renderer regression test. Keep deliberate composer focus for steering and follow-up actions. |
| `5809216` / #363 | Linux Chrome and application accessibility | Adopt launcher identity filtering, window-scoped actions, snapshot pagination and accessibility startup environment. This host validates tests; real Linux desktop operation remains platform coverage. |
| `419dd16` / #344 | Restore the browser screen through the address hash | Adopt. Preserve send-mode parameters, thread opening, personal settings and desktop behavior. |
| `d5df340` / #362 | Duplicate a routine | Adopt. Copies start disabled, keep content and schedule, and get a new webhook address. Silent-routine behavior remains in the runner. |
| `418a551` / #296 | Personal memory label | Already present; retain upstream's accepted implementation and tests. |
| `7c0ec18` / #347 | Open the thread when sending into a threaded channel | Adopt the pending-message event link while retaining attachments and send-mode parameters. |
| `4be5093` / #291 | Keenable connector entry | Adopt the catalog entry alongside custom connector images. |
| `ce25c37` / #368 | Patched runtime dependencies | Retain the accepted dependency updates. Upstream also has yaml as a direct dependency; preserve it. |
| `0b0b5cd` / #367 | Scope SSH key-cleanup assertion to its own call | Retain the accepted repair; no global temporary-directory cleanup or shell-dependent assertion. |
| `e277c73` / #339 | First Chrome command deadline | Retain the accepted cold-start allowance without increasing subsequent command deadlines. |
| `fdf1da7` / #371 | Org chart and delegated work | Adopt tree validation, persistent requests, limits, cancellation, deadlines, return messages and the new screen. Preserve existing feature contracts without allowing implicit team-ups to bypass structured delegation. |
| `73b724b` | Release 0.2.28 | Inherit the maintainer's version and changelog. Keep TucanoNext's package name, application identity, installation/data separation, ports and disabled updater. No independent release or tags. |

## Behavioral decisions at overlaps

The maintainer's comments on #341 and #343 demonstrate that a reserved slot with no running
reply can be legitimate: the reply is queued behind occupied run slots. Forgetting that
reservation starts overlapping work. The old tests manufactured a reservation without its
queued job; they no longer describe a valid production state. They are replaced by a regression
that fills all four normal run slots, queues a real routine for another agent, routes a message
to that agent, and verifies that both replies run in order without overlap or cancellation.

The parallel send mode now means parallel work across agents or threads, within upstream's
one-reply-per-agent-and-thread invariant. Queue still waits for the whole conversation. Steering,
interrupt, retry instructions and follow-up remain available. Conversation admission does not
consume an execution slot while it waits for the actual reserved reply; doing both would deadlock
a full queue. The deterministic engine now honors cancellation during its simulated long wait.

The org chart takes precedence over implicit cross-room team-ups for agents with a reachable
team. Otherwise a diagnostic listing agent handles could create a new team-up channel, and
structured work could be handed sideways without the delegation limits. Existing unstructured
team-ups remain available. Delegations are retained in run summaries together with routing
metadata and next-step cards. A routine that delegated work cannot claim it has nothing to
report, even if its answer contains the silent marker.

Codex's native plan windows remain visible in their original durations rather than being forced
into #305's three fixed rows. Other provider columns and the conversation quota strip are
retained. When only native Codex windows are available, the general panel points to them rather
than falsely claiming that no credentials exist.

## Verification

- [x] Read upstream PR decisions for #8, #301, #341, #343, #339, #351, #296, #367 and #368.
- [x] Resolve every textual conflict and pass typecheck on the combined 0.2.28 code.
- [x] Check the real queued-reservation regression, send modes and delegated-work interactions.
- [x] Check that a delegated routine is not silently hidden and Codex columns are not duplicated.
- [x] Pass the full suite: 2,193 passed, 66 skipped, zero failed.
- [x] Build and package fresh `tucanonext-setup-0.2.28.exe` from source `28eddc4`.
- [x] Verify installed path/version, existing workspace/Settings, and updater state `off`.
- [x] Run all six hidden UI checks against the installed executable, with separate scratch data/ports.
- [ ] Verify live DM selection: duplicate accessibility identities prevent safe background clicks. Agent rows open profiles; the scratch Open DM action passes.
- [x] Fetch once more, integrate into next, and refresh inventory (58 total: 38 open, 12 merged, 8 closed).

Upstream source reconciliation is complete. Feature auditing can resume; the live-navigation limitation remains recorded above. Full production
signoff, remaining platform checks and the existing maintainability gates are still separate work.
