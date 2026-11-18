# TucanoNext PR Protection Plan

This document plans how `apoapostolov/tucano:next` ingests upstream `eduwxyz/tucano`
while protecting personal features and open PR work. It is a planning artifact, not
a code change.

## Scope

- Source of truth for upstream intake: `eduwxyz/tucano` `main`.
- Integration branch: `apoapostolov/tucano` `next`.
- Personal features are the set of changes that exist in `next` but are not yet
  merged upstream, plus any open PRs that carry intended future behavior.

## Study snapshot (2026-11-17)

Source: `gh pr list --repo eduwxyz/tucano --author apoapostolov --state open`, 52 PRs;
merge state and dirty/clean from GitHub; chains from commit-subject overlap between
PR heads (fetched `refs/pull/*/head`) plus the stacked-on references in the titles.

- **52 open**, **41 dirty** (conflict with `main`, need rebase), **11 clean**, **2 drafts**
  (#259 wiki orphan links, #424 room sharing).
- Dirty does not mean wrong: every PR was cut from an older `main`, so almost all
  conflict on shared files as upstream advanced. Count is a rebase queue, not a defect list.

Chains protect as units; a later PR carries an earlier one's commits, so rebasing the
base without its dependants drops features from the stack. `D` = dirty, `C` = clean.

| Chain | PRs | Order / note |
| --- | --- | --- |
| Wiki | #258(D), #259(D/draft), #355(D), #268(D) | write tool -> orphan links; tool card + resolver on top |
| Send / steer / follow-up | #261(D), #332(D), #338(D), #288(D), #290(D) | send modes -> steer pill -> follow up; drawer + prompt-above-session |
| Steps UI | #245(D), #322(D), #327(C), #329(C), #298(C), #385(D) | thinking stream -> steps mode -> rail -> remember -> next steps -> ticks |
| Jev / classifiers (mega) | #279(D), #284(C), #333(C), #379(D), #383(D), #385(D), #446(D) | listen -> recommended -> routing pools -> classifiers -> six jobs; settings org on top |
| Reply recovery | #321(D), #391(C), #457(D), #411(D) | try again / resume / pause / shortcut stacked |
| Settings & copy | #410(D), #313(D), #395(D), #416(C), #435(D) | english copy, models thinking, 24h clock, grok account, initiative |
| History / session / quota | #249(D), #375(D), #432(D), #305(D) | clear history, delete session, retention, quotas |
| Images / connector | #336(D), #303(D), #353(D) | image menu, gallery, connector icon (#352 was the dropped duplicate) |
| Agent / boss / skill | #467(C), #274(D), #272(D), #319(D), #311(D), #512(C) | multi boss, team ups, mention, tuca skills, skill layout, skill hash |
| Standalone | #247(D), #248(D), #250(D), #334(D), #366(D), #417(D), #424(C/draft), #437(C), #451(D) | asks, reorder, approval card, routine silent, notifications, room sharing, db, guide |

#385 (next steps ticks) sits in both the Steps UI and the classifiers chains: it is the
crossover point, so a conflict there can break two stacks at once. The five clean PRs that
are chain bases (#284, #298, #333, #327, #329) are the most valuable to keep mergeable.

## PR inventory (from `gh pr list --author apoapostolov`)

### Merged PRs (already upstream)

These are safe to inherit during ingest. They should not be re-applied manually;
conflicts involving them are usually identity/import residue, not feature loss.

- #472 Extract Skills components without changing behavior or copy
- #471 Keep older retries within their original conversation context
- #468 fix: bound skill comparisons and preserve complete large versions
- #453 Give the delegation test's parked request 8 s
- #448 Fix the forwarder test's port race
- #445 Give the two core-boot tests the budget Windows already has
- #422 Skin the toast in the app's orange
- #419 Draw the wiki map in its first frame
- #412 A killed reply with real work offers Continue before Try again
- #402 Kill the app in the middle of a reply and check what it offers
- #397 Keep Memory bot tabs inside the bar
- #392 Stop reading a date that opens a sentence as a missing wiki page
- #386 Emit fake sign-in output before resolving its exit
- #377 Bring a hand-off answer back however it ends
- #373 Recheck wiki permissions and private pages during running replies
- #372 Run isolated UI checks without taking desktop focus
- #368 Update locked runtime packages past security advisories
- #367 Check wiki SSH key cleanup without requiring a shell on PATH
- #351 Read 0 as no monthly limit on the screens too
- #339 CI: cold Chrome first command budget and Mac service test budget
- #325 Stop a busy CI machine from reddening the core startup test
- #316 Stop calling a slow Chrome and a starved Windows test a failure
- #313 Settings ... (truncated upstream listing)

### Open PRs (features to protect)

These are the highest-risk items during ingest. Each must be checked for overlap
with upstream changes. If upstream implements equivalent behavior, do not overwrite
either side blindly; ask for approval before giving up the personal implementation.

- #512 Match Hermes stock-skill hashes on Windows
- #467 One agent can answer to more than one boss
- #457 Pause a reply before its next step, and resume it there
- #451 Write the guide's 24 pages in English too
- #446 Organize settings by task with accessible section navigation
- #437 Give the file its space back, and say whether it is sound
- #435 A bot can look after something for you between conversations
- #432 Keep history only as long as its period says
- #424 Control room visibility and agent read access
- #417 Notifications over every window
- #416 Let a Grok login be another account
- #411 Reply to a message with Ctrl/Cmd+L, stacked
- #410 Clarify English settings labels and shorten interface hints
- #395 Let the person read times as 24-hour or 12-hour
- #391 Resume interrupted replies after restart when enabled
- #385 Next steps open with every box clear
- #383 Classifiers on all six jobs
- #379 Expand Jev into a Classifiers section
- #366 Let a routine say nothing when it has nothing to report
- #355 Give the wiki a tool card with a level that writes pages
- #353 Give a connector the picture it wears
- #338 A finished reply goes on from where it stopped: Follow Up
- #336 Right-click a picture: save, copy, or put it back
- #334 Approval card: lead with action and target
- #333 Route each reply by what Jev reads: six pools
- #332 Steer a reply still working from the bottom of its steps
- #329 Remember a conversation's steps folded
- #327 Let the line beside a run's steps fold them
- #322 A reply's steps: all, latest few, or expandable line
- #321 A stopped reply gets a second way back
- #319 Let the Tuca set skills a bot follows
- #313 Settings ... (truncated upstream listing)

### Closed (not merged)

- #447 Give the OpenCode retry test the engine's own wait
- #408 Attach images/files when asking from Team page
- #401 A reply the app cut goes on with what it already did
- #343 Start a routed reply whose place was taken
- #341 Answer a routed message when place only marked busy
- #324 Run testing checkout on DeepSeek 4.1 Flash

## Dependency chains

These chains explain why certain PRs must land together or in order. Protect them
as units during ingest.

- Settings organization (#446) depends on classifier stack (#379, #383, #385)
  and routing pools (#333). These share `src/renderer/src/components/Pages.tsx`,
  `src/shared/routing.ts`, and settings structure files.
- Reply recovery chain: #412 (merged) + #402 (merged) + #321 + #391. These share
  `src/core/runs.ts` and reply status handling.
- Steps UI chain: #327 + #329 + #322 + #332. They share step rendering and
  folding state in `Pages.tsx` and `Conversation.tsx`.
- Wiki chain: #355 + #373 (merged) + #392 (merged). They share wiki access
  checks and tool surfaces.
- Connector visuals: #353 depends on connector icon/image handling in
  `ConnectorStore.tsx` and `db.ts`.
- Notifications: #417 depends on notice/settings surfaces and may conflict with
  upstream notification changes.

## Protection rules

1. Never silently drop an open PR's behavior during ingest.
2. If upstream implements equivalent behavior, stop and ask for approval before
   giving up the personal implementation.
3. If approval is given to defer to upstream, remove the personal
   implementation cleanly instead of overwriting or leaving dead code.
4. If a conflict is mechanical (imports, types, formatting), resolve by union and
   deduplicate.
5. If a conflict is semantic (same feature, different implementation), stop and
   request approval.
6. Record every such decision in `docs/pr-protection-decisions.md` with PR number,
   conflict location, and outcome.

## Approval triggers

Ask for approval when any of these occur:

- An upstream commit touches a file that an open PR also touches.
- Upstream adds a feature equivalent to an open PR.
- A personal settings key or route would be removed or renamed.
- A personal UI card would be replaced by an upstream version.
- A test that protects a personal feature would be deleted or weakened.
- The ingest would require dropping an open PR entirely.

## Fringe cases

- Upstream renames a file or moves a component: port the personal changes to the
  new location instead of reverting.
- Upstream changes a shared type that a personal feature extends: update both
  sides and keep the union.
- Upstream removes a setting that a personal feature depends on: stop and ask.
- A personal PR is closed upstream but still wanted in tucanonext: keep it
  locally and document it as fork-only.
- A personal PR is merged upstream in a different form: compare behavior, ask
  before replacing.

## Feature-conflict protocol (inform before triage)

When an upstream change competes with an open PR feature, do **not** triage it or touch
either side first. Stop and inform Apo in the brief with a recommendation, then act only
on his decision. A conflict is mechanical (imports, a new key in an allow-list, a new
column, a new RPC method, formatting) or a **feature conflict** (upstream implements the
same behaviour, replaces a personal UI card, or changes a personal data model). Mechanical
ones resolve by union under the acting procedure below. Feature conflicts use this protocol.

The recommendation follows Apo's stated rule:

- Opposing change is a **minor edit that merely happens to collide**, or a **UI decision**
  that conflicts with his better UI design: recommend **protecting his PR**. Keep the
  personal implementation, rebase the PR around the upstream edit.
- Opposing change is a **whole feature that is clearly the stronger implementation by size,
  reach and behaviour**: recommend **accepting it** and rebasing his PRs around it, dropping the
  overlapping personal implementation cleanly.

Every feature-conflict brief must name the PR number and chain, the upstream commit and
file/hunk, the size and nature of the opposing change, and the recommendation with the
reason it fits one branch of the rule. Apo then approves or gives his own decision. Record
the outcome in `docs/pr-protection-decisions.md`. Never decide silently, and never resolve
a feature conflict by union just because it touches a shared file.

Acting procedure:

1. Fetch and list upstream commits and open PRs.
2. For each conflicted file, identify which open PRs and chains touch it.
3. Resolve mechanical conflicts by union, deduplicate.
4. For a feature conflict, stop before triage: brief Apo with the recommendation and
   wait for his decision. Leave the branch untouched and no worktree behind.
5. On "protect": keep the personal implementation, rebase the PR around upstream.
   On "accept and rebase": defer to the stronger upstream feature, remove the personal
   implementation cleanly, rebase the chain in order.
6. Record the decision in `docs/pr-protection-decisions.md` with PR number, chain,
   conflict location, recommendation, decision and date.
7. Run typecheck, tests, build, install and release only after all conflicts are resolved
   or explicitly approved.

## When to ask for approval (summary)

- Any feature conflict involving an open PR, before any triage, with a recommendation.
- Any removal or replacement of a personal implementation, even if upstream looks better.
- Any change to settings keys, routes, or data models that affect personal features.
path: C:/git-ext/tucano/docs/pr-protection-plan.md