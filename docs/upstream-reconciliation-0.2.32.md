# TucanoNext 0.2.32 reconciliation

Started 15 November 2026, following the explicit request to ingest 0.2.32 during the 0.2.31 delivery.
Upstream release/main: `d175567b0a12d885544d74c45792717a883287f5`.

- [x] Inherit the 0.2.32 release and confirm application source is unchanged from tested 0.2.31 plus entry points.
- [x] Preserve all fork identities, controls, fixes and the concurrent uncommitted copy work.
- [x] Pass nine focused identity, background-QA and launch-environment cases.
- [x] Complete the required full suite for the final versioned source.
- [x] Build, package, install and observe the new regular installed app.
- [x] Verify the installed version, archive hash, existing workspace and hidden feature flow.
- [x] Publish and verify `next-v0.2.32` and its assets on the fork.
- [x] Publish the reconciled integration and deliver the living audit documents to the primary checkout.

The application changes and conflict decisions are documented in
[the 0.2.31 record](upstream-reconciliation-0.2.31.md). The version-only upstream commit changes
package.json, package-lock.json and CHANGELOG.md; `git diff` confirms no src changes. The release
entry is retained without duplicating its existing English feature paragraph. The completed prior
version's suite passed 2,620 tests, 61 skipped and zero failed; the final 0.2.32 run also passes 2,620 tests, with 61 skipped and zero failed.
The 0.2.31 release remains available, but 0.2.32 is now the requested final delivery.

The living plan, exact-head open-PR queue and daily 09:00 Europe/Kyiv intake continue unchanged.
Public feature branches are updated for concrete repairs, not routinely rebased to latest main.

## Browser layout evidence

The freshly built 0.2.32 renderer passes `scripts/qa-browser-sectors.mjs` with headless Edge at
1280, 900 and 420 CSS pixels. The synthetic entry-point toggle reaches the core and comes back,
its default request target is the coordinator, both sector zones remain separate, Team attachments
are reachable, and the revised entry-point hint remains within two lines. The helper supports the
additional browser width without asking Electron to violate its 900px minimum. Evidence and fonts,
line counts and overflow measurements: `C:/tmp/tucano-0232-browser-sectors-final/report.json`.

Screenshot review rejected the first narrow capture: the sidebar was midway through its closing
transition and covered the left of the panel even though text geometry passed. The QA helper now
waits for finite CSS animations/transitions and explicitly asserts the mobile drawer is closed and
offscreen before measurement. Earlier narrow screenshots are not accepted layout evidence.

Final suite artifact: `C:/tmp/tucano-0232-full.json`. Application source stayed unchanged from
`c25531f` throughout the run; subsequent commits only maintain documentation and development QA.
No timeout or assertion was weakened. Nine focused identity/background/launch checks also pass.

## Installed 0.2.32

Built and installed from `d797e0c45a8b8c882274aad385b5e1c037caed8a` using the self-build helper. Installed archive:
**37,403,455 bytes**, SHA-256 `0ac1c82e4e3d59091aa69a8422e2a896133738d4d457bc4762dfb37ea1cdd4ef`; equal to the packaged archive, with the
new entry-point string present. The new normal executable is PID 43272, with visible, unfocused
window `w-1641484`. Installed hidden QA passes seven navigation/smoke checks, 18 Settings captures,
native 150% scaling, entry-point toggles, sector spacing, Team attachments and pause/resume. The
runtime and updater both report 0.2.32, and updates are off. Scratch instances were closed.

Evidence: `C:/tmp/tucano-0232-self-install.log`, `C:/tmp/tucano-0232-installed/report.json`,
`C:/tmp/tucano-0232-installed-identity.json` and `C:/tmp/tucano-0232-workspace-after.json`.

Read-only workspace verification preserves all 19 agent IDs. The initial 0.2.31 migration also
preserved the exact conversation/message IDs and counts. During the later live session, counts
changed from 26 conversations / 915 messages to 25 / 927. The original exact-equality check
therefore failed; its result is retained. No cause or missing-content claim can be established from
aggregate hashes, and complete conversation preservation is not claimed for this later interval.
The live database passes read-only quick_check. QA reports show synthetic writes targeted scratch
data, not this workspace. Keep this observation separate from a demonstrated migration defect.

## Release and source delivery

`next-v0.2.32` points to installer source `d797e0c45a8b8c882274aad385b5e1c037caed8a`.
Uploaded installer: 132,374,490 bytes; blockmap: 139,363 bytes. Both GitHub SHA-256 digests match
local files. A ranged GET returns HTTP 206 and bytes 0–31/132374490; release notes name the same
source. The original project's tags and releases remain untouched.

The primary checkout has concurrent uncommitted copy edits. The integration and installer were
therefore prepared in `C:/git-ext/tucano-0231`; no unrelated source was stashed, reset or committed.
The new workflow, audit plan, inventory, exact-head backlog and intake scripts are also delivered
on local next without changing those source edits. The complete reconciled code is published to
origin/next. Fast-forwarding the primary source checkout remains deferred until its copy work is
ready to reconcile; do not rebuild its older package in place and overwrite this verified install.
