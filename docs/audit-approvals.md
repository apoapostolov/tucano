# Audit approval register

Policy from the user's 15 November 2026 instruction: focus mainly on Apo's PRs and wait for
approval for others. Follow [the master plan](audit-plan.md). No independent other-contributor
review or change has been approved under this master-plan rollout.

## In scope without another approval

- Maintain the master plan and capture release/PR metadata, including other authors, for triage.
- Audit and repair Apo's PRs, including the #454 comparison follow-up within #311 Skills verification.
- Inspect original-code paths needed to verify those features and their interactions.
- Perform the compatibility/conflict checks necessary for authorized upstream version ingestion.
- Maintain the existing daily schedule and publish authorized fork documentation and deliveries.

## Requires explicit approval

- An independent in-depth audit of another contributor's or maintainer's PR.
- Changes, new repair PRs or improvement proposals arising from that independent work.
- A broader original-code audit campaign unrelated to the authorized Apo feature or upgrade scope.

Authorship of a proposed new PR does not bypass this gate: an unrelated original-code campaign
still needs approval.

Ask with a concrete bounded scope: PR/area, exact known head/base or range, the reason to inspect
it, intended review/change, expected effort and deliverables. Do not ask to approve an unbounded
list of all other PRs. Wait for an actual user decision before starting the dependent work.

## Granted scopes

None recorded for independent non-Apo work in this rollout. Record each actual approval here
with an ID, date, the user's decision, scope, allowed actions and limits. Reuse it while its scope
remains applicable; do not ask repeatedly just because time passed or an in-scope revision landed.
If a proposed action exceeds the approval, prepare the concrete expansion and ask first.

The other-contributor queue remains unreviewed until approved work meets the audit criteria.
Capturing metadata, fetching refs, integration ancestry and accepted upstream PRs are not approval
or evidence of a completed audit.
