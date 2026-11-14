# Upstream 0.2.29 reconciliation

The upgrade begins from published integration `41d0979`, preserves the audit candidate
`d0fc185`, and incorporates upstream release `68cf5da`. Conflicting feature implementations
retain the fork's behavior, as requested. This record is a checklist, not a release signoff.

## Dispositions

- #244: retain the integrated skill filtering, bulk assignment and broader linked-harness labels.
- #310: retain the more complete English context, including Tuca skill inspection and search.
- #373: keep current-permission wiki reads and the additional write-permission guards from #355.
- #386: the causal fake sign-in fixture is now upstream; keep one implementation.
- #419 and #422: preserve the integrated wiki map and orange toast behavior; inspect clean merges.
- #404: add the personal automatic-opening preference without losing step display modes,
  remembered folding, manual toggles, silent runs, steering or follow-up behavior.
- #443: retain the existing English Team guide title and its shorter approved summary.
- Browser Settings now receives the server version through the web shim (#382).

## Settings placement and copy review

The six-page settings reorganization is integrated from its committed, layout-checked revision
`6f5d1b4`, leaving that task's uncommitted work untouched. Conversation presentation belongs
to App / `app-conversation`, beside the existing reasoning and step controls. The new key is
registered there and the settings placement check must pass before delivery.

| Decision | Record |
| --- | --- |
| Choice | Whether a running reply opens its steps automatically |
| Key | `Settings.stepsOpen` |
| Canonical home | App / `app-conversation` |
| Scope and roles | Personal; available to members, admins and owner |
| Default | On when unset |
| Dependencies | Step mode, remembered conversation folding and silent-run presentation still constrain automatic opening |
| Persistence | Existing settings/personal preferences; workspace-copy compatibility retained |
| Restart | None; changes apply to current presentation |
| Overrides | Manual opening/closing wins for the reply; remembered folding remains effective |
| Privacy/destruction | No new data access and no deletion |

Exact English label: **Open steps automatically**.
Exact hint: **Open working replies by default. You can still expand or collapse them yourself.**
The upstream Portuguese copy is retained unchanged. English wording names the behavior
without repeating the longer upstream explanation. Both widths and installed scaling still
require rendered checks before delivery.

## Validation and delivery

- [x] Capture starting refs and refresh the authored PR inventory.
- [x] Resolve conflicts in favor of compatible fork behavior and inherit version 0.2.29.
- [x] Inspect duplicate definitions and test each affected feature together with neighbors.
- [x] Pass typecheck and the complete suite on locked dependencies.
- [x] Build and complete hidden runtime, copy and navigation checks.
- [x] Install and verify the installed executable, workspace and archive hash.
- [x] Publish the fork release after installed verification.
- [x] Resume the per-head audit and update new/revised PR records.

## Refreshed PR heads and audit intake

At 08:03 UTC the authored inventory contains 83 PRs: 55 open, 18 merged and 10 closed.
The overnight merged set is #244, #310, #373, #386, #419 and #422. This describes upstream
acceptance, not complete quality review.

| PR | Current head | Revision review |
| --- | --- | --- |
| #248 | `f32b6ec` | Rebased onto 0.2.29; range-diff shows the same AskStrip feature, with CSS context changes only. Existing composed integration remains. |
| #249 | `acef2d7` | Rebased onto 0.2.29; three feature commits retain history boundaries, pending-work cleanup and summary deletion. Existing stronger cancellation and revision protections remain. |
| #311 | `066dba0` | Rebase retains Hermes folders, versions and facets, but drops the broader harness-label helper in favor of upstream skillOrigin. OpenCode, Copilot, Gemini, Pi and Agents then lose their source labels; `.hermes` also fails the narrower Hermes predicate. Repair belongs on #311 and needs fresh UI evidence. The integration already retains the broader labels. |

These comparisons use per-feature range-diff rather than whole-tree diffs, so upstream changes
are not mistaken for feature changes. None is marked fully audited from CI or ancestry alone.

## Evidence at the integrated source

Source `4cf74d8` passes type checking, the settings placement check (33 sections, 54 owned keys,
57 checked writes), 14 settings navigation/structure cases and 77 affected-feature cases.
The built renderer passes 50 captures and 96 section-navigation checks at 1280, 900 and 760 CSS
pixels, with zero copy failures. The background Electron smoke passes seven checks without
visible or focusable QA windows. The screenshot of App / Conversation was reviewed for the
new label and hint beside neighboring controls; installed-renderer measurements are separate.

Entanglement compares reconstructed committed before-tree `417a90a` with `4cf74d8`: +979 NLOC,
+322 summed function CC and +269 CogC, largely the settings architecture and checks. This is
not a pre-edit live-state baseline. Its gate is blocked by edited low-MI core/renderer files,
including Pages, Conversation, People, Routing and Wiki; structural debt remains open. This
upgrade does not claim maintainability or production-readiness signoff.

## Delivered build

Published and installed source: `28ad4f2078e8393f1515c1a34cdb1ee2fe05e72e`.
The first complete run found nine failures caused by the new step selector reading an absent
settings object in existing silent-reply/follow-up fixtures. The optional selector repair and
new one-line/folding/silent regression case pass all 26 focused checks. The final complete run
passes **2,563 tests, 61 skipped, zero failures**. The final application source is `7a861d6`;
`28ad4f2` adds only the development QA helper update. Typecheck and the rebuilt app pass.

`node scripts/self-build.mjs install` completed packaging, archive validation, installation and
normal launch. The installed archive is **37,336,498 bytes**, SHA-256
`56640ba78d9471a1aae6a152990f6dc5f5ea1d805464f235285ae70aba2dfa5e`, equal to the packaged
archive. The normal installed executable has a visible, unfocused window. Accessibility
inspection finds the window but exposes only two refs, so it does not establish normal-workspace
navigation. The installed executable separately passes seven hidden runtime checks with scratch
data, no model calls, no foreground exposure, preference persistence, and copy measurements at
native **150%** scaling plus 1280/900/760 CSS pixels. The native screenshot was inspected.

Evidence: `C:/tmp/tucano-0.2.29-final-full.json`,
`C:/tmp/tucano-0.2.29-settings/report.json`,
`C:/tmp/tucano-0.2.29-installed/report.json` and
`C:/tmp/tucano-0.2.29-installed-identity.json`.

[The fork release](https://github.com/apoapostolov/tucano/releases/tag/next-v0.2.29) has its tag
at the installed source. Installer and blockmap sizes and GitHub SHA-256 digests match local
files; a ranged download returns HTTP 206 and 32 installer bytes. Upstream tags/releases were
not changed. The dirty props worktree retains its exact edits on
`codex/preserve-props-20261114`; local and published next advanced without resetting those edits.
The primary feature checkout remains on its existing branch.

## Intake after delivery, 08:25 UTC

The fresh inventory is **84 authored PRs: 56 open, 18 merged, 10 closed**. These revisions arrived
while the delivery was validated; their old semantic reviews must not carry over automatically.

| PR | New head | Intake state |
| --- | --- | --- |
| #245 | `38014a68460e` | New revision; semantic comparison pending |
| #261 | `fa687b67dc0d` | New commit; interaction review pending |
| #268 | `ed990873335a` | Rewritten head; semantic comparison pending |
| #336 | `c92b50d753e5` | Rewritten head; semantic comparison pending |
| #366 | `328cbb76746b` | Rewritten head; semantic comparison pending |
| #383 | `94625c04b8ed` | Rewritten head; stack review pending |
| #391 | `ba9626929913` | Rewritten head; recovery review pending |
| #395 | `a22c58866366` | Rewritten head; semantic comparison pending |
| #397 | `d3307ba5c1e9` | Rewritten head; layout review pending |
| #402 | `980a8c5542bf` | Rewritten head; recovery harness review pending |
| #410 | `4e491dbaa301` | Rewritten head; copy evidence review pending |
| #412 | `ae0bb6e4abfb` | Rewritten head; recovery review pending |
| #435 | `aa41c2ff1b12` | Rewritten head; initiative/security review pending |
| #445 | `43fa3ab4e99d` | New test-budget PR; not integrated |

#445 raises two Windows boot budgets to 60 seconds. Its body and source comment say four CI
shards share one runner. `.github/workflows/ci.yml` explicitly runs them on four runners,
contradicting that causal explanation. Parallel tests within a shard may contend, but the cited
cross-shard cause is not established. This candidate passed both tests without the increases.
The PR body now corrects the separate-runner topology and marks contention as a hypothesis.
Its source comment still needs correction. Review requires a base-branch reproduction; no assertion or timeout was
weakened to obtain this release's passing result.

The #311 repair is prepared in `C:/git-ext/tucano-skills-origin-audit`, with 41 focused cases and
type checking passing. It is not pushed or delivered: fresh rendered evidence and the existing
Skills page's low-MI gate remain unresolved. The installed integration retains its original
broader labels. Later Settings revision `7c583c8` is also queued separately; this release includes
the verified committed six-page revision `6f5d1b4`, not another task's later changes.

The original audit cohort remains **0/43 fully audited**. Acceptance, targeted repair, test passes
and an installed release are separate evidence states.
