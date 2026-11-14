# Settings architecture and delivery plan

Prepared before implementation, 13 November 2026. Starting TucanoNext: `a945d3c57e2889490810a82484f62af16289398f`. Upstream main: `73b724bec8a576d316a5dd5f46a07e3bf83cbe75`. This is a settings placement review, not a signoff on every feature in the PR inventory.

## What the reorganization must solve

The current General page mixes personal appearance, workspace identity, recovery, dictation, notifications, conversation display, updates, team transfer, backups and workspace deletion. Agents mixes permissions, classifier-assisted behavior, scheduling, startup, skill folders, budgets, send behavior and approval expiry. Memory configuration lives under Models; Wiki configuration lives in a separate dialog. Reply steps are under Sidebar while reasoning is under Conversation. A new feature can therefore find several plausible homes and still make related controls harder to find.

Organize by the decision the person is making. Keep one implementation and one canonical home for each control. Preserve settings keys, values, defaults, personal/workspace scope, permissions, runtime behavior, restart requirements and existing data. This project reorganizes configuration; it does not integrate every unmerged capability or invent settings for features that do not exist yet.

## Navigation and interaction

Use six main pages: **App, Workspace, Agents, Models, Knowledge, Connections**. Render only pages with an available section. Within the selected page, show a second row of section links. All that page's sections remain in one scrollable document; selecting a section scrolls to its beginning rather than hiding adjacent sections.

The main row is a real tab list because it switches panels. The second row is an in-page navigation landmark with links and `aria-current="location"`, because its targets remain visible together. Do not describe those links as another ARIA tab list. Keep the active link synchronized with manual scrolling. Both rows remain reachable while the content scrolls, and narrow navigation strips scroll horizontally instead of wrapping labels or overflowing the window.

Pointer activation uses an interruptible 280 ms ease-in-out scroll. Keyboard activation and reduced-motion preferences move immediately. A new selection, wheel/touch input, navigation or unmount cancels an existing animation. Section targets receive programmatic focus without an additional scroll. The target must clear both sticky navigation rows. Keep the active main tab in the keyboard tab order; support arrow keys, Home and End. Section links use native keyboard behavior. Do not intercept normal modified link actions.

Use stable section IDs rather than labels, translated text or DOM positions. Preserve legacy tab destinations (`geral`, `modelos`, `agentes`, `roteamento`, `integracoes`, `pessoas`, `atividade`, `servidores`) through an explicit mapping. Existing links must reach the appropriate new page/section even if a permission or capability removes a remembered destination. Navigation state remains UI state; it is not a new database preference.

Use a flat presentation within each page: plain section headings, spacing and thin dividers. Settings sections and their nested groups do not use rounded cards, raised surfaces or shadows. Keep the existing input and button affordances.

## Canonical placement

Section order is intentional: common choices first, advanced setup later, destructive actions last. Labels below are the proposed concise English navigation labels; Portuguese labels follow the existing localization pattern.

| Page / section ID | Contents and owned settings | Access and scope to preserve |
| --- | --- | --- |
| App / `app-appearance` | Theme, interface/workspace language, time format where implemented | Personal preferences; explain existing workspace-language behavior for admins |
| App / `app-conversation` | Reasoning visibility/height, step display/count, expand steps while working, reply shortcut where implemented | Personal display/input behavior; no new feature toggle invented |
| App / `app-sidebar` | Personal screen order/visibility guidance; empty Asks and Approvals visibility | Screen dragging stays in the sidebar's contextual editor. Members see personal guidance; automatic empty-section controls remain admin-only |
| App / `app-notifications` | Sounds, notification appearance, timing, placement, interaction and test notification | Personal preferences; preserve explicit approval safeguards |
| App / `app-dictation` | Dictation engine, model, downloads and existing permission guidance | Existing admin/capability checks |
| App / `app-startup` | Launch at login | App-wide action, configured in the default workspace; retain installed-app restriction |
| App / `app-updates` | Version, release notes and existing update controls | Existing admin access; TucanoNext remains updates off; upstream keeps its own update behavior |
| Workspace / `workspace-context` | Workspace label, owner's name, shared agent context and introduction/checklist actions | Admin; owner's name remains owner-only |
| Workspace / `workspace-people` | People, profile, coverage and roles | Existing team-mode/member/admin/owner rules |
| Workspace / `workspace-activity` | Audit activity | Team-mode admins |
| Workspace / `workspace-transfer` | Import/export team configuration | Existing admin restrictions and warnings |
| Workspace / `workspace-backups` | Backup export, restore and replacement warnings | Owner, as required by the existing component; automatic-backup timing is not a new configurable control |
| Workspace / `workspace-danger` | File health/space reclamation, history retention/wipe, workspace deletion | Admins manage data and retention; workspace deletion remains owner-only inside the existing component. Last in the page |
| Agents / `agents-replies` | Send mode and consecutive agent reply cap | Workspace defaults; per-agent/conversation controls stay in their existing local editors |
| Agents / `agents-recovery` | Resume after restart, inactivity timeout | Workspace behavior; paused/stopped work semantics remain intact |
| Agents / `agents-permissions` | Autonomy, action rules, outside-workspace guard, approval expiry | Workspace defaults; retain per-agent overrides and risk disclosures |
| Agents / `agents-limits` | Monthly default token budget and per-reply percentage | Workspace defaults; zero/unlimited meaning stays unchanged |
| Agents / `agents-automation` | Quiet hours for routines and triggers | Workspace scheduling; explain that direct messages still receive replies |
| Agents / `agents-collaboration` | Team-up retention | Workspace retention; zero still keeps channels |
| Agents / `agents-skills` | Detected/custom skill folders and enable/disable controls | Workspace defaults; individual skill assignments remain on agent profiles |
| Models / `models-agents` | Bulk and per-agent model/reasoning assignment panel | Admin; keep per-agent model settings accessible in the profile too, using existing implementation |
| Models / `models-runtimes` | Runtime detection and setup | Admin; preserve credentials and gateway disclosures |
| Models / `models-accounts` | Claude Code, Codex and Grok accounts where implemented | Admin; sign-in remains in the CLI |
| Models / `models-classifiers` | Provider configuration, job assignments, browser matching, suggested answers and next steps | Admin; keep external-data disclosures beside the relevant controls |
| Models / `models-routing` | Smart routing enablement and pools, when implemented | Admin; agent-specific routing can keep pools available while the global default is off |
| Knowledge / `knowledge-memory` | Memory model and learning policy | Admin; knowledge behavior rather than general model setup |
| Knowledge / `knowledge-wiki-capture` | Conversation capture, existing-page approvals, weekly review | Existing Wiki permissions; keep per-conversation capture override local |
| Knowledge / `knowledge-wiki-resolver` | Resolver enablement, agent/model selection and fallback | Only when that capability exists; retain reset and approval behavior |
| Knowledge / `knowledge-wiki-storage` | Folder choice and Git synchronization | Existing filesystem/network permissions and destructive-change confirmations |
| Knowledge / `knowledge-wiki-import` | Obsidian import entry point | Reuse the Wiki import flow; preserve source files |
| Knowledge / `knowledge-wiki-rules` | Schema/page-rules entry point | Reuse the existing Wiki editor |
| Connections / `connections-phone` | Phone access, Telegram and gateway disclosure | Owner; preserve default-workspace limitations |
| Connections / `connections-servers` | Remote server configuration | Admin and supported capability only |

Connectors, individual agents, channels, routines and workspaces remain objects with their own editors. A shortcut to their canonical editor is appropriate; reproducing all their fields in global Settings is not. Personal settings and administrative defaults must not become duplicates merely because both are relevant to the same feature.

## Implementation design

Create a typed settings structure with stable page/section IDs, localized labels, visibility rules and setting-key ownership. Render sections in that declared order instead of accumulating scattered `pane(...)` conditions. Keep component definitions, handlers and RPC methods intact. The rendering map must be checked against the structure so a declared section cannot silently lack content.

The ownership check follows literal Settings writes through the rendered component graph, including shared components and the selected Wiki part. Its parser is an explicit development-only dependency at the version already used by the locked development toolchain; runtime dependencies are unchanged. Dynamic patches and RPC-only controls remain review obligations. Tests must demonstrate that misplaced or undeclared writes, duplicate ownership and missing rendering slots fail the check.

Extract reusable section navigation and scrolling behavior. It must work within `.page__scroll`, account for the sticky header's measured height, survive small viewports, avoid focus jumps during scroll tracking and cancel stale animation frames. Use existing React/CSS and browser APIs; no animation or navigation dependency is needed.

Reuse Wiki controls in central Knowledge settings and the contextual Wiki entry point. One controls component owns their behavior. The contextual dialog can keep the quick workflow, while section-level components let Knowledge expose useful anchors without duplicating handlers. Import/schema actions must still lead to the existing Wiki flows.

Split mixed cards by meaning: appearance from workspace context; reply steps from sidebar visibility; send behavior from token budgets; approval expiry from budgets; startup from routine scheduling; recovery from General. Put classifier-assisted features with their providers and job assignments. Keep a nearby cross-link when a person needs to configure a related feature elsewhere.

## Moderation for future features

Every proposed setting needs a short placement record before coding: user decision, whether a configurable choice is necessary, setting key/path, canonical page and section, scope, permitted roles, default, dependent controls, persistence/restart behavior, overrides, privacy/destructive consequences and copy/layout evidence. Add a new section only when its user task differs from existing sections. Do not create an empty page for a future feature, a Miscellaneous bucket, or an independent top-level tab for a single switch.

The six-page structure is a maintained baseline, not a numerical law. A new main page requires an updated architecture proposal explaining why existing tasks do not fit, which settings move, and how navigation will remain usable at narrow widths. Resolve placement overlaps before merging a feature. Record the canonical destination in the feature's existing issue/PR and keep its branch aligned as neighboring features land.

Future autonomous work belongs in Agents: execution/scheduling under Automation, authority under Permissions, resource caps under Limits, and shared purpose under Workspace context. Do not add heartbeat, initiative or budget placeholders before the feature exists. Other future features follow the same ownership rule.

## Existing PRs and upstream compatibility

Review every authored PR at its current head, including merged/closed dispositions. Modify open branches only where they add or inherit a misplaced settings control. A PR whose controls already have a suitable home needs a recorded no-change disposition, not a cosmetic commit. Never reopen merged/closed PRs for this work. Agent-specific controls and direct conversation actions retain their local editors.

Use two compatible deliveries:

1. TucanoNext receives the complete structure with all currently integrated controls.
2. The original project receives an upstream-main-based overhaul containing only capabilities it already has. Its settings values and product/update identity remain unchanged. Existing feature PRs use the nearest matching location in the current upstream tabs until the overhaul is accepted; they must not depend on an unaccepted global redesign merely to render one setting.

For legacy tabs: App sections use General; Workspace management remains together in General with People/Activity access intact; agent behavior/recovery/limits/automation/skills use Agents; classifier configuration and related opt-ins use Models; Knowledge keeps Memory under Models and reuses the Wiki dialog until the central page exists; Phone/Servers retain their working entry points. Keep Routing next to Models while it still requires a standalone legacy tab. Document these deliberate compatibility limits rather than claim every upstream branch already uses the complete new hierarchy.

Review the real feature head and discussions before changing it. Some stacked branches inherit the same send-mode or classifier setting; apply the same placement consistently without transplanting unrelated runtime changes or rebuilding old stacks into next. Keep revisions on their existing PRs and provide fresh evidence from the pushed head. Preserve newer fork runtime implementations when porting layout changes across divergent histories.

## Validation and delivery checklist

- [x] Read workflow, audit history, current source and role policy; record starting refs.
- [x] Refresh the authored PR inventory and inspect settings-related heads and discussions.
- [x] Write the architecture, ownership rules, compatibility limits and proposed placements before implementation.
- [x] Add governance to AGENTS.md and a typed placement/visibility contract.
- [x] Implement the TucanoNext structure and reusable Wiki controls; built-UI verification remains below.
- [ ] Cover category/section navigation, scroll tracking, cancellation, keyboard input, reduced motion, legacy destinations, roles and unavailable capabilities.
- [ ] Review every PR's disposition; move misplaced controls on applicable open feature branches and verify their published heads.
- [ ] Build an upstream-main-only counterpart and open a focused overhaul PR with neutral rationale and immutable screenshots.
- [ ] Check built UI at 900/1280 px and smaller supported widths, long values, both locales, enabled/disabled configurations and personal/admin/owner roles. Measure copy and navigation overflow.
- [ ] Pass typecheck, final full suite and build; inspect the resulting app using isolated data and fake engines.
- [ ] Integrate without overwriting concurrent work, push and verify remote next, install through the helper and smoke-check the installed executable.
- [ ] Rebuild the fork's 0.2.28 release assets/tag/notes because this changes a released settings surface; verify server hashes and real downloads.
- [ ] Record exact delivered heads, test results, screenshots, installer, installed-app result and remaining limitations.

## PR placement review

The following table records the initial placement screening. “Keep” means the feature has no misplaced global control at this snapshot, not that every audit dimension passed. Updated heads and delivery evidence will be recorded as branches are changed.

Implementation update, 14 November: reconciled the published integration through `8025930`, including the coordinator, history retention, database maintenance and personal sidebar ordering. Coordinator configuration stays in its per-person conversation dialog; it is not a new global default. Sidebar order/visibility stays editable in the sidebar and is explained under App / Sidebar. The existing data-safety component keeps file health, retention and deletion together under Workspace / Data and deletion, with its updated admin/owner distinctions. These controls are preserved rather than replaced by older settings markup.

Snapshot: 2026-11-13T18:30:25.651Z; 79 authored PRs screened. Heads with settings-related discussions were re-read before this plan; later head changes require a fresh check.

| PR | State / reviewed head | Placement disposition |
| --- | --- | --- |
| [#232](https://github.com/eduwxyz/tucano/pull/232) Fix the high-risk hold button losing the press before it fills | MERGED; `288f4d9b1b655093a40c14f8f62e72b5694b00f7` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#243](https://github.com/eduwxyz/tucano/pull/243) Read an agent limit of 0 as no ceiling, not as already spent | MERGED; `e389fd7c5e114eebeaba25386a3be8799efb371f` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#244](https://github.com/eduwxyz/tucano/pull/244) Filter and group the skills in an agent's tab, and fix where a skill came from | OPEN; `9b7068fd095c9d3fdb1b42c6ab22ea9ae37c6b9c` | Keep agent-local skill controls; no new global setting. |
| [#245](https://github.com/eduwxyz/tucano/pull/245) Show the model's thinking as dim, small, live text, not only a Thinking… label | OPEN; `4c07c283463e79feab753cc6cb89707ca20f07ca` | Keep General conversation display; full destination App / Conversation. |
| [#246](https://github.com/eduwxyz/tucano/pull/246) Close a reply when its approval is decided, and repair the ones already stuck | MERGED; `8f56144dfdad498277b7b1e2c4e73424e9a2a35c` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#247](https://github.com/eduwxyz/tucano/pull/247) Add a Questions section above Approvals, with every agent's question in one place | OPEN; `0aa0982616edbc9ec8bda3b580779ca0a3b2cf81` | Keep General sidebar visibility; full destination App / Sidebar. |
| [#248](https://github.com/eduwxyz/tucano/pull/248) Keep the open question next to the field, not only where it was asked | OPEN; `c3dbc7f5ba71e3bfd8e38fafc32f046d00d31050` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#249](https://github.com/eduwxyz/tucano/pull/249) Clear a conversation's history without deleting the conversation | OPEN; `5ad7dc515476e6bde4d21ec0927052fa1d4fc5ea` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#250](https://github.com/eduwxyz/tucano/pull/250) Modern, accessible reordering for every sidebar list: hold a row, see where it lands, move it with the keyboard | OPEN; `fa14f9f479eaccd8f7cb64682950c95c993e790e` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#251](https://github.com/eduwxyz/tucano/pull/251) Stop the guide's Portuguese from leaking into what agents write (dates by locale, guide labelled) | MERGED; `0fa3949a57fa232c35cb3c06e60a6d474a90c8c9` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#258](https://github.com/eduwxyz/tucano/pull/258) Wiki: let "Write the page" hand a missing page to an agent you pick | OPEN; `31b0cdcf63c967140be703919995009d376f4dc2` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#259](https://github.com/eduwxyz/tucano/pull/259) Wiki: let "Nothing links to them" hand the orphan pages to an agent that links them | OPEN; `05f99de5d963ae57bf99c7f61c27e3cd97b6b8d4` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#261](https://github.com/eduwxyz/tucano/pull/261) A new prompt in a thread: parallel, queued, steer or interrupt, on a setting and on the keys | OPEN; `640c23cb66d9009285b79b6c0a49c60ab54df83d` | Move send mode out of Limits into Agents reply behavior. |
| [#268](https://github.com/eduwxyz/tucano/pull/268) Wiki: give a finding the review can't settle a Resolve button and a built-in resolver | OPEN; `710a1589681a6ca7a939b8de8498d0f877c26c50` | Keep resolver beside Wiki curation; full destination Knowledge / Wiki resolver. |
| [#272](https://github.com/eduwxyz/tucano/pull/272) Channels: mention mode — an agent in the room that answers only when mentioned | OPEN; `eb21db8f8839423476c9ea333905cfd6897b0ce0` | Keep channel-specific mention mode in channel membership controls. |
| [#274](https://github.com/eduwxyz/tucano/pull/274) Team-ups: an agent that calls one outside the room gets a channel that carries the work | OPEN; `0605a112ad51835498a182e11f253a4dbd493715` | Move team-up retention beside agent collaboration/scheduling controls, before skill setup. |
| [#275](https://github.com/eduwxyz/tucano/pull/275) In a long run, keep "Reply in thread" at the top-right corner of the steps while they scroll | OPEN; `631705894b5e13ff9147f2f4b50f2a7105d449d5` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#279](https://github.com/eduwxyz/tucano/pull/279) Channels: a listen mode — Jev brings the expensive agent in when the message needs it and the room can't do without it | OPEN; `67796cd066f3f5f9a3ff3eb311b8d0e8c54465c7` | Keep channel-local listen mode; model/provider setup belongs with Models. |
| [#282](https://github.com/eduwxyz/tucano/pull/282) A drawer above the field: the sessions running right now, and the prompts still queued | CLOSED; `13056bc1206259af1b9c09ea3893d1047d5e68ba` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#284](https://github.com/eduwxyz/tucano/pull/284) An agent's question can mark the option Jev would pick | OPEN; `7d7fa9c93dbe7e35f3208c93d3e68472140f8f13` | Move suggested-answer opt-in from Agents to Models beside its decision model/provider. |
| [#288](https://github.com/eduwxyz/tucano/pull/288) Attach a work drawer above the field: the replies running now, and the prompts queued behind them | OPEN; `10448f6b4c713db88f38e53e724dae5bce34b0f3` | Align inherited send-mode placement with #261 without replacing drawer behavior. |
| [#289](https://github.com/eduwxyz/tucano/pull/289) Two tests that only fail on a real developer's machine: the git hooks folder and the case of PATH | CLOSED; `4c30160c91562d8512e02a884d7f04f5df1c0cc9` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#290](https://github.com/eduwxyz/tucano/pull/290) Keep each prompt above the session it started, and add a glyph that goes back to it | OPEN; `9a7015cbfb248f70e04c2096d19742cb4c384ad9` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#293](https://github.com/eduwxyz/tucano/pull/293) Make two tests hold on a machine with a global core.hooksPath, and on how a machine spells PATH | MERGED; `790e5c19e6ecd423e45f26aa909931660776fd75` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#296](https://github.com/eduwxyz/tucano/pull/296) Name your own memories "You" so the tab fits on one line (closes #295) | MERGED; `84606ac2318737706ea981b486763db761f15a10` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#298](https://github.com/eduwxyz/tucano/pull/298) Give a reply a card of next steps: every box ticked, so nothing it proposed is buried | OPEN; `f15d1b69f53d794b4d0c7fb705dbff399ad1edda` | Move suggested-answer/next-step opt-ins to Models beside their provider configuration. |
| [#299](https://github.com/eduwxyz/tucano/pull/299) docs: a review bot on every pull request, so security and bug review happens during development | CLOSED; `4167ee213378c779fcd9073cef5e2e0a83566d2c` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#301](https://github.com/eduwxyz/tucano/pull/301) Run agents on Hermes, brought forward from #8 | CLOSED; `28c3fe6b240afc871b7d97f1b4fa8779f4a591f4` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#303](https://github.com/eduwxyz/tucano/pull/303) Draw a reply's pictures as one album: one large and the rest beside it | OPEN; `dd3c4dbbfc46c5849ac72912c970bac7cd52ba65` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#305](https://github.com/eduwxyz/tucano/pull/305) Show each provider's quota in Usage and limits, and the ones a session's bots run on in its header | OPEN; `9a646757fcc32c479b909037c69d6b9473271e24` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#308](https://github.com/eduwxyz/tucano/pull/308) Read skills from every harness's folder, and let the person add or turn off folders | CLOSED; `880945a109ba885bd40d850f9e67840de3487231` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#310](https://github.com/eduwxyz/tucano/pull/310) Stop teaching a model Portuguese in an English workspace: language-free screen ids, the guide index, and a test that notices | OPEN; `bfc3f4b6db05d76140caadaaa19ff82adca1e249` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#311](https://github.com/eduwxyz/tucano/pull/311) Read a Hermes skill library as it is: categories one level down, versions, and the facets it is navigated by | OPEN; `99d23fda3b88a23294dbb586e93fc4f578e63ad6` | Put skill folder setup at the end of Agents, after behavior and safety controls. |
| [#313](https://github.com/eduwxyz/tucano/pull/313) Settings › Models: change the thinking on the bulk change and on every agent | OPEN; `239652158776a334d1659d26f73ea24917d0e27b` | Keep bulk/per-agent model reasoning under Models; full destination Models / Agent models. |
| [#316](https://github.com/eduwxyz/tucano/pull/316) Stop calling a slow Chrome and a starved Windows test a failure: 90 s to open, 60 s on Windows | MERGED; `9e2ab1bc4aa15c11674798e7ec542ed9a98ab640` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#319](https://github.com/eduwxyz/tucano/pull/319) Let the Tuca set the skills a bot follows, and show them in ver_estado | OPEN; `84945e451d46c768d4be69ac6d78ad967f479de5` | Keep individual skill assignments in agent controls; no new global preference. |
| [#321](https://github.com/eduwxyz/tucano/pull/321) A stopped reply gets a second way back: try again in a direction you write | OPEN; `05da41e2ba1bbd62203f0863c0e07045e9c40325` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#322](https://github.com/eduwxyz/tucano/pull/322) A reply's steps: all, the latest few, or an expandable line of current activity (#314) | OPEN; `7813b0e7e1e3312824ca5b7e6ef5e7b7c7f4fdb9` | Move step display from Sidebar to the existing Conversation display group. |
| [#324](https://github.com/eduwxyz/tucano/pull/324) Run a testing checkout on DeepSeek 4.1 Flash, not on a Claude model it cannot reach | CLOSED; `fa86f966755fde85c6d1762ba4b59f95123c5446` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#325](https://github.com/eduwxyz/tucano/pull/325) Stop a busy CI machine from reddening the core startup test | MERGED; `21285ec8f239fb346b05bc8a2bb981e5ae4849d3` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#327](https://github.com/eduwxyz/tucano/pull/327) Let the line beside a run's steps fold them: a double-click, from wherever the run has scrolled to | OPEN; `0e8f39c877966bb696596c9403531eeac7ee4ef8` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#329](https://github.com/eduwxyz/tucano/pull/329) Remember a conversation's steps folded, so coming back to it finds them folded (#328) | OPEN; `83af1779c8c9440df1b517f1f7ad6eddb618fc49` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#332](https://github.com/eduwxyz/tucano/pull/332) Steer a reply that's still working from the bottom of its steps (#331) | OPEN; `6d920856413e6d4ecce8949e944accb58946527c` | Align inherited send-mode placement with #261; keep steering UI behavior unchanged. |
| [#333](https://github.com/eduwxyz/tucano/pull/333) Route each reply by what Jev reads in the prompt: six pools, roles with their own specialists, and a thin line that says why | OPEN; `a561e62abe80e993f3a1997d6700e5e2bae18e10` | Keep legacy Routing immediately beside Models; full destination Models / Routing. Preserve current standalone routing entry points until the overhaul exists. |
| [#334](https://github.com/eduwxyz/tucano/pull/334) Approval card: lead with the action and its target, and say what became of the call | OPEN; `8218bb1617e2f87c4f32e2c00c7df3c6bcc9ca4e` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#336](https://github.com/eduwxyz/tucano/pull/336) Right-click a picture: save it, copy it, or put it back in the prompt (#335) | OPEN; `7bbd5d353c3c779cbf6c18ac0a64461b71de0217` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#338](https://github.com/eduwxyz/tucano/pull/338) A finished reply goes on from where it stopped: Follow Up (#337) | OPEN; `0576c66430374012d7576f49f77383552f0edbe7` | Align inherited send-mode placement with #261; keep follow-up behavior unchanged. |
| [#339](https://github.com/eduwxyz/tucano/pull/339) CI: give a cold Chrome's first command the 90 s its open already has, and the Mac service test the 30 s the core tests have | MERGED; `0947e25e27f85d8c86ffe4ac8e63ee5ecc72af7b` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#341](https://github.com/eduwxyz/tucano/pull/341) Answer a routed message when the place it waits for is only marked busy | CLOSED; `17f32c58b7608e9a869e5baf40fbad9cc9a5f02e` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#343](https://github.com/eduwxyz/tucano/pull/343) Start a routed reply whose place was taken by a job that never ran | CLOSED; `41fd9ad104b47c5105ad180bb5616383b01fad95` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#351](https://github.com/eduwxyz/tucano/pull/351) Read 0 as no monthly limit on the screens too, not as spent | MERGED; `885fc11772e36981e5498ccc32826ad8e9d8dc67` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#352](https://github.com/eduwxyz/tucano/pull/352) Let a configured MCP server wear the image the person gives it, from a file or an https address | CLOSED; `31e5ddb3589412464d742520e4971bcd4fea4c80` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#353](https://github.com/eduwxyz/tucano/pull/353) Give a connector the picture it wears, instead of a black terminal | OPEN; `f6b78178c8ff00e848a4a636e65e98138235fc94` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#355](https://github.com/eduwxyz/tucano/pull/355) Give the wiki a tool card on the agent's Tools tab, with a level that writes pages | OPEN; `dd4793e236e47b9d6a18922cc8bd608fd55816ae` | Keep agent Wiki access in that agent’s Tools editor; no duplicate global grant. |
| [#366](https://github.com/eduwxyz/tucano/pull/366) Let a routine say nothing when it has nothing to report | OPEN; `2559d2021c7674b1a10439fd2b3d4d119f01599f` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#367](https://github.com/eduwxyz/tucano/pull/367) Check wiki SSH key cleanup without requiring a shell on PATH | MERGED; `9eb0701454f374ca186d47934da455d61705d4cb` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#368](https://github.com/eduwxyz/tucano/pull/368) Update the locked runtime packages past their security advisories | MERGED; `acb095d887ec27316ced0dba341d9342d792e1d8` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#372](https://github.com/eduwxyz/tucano/pull/372) Run isolated UI checks without taking desktop focus | OPEN; `143c719b51f3ac6cd88671ec81a250f61593fa95` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#373](https://github.com/eduwxyz/tucano/pull/373) Recheck wiki permissions and private pages during running replies | OPEN; `db5e0c835b35aad6d7e5f9ed06d42c513886252e` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#375](https://github.com/eduwxyz/tucano/pull/375) Delete a session from the room: a trash under its thread button, in two presses | OPEN; `b168251fd9489df38484852b6e6ec2d01cebd898` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#377](https://github.com/eduwxyz/tucano/pull/377) Bring a hand-off answer back however it ends, and knock on a request nobody answered | OPEN; `d696bdf8c6e8ebd402a949ca0012b08ec2d36370` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#379](https://github.com/eduwxyz/tucano/pull/379) Expand Jev into a Classifiers section: TypeSafe, OpenRouter, OpenAI and Google | OPEN; `4f1d014adc5d58d3c12bf2f9c788cf5ed6c9927a` | Keep classifier providers/job configuration under Models; full destination Models / Classifiers. |
| [#383](https://github.com/eduwxyz/tucano/pull/383) Classifiers on all six jobs: the section, stacked on #279, #284, #298 and #333 | OPEN; `b58ca55fcfae1f2a5db9a3fe02383ef893bdff21` | Group browser matching and suggestion opt-ins with Models / Classifiers; preserve the routing-switch integration described in the PR discussion. |
| [#385](https://github.com/eduwxyz/tucano/pull/385) Next steps open with every box clear; the classifier that ticks the ones worth doing now is a job in Classifiers | OPEN; `586d769f3e94799d80b8bfd67b30eecea250a5b5` | Group inherited suggestion opt-ins with Models / Classifiers; do not change checkbox defaults or execution. |
| [#386](https://github.com/eduwxyz/tucano/pull/386) Emit fake sign-in output before resolving its exit | OPEN; `7e5c0bc77f6a8b7b83dcaf3ba545e8ae2d113fdd` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#391](https://github.com/eduwxyz/tucano/pull/391) Resume interrupted replies after restart and fix older retries | OPEN; `9b3dc02dc97e1d63a51eb9bf2ed8903737089bfa` | Move restart recovery from General into Agents recovery. |
| [#392](https://github.com/eduwxyz/tucano/pull/392) Stop reading a date that opens a sentence as a missing wiki page | OPEN; `53e04fd590f2fc4c75aa6558f8a214f757c44a32` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#395](https://github.com/eduwxyz/tucano/pull/395) Let the person read times as a 24-hour clock, or a 12-hour one | OPEN; `bff2d26e57793ef4e8b470c77e9a796b86d255ee` | Group time format with appearance/language rather than reply reasoning; verify owner and member access. |
| [#397](https://github.com/eduwxyz/tucano/pull/397) Keep the Memory bot tabs inside the bar, and page them with two borderless arrows | OPEN; `5b65404cede4822b88307f0229c507aeb0697426` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#401](https://github.com/eduwxyz/tucano/pull/401) A reply the app cut goes on with what it already did, instead of starting over | OPEN; `4eaf8a4d1b28f07c8cd3b22d75a32c4502084ad9` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#402](https://github.com/eduwxyz/tucano/pull/402) Kill the app in the middle of a reply and check what it offers afterwards | OPEN; `8c7d9c0f144bdc7dd2073d38749c45271a6d5853` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#408](https://github.com/eduwxyz/tucano/pull/408) Attach images and files when asking from the Team page | CLOSED; `21dad75fe25ee891d7d26041f49a631d23596440` | Historical only; no branch edit. Maintain any accepted behavior in the current source. |
| [#410](https://github.com/eduwxyz/tucano/pull/410) Clarify English settings labels and shorten interface hints | OPEN; `96095da60fa4e3ee160f1a87a94d8f80e5c7da04` | Keep copy-only scope. New section labels and navigation are authored in the overhaul; do not turn the wording PR into a redesign dependency. |
| [#411](https://github.com/eduwxyz/tucano/pull/411) Reply to a message, and to the selected excerpt with ⌘L, stacked on #32 | OPEN; `b1f853788ffe48eae7ca4e041608b4ebacc52cb9` | Keep the reply shortcut in the conversation group; full destination App / Conversation. |
| [#412](https://github.com/eduwxyz/tucano/pull/412) A killed reply with real work behind it offers Continue before Try again | OPEN; `4946b56d8848a99b85c31258dd35a4ead2572823` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#416](https://github.com/eduwxyz/tucano/pull/416) Let a Grok login be another account, in Settings › Accounts | OPEN; `486f4c650de3185e32775ac0ba6386d5b2be3664` | Keep Grok sign-in in existing Models accounts; full destination Models / Accounts. |
| [#417](https://github.com/eduwxyz/tucano/pull/417) Notifications over every window | OPEN; `40bacfeb9626fda3e73fafe24959ec8ac99c0c20` | Keep notification controls with sounds; full destination App / Notifications. |
| [#419](https://github.com/eduwxyz/tucano/pull/419) Draw the wiki map in its first frame, and fit it again when the window changes size | OPEN; `a4707e82b10c6ac62aa98afc30d68a2927f99f47` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
| [#422](https://github.com/eduwxyz/tucano/pull/422) Skin the toast in the app's orange instead of the primary that inverts to white | OPEN; `c96244ff22575b6c4abf4636566b46aeabb98535` | Keep existing local feature/editor placement; no added global setting found in the current diff. |
