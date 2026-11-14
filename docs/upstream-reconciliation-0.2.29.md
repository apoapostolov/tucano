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
