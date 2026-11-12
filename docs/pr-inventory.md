# Tucano PR inventory

Captured 2026-11-12T01:07:17.114Z. Upstream: [eduwxyz/tucano](https://github.com/eduwxyz/tucano); fork: [apoapostolov/tucano](https://github.com/apoapostolov/tucano).

57 total: 45 open, 7 merged, 5 closed.

Upstream main: `b436f4af311e31259e50fc466c4289e32fb51b3e`. Daily driver next: `4ca40f1c7cb92372eb7211a0839f6c20a0884eba`. Upstream main is contained: yes.

Containment compares commit ancestry. A rebased or independently integrated feature may be present without its current PR head. Screenshot links and changed tests are inventory signals; they do not establish quality or passing tests. GitHub mergeability compares each PR to its base, not to the other PRs.

| PR | State | Feature | Head in next | Tests changed | Screenshot links | Review |
| --- | --- | --- | --- | ---: | ---: | --- |
| [#232](https://github.com/eduwxyz/tucano/pull/232) | MERGED | Fix the high-risk hold button losing the press before it fills | object unavailable | 0 | 2 | not reviewed |
| [#243](https://github.com/eduwxyz/tucano/pull/243) | MERGED | Read an agent limit of 0 as no ceiling, not as already spent | object unavailable | 3 | 0 | not reviewed |
| [#244](https://github.com/eduwxyz/tucano/pull/244) | OPEN | Filter and group the skills in an agent's tab, and fix where a skill came from | yes | 1 | 4 | not reviewed |
| [#245](https://github.com/eduwxyz/tucano/pull/245) | OPEN | Show the model's thinking as dim, small, live text, not only a Thinking… label | yes | 3 | 5 | not reviewed |
| [#246](https://github.com/eduwxyz/tucano/pull/246) | MERGED | Close a reply when its approval is decided, and repair the ones already stuck | object unavailable | 1 | 0 | not reviewed |
| [#247](https://github.com/eduwxyz/tucano/pull/247) | OPEN | Add a Questions section above Approvals, with every agent's question in one place | yes | 7 | 23 | not reviewed |
| [#248](https://github.com/eduwxyz/tucano/pull/248) | OPEN | Keep the open question next to the field, not only where it was asked | yes | 9 | 3 | not reviewed |
| [#249](https://github.com/eduwxyz/tucano/pull/249) | OPEN | Clear a conversation's history without deleting the conversation | yes | 2 | 4 | not reviewed |
| [#250](https://github.com/eduwxyz/tucano/pull/250) | OPEN | Modern, accessible reordering for every sidebar list: hold a row, see where it lands, move it with the keyboard | yes | 3 | 3 | reviewed; browser checks pass; platform coverage remains |
| [#251](https://github.com/eduwxyz/tucano/pull/251) | MERGED | Stop the guide's Portuguese from leaking into what agents write (dates by locale, guide labelled) | object unavailable | 1 | 0 | not reviewed |
| [#258](https://github.com/eduwxyz/tucano/pull/258) | OPEN | Wiki: let "Write the page" hand a missing page to an agent you pick | yes | 7 | 3 | reviewed; stack repaired; load follow-up remains |
| [#259](https://github.com/eduwxyz/tucano/pull/259) | OPEN | Wiki: let "Nothing links to them" hand the orphan pages to an agent that links them | yes | 7 | 3 | reviewed; stack repaired; suite follow-up remains |
| [#261](https://github.com/eduwxyz/tucano/pull/261) | OPEN | A new prompt in a thread: parallel, queued, steer or interrupt, on a setting and on the keys | yes | 1 | 4 | not reviewed |
| [#268](https://github.com/eduwxyz/tucano/pull/268) | OPEN | Wiki: give a finding the review can't settle a Resolve button and a built-in resolver | yes | 10 | 3 | not reviewed |
| [#272](https://github.com/eduwxyz/tucano/pull/272) | OPEN | Channels: mention mode — an agent in the room that answers only when mentioned | yes | 2 | 6 | not reviewed |
| [#274](https://github.com/eduwxyz/tucano/pull/274) | OPEN | Team-ups: an agent that calls one outside the room gets a channel that carries the work | yes | 4 | 6 | not reviewed |
| [#275](https://github.com/eduwxyz/tucano/pull/275) | OPEN | In a long run, keep "Reply in thread" at the top-right corner of the steps while they scroll | yes | 8 | 5 | not reviewed |
| [#279](https://github.com/eduwxyz/tucano/pull/279) | OPEN | Channels: a listen mode — Jev brings the expensive agent in when the message needs it and the room can't do without it | yes | 13 | 10 | not reviewed |
| [#282](https://github.com/eduwxyz/tucano/pull/282) | CLOSED | A drawer above the field: the sessions running right now, and the prompts still queued | object unavailable | 2 | 6 | not reviewed |
| [#284](https://github.com/eduwxyz/tucano/pull/284) | OPEN | An agent's question can mark the option Jev would pick | yes | 2 | 5 | not reviewed |
| [#288](https://github.com/eduwxyz/tucano/pull/288) | OPEN | Attach a work drawer above the field: the replies running now, and the prompts queued behind them | yes | 2 | 8 | not reviewed |
| [#289](https://github.com/eduwxyz/tucano/pull/289) | CLOSED | Two tests that only fail on a real developer's machine: the git hooks folder and the case of PATH | no: inspect patch equivalence | 2 | 0 | not reviewed |
| [#290](https://github.com/eduwxyz/tucano/pull/290) | OPEN | Keep each prompt above the session it started, and add a glyph that goes back to it | yes | 2 | 4 | not reviewed |
| [#293](https://github.com/eduwxyz/tucano/pull/293) | MERGED | Make two tests hold on a machine with a global core.hooksPath, and on how a machine spells PATH | no: inspect patch equivalence | 2 | 0 | not reviewed |
| [#296](https://github.com/eduwxyz/tucano/pull/296) | OPEN | Name your own memories "You" so the tab fits on one line (closes #295) | yes | 1 | 4 | not reviewed |
| [#298](https://github.com/eduwxyz/tucano/pull/298) | OPEN | Give a reply a card of next steps: every box ticked, so nothing it proposed is buried | yes | 5 | 6 | not reviewed |
| [#299](https://github.com/eduwxyz/tucano/pull/299) | CLOSED | docs: a review bot on every pull request, so security and bug review happens during development | object unavailable | 0 | 0 | not reviewed |
| [#301](https://github.com/eduwxyz/tucano/pull/301) | OPEN | Run agents on Hermes, brought forward from #8 | yes | 53 | 1 | not reviewed |
| [#303](https://github.com/eduwxyz/tucano/pull/303) | OPEN | Draw a reply's pictures as one album: one large and the rest beside it | yes | 2 | 7 | not reviewed |
| [#305](https://github.com/eduwxyz/tucano/pull/305) | OPEN | Show each provider's quota in Usage and limits, and the ones a session's bots run on in its header | yes | 5 | 0 | not reviewed |
| [#308](https://github.com/eduwxyz/tucano/pull/308) | OPEN | Read skills from every harness's folder, and let the person add or turn off folders | yes | 3 | 6 | not reviewed |
| [#310](https://github.com/eduwxyz/tucano/pull/310) | OPEN | Stop teaching a model Portuguese in an English workspace: language-free screen ids, the guide index, and a test that notices | yes | 2 | 0 | not reviewed |
| [#311](https://github.com/eduwxyz/tucano/pull/311) | OPEN | Read a Hermes skill library as it is: categories one level down, versions, and the facets it is navigated by | yes | 4 | 4 | not reviewed |
| [#313](https://github.com/eduwxyz/tucano/pull/313) | OPEN | Settings › Models: change the thinking on the bulk change and on every agent | yes | 2 | 8 | not reviewed |
| [#316](https://github.com/eduwxyz/tucano/pull/316) | MERGED | Stop calling a slow Chrome and a starved Windows test a failure: 90 s to open, 60 s on Windows | yes | 8 | 0 | not reviewed |
| [#319](https://github.com/eduwxyz/tucano/pull/319) | OPEN | Let the Tuca set the skills a bot follows, and show them in ver_estado | yes | 2 | 0 | not reviewed |
| [#321](https://github.com/eduwxyz/tucano/pull/321) | OPEN | A stopped reply gets a second way back: try again in a direction you write | yes | 9 | 1 | not reviewed |
| [#322](https://github.com/eduwxyz/tucano/pull/322) | OPEN | A reply's steps: all, the latest few, or an expandable line of current activity (#314) | no: inspect patch equivalence | 13 | 0 | not reviewed |
| [#324](https://github.com/eduwxyz/tucano/pull/324) | CLOSED | Run a testing checkout on DeepSeek 4.1 Flash, not on a Claude model it cannot reach | no: inspect patch equivalence | 3 | 3 | not reviewed |
| [#325](https://github.com/eduwxyz/tucano/pull/325) | MERGED | Stop a busy CI machine from reddening the core startup test | no: inspect patch equivalence | 1 | 0 | not reviewed |
| [#327](https://github.com/eduwxyz/tucano/pull/327) | OPEN | Let the line beside a run's steps fold them: a double-click, from wherever the run has scrolled to | yes | 1 | 12 | not reviewed |
| [#329](https://github.com/eduwxyz/tucano/pull/329) | OPEN | Remember a conversation's steps folded, so coming back to it finds them folded (#328) | yes | 2 | 8 | not reviewed |
| [#332](https://github.com/eduwxyz/tucano/pull/332) | OPEN | Steer a reply that's still working from the bottom of its steps (#331) | yes | 2 | 12 | not reviewed |
| [#333](https://github.com/eduwxyz/tucano/pull/333) | OPEN | Route each reply by what Jev reads in the prompt: six pools, roles with their own specialists, and a thin line that says why | yes | 3 | 25 | not reviewed |
| [#334](https://github.com/eduwxyz/tucano/pull/334) | OPEN | Approval card: lead with the action and its target, and say what became of the call | yes | 2 | 10 | not reviewed |
| [#336](https://github.com/eduwxyz/tucano/pull/336) | OPEN | Right-click a picture: save it, copy it, or put it back in the prompt (#335) | yes | 1 | 16 | not reviewed |
| [#338](https://github.com/eduwxyz/tucano/pull/338) | OPEN | A finished reply goes on from where it stopped: Follow Up (#337) | yes | 5 | 14 | not reviewed |
| [#339](https://github.com/eduwxyz/tucano/pull/339) | OPEN | CI: give a cold Chrome's first command the 90 s its open already has, and the Mac service test the 30 s the core tests have | yes | 2 | 0 | not reviewed |
| [#341](https://github.com/eduwxyz/tucano/pull/341) | OPEN | Answer a routed message when the place it waits for is only marked busy | yes | 1 | 0 | not reviewed |
| [#343](https://github.com/eduwxyz/tucano/pull/343) | OPEN | Start a routed reply whose place was taken by a job that never ran | yes | 1 | 0 | not reviewed |
| [#351](https://github.com/eduwxyz/tucano/pull/351) | OPEN | Read 0 as no monthly limit on the screens too, not as spent | yes | 1 | 13 | not reviewed |
| [#352](https://github.com/eduwxyz/tucano/pull/352) | CLOSED | Let a configured MCP server wear the image the person gives it, from a file or an https address | yes | 1 | 7 | not reviewed |
| [#353](https://github.com/eduwxyz/tucano/pull/353) | OPEN | Give a connector the picture it wears, instead of a black terminal | yes | 2 | 9 | not reviewed |
| [#355](https://github.com/eduwxyz/tucano/pull/355) | OPEN | Give the wiki a tool card on the agent's Tools tab, with a level that writes pages | yes | 4 | 3 | reviewed; prospective DM privacy repaired; further privacy review remains |
| [#366](https://github.com/eduwxyz/tucano/pull/366) | OPEN | Let a routine say nothing when it has nothing to report | yes | 2 | 4 | not reviewed |
| [#367](https://github.com/eduwxyz/tucano/pull/367) | OPEN | Check wiki SSH key cleanup without requiring a shell on PATH | yes | 1 | 0 | reviewed; upstream PR opened |
| [#368](https://github.com/eduwxyz/tucano/pull/368) | OPEN | Update the locked runtime packages past their security advisories | yes | 0 | 0 | not reviewed |

## Commit dependencies

- #258 → #259
- #261 → #332
- #261 → #338
- #327 → #329
- #332 → #338

## Shared files among open PRs

| File | PRs |
| --- | --- |
| src/renderer/src/styles.css | #244, #245, #247, #248, #249, #250, #258, #259, #261, #268, #272, #275, #279, #284, #288, #290, #298, #303, #305, #311, #313, #321, #322, #327, #329, #332, #333, #334, #336, #338, #353 |
| src/shared/types.ts | #245, #247, #249, #250, #258, #259, #261, #268, #272, #274, #279, #284, #288, #290, #298, #301, #305, #308, #311, #319, #322, #332, #333, #334, #336, #338, #353, #355, #366 |
| src/renderer/src/components/Conversation.tsx | #245, #247, #248, #249, #261, #272, #274, #275, #279, #284, #288, #290, #298, #303, #305, #321, #322, #327, #329, #332, #333, #334, #336, #338, #351, #366 |
| src/core/runs.ts | #245, #247, #258, #259, #261, #272, #274, #279, #284, #288, #298, #301, #319, #321, #322, #332, #333, #334, #338, #341, #343, #351, #355, #366 |
| src/core/index.ts | #247, #249, #258, #259, #261, #268, #272, #274, #279, #288, #301, #305, #308, #311, #313, #319, #321, #322, #332, #333, #338, #353 |
| src/renderer/src/components/Pages.tsx | #244, #245, #247, #258, #259, #261, #274, #284, #288, #298, #308, #310, #311, #322, #332, #333, #338, #351, #353, #355 |
| src/shared/rpc.ts | #245, #247, #249, #258, #259, #261, #268, #272, #279, #288, #305, #308, #311, #313, #321, #322, #332, #338, #353 |
| src/renderer/src/store.ts | #245, #247, #249, #261, #272, #279, #288, #301, #305, #308, #311, #313, #321, #322, #332, #334, #338, #353 |
| src/core/db.ts | #247, #249, #250, #258, #259, #261, #272, #274, #279, #288, #322, #332, #333, #334, #338, #353, #355, #366 |
| src/shared/rpc-shapes.ts | #247, #249, #258, #259, #261, #268, #272, #279, #288, #305, #308, #311, #313, #321, #332, #338, #353 |
| src/core/settings-patch.ts | #245, #247, #250, #261, #268, #274, #284, #288, #298, #308, #311, #322, #332, #333, #336, #338 |
| src/core/policy-people.ts | #245, #247, #249, #250, #258, #259, #268, #305, #308, #311, #322, #336, #338, #353 |
| src/core/engines/fake.ts | #245, #258, #259, #268, #274, #298, #310, #319, #322, #332, #338, #355, #366 |
| src/core/chrome.ts | #248, #268, #275, #279, #308, #321, #322, #339 |
| test/wiki-git.test.ts | #248, #268, #275, #279, #321, #322, #367 |
| vitest.config.ts | #248, #268, #275, #279, #308, #321, #322 |
| test/autonomy-core.test.ts | #248, #268, #275, #279, #321, #322 |
| test/team-round3-core.test.ts | #248, #268, #275, #279, #321, #322 |
| test/team-round4-core.test.ts | #248, #268, #275, #279, #321, #322 |
| test/team-round5-core.test.ts | #248, #268, #275, #279, #321, #322 |
| test/team-round6-core.test.ts | #248, #268, #275, #279, #321, #322 |
| test/tuca-keep-and-batch-core.test.ts | #248, #268, #275, #279, #321, #322 |
| test/wiki-git-core.test.ts | #248, #268, #275, #279, #321, #322 |
| src/core/people.ts | #245, #247, #284, #298, #322 |
| src/renderer/src/components/Sidebar.tsx | #247, #249, #250, #274, #351 |
| src/core/context.ts | #258, #259, #274, #355 |
| src/core/wiki.ts | #258, #259, #268, #355 |
| test/send-modes.test.ts | #261, #288, #332, #338 |
| src/core/tuca-help.ts | #310, #319, #351, #366 |
| src/renderer/src/components/Skills.tsx | #244, #308, #311 |
| src/core/engines/types.ts | #245, #301, #322 |
| test/team-round3.test.ts | #245, #301, #322 |
| src/renderer/src/components/Dialogs.tsx | #247, #272, #279 |
| scripts/screens-wiki-write.mjs | #258, #259, #355 |
| src/renderer/src/components/Wiki.tsx | #258, #259, #268 |
| test/wiki-tools-card-ui.test.tsx | #258, #259, #355 |
| test/wiki-write-core.test.ts | #258, #259, #355 |
| test/wiki-write-privacy.test.ts | #258, #259, #355 |
| test/wiki-write.test.ts | #258, #259, #355 |
| test/governance.test.ts | #274, #298, #301 |
| src/core/jev.ts | #279, #284, #298 |
| test/team-fixes.test.ts | #301, #308, #311 |
| scripts/screens-thinking.mjs | #245, #322 |
| src/core/engines/pi.ts | #245, #322 |
| test/pi.test.ts | #245, #322 |
| test/thinking-setting.test.tsx | #245, #322 |
| src/renderer/src/App.tsx | #247, #336 |
| src/shared/questions.ts | #247, #298 |
| test/onboarding-ui.test.tsx | #247, #301 |
| test/people-roles.test.ts | #247, #301 |
| scripts/screens-wiki-handoff.mjs | #258, #259 |
| src/core/wiki-handoff.ts | #258, #259 |
| test/db-queries.test.ts | #258, #259 |
| test/wiki-handoff-ui.test.tsx | #258, #259 |
| test/wiki-handoff.test.ts | #258, #259 |
| src/shared/workspaces.ts | #268, #274 |
| src/core/guide/conversas.md | #272, #279 |
| test/mention-mode-ui.test.tsx | #272, #279 |
| test/mention-mode.test.ts | #272, #279 |
| scripts/screens-jev-pick.mjs | #284, #298 |
| src/renderer/src/components/Decisions.tsx | #284, #298 |
| test/jev-recommend-ui.test.tsx | #284, #298 |
| test/jev-recommend.test.ts | #284, #298 |
| test/reply-order.test.ts | #290, #301 |
| package-lock.json | #301, #368 |
| package.json | #301, #368 |
| src/core/tuca.ts | #301, #310 |
| test/runner.test.ts | #301, #321 |
| test/team-stress.test.ts | #301, #333 |
| test/tuca-help.test.ts | #301, #310 |
| src/renderer/src/components/Panel.tsx | #303, #336 |
| scripts/screens-skill-folders.mjs | #308, #311 |
| src/core/local-skills.ts | #308, #311 |
| test/local-skills.test.ts | #308, #311 |
| test/skill-folders.test.ts | #308, #311 |
| src/renderer/src/components/Tuca.tsx | #319, #351 |
| test/mac.test.ts | #319, #339 |
| scripts/screens-steps-rail.mjs | #327, #329 |
| test/steps-rail.test.tsx | #327, #329 |
| scripts/screens-steer-pill.mjs | #332, #338 |
| test/steer-pill.test.tsx | #332, #338 |
| src/core/followups.ts | #341, #343 |
