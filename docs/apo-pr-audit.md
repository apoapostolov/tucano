# Apo PR audit queue

Inventory captured 2026-11-15T21:28:13.595Z. Full exact-head audits: **0/94** (OPEN, MERGED, CLOSED).

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

- [ ] #246 [Close a reply when its approval is decided, and repair the ones already stuck](https://github.com/eduwxyz/tucano/pull/246) <!-- head:8f56144dfdad498277b7b1e2c4e73424e9a2a35c base:35db1c360e5178ee7daf6c8a635a79ae031fcf59 -->
  Head `8f56144dfdad`; MERGED; author apoapostolov; age 6 days; updated 2026-11-10T15:50:55Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #247 [Add a Questions section above Approvals, with every agent's question in one place](https://github.com/eduwxyz/tucano/pull/247) <!-- head:ca03603bb91f286dbe2db0ecbc13de166c40f424 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `ca03603bb91f`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T10:31:35Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #249 [Clear a conversation's history without deleting the conversation](https://github.com/eduwxyz/tucano/pull/249) <!-- head:acef2d7464f61cfc2d693ca3c9154da76bf89e68 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `acef2d7464f6`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T10:31:37Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #258 [Wiki: let "Write the page" hand a missing page to an agent you pick](https://github.com/eduwxyz/tucano/pull/258) <!-- head:ebe9c960af03b0291ab3ca6edc1a98769f368308 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `ebe9c960af03`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T12:43:51Z; integration ancestry: inspect equivalence; review: reviewed; stack repaired; load follow-up remains (stale).
- [ ] #259 [Wiki: let "Nothing links to them" hand the orphan pages to an agent that links them](https://github.com/eduwxyz/tucano/pull/259) <!-- head:a7c1f5f0ebb7b49a8d5c33da6aa2e20eab43dfa8 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `a7c1f5f0ebb7`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T12:43:52Z; integration ancestry: inspect equivalence; review: reviewed; stack repaired; suite follow-up remains (stale).
- [ ] #268 [Wiki: give a finding the review can't settle a Resolve button and a built-in resolver](https://github.com/eduwxyz/tucano/pull/268) <!-- head:ed990873335a1fc8ed2549242097b2117a67d52c base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `ed990873335a`; OPEN; author apoapostolov; age 5 days; updated 2026-11-15T10:33:53Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #334 [Approval card: lead with the action and its target, and say what became of the call](https://github.com/eduwxyz/tucano/pull/334) <!-- head:dd2b0497b78a86caccdf174a1ea25c479852d2aa base:04539404e545323124e5dd4737098892cd746226 -->
  Head `dd2b0497b78a`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T12:43:58Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #353 [Give a connector the picture it wears, instead of a black terminal](https://github.com/eduwxyz/tucano/pull/353) <!-- head:ad9b9a5c53e0c722dc95a28317e3a4bafd826594 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `ad9b9a5c53e0`; OPEN; author apoapostolov; age 4 days; updated 2026-11-14T09:18:38Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #355 [Give the wiki a tool card on the agent's Tools tab, with a level that writes pages](https://github.com/eduwxyz/tucano/pull/355) <!-- head:ee672432d4adca5ef7889b7d82804c5f3068ba46 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `ee672432d4ad`; OPEN; author apoapostolov; age 4 days; updated 2026-11-14T12:44:00Z; integration ancestry: inspect equivalence; review: reviewed; prospective DM privacy repaired; further privacy review remains (stale).
- [ ] #367 [Check wiki SSH key cleanup without requiring a shell on PATH](https://github.com/eduwxyz/tucano/pull/367) <!-- head:9eb0701454f374ca186d47934da455d61705d4cb base:ce25c37bb5a78fa5fb6cc93bdb88479002b5706a -->
  Head `9eb0701454f3`; MERGED; author apoapostolov; age 3 days; updated 2026-11-12T09:07:33Z; integration ancestry: inspect equivalence; review: reviewed; upstream PR opened (stale).
- [ ] #373 [Recheck wiki permissions and private pages during running replies](https://github.com/eduwxyz/tucano/pull/373) <!-- head:db5e0c835b35aad6d7e5f9ed06d42c513886252e base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `db5e0c835b35`; MERGED; author apoapostolov; age 3 days; updated 2026-11-14T00:15:49Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #375 [Delete a session from the room: a trash under its thread button, in two presses](https://github.com/eduwxyz/tucano/pull/375) <!-- head:9ea02e47e530156673c07cc5bb566dc628dc6d97 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `9ea02e47e530`; OPEN; author apoapostolov; age 3 days; updated 2026-11-14T09:20:36Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #385 [Next steps open with every box clear; the classifier that ticks the ones worth doing now is a job in Classifiers](https://github.com/eduwxyz/tucano/pull/385) <!-- head:0c5dd260c1fcb829444450369e1b28851b0eced6 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `0c5dd260c1fc`; OPEN; author apoapostolov; age 3 days; updated 2026-11-14T12:44:03Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #392 [Stop reading a date that opens a sentence as a missing wiki page](https://github.com/eduwxyz/tucano/pull/392) <!-- head:49c3957f412b8f7f9ee578b7c481b441d29975be base:ea2a3a7faf19431a04f6d498ef8bc2973f8e06c0 -->
  Head `49c3957f412b`; MERGED; author apoapostolov; age 3 days; updated 2026-11-15T13:55:04Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #397 [Keep the Memory bot tabs inside the bar, and page them with two borderless arrows](https://github.com/eduwxyz/tucano/pull/397) <!-- head:0d90c46f829ad356bcdc70e0e04b3e712a82997b base:04539404e545323124e5dd4737098892cd746226 -->
  Head `0d90c46f829a`; OPEN; author apoapostolov; age 3 days; updated 2026-11-14T12:44:06Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #419 [Draw the wiki map in its first frame, and fit it again when the window changes size](https://github.com/eduwxyz/tucano/pull/419) <!-- head:a4707e82b10c6ac62aa98afc30d68a2927f99f47 base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `a4707e82b10c`; MERGED; author apoapostolov; age 2 days; updated 2026-11-14T00:16:04Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #432 [Keep the history only as long as its period says, with a wipe for every bot and for one bot](https://github.com/eduwxyz/tucano/pull/432) <!-- head:35070e863690f3fceff566a530fa5aab79800875 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `35070e863690`; OPEN; author apoapostolov; age 2 days; updated 2026-11-14T13:18:22Z; integration ancestry: inspect equivalence; review: targeted safety repairs verified; full feature audit remains (stale).

## Execution, cancellation and reliability

- [ ] #261 [A new prompt in a thread: parallel, queued, steer or interrupt, on a setting and on the keys](https://github.com/eduwxyz/tucano/pull/261) <!-- head:5b3e294a72b77ae8ce96aa63761ddebd85ab7b5c base:04539404e545323124e5dd4737098892cd746226 -->
  Head `5b3e294a72b7`; OPEN; author apoapostolov; age 5 days; updated 2026-11-15T10:32:58Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #274 [Team-ups: an agent that calls one outside the room gets a channel that carries the work](https://github.com/eduwxyz/tucano/pull/274) <!-- head:f81c4a1d426f676f68d2d47524196df1b117c04b base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `f81c4a1d426f`; OPEN; author apoapostolov; age 5 days; updated 2026-11-15T10:32:45Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #275 [In a long run, keep "Reply in thread" at the top-right corner of the steps while they scroll](https://github.com/eduwxyz/tucano/pull/275) <!-- head:3faac071e76d38be7d21607e392aeeb76257fa75 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `3faac071e76d`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T10:31:43Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #282 [A drawer above the field: the sessions running right now, and the prompts still queued](https://github.com/eduwxyz/tucano/pull/282) <!-- head:13056bc1206259af1b9c09ea3893d1047d5e68ba base:3149d426e952e66ffd57c2d6cfb1cbed2be70ff7 -->
  Head `13056bc12062`; CLOSED; author apoapostolov; age 5 days; updated 2026-11-10T15:51:00Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #288 [Attach a work drawer above the field: the replies running now, and the prompts queued behind them](https://github.com/eduwxyz/tucano/pull/288) <!-- head:94b4d2792b453cf008f3ab93694f4f472ca88cb3 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `94b4d2792b45`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T11:43:30Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #298 [Give a reply a card of next steps: every box ticked, so nothing it proposed is buried](https://github.com/eduwxyz/tucano/pull/298) <!-- head:d6342dc64bc5f248a533cd2ca671b55a3274246a base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `d6342dc64bc5`; OPEN; author apoapostolov; age 5 days; updated 2026-11-15T10:32:52Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #301 [Run agents on Hermes, brought forward from #8](https://github.com/eduwxyz/tucano/pull/301) <!-- head:28c3fe6b240afc871b7d97f1b4fa8779f4a591f4 base:95e6b6210422f4b9128fb648c1958dae86eb5851 -->
  Head `28c3fe6b240a`; CLOSED; author apoapostolov; age 5 days; updated 2026-11-14T11:43:23Z; integration ancestry: present; review: not reviewed.
- [ ] #303 [Draw a reply's pictures as one album: one large and the rest beside it](https://github.com/eduwxyz/tucano/pull/303) <!-- head:c46b925a1ea5a133e2e3be8d9c14a80cc6778c4e base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `c46b925a1ea5`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T10:31:48Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #305 [Show each provider's quota in Usage and limits, and the ones a session's bots run on in its header](https://github.com/eduwxyz/tucano/pull/305) <!-- head:217d402618c978e2ef1f95840163e88ab9a42c75 base:32468eb78eaad169947147bfde8d3e0c1c82b5f3 -->
  Head `217d402618c9`; OPEN; author apoapostolov; age 5 days; updated 2026-11-15T14:23:19Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #308 [Read skills from every harness's folder, and let the person add or turn off folders](https://github.com/eduwxyz/tucano/pull/308) <!-- head:880945a109ba885bd40d850f9e67840de3487231 base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `880945a109ba`; CLOSED; author apoapostolov; age 5 days; updated 2026-11-15T10:33:48Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #321 [A stopped reply gets a second way back: try again in a direction you write](https://github.com/eduwxyz/tucano/pull/321) <!-- head:2ba3b92ca8ad18cd9e4d8769ade2818b63a496bd base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `2ba3b92ca8ad`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T10:31:55Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #322 [A reply's steps: all, the latest few, or an expandable line of current activity (#314)](https://github.com/eduwxyz/tucano/pull/322) <!-- head:6edcf8cec5c79481491c02dfc523693b7c00ac17 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `6edcf8cec5c7`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T12:43:55Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #324 [Run a testing checkout on DeepSeek 4.1 Flash, not on a Claude model it cannot reach](https://github.com/eduwxyz/tucano/pull/324) <!-- head:fa86f966755fde85c6d1762ba4b59f95123c5446 base:95e6b6210422f4b9128fb648c1958dae86eb5851 -->
  Head `fa86f966755f`; CLOSED; author apoapostolov; age 5 days; updated 2026-11-10T17:16:30Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #325 [Stop a busy CI machine from reddening the core startup test](https://github.com/eduwxyz/tucano/pull/325) <!-- head:21285ec8f239fb346b05bc8a2bb981e5ae4849d3 base:95e6b6210422f4b9128fb648c1958dae86eb5851 -->
  Head `21285ec8f239`; MERGED; author apoapostolov; age 5 days; updated 2026-11-10T17:53:13Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #327 [Let the line beside a run's steps fold them: a double-click, from wherever the run has scrolled to](https://github.com/eduwxyz/tucano/pull/327) <!-- head:c68294cb7d54b1512f8f8bf2606e7465907c1403 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `c68294cb7d54`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T10:31:57Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #332 [Steer a reply that's still working from the bottom of its steps (#331)](https://github.com/eduwxyz/tucano/pull/332) <!-- head:6a98452378c934109c5a18df1cf744602a57a6d7 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `6a98452378c9`; OPEN; author apoapostolov; age 5 days; updated 2026-11-15T10:33:43Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #333 [Route each reply by what Jev reads in the prompt: six pools, roles with their own specialists, and a thin line that says why](https://github.com/eduwxyz/tucano/pull/333) <!-- head:12a4f4526e650352ef429cf76dc16a86f0a83d17 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `12a4f4526e65`; OPEN; author apoapostolov; age 5 days; updated 2026-11-15T10:32:54Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #338 [A finished reply goes on from where it stopped: Follow Up (#337)](https://github.com/eduwxyz/tucano/pull/338) <!-- head:856b97742b89a39be8ca4fac18184fad4c9d34bd base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `856b97742b89`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T11:43:26Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #339 [CI: give a cold Chrome's first command the 90 s its open already has, and the Mac service test the 30 s the core tests have](https://github.com/eduwxyz/tucano/pull/339) <!-- head:0947e25e27f85d8c86ffe4ac8e63ee5ecc72af7b base:0b0b5cd96ca6de82ecdae055a01ae8e304240031 -->
  Head `0947e25e27f8`; MERGED; author apoapostolov; age 5 days; updated 2026-11-12T09:07:34Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #341 [Answer a routed message when the place it waits for is only marked busy](https://github.com/eduwxyz/tucano/pull/341) <!-- head:17f32c58b7608e9a869e5baf40fbad9cc9a5f02e base:0098f124d9796a7ee869939e8004def009255270 -->
  Head `17f32c58b760`; CLOSED; author apoapostolov; age 5 days; updated 2026-11-12T08:55:09Z; integration ancestry: present; review: not reviewed.
- [ ] #343 [Start a routed reply whose place was taken by a job that never ran](https://github.com/eduwxyz/tucano/pull/343) <!-- head:41fd9ad104b47c5105ad180bb5616383b01fad95 base:0098f124d9796a7ee869939e8004def009255270 -->
  Head `41fd9ad104b4`; CLOSED; author apoapostolov; age 5 days; updated 2026-11-12T08:55:12Z; integration ancestry: present; review: not reviewed.
- [ ] #368 [Update the locked runtime packages past their security advisories](https://github.com/eduwxyz/tucano/pull/368) <!-- head:acb095d887ec27316ced0dba341d9342d792e1d8 base:4be50936628546108aad92e2b2d81d2e4294aa9c -->
  Head `acb095d887ec`; MERGED; author apoapostolov; age 3 days; updated 2026-11-12T09:07:31Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #372 [Run isolated UI checks without taking desktop focus](https://github.com/eduwxyz/tucano/pull/372) <!-- head:be0d865d4205da5b27b6ba6efc1fa851fb403dac base:b76f9d8d28cecff8ca4a3319168ae7f00c1ab49f -->
  Head `be0d865d4205`; MERGED; author apoapostolov; age 3 days; updated 2026-11-15T18:10:49Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #391 [Resume interrupted replies after restart when enabled](https://github.com/eduwxyz/tucano/pull/391) <!-- head:f55ce3fbfec482281ad73fe8b376137dad246b99 base:3e8162ebbb8c1d432d6973cedde7444a21910f4f -->
  Head `f55ce3fbfec4`; OPEN; author apoapostolov; age 3 days; updated 2026-11-15T10:33:09Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #401 [A reply the app cut goes on with what it already did, instead of starting over](https://github.com/eduwxyz/tucano/pull/401) <!-- head:d821e6408f0aed1220b0106d7e971c7a564b795b base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `d821e6408f0a`; CLOSED; author apoapostolov; age 2 days; updated 2026-11-15T10:33:35Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #402 [Kill the app in the middle of a reply and check what it offers afterwards](https://github.com/eduwxyz/tucano/pull/402) <!-- head:02f03426a79df9a0872bce4f88bd8f7ed4ebbca0 base:b76f9d8d28cecff8ca4a3319168ae7f00c1ab49f -->
  Head `02f03426a79d`; MERGED; author apoapostolov; age 2 days; updated 2026-11-15T18:11:14Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #411 [Reply to a message, and to the selected excerpt with ⌘L, stacked on #32](https://github.com/eduwxyz/tucano/pull/411) <!-- head:4eef728c8baa903a36f50086102682e347bceaa4 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `4eef728c8baa`; OPEN; author apoapostolov; age 2 days; updated 2026-11-14T10:32:09Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #412 [A killed reply with real work behind it offers Continue before Try again](https://github.com/eduwxyz/tucano/pull/412) <!-- head:7907872c214c0f7aa6378a3700bd81b5bffc208d base:d175567b0a12d885544d74c45792717a883287f5 -->
  Head `7907872c214c`; MERGED; author apoapostolov; age 2 days; updated 2026-11-15T10:33:33Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #447 [Give the OpenCode retry test the engine's own wait, not 200 ms](https://github.com/eduwxyz/tucano/pull/447) <!-- head:d0c1344e1e2fdd820a07250594ed9eeea8ab150e base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `d0c1344e1e2f`; CLOSED; author apoapostolov; age 1 days; updated 2026-11-15T09:15:13Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #448 [Fix the forwarder test's port race, which fails on the macOS runner](https://github.com/eduwxyz/tucano/pull/448) <!-- head:b2fb8034b2ecd64ee931ea605acd86ef851e5bc2 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `b2fb8034b2ec`; MERGED; author apoapostolov; age 1 days; updated 2026-11-15T09:10:38Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #453 [Give the delegation test's parked request 8 s, so it is still at it when Clara's answer lands](https://github.com/eduwxyz/tucano/pull/453) <!-- head:37407e1937df3559c4557b354b9cfb482255cf72 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `37407e1937df`; MERGED; author apoapostolov; age 1 days; updated 2026-11-15T09:10:18Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #457 [Pause a reply before its next step, and resume it there](https://github.com/eduwxyz/tucano/pull/457) <!-- head:925c557a9583a5b5b67466cd206e947ada0be928 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `925c557a9583`; OPEN; author apoapostolov; age 1 days; updated 2026-11-14T18:45:44Z; integration ancestry: present; review: targeted cancellation/concurrency repair verified and installed; broader feature audit remains.
- [ ] #467 [One agent can answer to more than one boss, so a shared specialist serves several teams](https://github.com/eduwxyz/tucano/pull/467) <!-- head:1f1fa3a5b358d5ffb1b4470817cae0cbcb859335 base:d175567b0a12d885544d74c45792717a883287f5 -->
  Head `1f1fa3a5b358`; OPEN; author apoapostolov; age 0 days; updated 2026-11-15T10:07:03Z; integration ancestry: inspect equivalence; review: not reviewed.

## Features, usability and accessibility

- [ ] #232 [Fix the high-risk hold button losing the press before it fills](https://github.com/eduwxyz/tucano/pull/232) <!-- head:288f4d9b1b655093a40c14f8f62e72b5694b00f7 base:0183f0c96b47014e187837cd086648550f1f402e -->
  Head `288f4d9b1b65`; MERGED; author apoapostolov; age 6 days; updated 2026-11-10T15:50:58Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #243 [Read an agent limit of 0 as no ceiling, not as already spent](https://github.com/eduwxyz/tucano/pull/243) <!-- head:e389fd7c5e114eebeaba25386a3be8799efb371f base:cd4bc4de1a5aaa0684a0f1769d0f1b52cc251443 -->
  Head `e389fd7c5e11`; MERGED; author apoapostolov; age 6 days; updated 2026-11-10T15:50:57Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #244 [Filter and group the skills in an agent's tab, and fix where a skill came from](https://github.com/eduwxyz/tucano/pull/244) <!-- head:9b7068fd095c9d3fdb1b42c6ab22ea9ae37c6b9c base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `9b7068fd095c`; MERGED; author apoapostolov; age 6 days; updated 2026-11-14T00:17:57Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #245 [Show the model's thinking as dim, small, live text, not only a Thinking… label](https://github.com/eduwxyz/tucano/pull/245) <!-- head:359c199db4ad8c6a7ef616237d9d23e0ad781e12 base:6a7153994b7b98488402df206e5a8f4fdc4da853 -->
  Head `359c199db4ad`; OPEN; author apoapostolov; age 6 days; updated 2026-11-15T15:26:06Z; integration ancestry: inspect equivalence; review: in progress; retained-text reading-position defect reproduced; full audit incomplete (stale).
- [ ] #248 [Keep the open question next to the field, not only where it was asked](https://github.com/eduwxyz/tucano/pull/248) <!-- head:f32b6ece5d5f849d8da9a480c6ee16a6457fd66b base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `f32b6ece5d5f`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T10:31:36Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #250 [Modern, accessible reordering for every sidebar list: hold a row, see where it lands, move it with the keyboard](https://github.com/eduwxyz/tucano/pull/250) <!-- head:a80371891b99ec739eee6a9af762b184676dea21 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `a80371891b99`; OPEN; author apoapostolov; age 6 days; updated 2026-11-14T10:17:30Z; integration ancestry: inspect equivalence; review: reviewed; browser checks pass; platform coverage remains (stale).
- [ ] #251 [Stop the guide's Portuguese from leaking into what agents write (dates by locale, guide labelled)](https://github.com/eduwxyz/tucano/pull/251) <!-- head:0fa3949a57fa232c35cb3c06e60a6d474a90c8c9 base:35db1c360e5178ee7daf6c8a635a79ae031fcf59 -->
  Head `0fa3949a57fa`; MERGED; author apoapostolov; age 6 days; updated 2026-11-10T15:50:44Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #272 [Channels: mention mode — an agent in the room that answers only when mentioned](https://github.com/eduwxyz/tucano/pull/272) <!-- head:cb2e56550b56ce61f853a894d06ebfd8c42efeab base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `cb2e56550b56`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T10:31:41Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #279 [Channels: a listen mode — Jev brings the expensive agent in when the message needs it and the room can't do without it](https://github.com/eduwxyz/tucano/pull/279) <!-- head:2e1e8c0ada4d12f87b2541c164a1d4286e99fdbd base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `2e1e8c0ada4d`; OPEN; author apoapostolov; age 5 days; updated 2026-11-15T10:32:47Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #284 [An agent's question can mark the option Jev would pick](https://github.com/eduwxyz/tucano/pull/284) <!-- head:8eb84a079bf525772fda7cbf8b215920b34151a5 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `8eb84a079bf5`; OPEN; author apoapostolov; age 5 days; updated 2026-11-15T10:32:49Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #289 [Two tests that only fail on a real developer's machine: the git hooks folder and the case of PATH](https://github.com/eduwxyz/tucano/pull/289) <!-- head:4c30160c91562d8512e02a884d7f04f5df1c0cc9 base:95e6b6210422f4b9128fb648c1958dae86eb5851 -->
  Head `4c30160c9156`; CLOSED; author apoapostolov; age 5 days; updated 2026-11-10T17:53:16Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #290 [Keep each prompt above the session it started, and add a glyph that goes back to it](https://github.com/eduwxyz/tucano/pull/290) <!-- head:7b78c668910dc9b1c5d8d472fb1e53ff3ca58509 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `7b78c668910d`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T10:31:46Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #293 [Make two tests hold on a machine with a global core.hooksPath, and on how a machine spells PATH](https://github.com/eduwxyz/tucano/pull/293) <!-- head:790e5c19e6ecd423e45f26aa909931660776fd75 base:95e6b6210422f4b9128fb648c1958dae86eb5851 -->
  Head `790e5c19e6ec`; MERGED; author apoapostolov; age 5 days; updated 2026-11-10T17:53:05Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #296 [Name your own memories "You" so the tab fits on one line (closes #295)](https://github.com/eduwxyz/tucano/pull/296) <!-- head:84606ac2318737706ea981b486763db761f15a10 base:d5df340d08ba437b3b776846827f59f22b48e649 -->
  Head `84606ac23187`; MERGED; author apoapostolov; age 5 days; updated 2026-11-12T09:07:29Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #299 [docs: a review bot on every pull request, so security and bug review happens during development](https://github.com/eduwxyz/tucano/pull/299) <!-- head:4167ee213378c779fcd9073cef5e2e0a83566d2c base:95e6b6210422f4b9128fb648c1958dae86eb5851 -->
  Head `4167ee213378`; CLOSED; author apoapostolov; age 5 days; updated 2026-11-10T14:22:05Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #310 [Stop teaching a model Portuguese in an English workspace: language-free screen ids, the guide index, and a test that notices](https://github.com/eduwxyz/tucano/pull/310) <!-- head:bfc3f4b6db05d76140caadaaa19ff82adca1e249 base:95e6b6210422f4b9128fb648c1958dae86eb5851 -->
  Head `bfc3f4b6db05`; MERGED; author apoapostolov; age 5 days; updated 2026-11-14T00:17:48Z; integration ancestry: present; review: not reviewed.
- [ ] #311 [Read a Hermes skill library as it is: categories one level down, versions, and the facets it is navigated by](https://github.com/eduwxyz/tucano/pull/311) <!-- head:35e98635fad7a560d417877cbb8dcffbaf16b6c4 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `35e98635fad7`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T12:58:47Z; integration ancestry: present; review: targeted source-label repair verified; full skills audit remains.
- [ ] #313 [Settings › Models: change the thinking on the bulk change and on every agent](https://github.com/eduwxyz/tucano/pull/313) <!-- head:ed0f2b71c935c26760e0d04150bc6eda70858cb8 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `ed0f2b71c935`; OPEN; author apoapostolov; age 5 days; updated 2026-11-15T10:33:46Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #316 [Stop calling a slow Chrome and a starved Windows test a failure: 90 s to open, 60 s on Windows](https://github.com/eduwxyz/tucano/pull/316) <!-- head:9e2ab1bc4aa15c11674798e7ec542ed9a98ab640 base:95e6b6210422f4b9128fb648c1958dae86eb5851 -->
  Head `9e2ab1bc4aa1`; MERGED; author apoapostolov; age 5 days; updated 2026-11-10T17:53:09Z; integration ancestry: present; review: not reviewed.
- [ ] #319 [Let the Tuca set the skills a bot follows, and show them in ver_estado](https://github.com/eduwxyz/tucano/pull/319) <!-- head:18e886de68381f186b74d31eea96ff754239ea5f base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `18e886de6838`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T10:31:54Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #329 [Remember a conversation's steps folded, so coming back to it finds them folded (#328)](https://github.com/eduwxyz/tucano/pull/329) <!-- head:e7dae3e86626c9955f002c0854940b2a2fd6372c base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `e7dae3e86626`; OPEN; author apoapostolov; age 5 days; updated 2026-11-14T11:43:25Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #336 [Right-click a picture: save it, copy it, or put it back in the prompt (#335)](https://github.com/eduwxyz/tucano/pull/336) <!-- head:c92b50d753e5ab87e63a66980222f54c8fc1c824 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `c92b50d753e5`; OPEN; author apoapostolov; age 5 days; updated 2026-11-15T10:33:41Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #351 [Read 0 as no monthly limit on the screens too, not as spent](https://github.com/eduwxyz/tucano/pull/351) <!-- head:885fc11772e36981e5498ccc32826ad8e9d8dc67 base:add03562701c3a608fbddaa2e62de098c82e07b0 -->
  Head `885fc11772e3`; MERGED; author apoapostolov; age 4 days; updated 2026-11-12T08:43:52Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #352 [Let a configured MCP server wear the image the person gives it, from a file or an https address](https://github.com/eduwxyz/tucano/pull/352) <!-- head:31e5ddb3589412464d742520e4971bcd4fea4c80 base:b436f4af311e31259e50fc466c4289e32fb51b3e -->
  Head `31e5ddb35894`; CLOSED; author apoapostolov; age 4 days; updated 2026-11-11T22:04:22Z; integration ancestry: present; review: not reviewed.
- [ ] #366 [Let a routine say nothing when it has nothing to report](https://github.com/eduwxyz/tucano/pull/366) <!-- head:328cbb76746b7012f7af7199b49e489d55738c82 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `328cbb76746b`; OPEN; author apoapostolov; age 4 days; updated 2026-11-14T08:17:57Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #377 [Bring a hand-off answer back however it ends, and knock on a request nobody answered](https://github.com/eduwxyz/tucano/pull/377) <!-- head:76715c454620aaa0e6a08b63cddbc6f6adf00861 base:d88a53571cdec1ba8c75746260576460c15bd30b -->
  Head `76715c454620`; MERGED; author apoapostolov; age 3 days; updated 2026-11-15T13:55:25Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #379 [Expand Jev into a Classifiers section: TypeSafe, OpenRouter, OpenAI and Google](https://github.com/eduwxyz/tucano/pull/379) <!-- head:e614d4e6509892e3229ff37f77328e2d8154412e base:04539404e545323124e5dd4737098892cd746226 -->
  Head `e614d4e65098`; OPEN; author apoapostolov; age 3 days; updated 2026-11-15T10:33:39Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #383 [Classifiers on all six jobs: the section, stacked on #279, #284, #298 and #333](https://github.com/eduwxyz/tucano/pull/383) <!-- head:ed26fdc6600381b3d106ed9ddda2d509ce70f02a base:04539404e545323124e5dd4737098892cd746226 -->
  Head `ed26fdc66003`; OPEN; author apoapostolov; age 3 days; updated 2026-11-15T10:33:37Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #386 [Emit fake sign-in output before resolving its exit](https://github.com/eduwxyz/tucano/pull/386) <!-- head:7e5c0bc77f6a8b7b83dcaf3ba545e8ae2d113fdd base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `7e5c0bc77f6a`; MERGED; author apoapostolov; age 3 days; updated 2026-11-14T00:15:43Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #395 [Let the person read times as a 24-hour clock, or a 12-hour one](https://github.com/eduwxyz/tucano/pull/395) <!-- head:e5e1a18e738ccb47fd34b09bbda5979ec4dcab07 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `e5e1a18e738c`; OPEN; author apoapostolov; age 3 days; updated 2026-11-14T12:44:05Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #408 [Attach images and files when asking from the Team page](https://github.com/eduwxyz/tucano/pull/408) <!-- head:21dad75fe25ee891d7d26041f49a631d23596440 base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `21dad75fe25e`; CLOSED; author apoapostolov; age 2 days; updated 2026-11-13T12:23:31Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #410 [Clarify English settings labels and shorten interface hints](https://github.com/eduwxyz/tucano/pull/410) <!-- head:2a303deebe24aad13869a0a981367ff164ab683c base:04539404e545323124e5dd4737098892cd746226 -->
  Head `2a303deebe24`; OPEN; author apoapostolov; age 2 days; updated 2026-11-14T14:24:02Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #416 [Let a Grok login be another account, in Settings › Accounts](https://github.com/eduwxyz/tucano/pull/416) <!-- head:dadd7e7d831cace3704f4046550c7aacfd3e9755 base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `dadd7e7d831c`; OPEN; author apoapostolov; age 2 days; updated 2026-11-14T10:32:10Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #417 [Notifications over every window](https://github.com/eduwxyz/tucano/pull/417) <!-- head:c447ee919450f86742170d923d3bbee2cec0b95a base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `c447ee919450`; OPEN; author apoapostolov; age 2 days; updated 2026-11-15T10:33:30Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #422 [Skin the toast in the app's orange instead of the primary that inverts to white](https://github.com/eduwxyz/tucano/pull/422) <!-- head:c827296caf68d438aa6395c7cb1035212ebdefc3 base:73b724bec8a576d316a5dd5f46a07e3bf83cbe75 -->
  Head `c827296caf68`; MERGED; author apoapostolov; age 2 days; updated 2026-11-14T00:16:11Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #424 [Control room visibility and agent read access](https://github.com/eduwxyz/tucano/pull/424) <!-- head:e5899459b70be1b5aa33e94dbe0019d86e05f25c base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `e5899459b70b`; OPEN; author apoapostolov; age 2 days; updated 2026-11-14T09:17:50Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #435 [A bot can look after something for you between conversations](https://github.com/eduwxyz/tucano/pull/435) <!-- head:efa3cbe7c5bc5b1e06bbb0902d2fb63980a59999 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `efa3cbe7c5bc`; OPEN; author apoapostolov; age 1 days; updated 2026-11-15T10:33:28Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #437 [Give the file its space back, and say whether it is sound](https://github.com/eduwxyz/tucano/pull/437) <!-- head:a31233ed53f8d690b6d0e23253fe6c184546e7cd base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `a31233ed53f8`; OPEN; author apoapostolov; age 1 days; updated 2026-11-15T10:33:15Z; integration ancestry: inspect equivalence; review: migration-compatible counter assertion repaired; full feature audit remains (stale).
- [ ] #445 [Give the two core-boot tests the budget Windows already has](https://github.com/eduwxyz/tucano/pull/445) <!-- head:13440052bdd92f223f4a73c0464f602c0e0b8cdc base:68cf5da1cb5a1f589926ac819c46d9ffd7645988 -->
  Head `13440052bdd9`; MERGED; author apoapostolov; age 1 days; updated 2026-11-15T09:10:55Z; integration ancestry: inspect equivalence; review: CI explanation corrected; budget changes not integrated.
- [ ] #446 [Organize settings by task with accessible section navigation](https://github.com/eduwxyz/tucano/pull/446) <!-- head:ea0f090c2be51671ab71f71293100ce3ff6cb345 base:04539404e545323124e5dd4737098892cd746226 -->
  Head `ea0f090c2be5`; OPEN; author apoapostolov; age 1 days; updated 2026-11-14T13:15:11Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #451 [Write the guide's 24 pages in English too, and hand each workspace its own](https://github.com/eduwxyz/tucano/pull/451) <!-- head:6dcfa7a99ddee2de957d4ead5e27ecc0348dc86f base:04539404e545323124e5dd4737098892cd746226 -->
  Head `6dcfa7a99dde`; OPEN; author apoapostolov; age 1 days; updated 2026-11-14T11:19:09Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #468 [fix: bound skill comparisons and preserve complete large versions](https://github.com/eduwxyz/tucano/pull/468) <!-- head:82e9aaf6accab0fc0db5523d62746d26fe9ab715 base:abf597a1304b1a5a996006ee58cbe892c88dc704 -->
  Head `82e9aaf6acca`; MERGED; author apoapostolov; age 0 days; updated 2026-11-15T13:54:53Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #471 [Keep older retries within their original conversation context](https://github.com/eduwxyz/tucano/pull/471) <!-- head:dd9f86c31b1fa4b64f5be2a9eaba3b4a1b5be99b base:3e8162ebbb8c1d432d6973cedde7444a21910f4f -->
  Head `dd9f86c31b1f`; MERGED; author apoapostolov; age 0 days; updated 2026-11-15T13:39:56Z; integration ancestry: inspect equivalence; review: not reviewed.
- [ ] #472 [Extract Skills components without changing behavior or copy](https://github.com/eduwxyz/tucano/pull/472) <!-- head:e11417210356131e0253984652981257afbdebee base:b76f9d8d28cecff8ca4a3319168ae7f00c1ab49f -->
  Head `e11417210356`; MERGED; author apoapostolov; age 0 days; updated 2026-11-15T18:10:45Z; integration ancestry: inspect equivalence; review: not reviewed.
