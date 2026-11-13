# Maintaining Apo's Tucano PRs

This document is fork-local operating context. Upstream is `eduwxyz/tucano`; the publishing
target for every product fix is its `main` branch. The fork's `next` branch is a personal
integration and QA environment. Keep that context out of upstream reports.

## Inventory and review evidence

Run `node scripts/audit-prs.mjs --fetch --patches --report docs/pr-inventory.md` from this checkout. It queries all of
`apoapostolov`'s upstream PRs, including merged and closed ones, fetches current open heads,
and writes `.tucano-local/audit/inventory.md` and `inventory.json`. The default output is
ignored by Git; `--report` also updates the tracked inventory at the requested path.
`--output <directory>` chooses another destination. `--input <json>` replays
a previously collected `gh pr list` response without changing its metadata.

The script uses the authenticated GitHub CLI because the inventory is an executable local
maintenance workflow. It only reads GitHub and fetches Git objects; it never pushes, changes
a PR, opens an issue or touches application data. `--patches` caches each open PR's diff with
its head SHA in the filename. The files, descriptions and CI results remain evidence from
that snapshot, not a continuous monitor.

Keep semantic review records in `.tucano-local/audit/reviews.json`, keyed by PR number:

```json
{
  "355": {
    "head": "the exact reviewed commit SHA",
    "status": "reviewed; follow-up remains",
    "findings": ["Describe the observed behavior and its reproduction."],
    "validation": ["Record the commands, outcomes, platform and limitations."],
    "screenshots": ["Link captures from this implementation."],
    "remaining": ["List work that was not completed."]
  }
}
```

A record whose SHA differs from the current head is marked stale. Unreviewed PRs remain
explicitly unreviewed. Changed tests, screenshot URLs, GitHub mergeability and commit ancestry
are inventory signals; none establishes that the behavior works or is ready to publish.

## Review each feature independently

Use an isolated worktree from upstream `main` for a new upstream bug. For an existing feature,
start from its current PR head, bring in current upstream `main`, and inspect the resulting
diff against upstream. Push only to the corresponding feature branch after validation.
Avoid force pushes when an ordinary merge preserves review history.

Review the behavior from the user's action through renderer state, RPC validation and
permissions, persistence, execution, failure recovery and the resulting visible state. Test
permission changes during a run, restarts, concurrent work, cancellation, large histories,
empty states, keyboard operation and narrow windows where applicable. Feature expansion
must serve the feature's purpose and retain a focused review boundary.

For a renderer change, drive real DOM events in a regression test and inspect the built app.
Use scratch `TUCANO_DATA`, fake engines and a separate Electron profile for captures. The
released app and the daily driver's live database are outside the test environment. Publish
captures on a screenshot branch and reference immutable commit URLs in the upstream PR.

## Initial audit, 12 November 2026

The first snapshot found 55 authored PRs: 43 open, seven merged and five closed. The earlier
triage's counts were stale. Upstream `main` was `b436f4af311e31259e50fc466c4289e32fb51b3e`,
version 0.2.27. Six open heads were absent from the integration's ancestry: #247, #250, #258,
#259, #275 and #305. The asks, channels and quota work had corresponding integration
changes; the wiki handoff and orphan workflows were missing, and the sticky thread control
also needed restoring. Review the integration itself, not only merge commit subjects.

The wiki PRs had two incompatible write implementations. #258 used `write`; #355 used
`read_write` and supplied both append and passage-edit tools. The maintained stack now uses
the latter tools and access value: #355 → #258 → #259. The resolver remains alongside the
handoff controls. Other verified stacks are #261 → #332 → #338 and #327 → #329.

The audit reproduced private DM text becoming shared wiki content in #355. New writes now
carry their originating conversation, preserve private provenance, and hold a team's DM page
before notifying the renderer or scheduling Git synchronization. Regression tests cover
solo-to-team inheritance, new pages, appends, corrections, channel writes, restoration and
the real core's multi-user API. Historical writes without provenance cannot be safely
classified automatically; their privacy needs a separate review.

The sidebar pointer-capture repair was present locally but absent from #250. It has been
ported to that PR with DOM regression tests and a built-app click-and-drop check. Fresh
captures for #250, #258, #259 and #355 are on screenshot commit
`415d25a4b20480d0e371739c53aea3bf8d65d68f` in the fork.

[Upstream PR #367](https://github.com/eduwxyz/tucano/pull/367) fixes a standalone Windows
test failure and a cross-workspace cleanup race. Its full upstream-based Windows suite
passed: 1,562 tests, 59 skipped, zero failed. The first integration baseline had 2,052
passed, 65 skipped and the cleanup failure. Keep later results in the local audit report.

The dependency audit also found affected Electron, body-parser and fast-uri versions in
upstream's lockfile. The isolated dependency branch updates only these packages and
Electron's minimum safe version. Remaining moderate advisories require dependency-specific
review; automatic suggested downgrades are not an acceptable blanket fix.

Entanglement 1.0.1 reports existing file MI 0 for the large runner, wiki and wiki Git test
files. Its gate remains blocked for those edited files. The standalone cleanup change adds
four NLOC with unchanged summed CC and CogC; that does not make the file pass. The inventory
script's file MI is 20.95. Do not claim the entire audit or production preparation is complete:
most feature PRs still need an individual semantic review, upstream-platform validation and
load testing.
