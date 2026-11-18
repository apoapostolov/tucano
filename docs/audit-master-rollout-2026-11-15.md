# Master audit plan rollout, 15 November 2026

Starting published integration: `85bb37f94cd8123468ee36fbd4d207d63ac28b90`.
Upstream main: `d175567b0a12d885544d74c45792717a883287f5` (0.2.32).
This delivery changes documentation and development-only intake tools; application source,
package metadata and the installed 0.2.32 build are unchanged.

## Scope and user correction

The old plan mixed current work with historical checklists and primarily covered Apo's open PRs.
The new master defines release/main intake, an all-state Apo queue, a generated open subset,
an other-contributor intake queue, 18 full-stack work packages, finding/proposal handling,
evidence criteria and separate progress denominators. Earlier evidence and the original 43-item
cohort are preserved in dedicated reference documents.

The user then narrowed priority: focus mainly on Apo's PRs and wait for approval for others.
The plan, full-stack roadmap, other-author queue, approval register and existing automation now
apply that boundary. Metadata capture and necessary authorized upgrade compatibility checks remain
allowed; no independent other-author PR audit or change was performed during this rollout.
Broad unrelated original-code campaigns also wait for approval. Approval persists within its
actual scope; a new revision is not a reason to ask again unless the planned action exceeds it.

## Intake and progress

Current captures contain 326 PRs: 90 Apo (62 open, 18 merged, 10 closed) and 236 other authors
(30 open, 188 merged, 18 closed). Other-author intake is metadata-only and explicitly says which
signals were not collected. Canonical completion starts at 0/90 and 0/236; the 62-open-Apo queue
reads completion from the canonical Apo file. The legacy cohort remains 6/43 targeted repairs,
0/43 full audits. All 18 full-stack packages remain incomplete. These figures are not a combined
software-completion score.

The release tracker confirms the already delivered 0.2.32 tag target and separates post-baseline
first-parent main-delta review from baseline whole-tree coverage. No post-baseline change exists
in this snapshot; that does not certify the original code. Explicit state records delivery source
and evidence, not a fabricated semantic-review cursor.

## Workflow repairs and verification

- Metadata intake now includes author and exact base SHA, with a separate all-author output.
- Queues preserve completion only at matching head/base; closed/merged items stay in all-state scope.
- Open-Apo completion is generated from the canonical queue rather than maintained twice.
- Patch caches check the PR identity before/after capture and hash the saved bytes. Verified unchanged
  entries are reused; a changed PR cannot silently supply a differently labeled patch.
- Release boxes require an explicitly recorded delivery matching the actual upstream tag target.
- Timestamped snapshots retain intake history. The maintained list-limit guard fails instead of
  silently claiming pagination coverage beyond its supported limit.

`node --test scripts/test-audit-workflow.mjs` passes seven checks, with no failures or skips.
Fixtures cover unchanged and revised head/base completion, owner/state filtering, canonical views,
legacy unknown-base completion, capture races, tampering/cache reuse, metadata disclosure and tag
retargeting. Live GitHub checks refreshed both inventories and the release tracker, and captured
then reused a verified #457 patch in a separate temporary output. Generated local links and the
master's canonical counts are checked before publication.

The existing automation `tucanonext-daily-intake-and-pr-audit` remains active at 09:00 Europe/Kyiv
in the same chat; its prompt was updated in place, with no second schedule.

## Delivery boundaries and next action

The primary checkout's concurrent copy-review source is preserved. Only the maintained guides,
queues and intake tools are committed there; the complete source integration remains published on
next while primary source fast-forward waits for that copy work. No application rebuild/reinstall
is required by the development-only exception in AGENTS.md. No original-project issue or PR is
opened for these fork-local operating tools.

Next bounded work is the Apo Skills/#311 comparison follow-up (#454), followed by the #245
reasoning/reading-position review and #355 provenance cases. Other-author independent packets stay
pending a concrete approved scope.
