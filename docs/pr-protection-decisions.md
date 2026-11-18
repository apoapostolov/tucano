# PR protection decisions

Every feature conflict between an upstream change and an open `apoapostolov/tucano` PR
is logged here before triage. The recommendation goes to Apo first; he approves or gives
his own decision. See `docs/pr-protection-plan.md`, "Feature-conflict protocol".

Fields: date, PR number and chain, conflict location, opposing change, recommendation,
Apo's decision, outcome.

## 2026-11-18: upstream v0.2.37 (merge base `86b785dc`, head `4522704e`)

Eight commits, 78 files. Base study (2026-11-17) found upstream quiet (0 commits), so these
are the first logged conflicts. Decision protocol followed: brief with recommendation,
Apo decided, record here before triage.

| # | PR / chain | Conflict surface | Opposing upstream change | Apo's decision | Outcome |
| --- | --- | --- | --- | --- | --- |
| 1 | #366, routine report chain | `Routines.tsx`, `routines-view.ts`, `routine-runs.ts`, `routine-news.ts`, `styles.css` | #535 whole Routines page rebuild | Accept his improvements; identify where my routine features live with his changes | pending ingest |
| 2 | #446, #410, #395, #385, #379/#383 (settings and classifier chains) | `Pages.tsx`, settings structure | #535 team board rewrite of shared settings/UI | Protect my changes around his additions; place any new upstream settings using my logical distribution and navigation | pending ingest; matrix hardened into `tucano-next-daily-ingest/references/ingest-decision-matrix.md` |
| 3 | #416, Grok account (settings & copy chain) | `src/core/engines/antigravity.ts`, account surfaces | #538 Antigravity second account | Implement; keep both account mechanisms | pending ingest |
| 4 | new feature, no open PR | `src/core/feedback.ts`, `Feedback.tsx`, `site/feedback.js`, migration 0003 | #534 feedback and surveys | Implement | pending ingest |
| 5 | #537 Tuca fix | `src/core/tuca.ts`, `Tuca.tsx` | second-agent card fix | Implement; protect my changes where possible | pending ingest; rule hardened into the ingest decision matrix |

The standing protect-by-default rule and the settings placement matrix now live in
`tucano-next-daily-ingest/references/ingest-decision-matrix.md` and are linked from
`tucano-next-dev/references/settings-placement.md`.
