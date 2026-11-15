# TucanoNext 0.2.32 reconciliation

Started 15 November 2026, following the explicit request to ingest 0.2.32 during the 0.2.31 delivery.
Upstream release/main: `d175567b0a12d885544d74c45792717a883287f5`.

- [x] Inherit the 0.2.32 release and confirm application source is unchanged from tested 0.2.31 plus entry points.
- [x] Preserve all fork identities, controls, fixes and the concurrent uncommitted copy work.
- [x] Pass nine focused identity, background-QA and launch-environment cases.
- [ ] Complete the required full suite for the final versioned source.
- [ ] Build, package, install and observe the new regular installed app.
- [ ] Verify the installed version, archive hash, existing workspace and hidden feature flow.
- [ ] Publish and verify `next-v0.2.32` and its assets on the fork.
- [ ] Publish the reconciled integration and deliver the living audit documents to the primary checkout.

The application changes and conflict decisions are documented in
[the 0.2.31 record](upstream-reconciliation-0.2.31.md). The version-only upstream commit changes
package.json, package-lock.json and CHANGELOG.md; `git diff` confirms no src changes. The release
entry is retained without duplicating its existing English feature paragraph. The completed prior
version's suite passed 2,620 tests, 61 skipped and zero failed; a new full run is underway for 0.2.32.
The 0.2.31 release remains available, but 0.2.32 is now the requested final delivery.

The living plan, exact-head open-PR queue and daily 09:00 Europe/Kyiv intake continue unchanged.
Public feature branches are updated for concrete repairs, not routinely rebased to latest main.

## Browser layout evidence

The freshly built 0.2.32 renderer passes `scripts/qa-browser-sectors.mjs` with headless Edge at
1280, 900 and 420 CSS pixels. The synthetic entry-point toggle reaches the core and comes back,
its default request target is the coordinator, both sector zones remain separate, Team attachments
are reachable, and the revised entry-point hint remains within two lines. The helper supports the
additional browser width without asking Electron to violate its 900px minimum. Evidence and fonts,
line counts and overflow measurements: `C:/tmp/tucano-0232-browser-sectors/report.json`.
