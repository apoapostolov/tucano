# 0.2.35 maintainability checkpoint

Entanglement 1.0.1 repository analysis compared starting next `b6a3461f` with the combined
0.2.35 application tree `db2ad2aa`. Later next merges do not change supported application source.

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| nloc | 140798 | 142264 | 1466 |
| cc | 46078 | 46593 | 515 |
| cogc | 30261 | 30618 | 357 |

The edited-file MI gate **fails**; this is not a clean maintainability verdict. Fifteen
edited files remain red, including existing core/renderer modules, Hermes importer and tests.
The release intake and secondary-boss preview preserve this debt; broad modularization remains
in the full-stack audit queue. Functional build/test results do not resolve that gate.

Red edited files:

- `site/build.mjs`
- `site/index.html`
- `src/core/db.ts`
- `src/core/delegations.ts`
- `src/core/hermes-import.ts`
- `src/core/index.ts`
- `src/core/team.ts`
- `src/renderer/src/components/OrgChart.tsx`
- `src/renderer/src/components/Pages.tsx`
- `src/renderer/src/components/Select.tsx`
- `src/renderer/src/styles.css`
- `src/shared/org.ts`
- `src/shared/types.ts`
- `test/hermes-import.test.ts`
- `test/org-chart-ui.test.tsx`

Raw snapshots and comparison are local evidence at `C:/tmp/tucano-0235-baseline.json`,
`C:/tmp/tucano-0235-final-metrics.json` and `C:/tmp/tucano-0235-metric-comparison.txt`.
The comparison includes four added supported files and 1466 additional lines of code.
New regression tests and imported secondary-boss/Hermes functionality account for the growth.
