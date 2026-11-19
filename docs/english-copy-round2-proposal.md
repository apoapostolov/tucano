# English copy follow-up proposal

Source: `cf9d34fa6fff1fe9a7042a6785c827bb081683b3`; comparison: `7ba091c217eb6e3dab28b637c555de0126e560b5`. This is the editorial proposal before source implementation. The accompanying [complete review](english-copy-round2-review.json) records all 380 candidates, including retained strings. 179 replacements are proposed.

## Purpose and scope

Make new and changed interface text concise, grammatical, and consistent across Initiative, notifications, agent history, workspace data, conversation controls, Wiki, and validation errors. Keep agent as the ordinary product term, name actions directly, and distinguish disabled, paused, waiting, and failed states. Retain model-facing protocols and synthetic conversation content where rewriting would not improve the interface.

History confirmations must still identify exactly which messages disappear, what remains, and irreversibility. Retention must preserve daily cleanup, the zero/forever choice, agent overrides, and the effect on future replies. Initiative must preserve read/action scope and the rule that it cannot grant additional Autonomy. Notification approval copy must preserve high-risk hold behavior and future-tool permission. Workspace cloning must retain every exclusion and shared-folder consequence. No Portuguese, setting key, default, permission, persistence behavior, or interpolation expression is to change.

## Implementation and evidence plan

- [x] Inventory localized and unlocalized new/changed text since the previous delivered review.
- [x] Review every candidate and record exact keep/replace decisions.
- [ ] Apply English-only replacements and compare syntax trees to prove behavior and Portuguese are unchanged.
- [ ] Review affected tests and run typecheck, settings placement, full tests, and build.
- [ ] Measure actual labels and hints at 900 and 1280 CSS pixels, plus narrower supported web layouts, with realistic long values and enabled/custom states. Save screenshots and JSON with source, widths, font, characters, lines, and overflow.
- [ ] Verify the installed Electron renderer at native display scaling using hidden-window resizing rather than viewport emulation.
- [ ] Update existing feature PRs with their own copy changes and evidence, then install and verify the combined fork build.

Labels should occupy one line and hints at most two. Character counts are estimates, not acceptance thresholds. Explicit exceptions: agent/workspace message-deletion confirmations, workspace-clone exclusions, and restart interruption warnings may need more than two lines to preserve their consequences. They must remain fully visible. Model instructions and synthetic message bodies are not interface hints. Any layout failure requires a wording or suitable layout correction before delivery; do not truncate or shrink text.

## Exact replacements

| ID and location | Current English | Proposed English |
| --- | --- | --- |
| 2 · src/core/index.ts:2034 | A reply is at work right now. Optimize when it finishes. | A reply is running. Wait for it to finish before optimizing the database. |
| 3 · src/core/index.ts:2769 | Only Claude Code, Codex or Grok can have another account. | Additional accounts are supported for Claude Code, Codex, and Grok. |
| 6 · src/core/initiative-links.ts:72 | The request didn't finish. | The request did not complete. |
| 18 · src/core/initiative-state.ts:105 | rests on | depends on |
| 25 · src/core/initiative.ts:35 | That record no longer exists. | This record no longer exists. |
| 26 · src/core/initiative.ts:37 | This changed while the page was open. Reload and try again. | This record changed. Reload and try again. |
| 27 · src/core/initiative.ts:114 | Turn on initiative for a bot first. | Enable initiative for an agent first. |
| 28 · src/core/initiative.ts:120 | Only the bot looking after this can take this on. | Only the assigned agent can take on this responsibility. |
| 29 · src/core/initiative.ts:123 | That came from a conversation outside what the bot may read. | This conversation is outside the agent’s read access. |
| 30 · src/core/initiative.ts:125 | That goes beyond what you authorized for the bot. | This action exceeds the agent’s authorized scope. |
| 31 · src/core/initiative.ts:131 | That is as many responsibilities as one bot can keep. Close one before adding another. | Responsibility limit reached. Complete or dismiss one before adding another. |
| 32 · src/core/initiative.ts:257 | That bot no longer exists. | This agent no longer exists. |
| 33 · src/core/initiative.ts:261 | Choose your direct conversation with that bot. | Choose your direct message with this agent. |
| 36 · src/core/initiative.ts:289 | What this was following no longer exists. | The linked item no longer exists. |
| 38 · src/core/runs.ts:897 | The reply ended before it read this | The reply ended before reading this instruction. |
| 39 · src/core/runs.ts:2444 | You do not have wiki access now. | You no longer have Wiki access. |
| 40 · src/core/runs.ts:2454 | You cannot write to the wiki now. | You no longer have permission to edit the Wiki. |
| 43 · src/main/index.ts:702 | An agent on this computer is still working: restarting now stops what it is doing. If you wait, the update goes in when you quit Tucano. | An agent is running on this computer. Restarting interrupts its work. The update will install when you quit Tucano. |
| 44 · src/main/index.ts:703 | The app closes and opens again on the new version. The server keeps running. | Restart the desktop app to install this update. The server keeps running. |
| 46 · src/main/notice.ts:124 | This is how notifications arrive. Hover it to keep it. | Appearance follows your notification settings. |
| 48 · src/renderer/src/components/Conversation.tsx:854 | Edit this prompt | Edit prompt |
| 49 · src/renderer/src/components/Conversation.tsx:855 | Edit this prompt | Edit prompt |
| 51 · src/renderer/src/components/Conversation.tsx:987 | The ceiling per reply is set in Settings › Agents › Limits; it isn’t the agent’s monthly limit. | Set the per-reply limit in Settings › Agents › Limits. It is separate from the monthly limit. |
| 52 · src/renderer/src/components/Conversation.tsx:1033 | Go to the start of this reply | Go to reply start |
| 53 · src/renderer/src/components/Conversation.tsx:1211 | Delete this prompt | Delete prompt |
| 54 · src/renderer/src/components/Conversation.tsx:1213 | Delete this post | Delete post |
| 55 · src/renderer/src/components/Conversation.tsx:1214 | Delete this session | Delete session |
| 63 · src/renderer/src/components/Conversation.tsx:2038 | Go on now, in the same session and on the same model | Resume with the same session and model |
| 64 · src/renderer/src/components/Conversation.tsx:2039 | Let the reply go on | Resume reply |
| 66 · src/renderer/src/components/Conversation.tsx:2050 | Stop at the end of this turn and wait: the session and what it has done stay | Pause before the next step, preserving the session and completed work |
| 67 · src/renderer/src/components/Conversation.tsx:2051 | Pause the reply | Pause reply |
| 70 · src/renderer/src/components/Harness.tsx:493 | That account’s sign-in did not leave now because its CLI was still open: close its window. It goes the next time Tucano opens. | Close the account’s CLI window to finish signing out. Otherwise, sign-out completes when Tucano restarts. |
| 73 · src/renderer/src/components/Initiative.tsx:19 | open | Open |
| 74 · src/renderer/src/components/Initiative.tsx:21 | in progress | In progress |
| 75 · src/renderer/src/components/Initiative.tsx:23 | waiting on someone else | Waiting for others |
| 76 · src/renderer/src/components/Initiative.tsx:25 | waiting on you | Waiting for you |
| 77 · src/renderer/src/components/Initiative.tsx:27 | done | Done |
| 78 · src/renderer/src/components/Initiative.tsx:28 | dismissed | Dismissed |
| 79 · src/renderer/src/components/Initiative.tsx:31 | checked, nothing to report | Nothing to report |
| 80 · src/renderer/src/components/Initiative.tsx:32 | repeated the check-in before it, so it stayed out | Duplicate report suppressed |
| 81 · src/renderer/src/components/Initiative.tsx:32 | wrote in the conversation | Reported in conversation |
| 82 · src/renderer/src/components/Initiative.tsx:33 | didn't finish | Did not complete |
| 83 · src/renderer/src/components/Initiative.tsx:34 | interrupted by the app | Interrupted by the app |
| 84 · src/renderer/src/components/Initiative.tsx:37 | skipped: you changed the brief | Skipped: brief changed |
| 85 · src/renderer/src/components/Initiative.tsx:39 | skipped: the app is paused | Skipped: app paused |
| 86 · src/renderer/src/components/Initiative.tsx:41 | skipped: that bot is gone | Skipped: agent unavailable |
| 87 · src/renderer/src/components/Initiative.tsx:43 | skipped: that conversation is gone | Skipped: conversation unavailable |
| 88 · src/renderer/src/components/Initiative.tsx:45 | skipped: initiative was turned off | Skipped: initiative disabled |
| 89 · src/renderer/src/components/Initiative.tsx:47 | skipped by an error | Skipped: error |
| 90 · src/renderer/src/components/Initiative.tsx:48 | skipped | Skipped |
| 95 · src/renderer/src/components/Initiative.tsx:92 | Turn on this bot's initiative | Set up this agent’s initiative |
| 97 · src/renderer/src/components/Initiative.tsx:103 | everything paused | App paused |
| 98 · src/renderer/src/components/Initiative.tsx:105 | checking now… | Checking… |
| 99 · src/renderer/src/components/Initiative.tsx:107 | initiative off | Initiative off |
| 100 · src/renderer/src/components/Initiative.tsx:109 | waits on you | Waiting for you |
| 101 · src/renderer/src/components/Initiative.tsx:111 | next in ${until(st.dueAt - Date.now())} | Next check in ${until(st.dueAt - Date.now())} |
| 102 · src/renderer/src/components/Initiative.tsx:112 | on | Enabled |
| 103 · src/renderer/src/components/Initiative.tsx:113 | Your bot's initiative: ${says}. | Agent initiative: ${says}. |
| 104 · src/renderer/src/components/Initiative.tsx:113 | ${st.open} open, ${st.waitingOnPerson} waiting on you. | ${st.open} open; ${st.waitingOnPerson} waiting for you. |
| 105 · src/renderer/src/components/Initiative.tsx:155 | nothing yet | Not configured |
| 106 · src/renderer/src/components/Initiative.tsx:157 | everything paused | App paused |
| 107 · src/renderer/src/components/Initiative.tsx:159 | checking now… | Checking… |
| 108 · src/renderer/src/components/Initiative.tsx:161 | off | Disabled |
| 109 · src/renderer/src/components/Initiative.tsx:163 | waits on you | Waiting for you |
| 110 · src/renderer/src/components/Initiative.tsx:165 | next in ${until(st.dueAt - Date.now())} | Next check in ${until(st.dueAt - Date.now())} |
| 111 · src/renderer/src/components/Initiative.tsx:166 | on | Enabled |
| 112 · src/renderer/src/components/Initiative.tsx:172 | saving… | Saving… |
| 113 · src/renderer/src/components/Initiative.tsx:177 | Once on, it looks between conversations at the interval you set, inside what you allowed, and only appears when it found something worth saying. | Checks between conversations at your chosen interval, within its allowed scope. Reports only when needed. |
| 114 · src/renderer/src/components/Initiative.tsx:181 | Open the initiative | Open initiative |
| 115 · src/renderer/src/components/Initiative.tsx:181 | Set up the initiative | Set up initiative |
| 117 · src/renderer/src/components/Initiative.tsx:263 | Saved. It is off: nothing runs until you turn it on. | Saved. Enable initiative to start check-ins. |
| 118 · src/renderer/src/components/Initiative.tsx:280 | Write what it should look after, then turn it on. | Add a brief before enabling initiative. |
| 119 · src/renderer/src/components/Initiative.tsx:293 | Your bot's initiative | Agent initiative |
| 120 · src/renderer/src/components/Initiative.tsx:295 | Reading… | Loading… |
| 121 · src/renderer/src/components/Initiative.tsx:300 | The app is paused: nothing runs until you unpause it. | App paused. Resume it to allow check-ins. |
| 122 · src/renderer/src/components/Initiative.tsx:302 | Checking now… | Checking… |
| 123 · src/renderer/src/components/Initiative.tsx:305 | Next check-in in ${until(st.dueAt - Date.now())}. | Next check in ${until(st.dueAt - Date.now())}. |
| 124 · src/renderer/src/components/Initiative.tsx:305 | On. | Enabled. |
| 125 · src/renderer/src/components/Initiative.tsx:308 | Off: nothing runs. | Disabled. Check-ins are off. |
| 126 · src/renderer/src/components/Initiative.tsx:315 | ${st.today.reviews} of ${draft.dailyReviews} check-ins today · ${tokens(st.today.tokens)} of ${tokens(draft.dailyTokens)} tokens · ${st.open} open, ${st.waitingOnPerson} waiting on you | ${st.today.reviews}/${draft.dailyReviews} check-ins · ${tokens(st.today.tokens)}/${tokens(draft.dailyTokens)} tokens today · ${st.open} open; ${st.waitingOnPerson} waiting for you |
| 130 · src/renderer/src/components/Initiative.tsx:345 | Off. | Disabled. |
| 131 · src/renderer/src/components/Initiative.tsx:349 | Turn off | Disable |
| 132 · src/renderer/src/components/Initiative.tsx:353 | on | Enabled |
| 133 · src/renderer/src/components/Initiative.tsx:353 | off | Disabled |
| 134 · src/renderer/src/components/Initiative.tsx:362 | Write the brief, then you can turn it on. | Add a brief to enable initiative. |
| 135 · src/renderer/src/components/Initiative.tsx:366 | What it looks after for you | Brief |
| 136 · src/renderer/src/components/Initiative.tsx:366 | In your words. It is what it reads on every check-in. | Instructions the agent reads at each check-in. |
| 137 · src/renderer/src/components/Initiative.tsx:371 | How often | Check interval |
| 140 · src/renderer/src/components/Initiative.tsx:380 | When to interrupt you | Notify me about |
| 141 · src/renderer/src/components/Initiative.tsx:382 | findings that matter | Important findings |
| 142 · src/renderer/src/components/Initiative.tsx:383 | only what needs a decision | Decisions only |
| 143 · src/renderer/src/components/Initiative.tsx:384 | never | Never |
| 144 · src/renderer/src/components/Initiative.tsx:387 | Check-ins a day | Daily check-in limit |
| 145 · src/renderer/src/components/Initiative.tsx:390 | Token ceiling a day | Daily token limit |
| 146 · src/renderer/src/components/Initiative.tsx:395 | Where it may look | Read access |
| 147 · src/renderer/src/components/Initiative.tsx:395 | Only what you already see. Empty: this conversation alone. | Only conversations you can access. None selected: this DM only. |
| 148 · src/renderer/src/components/Initiative.tsx:416 | What it may do out there | Allowed actions |
| 149 · src/renderer/src/components/Initiative.tsx:416 | The bot's Autonomy decides every call; this only narrows it. | Restricts the agent’s Autonomy; never grants additional permissions. |
| 153 · src/renderer/src/components/Initiative.tsx:454 | The app is paused. | The app is paused. |
| 154 · src/renderer/src/components/Initiative.tsx:456 | One is already running. | A check-in is already running. |
| 155 · src/renderer/src/components/Initiative.tsx:458 | Today's check-ins are spent. | Daily check-in limit reached. |
| 156 · src/renderer/src/components/Initiative.tsx:460 | Today's token ceiling is spent. | Daily token limit reached. |
| 157 · src/renderer/src/components/Initiative.tsx:462 | Turn initiative on first. | Enable initiative first. |
| 158 · src/renderer/src/components/Initiative.tsx:463 | Couldn't start it now. | Could not start the check-in. |
| 159 · src/renderer/src/components/Initiative.tsx:471 | What it's carrying | Responsibilities |
| 160 · src/renderer/src/components/Initiative.tsx:471 | Nothing open. | No open responsibilities. |
| 161 · src/renderer/src/components/Initiative.tsx:482 | rests on | Depends on |
| 166 · src/renderer/src/components/Initiative.tsx:528 | What it did | Check-in history |
| 167 · src/renderer/src/components/Initiative.tsx:528 | The last check-ins, newest first. | Recent check-ins, newest first. |
| 168 · src/renderer/src/components/Initiative.tsx:528 | It hasn't checked yet. | No check-ins yet. |
| 172 · src/renderer/src/components/Pages.tsx:550 | What this bot looks after for you between conversations: your brief, an interval, and what it may read and do. | Set this agent’s brief, check interval, read access, and allowed actions. |
| 173 · src/renderer/src/components/Pages.tsx:978 | This bot’s history | Agent history |
| 174 · src/renderer/src/components/Pages.tsx:981 | What it answered anywhere, and everything said in its DMs. What you wrote in channels stays, and so do its memories: they have their own Memory tab. | Agent replies and all DM messages. Your channel posts and memories stay. |
| 175 · src/renderer/src/components/Pages.tsx:985 | Keep its history for | History retention |
| 176 · src/renderer/src/components/Pages.tsx:986 | Keep its history for | History retention |
| 177 · src/renderer/src/components/Pages.tsx:988 | Same as the Tucano (${retentionLabel(tucanoDays)}) | Workspace default (${retentionLabel(tucanoDays)}) |
| 178 · src/renderer/src/components/Pages.tsx:991 | Only this bot | Custom |
| 180 · src/renderer/src/components/Pages.tsx:1005 | days; 0 keeps everything, for good, even when the Tucano keeps less | Days; 0 keeps all, overriding workspace retention. |
| 181 · src/renderer/src/components/Pages.tsx:1011 | Each message counts from its own date, in the daily cleanup: with 30, anything past 30 days leaves the database and the next turn reads none of it. | Daily cleanup deletes older messages and removes them from future replies. |
| 183 · src/renderer/src/components/Pages.tsx:1024 | Its replies in every channel go, and everything said in its DMs. ${draft.name} stays on the team; memories and usage receipts stay. This cannot be undone. | Delete this agent’s replies in all channels and every message in its DMs. ${draft.name}, memories, and usage records stay. This cannot be undone. |
| 185 · src/renderer/src/components/Pages.tsx:1033 | ${gone} message(s) deleted. | Messages deleted: ${gone}. |
| 186 · src/renderer/src/components/Pages.tsx:1039 | Delete this bot’s history | Delete agent history |
| 191 · src/renderer/src/components/Pages.tsx:2662 | Rebuilding the file… | Optimizing database… |
| 193 · src/renderer/src/components/Pages.tsx:2666 | Still ${size(r.after)}, it was already compact. | Already compact: ${size(r.after)}. |
| 194 · src/renderer/src/components/Pages.tsx:2667 | The file is sound. | Integrity check passed. |
| 195 · src/renderer/src/components/Pages.tsx:2667 | The file did not pass its check: ${r.said} | Integrity check failed: ${r.said} |
| 203 · src/renderer/src/components/Pages.tsx:3419 | Delete every bot’s history? | Delete all message history? |
| 204 · src/renderer/src/components/Pages.tsx:3422 | Every conversation in every channel and every DM goes: what you wrote and what the bots answered. Channels, DMs, agents, memories, the wiki and the usage receipts stay. This cannot be undone. | Delete all messages in channels and DMs, including yours. Channels, DMs, agents, memories, Wiki, and usage records stay. This cannot be undone. |
| 205 · src/renderer/src/components/Pages.tsx:3424 | Delete everything | Delete all messages |
| 206 · src/renderer/src/components/Pages.tsx:3432 | ${gone} message(s) deleted. | Messages deleted: ${gone}. |
| 207 · src/renderer/src/components/Pages.tsx:3442 | What is kept of what was said and answered in this workspace. The period is checked once a day; the button below deletes at once. | Set how long messages are kept. Cleanup runs daily; deleting history removes messages immediately. |
| 210 · src/renderer/src/components/Pages.tsx:3454 | Delete every bot’s history | Delete all message history |
| 225 · src/renderer/src/components/Pages.tsx:3879 | Add Claude Code, Codex or Grok accounts, then assign them to agents. Sign in through the CLI; Tucano never stores your password. | Add Claude Code, Codex, or Grok accounts and assign them to agents. Sign in through the CLI; Tucano never stores your password. |
| 229 · src/renderer/src/components/Pages.tsx:4029 | Allow site notifications and reload.  | Allow site notifications, then reload. |
| 230 · src/renderer/src/components/Pages.tsx:4047 | Notifications over every window | Desktop notification overlays |
| 231 · src/renderer/src/components/Pages.tsx:4051 | Notifications arrive in a stack in the corner of the screen, over the other windows, and go away on their own. Off, the system’s own come back. | Show notifications above other windows and dismiss them automatically. When off, use system notifications. |
| 232 · src/renderer/src/components/Pages.tsx:4062 | Where they appear | Position |
| 234 · src/renderer/src/components/Pages.tsx:4071 | Choose the area | Choose area |
| 235 · src/renderer/src/components/Pages.tsx:4074 | Back to the bottom right corner | Reset to bottom right |
| 236 · src/renderer/src/components/Pages.tsx:4082 | Decide from the notification | Respond from notifications |
| 237 · src/renderer/src/components/Pages.tsx:4086 | Approve, refuse and answer right on the notification, without opening the conversation. A high-risk action asks you to hold the button. | Approve, refuse, or answer without opening the conversation. Hold to approve high-risk actions. |
| 238 · src/renderer/src/components/Pages.tsx:4095 | Skin | Appearance |
| 240 · src/renderer/src/components/Pages.tsx:4103 | Notification skin | Notification appearance |
| 243 · src/renderer/src/components/Pages.tsx:4124 | Seconds before a notification goes. After that it fades, with a short pause to bring the pointer back. | Seconds before fading, followed by a short grace period to move the pointer back. |
| 246 · src/renderer/src/components/Pages.tsx:4146 | Stays under the pointer | Keep open on hover |
| 247 · src/renderer/src/components/Pages.tsx:4150 | With the pointer on a notification it waits. The mouse wheel opens it whole, and closes it again. | Hover to keep notifications visible. Scroll to expand or collapse them. |
| 248 · src/renderer/src/components/Pages.tsx:4172 | One of each kind: done, mention, question, approval, and high risk. | Preview completion, mention, question, approval, and high-risk notifications. |
| 249 · src/renderer/src/components/Pages.tsx:4175 | One notification of each kind, as they look. | Preview each notification type. |
| 252 · src/renderer/src/components/People.tsx:632 | rebuilt the Tucano's file (${(d['before'] / 1024 ** 2).toFixed(1)} MB → ${(d['after'] / 1024 ** 2).toFixed(1)} MB) | optimized the database (${(d['before'] / 1024 ** 2).toFixed(1)} MB → ${(d['after'] / 1024 ** 2).toFixed(1)} MB) |
| 253 · src/renderer/src/components/People.tsx:634 | rebuilt the Tucano's file | optimized the database |
| 255 · src/renderer/src/components/People.tsx:638 | deleted every bot’s history | deleted all message history |
| 256 · src/renderer/src/components/People.tsx:640 | history past its period went (${Number(d['messages'] ?? 0)} messages) | deleted expired messages (${Number(d['messages'] ?? 0)} messages) |
| 261 · src/renderer/src/components/Sidebar.tsx:471 | Show the hidden sections | Show hidden sections |
| 272 · src/renderer/src/components/Wiki.tsx:1215 | Use ${bot.name}’s instructions, model, and effort. If unavailable or cleared, use the built-in resolver’s model. | Use ${bot.name}’s instructions, model, and reasoning effort. If unavailable or cleared, use the built-in resolver’s model. |
| 274 · src/renderer/src/components/WorkspaceManager.tsx:94 | Never coming: messages, memories, summaries, approvals, usage history, computers’ files, browser sessions and the extra Claude Code, Codex and Grok accounts (in the copy, agents use the usual sign-in). Telegram stays in the default workspace. Changes here don’t change the original; lent folders are still the same ones. | Not copied: messages, memories, summaries, approvals, usage history, computer files, browser sessions, or additional Claude Code, Codex, and Grok accounts. Copied agents use the default sign-in. Telegram stays in the default workspace. Workspace changes do not affect the original; shared folders still point to the same files. |
| 275 · src/renderer/src/notice/AreaPicker.tsx:100 | Notifications arrive here, from the bottom up | Notifications appear here, from bottom to top |
| 276 · src/renderer/src/notice/AreaPicker.tsx:100 | Notifications arrive here, from the top down | Notifications appear here, from top to bottom |
| 277 · src/renderer/src/notice/AreaPicker.tsx:108 | Drag the rectangle, and its corners to resize it. Notifications appear there. | Drag to move the notification area. Drag its corners to resize it. |
| 288 · src/renderer/src/notice/Notice.tsx:183 | high risk | High risk |
| 291 · src/renderer/src/notice/Notice.tsx:213 | Approve, and from now on without asking, whenever it is this tool | Approve and allow future uses of this tool without asking |
| 333 · src/renderer/src/store.ts:1132 | I couldn't pause the reply. | Could not pause the reply. |
| 334 · src/renderer/src/store.ts:1133 | I couldn't let the reply go on. | Could not resume the reply. |
| 335 · src/renderer/src/store.ts:1140 | I couldn't delete the session. | Could not delete the session. |
| 336 · src/shared/initiative.ts:305 | That time zone is not one this computer knows. | This computer does not recognize that time zone. |
| 337 · src/shared/initiative.ts:309 | Choose the bot that will keep an eye on this. | Choose an agent for initiative. |
| 338 · src/shared/initiative.ts:310 | Choose the conversation it works in. | Choose its working conversation. |
| 339 · src/shared/initiative.ts:311 | Write what it should look after. | Add a brief. |
| 340 · src/shared/initiative.ts:312 | What it should look after goes up to ${INITIATIVE_LIMITS.brief.toLocaleString('en-US')} characters. | Briefs can contain up to ${INITIATIVE_LIMITS.brief.toLocaleString('en-US')} characters. |
| 341 · src/shared/initiative.ts:314 | The interval goes from ${MIN_CADENCE_MINUTES} to ${MAX_CADENCE_MINUTES} minutes. | Set an interval from ${MIN_CADENCE_MINUTES} to ${MAX_CADENCE_MINUTES} minutes. |
| 342 · src/shared/initiative.ts:315 | Reviews a day go from 1 to ${MAX_DAILY_REVIEWS}. | Set a daily check-in limit from 1 to ${MAX_DAILY_REVIEWS}. |
| 343 · src/shared/initiative.ts:316 | That daily token limit is too low or too high. | The daily token limit is outside the allowed range. |
| 344 · src/shared/initiative.ts:319 | It can only act in a conversation it may also read. | The agent can only act in conversations it can read. |
| 345 · src/shared/initiative.ts:325 | Write what needs doing. | Describe the responsibility. |
| 346 · src/shared/initiative.ts:326 | Describe it in up to ${INITIATIVE_LIMITS.description} characters. | Use up to ${INITIATIVE_LIMITS.description} characters. |
| 347 · src/shared/initiative.ts:327 | The note goes up to ${INITIATIVE_LIMITS.note} characters. | Notes can contain up to ${INITIATIVE_LIMITS.note} characters. |
| 348 · src/shared/initiative.ts:328 | Choose the bot responsible. | Choose the responsible agent. |
| 349 · src/shared/initiative.ts:329 | Say where this came from. | Specify the source. |
| 361 · src/shared/notice.ts:184 | The agent stopped, waiting for you. The conversation has the details. | The agent is waiting for your response. Open the conversation for details. |
| 377 · src/shared/retention.ts:36 | everything, for good | Forever |

## Rendered review amendment

At native 150% scaling, the 900px agent editor has a 249px text column. The original proposals for IDs 174, 180 and 181 used three lines; the 49-character side note had only 134px. Shorten the two explanations as recorded above and put the zero/forever override note below the input at full column width. Keep the same type size and all content visible.

The screenshot also exposes wrapped neighboring labels and hints because the 260px profile summary squeezes the editor. Stack that summary below the form at 761–1100px viewports, retaining the existing mobile layout and wide desktop arrangement. Extend measurement to every visible editor label and hint, including the new Initiative controls.

The current pause revision (`925c557a`) was integrated before installation. Its original Portuguese timing correction is preserved, and ID 66 now says “before the next step” in English. The copy-only syntax comparison remains evidence for the editorial patch; this subsequent integration also changes the Hold implementation and its regression coverage. Two unchanged “Checking…” occurrences are retained, giving 180 actual English replacements.

Retain Refuse as the existing application-wide approval action. The notification uses the same term; the original comparison therefore contains 179 changed English occurrences.
