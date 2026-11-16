# TucanoNext 0.2.34 reconciliation

Started 16 November 2026 after the request to install the latest build immediately and make live
installation part of daily intake. Starting next: `d1722576d4010d81f89d26d41191058c62db1544`.
Upstream release: `ab1b9d0f`; included main target: `15370a0b41f54aec11d542bc2114d6acb9588535`.
Fork main `c42d1f323a2927084d0cc06366160ea21aa0788b` is already contained.

## Delivery checklist

- [x] Inspect current refs, capture incoming PR heads and delegate bounded compatibility reviews.
- [x] Resolve overlaps while preserving Apo interface choices, access checks and Next isolation.
- [x] Reproduce endpoint credential scoping with synthetic loopback tests and verify the repair.
- [x] Pass typecheck, Settings placement and focused delegation/endpoint tests.
- [x] Pass final combined suite and built rendered checks.
- [ ] Verify pushed source in a fresh checkout.
- [ ] Build/package, install, freshly launch and verify the installed application.
- [ ] Record installed source and archive identity; push completed delivery evidence.

The daily automation remains active at 09:00 Europe/Kyiv. Its prompt and the master checklist now
require installation of the latest validated integration when application code changes, followed
by fresh background launch, installed behavior checks and archive/source identity verification.
Unchanged application bytes require verification rather than a needless reinstall. Intake alone
cannot close a daily run whose application delivery is pending.

## Compatibility decisions

| Incoming change | Combined behavior |
| --- | --- |
| #477 native select caret | Adopt theme-specific SVG caret and padding; retain existing surrounding styles. |
| #275 thread control | Preserve existing richer thread controls, rail geometry and copy. |
| #489 outside-workspace approval | Keep current approval pending-state controls and wording; retain permission precedence and explicit allow behavior. |
| #482 site guides | Ingest site-only upstream content and analytics/privacy disclosures; no site deployment. |
| #397 Memory tabs | Preserve integrated Memory organization and copy. |
| #488 delegated thread ownership | Add handed-run identity, source/work threads, approval cards and silent approvals. Preserve requester-partitioned returns, queue/steer/parallel controls and recovery. Filter continuation/history by requester and reject another request's marked reply. |
| #490 endpoint/Web | Add compatible endpoint engine and Web execution. Preserve default Web semantics (`web !== false`) and refresh model choices when model identity changes with the same count. |
| #492 endpoint setup | Retain refusal of unsupported installation/login for the endpoint runtime. |
| #493 Hermes import | Owner-only preview/import, restricted imported agents, disabled routines and memory confirmation. Keep canonical Workspace transfer placement and reviewed concise English. |

Endpoint setup belongs to Models / Runtimes; its settings ownership is registered alongside
`harnesses`. Hermes remains Workspace / Import and export. The placement document records
scope, access, defaults, persistence, restart behavior and credential consequences.

The approval merge initially retained an obsolete `parked` return path with a deleted helper.
Typecheck and two delegation tests caught it. The code was wrong: remove that approval wake
path while preserving approval cards, partial replies and explicit user-pause behavior.
The guide page reached 601 words; the existing size invariant was correct. Shortening redundant
Portuguese wording brings it to 599 without removing instructions.

## Parent reproduction and checks

- `npm ci`: exit 0; this packaging worktree has its own real dependency directory.
- `npm run typecheck`: passed after resolving approval flow and exhaustive engine fixtures.
- `npm run check:settings`: passed; 33 sections, 56 owned keys, 58 checked writes, 14 tests.
- `npx vitest run test/delegations.test.ts test/team-fixes.test.ts`: 56 passed.
- `npx vitest run test/endpoint-key-scope.test.ts test/endpoint-default-web.test.ts test/endpoint-model-cache.test.tsx`: 8 passed.
- Hermes/import/roles focused run: 70 tests passed across five files.
- Parent reran the key-scope test against a disposable control restoring only the exact upstream
  `probeEndpoint` and `setEndpoint` method bodies: three failures, one pass. All requests used
  loopback and synthetic keys. The tests are correct; address changes reused saved credentials.
  The repair limits implicit reuse to the same normalized address, respects explicit empty keys,
  and clears an omitted saved key when the address changes. No real credential was read.
- First full run: 2,753 passed, 61 skipped, three failures (two obsolete approval paths, one guide
  size). Focused reruns pass after code/content repair; final combined run remains pending.
- First built background run passed Settings, Skills, pause and artifact checks, then failed
  because the new QA selector opened a DM instead of the agent profile. This is a harness error;
  correct its target and rerun. Hidden/unfocused guards remained enforced.

## Coverage limits

These are necessary ingestion compatibility checks, not completed independent contributor audits.
All full feature audit counts stay open. Endpoint probe/save and Hermes mutations are covered by
isolated core tests; the rendered harness uses only synthetic profiles and does not import them.
Real external endpoints, provider accounts, real Hermes profiles, site deployment and live
analytics are outside this delivery check. The released Tucano installation and live database
remain untouched by test fixtures.

Maintainability is not certified. The fixed Entanglement baseline at starting next has 145 red
files; the first combined snapshot has 150, including newly ingested upstream endpoint/import/site
modules. The hard MI gate is blocked, with both inherited and incoming upstream debt; it is not
an unchanged-debt pass. Broad refactoring of these upstream features is outside this installation
request and requires a separate bounded audit. Keep the full per-file comparison and growth
record alongside the final evidence rather than treating successful compilation as a quality
certificate.

Final combined application suite: `npm test` passed **2,756 tests**, 61 skipped, zero failures
(308 passed files, four skipped). Built upgrade QA passed all 12 layout measurements at
900/1280 CSS pixels and 150% scaling, including light/dark native selects, endpoint setup,
Hermes error, preview and empty selection. Parent inspected the 900px endpoint and Hermes
screenshots. All measured copy fits; no wrapping exception was needed. The harness corrections
were target scoping and accepting the browser's canonical `14px auto` background size.
