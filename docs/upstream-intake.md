# Upstream version and commit intake

Captured 2026-11-15T21:42:50.442Z. Main: `9474545f0415f4bb2a439e1a7727912254b69972`; integration: `9474545f0415f4bb2a439e1a7727912254b69972`.

Release boxes mean verified integration, installation and release evidence recorded in audit-state.json,
not a complete audit of the release code. The baseline whole-tree audit remains separate.

## Published versions from the delivery baseline

- [x] [v0.2.32](https://github.com/eduwxyz/tucano/releases/tag/v0.2.32) — published; target `d175567b0a12d885544d74c45792717a883287f5`; [delivery evidence](upstream-reconciliation-0.2.32.md).
- [ ] [v0.2.33](https://github.com/eduwxyz/tucano/releases/tag/v0.2.33) — published; target `9474545f0415f4bb2a439e1a7727912254b69972`; intake/delivery pending.

## Main changes after the baseline

These first-parent commits are the upstream integration events. Review the linked PR and its full
commit range too. Checked means semantic delta review recorded in audit-state.json; ancestry alone
does not check a box. Baseline code is covered by the full-stack work packages, not this delta list.

- [x] [6111849f8d8b](https://github.com/eduwxyz/tucano/commit/6111849f8d8b6fa844303cc0ac1f9d50c8afeeef) Give the delegation test's parked request 8 s, so it is still at it when Clara's answer lands (#453); integrated: yes.
- [x] [84c7252c5d1e](https://github.com/eduwxyz/tucano/commit/84c7252c5d1ec257387422a8fb90567d9449e0a7) Fix the forwarder test's port race, which fails on the macOS runner (#448); integrated: yes.
- [x] [37babafd2ef0](https://github.com/eduwxyz/tucano/commit/37babafd2ef0b9db6ed78dde392462014d6ac8bb) Give the two core-boot tests the budget Windows already has (#445); integrated: yes.
- [x] [8c5c5c2297c7](https://github.com/eduwxyz/tucano/commit/8c5c5c2297c7ce0342ee9bf4952086c9faaeae89) Let a reply the app cut go on with what it already did (#412); integrated: yes.
- [x] [e2a2dea425ae](https://github.com/eduwxyz/tucano/commit/e2a2dea425ae4076898203ee761c50154ac17eb8) Merge pull request #429 from stefanosandes/fix/limit-notice-alignment; integrated: yes.
- [x] [26ae13da8482](https://github.com/eduwxyz/tucano/commit/26ae13da848261fc25e2ca80847494b51a8aa11b) Merge pull request #388 from stefanosandes/fix/182-reveal-artifact; integrated: yes.
- [x] [3e8162ebbb8c](https://github.com/eduwxyz/tucano/commit/3e8162ebbb8c1d432d6973cedde7444a21910f4f) Merge pull request #400 from stefanosandes/fix/agent-card-closes-on-autoscroll; integrated: yes.
- [x] [abf597a1304b](https://github.com/eduwxyz/tucano/commit/abf597a1304b1a5a996006ee58cbe892c88dc704) Merge pull request #471 from apoapostolov/fix/retry-history-window; integrated: yes.
- [x] [ea2a3a7faf19](https://github.com/eduwxyz/tucano/commit/ea2a3a7faf19431a04f6d498ef8bc2973f8e06c0) Merge pull request #468 from apoapostolov/fix/bounded-skill-comparisons; integrated: yes.
- [x] [d88a53571cde](https://github.com/eduwxyz/tucano/commit/d88a53571cdec1ba8c75746260576460c15bd30b) Merge pull request #392 from apoapostolov/feat/wiki-name-stoplist; integrated: yes.
- [x] [32468eb78eaa](https://github.com/eduwxyz/tucano/commit/32468eb78eaad169947147bfde8d3e0c1c82b5f3) Merge pull request #377 from apoapostolov/fix/answer-back; integrated: yes.
- [x] [1a8b82073adf](https://github.com/eduwxyz/tucano/commit/1a8b82073adf63a134f572feeb364ac6dd2e1269) People: choose which sectors, agents and channels each member sees (#461); integrated: yes.
- [x] [6a7153994b7b](https://github.com/eduwxyz/tucano/commit/6a7153994b7b98488402df206e5a8f4fdc4da853) Run an answer back for whoever asked, within what they all see (#479); integrated: yes.
- [x] [b76f9d8d28ce](https://github.com/eduwxyz/tucano/commit/b76f9d8d28cecff8ca4a3319168ae7f00c1ab49f) Keep a restricted member's wiki to what they see (#478); integrated: yes.
- [x] [16d14991ed01](https://github.com/eduwxyz/tucano/commit/16d14991ed010c4b9ff4b68a210fdf3b1cef9ce9) Extract Skills components without changing behavior or copy (#472); integrated: yes.
- [x] [347146dcf4ca](https://github.com/eduwxyz/tucano/commit/347146dcf4ca15ec40faf32df45b90383254a687) Run isolated UI checks without taking desktop focus (#372); integrated: yes.
- [x] [5df1feb783fe](https://github.com/eduwxyz/tucano/commit/5df1feb783fe9b2f1afc674369db91abf7a5bbf0) Kill the app in the middle of a reply and check what it offers afterwards (#402); integrated: yes.
- [x] [54f92fe5e6e4](https://github.com/eduwxyz/tucano/commit/54f92fe5e6e430830623745e26e5d6b989602496) Thank apoapostolov for the background checks and the Skills split; integrated: yes.
- [x] [9474545f0415](https://github.com/eduwxyz/tucano/commit/9474545f0415f4bb2a439e1a7727912254b69972) Release 0.2.33; integrated: yes.
