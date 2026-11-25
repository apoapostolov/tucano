# Fork modules not ported into 0.2.46

This tree is upstream v0.2.46 with TucanoNext identity only. The modules below exist on
`next` and are not in this build. Porting one means copying it from `origin/next` and re-wiring
its readers against the new base, then deleting its line here.

Source: `git diff --name-only v0.2.46 origin/next -- src/` minus 27 guide content files.

- src/core/account-folders.ts
- src/core/chrome-addon-pins.ts
- src/core/chrome-addons.ts
- src/core/hold.ts
- src/core/initiative-links.ts
- src/core/initiative-state.ts
- src/core/jev-fake.ts
- src/core/model-routing.ts
- src/core/quota-cache.ts
- src/core/quota-parsers.ts
- src/core/quotas.ts
- src/core/restart-recovery.ts
- src/core/retention-selection.ts
- src/core/retention.ts
- src/core/roster.ts
- src/core/wiki-handoff.ts
- src/core/wiki-resolver.ts
- src/main/notice.ts
- src/main/updater-module.ts
- src/renderer/notice.html
- src/renderer/src/components/AgentAddOns.tsx
- src/renderer/src/components/AsksPage.tsx
- src/renderer/src/components/Attachments.tsx
- src/renderer/src/components/QuotaStrip.tsx
- src/renderer/src/components/Routing.tsx
- src/renderer/src/components/SectionStrip.tsx
- src/renderer/src/connector-icon.ts
- src/renderer/src/notice/AreaPicker.tsx
- src/renderer/src/notice/Notice.tsx
- src/renderer/src/notice/feed.ts
- src/renderer/src/notice/main.tsx
- src/renderer/src/notice/notice.css
- src/renderer/src/reading-context.ts
- src/renderer/src/reading-line.ts
- src/shared/addons.ts
- src/shared/initiative.ts
- src/shared/notice.ts
- src/shared/quota-provider.ts
- src/shared/quota-view.ts
- src/shared/retention.ts
- src/shared/routing.ts
- src/shared/silent.ts
