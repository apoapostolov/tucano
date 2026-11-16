# Open PR audit queue

Inventory captured 2026-11-16T17:26:55.013Z. Full exact-head audits: **0/52** (OPEN).

Check a box only after the complete feature audit in docs/audit-plan.md passes. Targeted repairs,
integration and green CI alone do not qualify. Refreshing this file preserves checked boxes only
at the same head and base; either revision reopens the review. Keep findings and evidence in the private
reviews.json record, keyed to the exact head/base. A stale targeted review remains useful history.

Groups are initial title-based triage, not an assessed severity. Within a group, lower PR numbers
come first as an approximation of submission order. Age is time since PR creation, including time after closure; the update date includes discussion activity
and does not establish the age of the source commit. Reprioritize concrete defects in the main plan.

Do not routinely update these public branches to current main. Audit their existing code and its
integrated behavior; make focused repairs when evidence warrants them.

## Privacy, permissions and data integrity

- [ ] #247 [Add a Questions section above Approvals, with every agent's question in one place](https://github.com/eduwxyz/tucano/pull/247) <!-- head:ca03603bb91f286dbe2db0ecbc13de166c40f424 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `ca03603bb91f`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T10:31:35Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #249 [Clear a conversation's history without deleting the conversation](https://github.com/eduwxyz/tucano/pull/249) <!-- head:acef2d7464f61cfc2d693ca3c9154da76bf89e68 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `acef2d7464f6`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T10:31:37Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #258 [Wiki: let "Write the page" hand a missing page to an agent you pick](https://github.com/eduwxyz/tucano/pull/258) <!-- head:ebe9c960af03b0291ab3ca6edc1a98769f368308 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `ebe9c960af03`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T12:43:51Z; integration ancestry: inspect equivalence; review: reviewed; stack repaired; load follow-up remains (stale).
- [ ] #259 [Wiki: let "Nothing links to them" hand the orphan pages to an agent that links them](https://github.com/eduwxyz/tucano/pull/259) <!-- head:a7c1f5f0ebb7b49a8d5c33da6aa2e20eab43dfa8 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `a7c1f5f0ebb7`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T12:43:52Z; integration ancestry: inspect equivalence; review: reviewed; stack repaired; suite follow-up remains (stale).
- [ ] #268 [Wiki: give a finding the review can't settle a Resolve button and a built-in resolver](https://github.com/eduwxyz/tucano/pull/268) <!-- head:ed990873335a1fc8ed2549242097b2117a67d52c base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `ed990873335a`; OPEN; author apoapostolov; age 6 days; updated 2026-11-15T10:33:53Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #334 [Approval card: lead with the action and its target, and say what became of the call](https://github.com/eduwxyz/tucano/pull/334) <!-- head:dd2b0497b78a86caccdf174a1ea25c479852d2aa base:04539404e545323124e5dd4737098892cd746226 -->
  Head `dd2b0497b78a`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T12:43:58Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #353 [Give a connector the picture it wears, instead of a black terminal](https://github.com/eduwxyz/tucano/pull/353) <!-- head:ad9b9a5c53e0c722dc95a28317e3a4bafd826594 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `ad9b9a5c53e0`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T09:18:38Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #355 [Give the wiki a tool card on the agent's Tools tab, with a level that writes pages](https://github.com/eduwxyz/tucano/pull/355) <!-- head:ee672432d4adca5ef7889b7d82804c5f3068ba46 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `ee672432d4ad`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T12:44:00Z; integration ancestry: inspect equivalence; review: reviewed; prospective DM privacy repaired; further privacy review remains (stale).
- [ ] #375 [Delete a session from the room: a trash under its thread button, in two presses](https://github.com/eduwxyz/tucano/pull/375) <!-- head:9ea02e47e530156673c07cc5bb566dc628dc6d97 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `9ea02e47e530`; OPEN; author apoapostolov; age 4 days; updated 2026-11-14T09:20:36Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #385 [Next steps open with every box clear; the classifier that ticks the ones worth doing now is a job in Classifiers](https://github.com/eduwxyz/tucano/pull/385) <!-- head:0c5dd260c1fcb829444450369e1b28851b0eced6 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `0c5dd260c1fc`; OPEN; author apoapostolov; age 4 days; updated 2026-11-14T12:44:03Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #432 [Keep the history only as long as its period says, with a wipe for every bot and for one bot](https://github.com/eduwxyz/tucano/pull/432) <!-- head:35070e863690f3fceff566a530fa5aab79800875 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `35070e863690`; OPEN; author apoapostolov; age 2 days; updated 2026-11-14T13:18:22Z; integration ancestry: inspect equivalence; review: targeted safety repairs verified; full feature audit remains (stale).

## Execution, cancellation and reliability

- [ ] #261 [A new prompt in a thread: parallel, queued, steer or interrupt, on a setting and on the keys](https://github.com/eduwxyz/tucano/pull/261) <!-- head:5b3e294a72b77ae8ce96aa63761ddebd85ab7b5c base:04539404e545323124e5dd4737098892cd746226 -->
  Head `5b3e294a72b7`; OPEN; author apoapostolov; age 6 days; updated 2026-11-15T10:32:58Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #274 [Team-ups: an agent that calls one outside the room gets a channel that carries the work](https://github.com/eduwxyz/tucano/pull/274) <!-- head:f81c4a1d426f676f68d2d47524196df1b117c04b base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `f81c4a1d426f`; OPEN; author apoapostolov; age 6 days; updated 2026-11-15T10:32:45Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #288 [Attach a work drawer above the field: the replies running now, and the prompts queued behind them](https://github.com/eduwxyz/tucano/pull/288) <!-- head:94b4d2792b453cf008f3ab93694f4f472ca88cb3 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `94b4d2792b45`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T11:43:30Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #298 [Give a reply a card of next steps: every box ticked, so nothing it proposed is buried](https://github.com/eduwxyz/tucano/pull/298) <!-- head:44b5932234d5e11307ef8eff3965f2145a53b373 base:2c4f0552396f3c36dcd53db07f2c033128501d5f -->
  Head `44b5932234d5`; OPEN; author apoapostolov; age 6 days; updated 2026-11-16T15:04:12Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #303 [Draw a reply's pictures as one album: one large and the rest beside it](https://github.com/eduwxyz/tucano/pull/303) <!-- head:c46b925a1ea5a133e2e3be8d9c14a80cc6778c4e base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `c46b925a1ea5`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T10:31:48Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #305 [Show each provider's quota in Usage and limits, and the ones a session's bots run on in its header](https://github.com/eduwxyz/tucano/pull/305) <!-- head:217d402618c978e2ef1f95840163e88ab9a42c75 base:32468eb78eaad169947147bfde8d3e0c1c82b5f3 -->
  Head `217d402618c9`; OPEN; author apoapostolov; age 6 days; updated 2026-11-15T14:23:19Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #321 [A stopped reply gets a second way back: try again in a direction you write](https://github.com/eduwxyz/tucano/pull/321) <!-- head:2ba3b92ca8ad18cd9e4d8769ade2818b63a496bd base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `2ba3b92ca8ad`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T10:31:55Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #322 [A reply's steps: all, the latest few, or an expandable line of current activity (#314)](https://github.com/eduwxyz/tucano/pull/322) <!-- head:6edcf8cec5c79481491c02dfc523693b7c00ac17 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `6edcf8cec5c7`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T12:43:55Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #327 [Let the line beside a run's steps fold them: a double-click, from wherever the run has scrolled to](https://github.com/eduwxyz/tucano/pull/327) <!-- head:c68294cb7d54b1512f8f8bf2606e7465907c1403 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `c68294cb7d54`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T10:31:57Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #332 [Steer a reply that's still working from the bottom of its steps (#331)](https://github.com/eduwxyz/tucano/pull/332) <!-- head:6f9acb486e64e190f299759e8399bbce8c334b98 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `6f9acb486e64`; OPEN; author apoapostolov; age 5 days; updated 2026-11-16T09:56:32Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #333 [Route each reply by what Jev reads in the prompt: six pools, roles with their own specialists, and a thin line that says why](https://github.com/eduwxyz/tucano/pull/333) <!-- head:de3555b47072ace8ab2c05ed706fa5086961c485 base:2c4f0552396f3c36dcd53db07f2c033128501d5f -->
  Head `de3555b47072`; OPEN; author apoapostolov; age 5 days; updated 2026-11-16T15:04:03Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #338 [A finished reply goes on from where it stopped: Follow Up (#337)](https://github.com/eduwxyz/tucano/pull/338) <!-- head:856b97742b89a39be8ca4fac18184fad4c9d34bd base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `856b97742b89`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T11:43:26Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #391 [Resume interrupted replies after restart when enabled](https://github.com/eduwxyz/tucano/pull/391) <!-- head:33dea61c9b29537e8fd17063bbffcaa36dc90e38 base:15370a0b41f54aec11d542bc2114d6acb9588535 -->
  Head `33dea61c9b29`; OPEN; author apoapostolov; age 4 days; updated 2026-11-16T06:24:50Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #411 [Reply to a message, and to the selected excerpt with ⌘L, stacked on #32](https://github.com/eduwxyz/tucano/pull/411) <!-- head:4eef728c8baa903a36f50086102682e347bceaa4 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `4eef728c8baa`; OPEN; author apoapostolov; age 3 days; updated 2026-11-14T10:32:09Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #457 [Pause a reply before its next step, and resume it there](https://github.com/eduwxyz/tucano/pull/457) <!-- head:925c557a9583a5b5b67466cd206e947ada0be928 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `925c557a9583`; OPEN; author apoapostolov; age 2 days; updated 2026-11-14T18:45:44Z; integration ancestry: present; review: targeted cancellation/concurrency repair verified and installed; broader feature audit remains.
- [ ] #467 [One agent can answer to more than one boss, so a shared specialist serves several teams](https://github.com/eduwxyz/tucano/pull/467) <!-- head:9b202e99ec9662312bb7098ae3453501a586fb0e base:d175567b0a12d885544d74c45792717a883287f5 -->
  Head `9b202e99ec96`; OPEN; author apoapostolov; age 1 days; updated 2026-11-16T17:24:23Z; integration ancestry: inspect equivalence; review: in progress; parent-reproduced defects; full audit incomplete (stale).

## Features, usability and accessibility

- [ ] #245 [Show the model's thinking as dim, small, live text, not only a Thinking… label](https://github.com/eduwxyz/tucano/pull/245) <!-- head:82e563b27243ee38e0ea3df97dbdef9915ebd5e5 base:15370a0b41f54aec11d542bc2114d6acb9588535 -->
  Head `82e563b27243`; OPEN; author apoapostolov; age 6 days; updated 2026-11-16T12:12:55Z; integration ancestry: inspect equivalence; review: in progress; parent-reproduced defects; full audit incomplete (stale).
- [ ] #248 [Keep the open question next to the field, not only where it was asked](https://github.com/eduwxyz/tucano/pull/248) <!-- head:f32b6ece5d5f849d8da9a480c6ee16a6457fd66b base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `f32b6ece5d5f`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T10:31:36Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #250 [Modern, accessible reordering for every sidebar list: hold a row, see where it lands, move it with the keyboard](https://github.com/eduwxyz/tucano/pull/250) <!-- head:a80371891b99ec739eee6a9af762b184676dea21 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `a80371891b99`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T10:17:30Z; integration ancestry: inspect equivalence; review: reviewed; browser checks pass; platform coverage remains (stale).
- [ ] #272 [Channels: mention mode — an agent in the room that answers only when mentioned](https://github.com/eduwxyz/tucano/pull/272) <!-- head:cb2e56550b56ce61f853a894d06ebfd8c42efeab base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `cb2e56550b56`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T10:31:41Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #279 [Channels: a listen mode — Jev brings the expensive agent in when the message needs it and the room can't do without it](https://github.com/eduwxyz/tucano/pull/279) <!-- head:03f687123ba29bcf7e92499b78a2219739519ba0 base:2c4f0552396f3c36dcd53db07f2c033128501d5f -->
  Head `03f687123ba2`; OPEN; author apoapostolov; age 6 days; updated 2026-11-16T15:04:43Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #284 [An agent's question can mark the option Jev would pick](https://github.com/eduwxyz/tucano/pull/284) <!-- head:07d15c8c3315aee2d8d3f8fab4dc38eaf18d6174 base:2c4f0552396f3c36dcd53db07f2c033128501d5f -->
  Head `07d15c8c3315`; OPEN; author apoapostolov; age 6 days; updated 2026-11-16T11:32:14Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #290 [Keep each prompt above the session it started, and add a glyph that goes back to it](https://github.com/eduwxyz/tucano/pull/290) <!-- head:7b78c668910dc9b1c5d8d472fb1e53ff3ca58509 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `7b78c668910d`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T10:31:46Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #311 [Read a Hermes skill library as it is: categories one level down, versions, and the facets it is navigated by](https://github.com/eduwxyz/tucano/pull/311) <!-- head:35e98635fad7a560d417877cbb8dcffbaf16b6c4 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `35e98635fad7`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T12:58:47Z; integration ancestry: present; review: targeted source-label repair verified; full skills audit remains.
- [ ] #313 [Settings › Models: change the thinking on the bulk change and on every agent](https://github.com/eduwxyz/tucano/pull/313) <!-- head:ed0f2b71c935c26760e0d04150bc6eda70858cb8 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `ed0f2b71c935`; OPEN; author apoapostolov; age 6 days; updated 2026-11-15T10:33:46Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #319 [Let the Tuca set the skills a bot follows, and show them in ver_estado](https://github.com/eduwxyz/tucano/pull/319) <!-- head:18e886de68381f186b74d31eea96ff754239ea5f base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `18e886de6838`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T10:31:54Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #329 [Remember a conversation's steps folded, so coming back to it finds them folded (#328)](https://github.com/eduwxyz/tucano/pull/329) <!-- head:e7dae3e86626c9955f002c0854940b2a2fd6372c base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `e7dae3e86626`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T11:43:25Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #336 [Right-click a picture: save it, copy it, or put it back in the prompt (#335)](https://github.com/eduwxyz/tucano/pull/336) <!-- head:c92b50d753e5ab87e63a66980222f54c8fc1c824 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `c92b50d753e5`; OPEN; author apoapostolov; age 5 days; updated 2026-11-15T10:33:41Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #366 [Let a routine say nothing when it has nothing to report](https://github.com/eduwxyz/tucano/pull/366) <!-- head:328cbb76746b7012f7af7199b49e489d55738c82 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `328cbb76746b`; OPEN; author apoapostolov; age 4 days; updated 2026-11-14T08:17:57Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #379 [Expand Jev into a Classifiers section: TypeSafe, OpenRouter, OpenAI and Google](https://github.com/eduwxyz/tucano/pull/379) <!-- head:e614d4e6509892e3229ff37f77328e2d8154412e base:04539404e545323124e5dd4737098892cd746226 -->
  Head `e614d4e65098`; OPEN; author apoapostolov; age 4 days; updated 2026-11-15T10:33:39Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #383 [Classifiers on all six jobs: the section, stacked on #279, #284, #298 and #333](https://github.com/eduwxyz/tucano/pull/383) <!-- head:e799d7a42b332e2148f77837c60d3ba5ee5270f8 base:2c4f0552396f3c36dcd53db07f2c033128501d5f -->
  Head `e799d7a42b33`; OPEN; author apoapostolov; age 4 days; updated 2026-11-16T15:04:11Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #395 [Let the person read times as a 24-hour clock, or a 12-hour one](https://github.com/eduwxyz/tucano/pull/395) <!-- head:e5e1a18e738ccb47fd34b09bbda5979ec4dcab07 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `e5e1a18e738c`; OPEN; author apoapostolov; age 3 days; updated 2026-11-14T12:44:05Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #410 [Clarify English settings labels and shorten interface hints](https://github.com/eduwxyz/tucano/pull/410) <!-- head:2a303deebe24aad13869a0a981367ff164ab683c base:04539404e545323124e5dd4737098892cd746226 -->
  Head `2a303deebe24`; OPEN; author apoapostolov; age 3 days; updated 2026-11-14T14:24:02Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #416 [Let a Grok login be another account, in Settings › Accounts](https://github.com/eduwxyz/tucano/pull/416) <!-- head:dadd7e7d831cace3704f4046550c7aacfd3e9755 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `dadd7e7d831c`; OPEN; author apoapostolov; age 3 days; updated 2026-11-14T10:32:10Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #417 [Notifications over every window](https://github.com/eduwxyz/tucano/pull/417) <!-- head:c447ee919450f86742170d923d3bbee2cec0b95a base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `c447ee919450`; OPEN; author apoapostolov; age 3 days; updated 2026-11-15T10:33:30Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #424 [Control room visibility and agent read access](https://github.com/eduwxyz/tucano/pull/424) <!-- head:e5899459b70be1b5aa33e94dbe0019d86e05f25c base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `e5899459b70b`; OPEN; author apoapostolov; age 2 days; updated 2026-11-14T09:17:50Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #435 [A bot can look after something for you between conversations](https://github.com/eduwxyz/tucano/pull/435) <!-- head:efa3cbe7c5bc5b1e06bbb0902d2fb63980a59999 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `efa3cbe7c5bc`; OPEN; author apoapostolov; age 2 days; updated 2026-11-15T10:33:28Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #437 [Give the file its space back, and say whether it is sound](https://github.com/eduwxyz/tucano/pull/437) <!-- head:a31233ed53f8d690b6d0e23253fe6c184546e7cd base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `a31233ed53f8`; OPEN; author apoapostolov; age 2 days; updated 2026-11-15T10:33:15Z; integration ancestry: inspect equivalence; review: migration-compatible counter assertion repaired; full feature audit remains (stale).
- [ ] #446 [Organize settings by task with accessible section navigation](https://github.com/eduwxyz/tucano/pull/446) <!-- head:ea0f090c2be51671ab71f71293100ce3ff6cb345 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `ea0f090c2be5`; OPEN; author apoapostolov; age 2 days; updated 2026-11-14T13:15:11Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #451 [Write the guide's 24 pages in English too, and hand each workspace its own](https://github.com/eduwxyz/tucano/pull/451) <!-- head:6dcfa7a99ddee2de957d4ead5e27ecc0348dc86f base:04539404e545323124e5dd4737098892cd746226 -->
  Head `6dcfa7a99dde`; OPEN; author apoapostolov; age 2 days; updated 2026-11-14T11:19:09Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #512 [Match Hermes stock-skill hashes on Windows](https://github.com/eduwxyz/tucano/pull/512) <!-- head:dee182343dbe144dde16da217fee2f54711b8022 base:d02bfeb3c041275db308590b7416b3d0d2c69299 -->
  Head `dee182343dbe`; OPEN; author apoapostolov; age 0 days; updated 2026-11-16T17:03:31Z; integration ancestry: inspect equivalence; review: not reviewed.
