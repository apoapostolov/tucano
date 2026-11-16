# TucanoNext improvements and current availability

Updated 16 November 2026. This catalogue links the current software to its implementation and
verification records. Checked entries mean the improvement is documented; full feature audits
remain separate in [the master plan](audit-plan.md). See also the repository [changelog](../CHANGELOG.md)
and [current deep-audit checkpoint](audit-deep-2026-11-16.md).

## Team and conversation improvements

- [x] **Secondary bosses, “Also answers to”.** A specialist keeps one primary boss and can also
  answer to other team leaders. The installed 0.2.34 preview contains this feature; published next
  `514c94be` does not. Preview source is `658693b8`;
  [upstream PR #467](https://github.com/eduwxyz/tucano/pull/467) is the feature's review home.
  Integration and repairs go directly into next. The mistakenly opened fork PR #5 is closed.
  Export/import, side-panel pointer interaction and rapid selection have reproduced defects;
  local repair `3eba2507` passes 50 focused tests but still needs porting and delivery.
- [x] **Wider steer input and aligned steer controls.** Recent fork
  [PR #2](https://github.com/apoapostolov/tucano/pull/2) and
  [PR #3](https://github.com/apoapostolov/tucano/pull/3) are merged into next. This is separate
  from secondary bosses. Focused current-source regression coverage passes.
- [x] **Dedicated prompt pencil column.** [Fork PR #4](https://github.com/apoapostolov/tucano/pull/4)
  is merged into next, retaining prompt layout while exposing the edit action. Combined steer,
  prompt-glyph and edit-prompt regressions pass nine tests.
- [x] **Reasoning reading and folding.** Three panel sizes, retained reading position, manual and
  completion folding compose in the integrated component. Bounded retention, disable/removal and
  prefix-trimming repairs have delivered evidence. Retry attempts and message/history deletion
  now have additional open cache findings; see [R-245](audit-245-delivery-2026-11-15.md) and
  [this checkpoint](audit-deep-2026-11-16.md).
- [x] **Pause and resume.** Abort/concurrent-waiter/listener repairs are integrated; fresh installed
  hidden pause checks pass. Real-provider and broader feature checks remain open.
  [Pause repair](audit-evening-2026-11-14.md).

## Knowledge, configuration and recovery

- [x] **Settings organization.** App, Workspace, Agents, Models, Knowledge and Connections retain
  canonical ownership and concise copy. New runtime and import controls use their existing homes.
  Fresh installed Settings and upgrade layout checks pass at 900/1280 pixels and 150% scaling.
  [Architecture](settings-architecture-plan.md), [copy guide](interface-copy.md).
- [x] **Skills origins and bounded comparisons.** Origin labels, categories/tags and complete
  comparison content remain available. The quadratic comparison allocation was repaired and
  delivered; proposal/history and keyboard checks are recorded in
  [the Skills packet](audit-skill-comparison-2026-11-15.md).
- [x] **Memory and artifacts.** Memory tabs/paging and the upstream artifact panel are retained
  alongside fork organization and controls. [0.2.33 reconciliation](upstream-reconciliation-0.2.33.md),
  [0.2.34 reconciliation](upstream-reconciliation-0.2.34.md).
- [x] **Wiki and access.** Private holds, handoff/orphan controls, resolver/dismissal behavior and
  member-source filtering coexist. Member/invite selected access can include sectors, agents and
  channels. Historical and in-flight provenance still require the full permission audit.
  [Reconciliation decisions](upstream-reconciliation-0.2.33.md).
- [x] **Restart and delegation recovery.** The isolated restart harness, local recovery defaults,
  Try with instructions and in-place dismissal are preserved. Delegation returns are partitioned
  by requester; newer source/work-thread identity and approval cards are integrated. These
  targeted checks do not certify every room-wide privacy or concurrent recovery path.
  [Revision batch](maintainer-revisions-2026-11-15.md), [0.2.34 decisions](upstream-reconciliation-0.2.34.md).

## Runtimes and import

- [x] **Endpoint runtime and Web execution.** Compatible endpoint setup, Web defaults and model
  choice refresh are integrated. Changing an endpoint address no longer implicitly reuses its
  saved key; explicit empty keys are respected. Installed setup layout is checked; real external
  endpoint operations are outside the fresh hidden run. [0.2.34 evidence](upstream-reconciliation-0.2.34.md).
- [x] **Restricted Hermes import.** Owner-only preview/import, restricted imported agents, disabled
  routines and memory confirmation are integrated under Workspace transfer. Fresh preview/error/
  empty-state layout checks pass; real profile import was not performed. Newer upstream SOUL/
  gateway changes at `9901b9e5` remain pending reconciliation.
- [x] **Native select polish.** Theme-specific carets and padding are retained; the installed
  light/dark upgrade checks pass. [0.2.34 evidence](upstream-reconciliation-0.2.34.md).

## Remaining verification

- [ ] Finish and deliver secondary-boss repairs; verify real team sharing, permissions, cycles,
  restart persistence, keyboard operation and installed layout.
- [ ] Repair reasoning cache retry and deletion boundaries, preserving prior reading/folding fixes.
- [ ] Review the three incoming upstream commits and complete compatibility integration.
- [ ] Complete full feature audits, whole-tree ownership and representative performance coverage.

This catalogue describes current and recently integrated improvements. The changelog and linked
historical records retain earlier additions; their presence is not a claim of fresh verification.
The installed preview, published next and downloadable fork release currently have different heads.
