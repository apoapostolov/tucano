# Full-stack file inventory, 16 November 2026

Source: `514c94bec373d8156845879968ffccb4efae2bd1`. Enumerated all **905 tracked paths** using `git ls-files -z`; the [CSV](full-stack-files.csv) records every path once. This is a source-bound inventory, not a semantic architecture review. Documents added by this audit appear in the next inventory refresh.

- [x] Enumerate tracked source, tests, scripts, configuration, site, documentation and assets.
- [x] Preserve one CSV row per path and identify evidence captures separately.
- [x] Produce provisional package assignments and expose unassigned paths.
- [ ] Review assignments against imports, runtime ownership and cross-feature flows.
- [ ] Assign every unassigned module; review shared modules and package boundaries.
- [ ] Inspect cycles, duplicated contracts, dead paths, maintenance hotspots and representative runtime behavior.

Path/name rules assign a candidate primary package. A rule match does not establish reviewed ownership. FS-01 owns documentation provisionally; other packages still own the behavior documented there. Capture images under frames/screens are evidence, not maintained application modules. Runtime assets remain in the inventory.

| Package/state | Paths |
| --- | ---: |
| evidence | 12 |
| FS-01 | 78 |
| FS-02 | 18 |
| FS-03 | 16 |
| FS-04 | 6 |
| FS-05 | 23 |
| FS-06 | 21 |
| FS-07 | 56 |
| FS-08 | 46 |
| FS-09 | 16 |
| FS-10 | 27 |
| FS-11 | 43 |
| FS-12 | 38 |
| FS-13 | 34 |
| FS-14 | 15 |
| FS-15 | 93 |
| FS-16 | 55 |
| FS-17 | 4 |
| FS-18 | 36 |
| unassigned | 268 |

## Unassigned paths

- [ ] `CHANGELOG.md`
- [ ] `SECURITY.md`
- [ ] `install.ps1`
- [ ] `install.sh`
- [ ] `scripts/apply-copy-review.mjs`
- [ ] `scripts/bench-kept-session.ts`
- [ ] `scripts/bench-warm-start.ts`
- [ ] `scripts/check-agent-models.mjs`
- [ ] `scripts/demo-mcp-server.mjs`
- [ ] `scripts/desktop-e2e.ts`
- [ ] `scripts/feature-map-sync.mjs`
- [ ] `scripts/lib/copy-runtime.mjs`
- [ ] `scripts/lib/electron-copy-viewport.mjs`
- [ ] `scripts/lib/upgrade-034-check.mjs`
- [ ] `scripts/qa-background.mjs`
- [ ] `scripts/qa-person-access.mjs`
- [ ] `scripts/qa-reasoning-eviction.mjs`
- [ ] `scripts/qa-reasoning-fold.mjs`
- [ ] `scripts/qa-reasoning-retention-boundary-entry.tsx`
- [ ] `scripts/qa-reasoning-retention-boundary.html`
- [ ] `scripts/qa-reasoning-retention-boundary.mjs`
- [ ] `scripts/screens-agent-card.mjs`
- [ ] `scripts/screens-answer-back.mjs`
- [ ] `scripts/screens-asks-multichoice.mjs`
- [ ] `scripts/screens-asks-waiting.mjs`
- [ ] `scripts/screens-asks.mjs`
- [ ] `scripts/screens-copy-round2.mjs`
- [ ] `scripts/screens-db-file.mjs`
- [ ] `scripts/screens-delete-session.mjs`
- [ ] `scripts/screens-harness.mjs`
- [ ] `scripts/screens-hermes-harness.mjs`
- [ ] `scripts/screens-history.mjs`
- [ ] `scripts/screens-image-menu-thumbs.mjs`
- [ ] `scripts/screens-image-menu.mjs`
- [ ] `scripts/screens-live.mjs`
- [ ] `scripts/screens-mac.mjs`
- [ ] `scripts/screens-model.mjs`
- [ ] `scripts/screens-models-bulk.mjs`
- [ ] `scripts/screens-new.mjs`
- [ ] `scripts/screens-no-limit.mjs`
- [ ] `scripts/screens-notices.mjs`
- [ ] `scripts/screens-onboarding.mjs`
- [ ] `scripts/screens-parallel-dm.mjs`
- [ ] `scripts/screens-prompt-order.mjs`
- [ ] `scripts/screens-reviewed-copy.mjs`
- [ ] `scripts/screens-silent.mjs`
- [ ] `scripts/screens-splash.mjs`
- [ ] `scripts/screens-thread-btn.mjs`
- [ ] `scripts/screens-try-with-instructions.mjs`
- [ ] `scripts/screens-work-drawer.mjs`
- [ ] `scripts/screens.mjs`
- [ ] `scripts/seed-no-limit.mjs`
- [ ] `scripts/whisper.mjs`
- [ ] `src/core/agent-look.ts`
- [ ] `src/core/apps.ts`
- [ ] `src/core/chrome.ts`
- [ ] `src/core/context.ts`
- [ ] `src/core/gateway.ts`
- [ ] `src/core/guide.ts`
- [ ] `src/core/guide/agentes.md`
- [ ] `src/core/guide/aprovacoes.md`
- [ ] `src/core/guide/celular.md`
- [ ] `src/core/guide/comecar.md`
- [ ] `src/core/guide/composio.md`
- [ ] `src/core/guide/computadores.md`
- [ ] `src/core/guide/conectores.md`
- [ ] `src/core/guide/conversas.md`
- [ ] `src/core/guide/google.md`
- [ ] `src/core/guide/limites.md`
- [ ] `src/core/guide/memoria.md`
- [ ] `src/core/guide/motores.md`
- [ ] `src/core/guide/problemas.md`
- [ ] `src/core/guide/rede.md`
- [ ] `src/core/guide/rotinas.md`
- [ ] `src/core/guide/servidor.md`
- [ ] `src/core/guide/setores.md`
- [ ] `src/core/guide/slack.md`
- [ ] `src/core/guide/time.md`
- [ ] `src/core/guide/workspaces.md`
- [ ] `src/core/harness-mcp.ts`
- [ ] `src/core/harness.ts`
- [ ] `src/core/hermes-import.ts`
- [ ] `src/core/hold.ts`
- [ ] `src/core/index.ts`
- [ ] `src/core/mac.ts`
- [ ] `src/core/platform.ts`
- [ ] `src/core/seed.ts`
- [ ] `src/core/sessions.ts`
- [ ] `src/core/step-text.ts`
- [ ] `src/core/vt-screen.ts`
- [ ] `src/renderer/index.html`
- [ ] `src/renderer/notice.html`
- [ ] `src/shared/access.ts`
- [ ] `src/shared/actions.ts`
- [ ] `src/shared/app-identity.ts`
- [ ] `src/shared/attach.ts`
- [ ] `src/shared/channel-layout.ts`
- [ ] `src/shared/classify.ts`
- [ ] `src/shared/clock.ts`
- [ ] `src/shared/composio.ts`
- [ ] `src/shared/errors.ts`
- [ ] `src/shared/hermes-import.ts`
- [ ] `src/shared/instructions.ts`
- [ ] `src/shared/lang.ts`
- [ ] `src/shared/limits.ts`
- [ ] `src/shared/links.ts`
- [ ] `src/shared/list-order.ts`
- [ ] `src/shared/mention-text.ts`
- [ ] `src/shared/notice.ts`
- [ ] `src/shared/onboarding.ts`
- [ ] `src/shared/page.ts`
- [ ] `src/shared/path-text.ts`
- [ ] `src/shared/questions.ts`
- [ ] `src/shared/release-notes.ts`
- [ ] `src/shared/run-progress.ts`
- [ ] `src/shared/screens.ts`
- [ ] `src/shared/servers.ts`
- [ ] `src/shared/silent.ts`
- [ ] `src/shared/types.ts`
- [ ] `src/shared/voice.ts`
- [ ] `src/shared/wav.ts`
- [ ] `src/shared/workspaces.ts`
- [ ] `test/action-rules.test.ts`
- [ ] `test/actions.test.ts`
- [ ] `test/agent-card.test.ts`
- [ ] `test/agent-look.test.ts`
- [ ] `test/agent-models-ui.test.tsx`
- [ ] `test/agent-models.test.ts`
- [ ] `test/antigravity-migration.test.ts`
- [ ] `test/app-identity.test.ts`
- [ ] `test/apps.test.ts`
- [ ] `test/ask-card.test.tsx`
- [ ] `test/ask-strip.test.tsx`
- [ ] `test/asks-dismiss.test.tsx`
- [ ] `test/asks-history.test.tsx`
- [ ] `test/asks-page.test.tsx`
- [ ] `test/asks-waiting-refresh.test.ts`
- [ ] `test/asks-waiting.test.tsx`
- [ ] `test/attach.test.ts`
- [ ] `test/background-qa.test.ts`
- [ ] `test/catalog-view.test.ts`
- [ ] `test/channel-layout.test.ts`
- [ ] `test/chrome-close.test.ts`
- [ ] `test/chrome-deadline.test.ts`
- [ ] `test/chrome-windowless.test.ts`
- [ ] `test/clear-history-core.test.ts`
- [ ] `test/clear-history.test.ts`
- [ ] `test/clock-setting.test.ts`
- [ ] `test/codex-app.test.ts`
- [ ] `test/codex-models.test.ts`
- [ ] `test/composer-focus-ui.test.tsx`
- [ ] `test/composer-paste.test.ts`
- [ ] `test/composio-calls.test.ts`
- [ ] `test/context.test.ts`
- [ ] `test/continue-button.test.tsx`
- [ ] `test/continue-killed.test.ts`
- [ ] `test/decision-keys.test.ts`
- [ ] `test/delete-session-at-work.test.ts`
- [ ] `test/delete-session-thread-at-work.test.ts`
- [ ] `test/delete-session-ui.test.tsx`
- [ ] `test/delete-session.test.ts`
- [ ] `test/detect-run.test.ts`
- [ ] `test/edit-prompt.test.tsx`
- [ ] `test/endpoint-default-web.test.ts`
- [ ] `test/endpoint-key-scope.test.ts`
- [ ] `test/errors.test.ts`
- [ ] `test/faster-turns.test.ts`
- [ ] `test/fixtures/antigravity-stream.jsonl`
- [ ] `test/fixtures/claude-stream.jsonl`
- [ ] `test/fixtures/cline-stream-recorded.jsonl`
- [ ] `test/fixtures/codex-app-turn.jsonl`
- [ ] `test/fixtures/codex-exec.jsonl`
- [ ] `test/fixtures/cursor-stream.jsonl`
- [ ] `test/fixtures/fake-claude.mjs`
- [ ] `test/fixtures/fake-codex.mjs`
- [ ] `test/fixtures/grok-stream-recorded.jsonl`
- [ ] `test/fixtures/grok-stream.jsonl`
- [ ] `test/fixtures/hermes-cli.ts`
- [ ] `test/fixtures/hermes-stream.jsonl`
- [ ] `test/fixtures/test-root.crt`
- [ ] `test/fixtures/test-root.key`
- [ ] `test/gateway.test.ts`
- [ ] `test/github-publish.test.ts`
- [ ] `test/governance.test.ts`
- [ ] `test/guide-language.test.ts`
- [ ] `test/guide.test.ts`
- [ ] `test/harness-mcp.test.ts`
- [ ] `test/harness.test.ts`
- [ ] `test/helpers/core.ts`
- [ ] `test/hermes-e2e.test.ts`
- [ ] `test/hermes-import.test.ts`
- [ ] `test/hermes-one-at-a-time.test.ts`
- [ ] `test/hermes.test.ts`
- [ ] `test/hold-reorder.test.tsx`
- [ ] `test/hold-reply.test.ts`
- [ ] `test/home-link.test.ts`
- [ ] `test/image-menu-thumbnails.test.tsx`
- [ ] `test/image-menu.test.ts`
- [ ] `test/kept-session.test.ts`
- [ ] `test/lang.test.ts`
- [ ] `test/launch-minimized.test.ts`
- [ ] `test/limit-too-large.test.ts`
- [ ] `test/limit-zero.test.ts`
- [ ] `test/limits.test.ts`
- [ ] `test/links.test.ts`
- [ ] `test/list-order.test.ts`
- [ ] `test/mac.test.ts`
- [ ] `test/mention-mode-ui.test.tsx`
- [ ] `test/mention-mode.test.ts`
- [ ] `test/mention-text.test.ts`
- [ ] `test/message-history.test.ts`
- [ ] `test/message-reading-anchor.test.tsx`
- [ ] `test/migrate.test.ts`
- [ ] `test/model-facing-language.test.ts`
- [ ] `test/no-monthly-limit.test.tsx`
- [ ] `test/notice.test.tsx`
- [ ] `test/notify-hint.test.ts`
- [ ] `test/onboarding-ui.test.tsx`
- [ ] `test/onboarding.test.ts`
- [ ] `test/opencode-v2.test.ts`
- [ ] `test/opencode.test.ts`
- [ ] `test/person-access.test.ts`
- [ ] `test/pi.test.ts`
- [ ] `test/platform.test.ts`
- [ ] `test/preview.test.ts`
- [ ] `test/prompt-glyphs-column.test.ts`
- [ ] `test/prompt-jump.test.tsx`
- [ ] `test/questions.test.ts`
- [ ] `test/release-notes.test.ts`
- [ ] `test/relocate-sessions.test.ts`
- [ ] `test/reply-order.test.ts`
- [ ] `test/reserve.test.ts`
- [ ] `test/returned-line-open.test.tsx`
- [ ] `test/runner.test.ts`
- [ ] `test/self-build-junction.test.ts`
- [ ] `test/server.test.ts`
- [ ] `test/servers.test.ts`
- [ ] `test/slow-triage.test.ts`
- [ ] `test/sounds.test.ts`
- [ ] `test/step-text.test.ts`
- [ ] `test/team-fixes-ui.test.tsx`
- [ ] `test/team-fixes.test.ts`
- [ ] `test/team-round2-core.test.ts`
- [ ] `test/team-round2.test.ts`
- [ ] `test/team-round3-core.test.ts`
- [ ] `test/team-round3-ui.test.tsx`
- [ ] `test/team-round3.test.ts`
- [ ] `test/team-round4-core.test.ts`
- [ ] `test/team-round4.test.ts`
- [ ] `test/team-round5-core.test.ts`
- [ ] `test/team-round5.test.ts`
- [ ] `test/team-round6-core.test.ts`
- [ ] `test/team-save-errors-ui.test.tsx`
- [ ] `test/thread-opens-on-send.test.ts`
- [ ] `test/threads.test.ts`
- [ ] `test/triggers.test.ts`
- [ ] `test/turn-files.test.ts`
- [ ] `test/turn-images.test.ts`
- [ ] `test/updates-without-module.test.ts`
- [ ] `test/updates.test.ts`
- [ ] `test/waiting-mark.test.ts`
- [ ] `test/waiting.test.ts`
- [ ] `test/warm-start.test.ts`
- [ ] `test/web-address.test.ts`
- [ ] `test/web-shim.test.ts`
- [ ] `test/work-drawer-ui.test.tsx`
- [ ] `test/workspace-data.test.ts`
- [ ] `test/workspaces.test.ts`
