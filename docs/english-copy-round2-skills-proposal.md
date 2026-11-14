# Intervening Skills copy review

The published integration advanced to `77286bf4` during delivery. Its Skills component extraction and source-label repair are preserved in `cbe06953bd3119c20bb796c86d82d2f26b1baa49`. This supplement reviews all 68 newly located or changed strings, with 22 exact replacements before implementation. Moved text is not automatically rewritten.

Keep skill as the established term. Describe source files, assigned agents, versions, searches, and completed replies directly. Keep Refuse as the established approval action across the application; restore that wording in the notification button rather than introduce an isolated synonym. The linked-file path is a value and needs its own row; give its explanatory hint a separate paragraph so long paths cannot consume the two-line hint allowance. Keep paths fully visible and allow them to break.

| ID and location | Current English | Proposed English |
| --- | --- | --- |
| 380 · src/renderer/src/components/Pages.tsx:3797 | Pause at the limit. With no monthly limit, use a base of 10 million tokens. | Pause at the limit until you continue. Without a monthly limit, use a base of 10 million tokens. |
| 384 · src/renderer/src/components/skills/SkillForm.tsx:19 | Short; becomes something like core-tests. | Used to generate an ID such as core-tests. |
| 387 · src/renderer/src/components/skills/SkillForm.tsx:22 | One sentence. It goes in every agent’s prompt. | One sentence, included in each assigned agent’s prompt. |
| 390 · src/renderer/src/components/skills/SkillForm.tsx:28 | the recipe changes there, and agents always read the current version. Here you pick who uses it. | Edit the source file to update instructions. Choose assigned agents here. |
| 392 · src/renderer/src/components/skills/SkillForm.tsx:32 | The steps, in Markdown: exact commands, pitfalls, how to check. | Markdown instructions, commands, cautions, and checks. |
| 399 · src/renderer/src/components/skills/SkillHistory.tsx:14 | Fetching the history… | Loading history… |
| 400 · src/renderer/src/components/skills/SkillHistory.tsx:15 | No changes yet: this is the first version. | No previous versions. |
| 404 · src/renderer/src/components/skills/SkillHistory.tsx:25 | hide | Hide changes |
| 405 · src/renderer/src/components/skills/SkillHistory.tsx:25 | what changed | Show changes |
| 408 · src/renderer/src/components/skills/SkillImport.tsx:46 | Search the skills of your Claude Code and Codex | Search available skill folders |
| 409 · src/renderer/src/components/skills/SkillImport.tsx:57 | Looking… | Searching… |
| 410 · src/renderer/src/components/skills/SkillImport.tsx:58 | No skill matching | No matching skills. |
| 412 · src/renderer/src/components/skills/SkillImport.tsx:68 | needs a computer | Computer access required |
| 413 · src/renderer/src/components/skills/SkillImport.tsx:69 | in use | In use |
| 422 · src/renderer/src/components/skills/SkillPage.tsx:43 | done | Done |
| 423 · src/renderer/src/components/skills/SkillPage.tsx:43 | change | Change |
| 427 · src/renderer/src/components/skills/SkillPage.tsx:62 | Read from the file, ${from(k)}: what you change there applies next time | Source file ${from(k)}; edits apply on next use. |
| 428 · src/renderer/src/components/skills/SkillPage.tsx:62 | Written here, ${from(k)} | Created here; ${from(k)} |
| 430 · src/renderer/src/components/skills/SkillPage.tsx:78 | The recipe is read from ${k.source} on every use. | Instructions are read from ${k.source} on each use. |
| 435 · src/renderer/src/components/skills/SkillPeople.tsx:43 | At least one agent uses the skill | At least one agent must be assigned |
| 436 · src/renderer/src/components/skills/SkillPeople.tsx:58 | not read yet | Not read yet |
| 437 · src/renderer/src/components/skills/SkillPeople.tsx:62 | read ${n} ${n === 1 ? 'time' : 'times'} · ${ok === n ? (n === 1 ? 'it ended well' : 'all ended well') : `${Math.round((ok / n) * 100)}% ended well`} | ${n} ${n === 1 ? 'reply' : 'replies'} · ${ok === n ? (n === 1 ? 'completed' : 'all completed') : `${Math.round((ok / n) * 100)}% completed`} |

Validate the new/edited/imported/source-linked/history states at 900 and 1280 pixels and the supported narrow browser layout. Use seeded source paths and synthetic skills only. The completion metric changes English literals inside existing conditionals, with explicit review permission; syntax checks must still preserve operators, expressions, Portuguese, and all non-copy code. The expanded per-reply limit hint preserves both manual continuation and the default token base.
