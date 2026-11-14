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
- [ ] Inspect duplicate definitions and test each affected feature together with neighbors.
- [ ] Pass typecheck and the complete suite on locked dependencies.
- [ ] Build and complete hidden runtime, copy and navigation checks.
- [ ] Install and verify the installed executable, workspace and archive hash.
- [ ] Publish the fork release after installed verification.
- [ ] Resume the per-head audit and update new/revised PR records.

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
