# TucanoNext 0.2.33 reconciliation

Started 15 November 2026. Requested ingestion of release 0.2.33, upstream/main
`9474545f0415f4bb2a439e1a7727912254b69972`, preserving Apo’s interface choices.
Starting local next `d6ea9cf9cf4c9211072870baaa6e9cf0513f8e78`; published next
`f75d3503877f8519e561e90626ea51a0ee780c2a`; origin/main
`c42d1f323a2927084d0cc06366160ea21aa0788b` is already contained.

## Delivery plan

- [x] Capture release, current refs, exact PR heads and discussions.
- [x] Mark seven additional Apo PRs merged upstream without marking their full audits complete.
- [x] Reconcile upstream against the local unpublished UI work in an isolated worktree.
- [x] Preserve Apo interface precedence explicitly in AGENTS.md.
- [ ] Complete combined source checks and rendered copy review.
- [ ] Verify the pushed integration in a fresh checkout.
- [ ] Build/package, install, freshly launch and check installed behavior.
- [ ] Publish the fork release after the required publishing approval.

## Access control placement and copy draft

Member access belongs to Workspace / `workspace-people`, beside roles and coverage.
This is an object-specific member/invite policy, not a global settings key. Persistence:
`people.access` and `invites.access`; owners/admins configure members and invites, members
can inspect their own access. Default: all agents/channels. Owners/admins retain full access;
Tuca remains visible. Sector selections include future members. Changes apply immediately;
no restart. Every server entry point must enforce the selection, including delegated work and
Wiki provenance. Restricted Wiki pages remain unavailable when any source is outside access.

New English draft, reviewed before implementation: “Sees everything”, “Selected access”,
“All agents and channels.”, “Select whole sectors or individual agents. New agents in selected
sectors are included.”, “No agents yet. Add agents to the team to select them.”, “No sectors
yet. Select agents individually.”, “Owners and admins always see everything. Tuca is visible
to everyone.” Privacy summary: “Excluded agents cannot receive requests for this member.”
and “Wiki pages with sources outside this access are also hidden.” Preserve the existing
approved Invite wording when upstream extracts it into its own component.

## Merge decisions

| Surface | Upstream difference | TucanoNext decision |
| --- | --- | --- |
| Skills #472/#468 | Accepted extraction and bounded comparisons overlap fork components | Retain fork files, categories/tags, runtime naming, full comparison content and approved copy. |
| Wiki #392/#478 | Narrowed dismissal reset and new source-based member visibility | Keep broader fork dismissal reset; add provenance filtering alongside private holds and handoff/orphan controls. |
| Recovery #402 | Updated restart harness | Keep production recovery defaults, Try with instructions and in-place dismissal; integrate isolated harness improvements only. |
| People #461 | New per-member/invite sectors/agents/channels policy | Adapt to canonical Workspace People section, preserve fork management controls and existing Invite copy; add enforcement to fork team-up and listening paths. |
| Answer-back #377/#479 | Combined returns may preserve only first requester identity and expose another requester’s task names | Process each requester’s ready returns and pending task summary separately; preserve existing single-requester execution contract. |
| Main/QA | Hidden QA guards and profiles overlap fork implementation | Preserve Next identity/ports, notification guards, minimized startup and all feature probes; include disabled screenshot animations and protected development profiles. |

Parent reproduced the #479 authorization-predicate failure on exact upstream/main with
`npx vitest run test/answer-audience-proof.test.ts` (expected false, received true).
This demonstrates the mixed-identity authorization gap, not an observed model disclosure.
Two regression cases verify separate requester/task groups; they mock follow-up execution.
The existing broader policy allowing a channel reply to use the requester’s own sources remains
unchanged and is not certified as a channel-wide privacy guarantee.

A clean auto-merge duplicated delegation column declarations; removed the duplicates while
retaining one SQL mapping. The combined QA check initially failed because Settings reloads erased
a renderer fixture function. This was a harness defect: seed comparisons after that reload.
The rerun passes all requested flows with hidden/unfocused windows and no page errors.

## Apo upstream dispositions

Seven additional PRs are MERGED in the refreshed canonical inventory (94 total: 53 open,
29 merged, 12 closed). These dispositions do not mark complete feature audits:

| PR | Merged head |
| --- | --- |
| #372 | `be0d865d4205da5b27b6ba6efc1fa851fb403dac` |
| #377 | `76715c454620aaa0e6a08b63cddbc6f6adf00861` |
| #392 | `49c3957f412b8f7f9ee578b7c481b441d29975be` |
| #402 | `02f03426a79df9a0872bce4f88bd8f7ed4ebbca0` |
| #468 | `82e9aaf6accab0fc0db5523d62746d26fe9ab715` |
| #471 | `dd9f86c31b1fa4b64f5be2a9eaba3b4a1b5be99b` |
| #472 | `e11417210356131e0253984652981257afbdebee` |


## Validation evidence

- `npm run typecheck` and `npm run check:settings`: passed (33 sections, 55 owned keys,
  58 settings writes; 14 placement tests).
- `npm run build`: passed with the reconciled source and reviewed English copy.
- `node scripts/e2e-kill-restart.mjs C:/tmp/tucano-0233-restart`: passed all 20 checks
  across four hidden launches, with no renderer errors.
- `node scripts/qa-background.mjs C:/tmp/tucano-0233-built-fixed --settings-overhaul
  --settings-copy --skill-origins --pause --skill-comparisons --upstream-artifact --sectors`:
  passed; report and screenshots are in that directory. Settings and Skills comparison
  screenshots retain the fork layout and full comparison content.
- `node scripts/qa-person-access.mjs C:/tmp/tucano-0233-person-access-verified`: passed.
  Four all/selected access captures at 1280 and 900 CSS pixels, native display scaling 150%,
  with expanded sectors and realistic long names. JSON records source, dirty state, fonts,
  available widths, character/line counts and overflow. Authored labels fit one line and hints
  two. User-provided agent names may occupy two lines. The privacy summary is allowed more
  than two lines so consequences and selected names remain visible; this fixture needs two.
  A 720-pixel native request is unsupported by the app minimum width, recorded in the report.
  Parent reviewed the Settings, Skills and access screenshots as well as measurements.

The initial full-suite run exposed three obsolete source-regex assertions in team-stress tests:
CRLF handling and the fork's existing form-based delegated-room composer. Updated those assertions
without changing production behavior; all 33 team-stress tests pass. A wiki-git Unicode case timed
out at 60 seconds under suite load. Its source and tests match upstream; all 19 tests pass unchanged
in isolation. The final full suite uses four workers to reduce host contention, with unchanged
assertions and timeouts. Final suite and installed evidence follow below when available.
