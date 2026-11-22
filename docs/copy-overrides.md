# Preserve reviewed English during integration

TucanoNext keeps its approved English in
[`scripts/data/english-copy-overrides.json`](../scripts/data/english-copy-overrides.json).
The registry travels with `next`, so a later upstream merge does not make the previous
editorial decisions disappear. The initial seed recorded 604 approved keys and 611 previous
English variants from committed copy reviews; later reviews extend that registry.

## After a merge and before pushing

```powershell
npm run check:copy:approved
npm run fix:copy
npm run check:copy:approved
git diff -- src
```

`check:copy:approved` reports known regressions and unfamiliar wording with file and line
references. `fix:copy` restores only explicitly recorded previous English variants. Both
commands write the detailed report to `.tucano-local/copy-overrides/report.json`. An unfamiliar variant
requires editorial review and produces a failing exit code; the tool does not assume it
means the same thing. Conflicting approvals stop application before any file is written.

The tool matches Portuguese source text within declared files and optional function contexts.
Line numbers can move freely. When a component moves, review the destination and update the
entry's `files` list; a short translation key shared by unrelated controls never authorizes
a repository-wide replacement. A changed Portuguese key requires a fresh ownership review.
The registry expresses TucanoNext decisions. An upstream feature branch may have different
navigation and scope; review those differences before porting its replacements.

Each replacement is validated against the parsed TypeScript/JSX syntax tree before writing.
Portuguese, surrounding code and interpolation expressions must remain unchanged. Entries
that explicitly permit reviewed English literals within interpolation still preserve the
expression's operators, identifiers and structure. Application uses current source offsets,
so context restrictions cannot be bypassed by matching another occurrence in the same file.

## Export the approved copy

`npm run export:copy` writes two files to `.tucano-local/strings` by default (override with
`--out DIR`, add `--bom` for Excel):

- `strings-processed.csv` has one row per registered string: the Portuguese source, the
  approved English, the files and contexts it belongs to, earlier variants, how many live
  occurrences it has, and whether the source still carries it. `status` is `live`, `drifted`
  or `absent`, so strings that only ever lived on an unmerged branch stay visible but marked.
- `strings-inventory.csv` has one row per `L()` pair in `src`, with the registry's approved
  text beside the live one. It is the list a translation file is built from, and the gap
  between reviewed and unreviewed strings is the count where `status` is `unreviewed`.

Neither file is committed: they are derived from the registry and the source, so regenerate
them after a review or a merge instead of editing them.

## The two copy checks on `next`

`next` carries two different checks and they answer different questions.

| Command | Question |
| --- | --- |
| `npm run check:copy` | Does any English string still carry Portuguese? A one-second source pass, also run by the install helper's typecheck |
| `npm run check:copy:approved` | Has reviewed English been replaced by older wording? The registry check described below |

## Review new or changed strings

Record the pre-integration SHA, then include it in the check:

```powershell
node scripts/maintain-english-copy.mjs check --base PRE_MERGE_SHA
node scripts/audit-copy-changes.mjs --base PRE_MERGE_SHA --output .tucano-local/copy-review.json
```

The first command also flags unregistered additions and changes. The audit produces
an editable inventory with exact source locations and old wording. Review every candidate,
mark `decision` as `retain` or `replace`, and supply `replacement` for replacements. Follow
the [copy guide](interface-copy.md), including screenshots and rendered measurements.
Retaining a string is also an editorial decision; do not mark the whole inventory approved
merely to satisfy a check.

After applying and checking the approved text, register the review:

```powershell
node scripts/apply-copy-review.mjs PATH_TO_REVIEW.json --write
node scripts/maintain-english-copy.mjs register --review PATH_TO_REVIEW.json
npm run check:copy:approved
npm run check:copy
npm run test:copy-overrides
```

Commit the review, registry, source changes and layout evidence together. Registration
requires the approved wording to be present in the actual source. It retains the prior
approved wording as a known variant. Use tracked review paths for durable provenance.
When the same Portuguese source in one file has different approved meanings, give it
distinct translation keys or explicitly scoped registry entries; registration refuses
to guess between them.

## Scope and checks

The registry automatically restores literal and template English arguments of `L(...)`,
including conditional English branches. The audit also reports raw JSX, selected text
attributes, English properties and error literals; those require manual editing and review.
Unregistered keys, renamed files and unrecognized source forms are not protected by the
ordinary check. Use `--base` during ingestion to expose additions instead of claiming that
the existing registry covers a new feature. Ten ambiguous historical keys and eleven retired
keys were deliberately excluded from the initial seed rather than guessed.

The `Approved English` workflow runs the safety tests and registry check on every push to
`next`, and can also be dispatched manually. The registry now passes on the integration
branch. The build/install helper runs the registry check before typechecking or packaging,
including when `--no-typecheck` is supplied. A regression or unfamiliar variant stops it.

A push alone cannot change strings; merges, conflict resolution
and later source edits can. Run the check before pushing and again in the verified remote
head. This tool preserves editorial decisions; it does not replace grammar, meaning or
rendered layout review.

`npm run test:copy-overrides` uses a throwaway Git repository. It checks regression detection,
restoration, repeated application, unfamiliar text, conflicting approvals, file ownership,
explicit move aliases, registration and interpolation protection without touching app data.
