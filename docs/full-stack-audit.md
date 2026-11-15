# Full-stack Tucano audit coverage

This is the canonical checklist for the original code and cross-feature behavior. Baseline:
`d175567b0a12d885544d74c45792717a883287f5`. **0/18 packages complete.** The scope includes code
from the maintainer, Apo and every other contributor. Assignment and intake do not complete a box.
Follow [the master plan](audit-plan.md) for priorities, findings and delivery. Apo-related checks
are the primary work; independent other-contributor or unrelated original-code audits require
[explicit approval](audit-approvals.md). This checklist is a roadmap, not blanket authorization.

For each package record the reviewed files/range, relevant PRs, invariants, scenarios, measurements,
platforms, evidence, findings and remaining gaps in its dated packet. Map every maintained source,
configuration, script and test module to a primary package before claiming whole-tree coverage;
shared flows can have secondary packages. Generated products and third-party dependency source are
excluded from authored-code coverage but remain part of dependency/runtime risk review.

## Architecture and data foundations

- [ ] **FS-01 — Whole-tree inventory and architecture.** Map main/preload/renderer/core/shared boundaries, module ownership, entry points, cross-module cycles and existing maintainability hotspots. Reconcile the file map against the actual tree; identify orphaned/dead paths and duplicated contracts. Record baseline source/metrics and design debt without hiding low-quality edited files behind averages.
- [ ] **FS-02 — Database, migrations and recovery.** Review schema/row mappings, transactions, WAL/locks, concurrent writes and bounded queries in `src/core/db.ts` and callers. Exercise upgrades from representative old schemas, interrupted migrations, failure rollback, retention/cascade interactions and backup/restore. Restore only into throwaway data; prove recovered data and behavior, not merely that an archive exists.
- [ ] **FS-03 — Identity, roles and data isolation.** Trace ownership, member/admin capabilities, workspace boundaries, DMs and room visibility/agent access. Exercise cross-user IDs, stale permissions, access revoked during active work, exports and indirect leakage through Wiki, Memory, tools and notifications. No privacy completion while an in-flight provenance path is unverified.
- [ ] **FS-04 — RPC and API contracts.** Review `src/shared/rpc*`, preload bridges, core handlers and server/browser endpoints. Verify input shapes, size limits, authorization, unknown methods, malformed/stale objects, idempotency, races and error handling. Renderer hiding is not authorization; successful persistence is not proof of a safe contract.

## Agent execution and model/tool boundaries

- [ ] **FS-05 — Scheduling, queues and cancellation.** Audit runs, slot reservations, concurrent sends, queue order, steer/interrupt/follow-up, holds, stop/delete/wipe and disposal. Exercise stop before/after each asynchronous boundary, parallel waiters, starvation, retries, retained listeners and work returning after deletion. Prove bounded active work and cleanup of timers/processes/resources.
- [ ] **FS-06 — Startup, shutdown and restart recovery.** Review core/app lifecycle, single-instance locks, crash/quit behavior, disconnected renderers and pending work. Exercise killed/paused/approval-waiting runs, partial outputs and restart at each durable boundary. Prevent replay of side effects and distinguish user stop from recoverable interruption.
- [ ] **FS-07 — Engine adapters, sessions and credentials.** Review every supported harness, CLI discovery, login/account scoping, model/effort mapping, streaming/parser behavior, subprocess lifetime and Windows/macOS/Linux differences. Exercise empty/partial/malformed output, missing executables, bad credentials, provider errors and cancellation. Fake-engine tests establish orchestration only; document remaining real-provider cases.
- [ ] **FS-08 — Routing, delegation and sectors.** Review classifier tiers/pools, fallback chains, mentions/listening, team-ups, sector heads/entry points and delegation return paths. Exercise maximum depth, cycles, head changes, archived agents, queued requests, parked approvals/questions, duplicate delivery and dead slots. Keep private-DM provenance and independent parallel replies intact.
- [ ] **FS-09 — Tools, autonomy and approvals.** Trace tool schemas through policy and execution, per-agent permissions and high-risk approval handling. Exercise approval denied/expired/revoked mid-run, duplicate decisions, tool errors and restart. Review file/computer/browser access, secrets in arguments/results and path boundaries. An agent instruction must not replace backend enforcement.
- [ ] **FS-10 — Proactive behavior and agent instructions.** Review Tuca proposals, routines, silent runs, initiatives, commitments, deduplication and model-facing context. Exercise permission scope, quiet/active hours, repeated no-progress work, daily limits, cancellation, restart and unintended message/notification delivery. Verify language/context contracts; distinguish deterministic safeguards from unproven model compliance.

## Knowledge, files and connected environments

- [ ] **FS-11 — Memory, Wiki and provenance.** Review reads/writes, scopes, indexing/search/review, Git persistence, handoffs/resolvers and historical records. Exercise private-source propagation, cross-room access, permission changes during a pass, interrupted writes, large libraries and stale finding IDs. Validate historical and in-flight privacy separately from future tool instructions.
- [ ] **FS-12 — Skills, files, attachments and artifacts.** Review imports, folders, harness origin labels, versions/diffs, assignment, text extraction, images and exports. Exercise empty/binary/malformed/oversized inputs, content/path limits, large comparisons, concurrent additions, partial uploads and persistence after reload/restart. Track peak memory and renderer responsiveness, including #454.
- [ ] **FS-13 — Connectors, networking and remote use.** Review accounts/scopes, tokens, Composio approval, webhook/Git ports, server pairing, browser authentication and remote-desktop contracts. Exercise reconnect/offline/timeout, rate limits, request bounds, SSRF/path/input boundaries, expired credentials and multi-account isolation. Separate local app update authority from connected-server authority.
- [ ] **FS-14 — Settings and workspace configuration.** Review canonical ownership, defaults, personal/global/object scopes, permissions and persistence. Exercise migrations, legacy links, import/export, duplicate/restore/delete, dependent controls and restart semantics. Retain the union of compatible feature controls and verify the canonical entry point after integrations.

## Product experience and production evidence

- [ ] **FS-15 — Renderer architecture and streaming performance.** Review store subscriptions, component boundaries, scrolling/reading position, folding, attachments, large histories and rerender/allocation costs. Benchmark idle/streaming/long-session behavior, memory leaks, layout thrash and bounded diff/search work. Exercise interacting features together rather than only isolated happy paths.
- [ ] **FS-16 — Usability, accessibility and interface quality.** Review complete user journeys, discoverability, keyboard/focus, screen-reader names, contrast, reduced motion, empty/error/disabled states and copy/localization. Inspect built UI at 900/1280 and supported browser widths, plus installed native scaling. Save source-keyed screenshots/measurements and inspect occlusion/transitions, not geometry alone.
- [ ] **FS-17 — Reliability, observability and heavy use.** Define small/typical/large synthetic workloads from observed use before setting SLOs. Measure startup, first interaction, stream latency, queue wait, database/index growth, CPU/memory and long-session resource retention. Exercise network/disk/provider failures and recovery. Review logs/metrics for useful diagnostics without secrets; record reproducible host effects instead of declaring tests flaky.
- [ ] **FS-18 — Tests, dependencies, packaging and delivery.** Review test boundaries and meaningful coverage, race fixtures, CI behavior, skipped platforms/providers, locked dependencies/advisories and license/runtime cost. Verify package contents, executable identity, updater isolation, unsigned-installer disclosures, whisper assets, installation/launch and downloaded asset digests. Assess releases on actual pushed source, not uncommitted worktrees or stale binaries.

## First packets

- [ ] FS-01: enumerate maintained files and assign primary ownership across all 18 packages; list unassigned files explicitly.
- [ ] FS-12/15: revalidate #454 at current main, establish representative Electron impact and prepare a bounded comparison algorithm with meaningful regression cases.
- [ ] FS-03/11: complete #355's active-run permission/provenance cases.
- [ ] FS-08/14/16: record the next proposed independent review of sectors/entry points and browser attachments for approval; keep necessary upgrade compatibility checks within the authorized upgrade scope.
- [ ] FS-05/17: establish queue/cancellation load fixtures with deterministic gates instead of ordering based only on wall-clock delays.

The five first packets above are steps inside packages, not five extra completed units. Reopen
specific affected scenarios after relevant changes. The historic 2,620-pass suite and existing
maintainability findings are useful starting evidence; they do not complete these packages.
