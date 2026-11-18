# Conversation and reasoning reading-position repair

The conversation list could slide continuously after the reader scrolled back. Its frame loop
measured a content coordinate that stayed changed after a scroll correction, then applied that
same correction again on every frame. An 80 px change above the reading line moved it more than
2,000 px in the hidden built-app reproduction.

The repair measures displacement in the viewport. Reasoning blocks preserve a character in the
reading line as well as their internal offset, so growth above the block, wrapping and the end of
the reply cannot silently replace the reader's position. The page and block share one correction;
native layout events are separated from user gestures. The actively read row remains laid out
while Chromium would otherwise be allowed to skip offscreen content. Returning to the actual end,
with 2 CSS px of rounding tolerance, resumes following. An older block cannot release a newer hold.

The prior reasoning-scroll session was inspected privately. Its offset checks did not establish
that the text line remained still, and its later installed checks included failures. This delivery
uses a marked character and measures through the transition to the final answer.

- [x] Reproduce the repeated conversation correction before changing its coordinate system.
- [x] Cover growth, shrinkage, native scroll anchoring, streamed renders, layout resets and resuming.
- [x] Reconcile the concurrent audit workflow through `66be2ced` without changing its source work.
- [x] Typecheck, build and run the complete candidate suite: 2,622 passed, 61 skipped, zero failed.
- [x] Verify all three reasoning panel sizes in a hidden built Electron instance.
- [x] Package, verify, install and observe a fresh regular TucanoNext window.
- [x] Repeat the scrolling and general smoke checks with the installed executable.
- [x] Record the installed package hash and final runtime results below.

Application source is `4fef95c1f634624952c37706708b217fd9cafd3f`, based on published 0.2.32 integration
`85bb37f9`. Upstream remains `d175567b`; the source retains TucanoNext's name, app ID, separate data
directory and ports, with updates disabled. The installer inherits version 0.2.32. The public
thinking-stream PR head `5f4a1a2` was inspected: the repeated frame correction was added in the fork.

The built-app character check passed with 10,582 / 10,855 / 9,449 additional reasoning characters
in the small / medium / large panels. Streaming drift was 0 CSS px in each. Maximum movement during
completion was 0 / 0.8701 / 0.2286 CSS px respectively. The conversation regression passed growth
and shrinkage with native anchoring both enabled and disabled. Screenshots were visually reviewed.
All fixtures use fresh scratch data, fake engines and separate ports; none writes to the regular
workspace or calls a model. No interface strings changed, so copy measurement is not applicable.

Evidence is under `C:/tmp/tucano-scroll-evidence`: `before`, `thought-final-frames`, `anchor-ready`,
`tests-candidate.log`, `package.json` and `install.json`. The final source passed 291 test files,
with four files skipped. The temporary CRLF conversion that broke a source-text assertion was
corrected to LF and the complete suite rerun successfully.

Entanglement 1.0.1 reports MI 44.06 for the character helper, 26.25 for the new DOM regression and
15.94 for the streaming QA script. Growth across the task files is 432 NLOC, 144 summed CC and 83 CogC, mostly
the runtime fixtures and regression coverage. The maintainability gate remains **blocked** by
the existing large `Conversation.tsx` file (MI 0 before and after). Making that entire file meet
the gate needs a broader extraction than this urgent repair; this record does not claim a pass.
The repository-wide comparison also includes the separately merged audit workflow changes.

The regular app was restarted after explicit user approval because a live reply was still working.
The self-build helper verified all 114 packaged runtime dependencies, installed the package and
observed the new `TucanoNext` window. Regular process path is
`C:/Users/theap/AppData/Local/Programs/tucanonext/TucanoNext.exe`.

The primary checkout's unrelated copy edits are preserved. Its fast-forward was refused because
the existing `styles.css` edits overlap upstream changes; the published repair and delivery tree
remain in `C:/git-ext/tucano-scroll-fix`. No stash, reset or replacement of those edits was used.

Installed reasoning verification passed at the user's 150% display scaling, in a 1266 × 783 CSS px
renderer. The small / medium / large checks received 12,443 / 10,609 / 8,216 additional characters
while reading. All three measured **0 CSS px drift**, including completion. Returning to the end
resumed following in all sizes; gaps remained within Chromium's fractional-pixel rounding.

The installed and packaged `app.asar` files have the same SHA-256:
`7AD10759FECB17F7E6B4D92EC6719830E4B0F3A53B86BCF0FDD8EDB8BBF4DE95`.
The fresh regular process was PID 2936 with the `TucanoNext` window title. The installed runtime
record and synthetic captures are in `installed-thought/report.json`. Regular-workspace navigation
was not automated: agent-desktop tools were unavailable, and no foreground fallback was used.

Installed conversation anchoring passed all four growth/shrink/native-anchoring combinations in
`installed-anchor/report.json`. The general installed smoke check also passed seven checks:
workspace loading, agent profile, agent DM, Settings, background notification handling, Team and
Usage and limits. It reported no renderer errors and updater status `off`. Its `dirty` flag refers
to this delivery record, the audit-plan update and runtime-report metadata in the development-only
QA script; application source matches the packaged commit. The regular database remained available
through a read-only connection and retained 20 agents and 26 conversations.
