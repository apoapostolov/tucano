# Upstream version and commit intake

Captured 2026-11-15T10:03:06.880Z. Main: `3e8162ebbb8c1d432d6973cedde7444a21910f4f`; integration: `7dce2af88ef165b56caac2ee692b68ebe009efb5`.

Release boxes mean verified integration, installation and release evidence recorded in audit-state.json,
not a complete audit of the release code. The baseline whole-tree audit remains separate.

## Published versions from the delivery baseline

- [x] [v0.2.32](https://github.com/eduwxyz/tucano/releases/tag/v0.2.32) — published; target `d175567b0a12d885544d74c45792717a883287f5`; [delivery evidence](upstream-reconciliation-0.2.32.md).

## Main changes after the baseline

These first-parent commits are the upstream integration events. Review the linked PR and its full
commit range too. Checked means semantic delta review recorded in audit-state.json; ancestry alone
does not check a box. Baseline code is covered by the full-stack work packages, not this delta list.

- [ ] [6111849f8d8b](https://github.com/eduwxyz/tucano/commit/6111849f8d8b6fa844303cc0ac1f9d50c8afeeef) Give the delegation test's parked request 8 s, so it is still at it when Clara's answer lands (#453); integrated: no.
- [ ] [84c7252c5d1e](https://github.com/eduwxyz/tucano/commit/84c7252c5d1ec257387422a8fb90567d9449e0a7) Fix the forwarder test's port race, which fails on the macOS runner (#448); integrated: no.
- [ ] [37babafd2ef0](https://github.com/eduwxyz/tucano/commit/37babafd2ef0b9db6ed78dde392462014d6ac8bb) Give the two core-boot tests the budget Windows already has (#445); integrated: no.
- [ ] [8c5c5c2297c7](https://github.com/eduwxyz/tucano/commit/8c5c5c2297c7ce0342ee9bf4952086c9faaeae89) Let a reply the app cut go on with what it already did (#412); integrated: no.
- [ ] [e2a2dea425ae](https://github.com/eduwxyz/tucano/commit/e2a2dea425ae4076898203ee761c50154ac17eb8) Merge pull request #429 from stefanosandes/fix/limit-notice-alignment; integrated: no.
- [ ] [26ae13da8482](https://github.com/eduwxyz/tucano/commit/26ae13da848261fc25e2ca80847494b51a8aa11b) Merge pull request #388 from stefanosandes/fix/182-reveal-artifact; integrated: no.
- [ ] [3e8162ebbb8c](https://github.com/eduwxyz/tucano/commit/3e8162ebbb8c1d432d6973cedde7444a21910f4f) Merge pull request #400 from stefanosandes/fix/agent-card-closes-on-autoscroll; integrated: no.
