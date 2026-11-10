I read the proposals and the follow-up about the narrow thread pane. **I would give an opened thread the main reading area, keep the channel as the overview, and make workspace state and project context visible without introducing another project hierarchy.**

There are **two alternative thread layouts** below. The workspace, context and reply studies are shared improvements that work with either one. All seven images are **design mockups with illustrative content**, rendered from HTML/CSS, not screenshots of implemented features.

Workspaces have moved forward since the original question: #37 was closed through merged PR #63. I checked the current workspace UI and documentation, and the current thread renderer, against `main` at `95e6b62`. The existing thread pane uses `width: min(42%, 560px)` with an inherited 360px minimum. The issue is now how to use that foundation well.

### A — Make the thread the reading surface · recommended

![A: focused thread with sibling task navigation and a full-width reading area](https://raw.githubusercontent.com/apoapostolov/tucano/design/discussion-52-context-and-threads/design/discussion-52/a-focused-thread.png)

Opening a thread uses the main content area. A compact list of sibling threads keeps other tasks reachable; the channel header remains the way back. The selected thread has one composer, a named destination, its summary and its own work drawer. The large reading surface goes to the conversation the person is actually following.

- Keep the channel timeline as the landing overview. Opening a thread restores that thread's own scroll position and draft. Back restores the channel's previous position.
- Use a 270px sibling list and a flexible reader, with message text capped at 800px. Hide the sibling list below 1180px window width; use a single surface below 960px.
- Offer **View beside channel** for comparing a thread with its origin. Only enable a split when the available content width supports a 420px channel, 560px thread and divider. Make the divider resizable; otherwise use the focused view.
- Keep working, needs-your-answer and unread states distinct. “Marked done” is an explicit task decision; a reply finishing does not mark the entire thread done.
- In the channel overview, show the root, reply count, current activity and the last human-readable update. An excerpt should remain an excerpt; do not label it a verified outcome.

This is my first choice because it directly addresses @marcelogrcia's report about the main channel being underused while the actual conversation is constrained.

### B — Expand the thread in the channel

![B: an expanded inline thread with its own scoped composer](https://raw.githubusercontent.com/apoapostolov/tucano/design/discussion-52-context-and-threads/design/discussion-52/b-inline-thread.png)

The thread opens below its root message, at the channel's reading width. A rail groups the replies and ends at their composer. The next channel message remains visible below it.

- Expand one thread at a time. Collapsing preserves its draft and reading position.
- Give the thread a **Focus thread** action for long reading, code or documents.
- Label both composers explicitly: **Reply in this thread…** and **Message #checkout…**. Their draft, attachment, send-mode and work-drawer state must stay separate.
- Do not collapse or replace a thread because another reply arrives. Anchor the viewport when content expands above it.
- Keep this as the alternative if preserving channel chronology is more important than quickly moving between parallel tasks. It has more vertical movement and two visible destinations to manage.

### Workspace switching — counts with meaning, state before action

![Workspace switcher: named approval and unread counts, running, paused and failed states](https://raw.githubusercontent.com/apoapostolov/tucano/design/discussion-52-context-and-threads/design/discussion-52/workspace-switcher.png)

Build on the existing selector. Name its counts rather than leaving two unexplained badges; distinguish **Running in background**, **Paused** and **Couldn't start**.

Switching is navigation. It must not resume a paused workspace. Preserve the destination workspace's last channel, scroll and draft. A failed core gets **Retry**, with an inline failure explanation if it fails again. Keep the current workspace visible until the destination is ready.

A background alert can say “Studio · 2 approvals need your decision.” Opening it switches to Studio's pending approvals. The selector and background alert show names and counts only; request content belongs inside the destination workspace. Apply the same naming in the tray. In server mode, keep the documented single-workspace model rather than showing controls for unavailable desktop behavior.

**Manage** should make pause semantics explicit: pausing prevents new work; running replies may finish. A full-app quit and a window close need different wording because their effect on background work differs.

### Projects — channel context first, effective agent access alongside it

![Channel context: project brief, channel-scoped memories with provenance and current agent permissions](https://raw.githubusercontent.com/apoapostolov/tucano/design/discussion-52-context-and-threads/design/discussion-52/channel-context.png)

Reuse an agent across channels without copying its instructions. Put the project's brief and reusable facts in **Channel context**, and show where each fact came from.

My proposed scope model is:

| Information | Default scope |
| --- | --- |
| Agent role and standing instructions | Agent within its workspace |
| Task conversation and task summary | Thread |
| Reusable project facts | Channel |
| Personal preferences deliberately shared across projects | Workspace |

This is a **proposed context/retrieval change**, not a claim about the current memory implementation. New project facts would stay in the channel unless someone explicitly shares them more broadly. Existing global memories need a review step showing their source and proposed destination; do not silently reclassify them.

A context inspector should show what a reply received: agent instructions, workspace context, channel brief/facts, and thread history/summary. Also disclose when another thread was searched and what was retrieved. Reusing a UI layout never changes that retrieval policy by itself.

Keep **Agent access** a view of effective permissions with a link to manage each agent. This follows the maintainer's boundary in #38: a folder attached to a channel must not look like a sandbox. On Windows, say plainly when **This computer** still acts with the user's access.

Channel-specific connector restrictions can be a later, separately enforced feature. If adopted, a channel restriction can only narrow an agent's grant; it cannot create access the agent lacks. Show the resulting access before saving. Ports and browser sessions are also later resources: describe a reserved port as a coordination hint unless it is enforced, and keep separate authenticated browser sessions where different project accounts must not mix.

### Replies and threads — one place to choose, explicit destinations

![Reply actions: quote in channel, start a thread, cancellable quote preview and explicit slash command](https://raw.githubusercontent.com/apoapostolov/tucano/design/discussion-52-context-and-threads/design/discussion-52/reply-intent.png)

Bring #32 and #39 together through the message action menu:

- **Quote in channel** adds a cancellable source preview and keeps the response in the channel.
- **Start thread** derives a separate conversation from that message. If it already has a thread, use **Reply in thread** and open the existing one.
- Selecting text carries the selected excerpt into the preview. The source link returns to the original message; opening a quote never starts agent work.
- Add `/thread <prompt>` as an explicit new-task shortcut. It prepares a new root prompt; nothing is sent before Send. Bare `/thread` prepares an empty thread draft. With a quote selected, include that quote as source context.
- A proposed **Work in threads** channel setting applies to new top-level prompts. Show **Start a thread in #checkout…** in that composer. Keep an explicit quote action's destination stable.

I would avoid giving the same generic Reply button a different, hidden destination based on channel settings.

### Narrow and dark studies

![Focused thread at 390px, scrolled to the latest replies](https://raw.githubusercontent.com/apoapostolov/tucano/design/discussion-52-context-and-threads/design/discussion-52/a-mobile.png)

At narrow widths, the thread occupies the full surface. The channel breadcrumb remains available, the composer stays attached to the thread, and code wraps or scrolls inside its own block. The task list becomes a separate view rather than a squeezed second column.

![Focused thread using Tucano's existing dark palette](https://raw.githubusercontent.com/apoapostolov/tucano/design/discussion-52-context-and-threads/design/discussion-52/a-dark.png)

### Build handoff

| Element | Specification |
| --- | --- |
| Visual system | Existing Inter, warm neutrals and orange; reuse Tucano tokens and icon paths. No new brand palette, gradients or decorative shadows. |
| Typography | Message body 14/22; thread title 17/24 semibold; metadata 12/18; context heading 22/30. |
| Layout | App sidebar inherited; sibling list 270px; reader flexible; text max 800px; reader insets 24–32px desktop, 16px narrow. |
| Surfaces | 1px existing border tokens; 9px controls and 14px composer radius. Keep nested framing to a minimum. |
| Controls | New interactive targets at least 44×44px. Use full thread rows as navigation links, with current state exposed. |
| Switcher | 376px wide, capped at viewport minus 32px; menu scrolls if needed; workspace row at least 72px, names wrap and counts have labels. |
| Focus | 2px orange outline, 2px offset. Navigation focuses the thread heading without forcing the keyboard open. Returning restores the originating link. |
| Keyboard | Message actions available without hover; menu Arrow/Home/End navigation; Escape dismisses menus first and returns focus. Preserve existing composer send-mode bindings. |
| Motion | Existing 120ms hover and 180ms small-state tokens; 240ms maximum entry. No animation through a workspace reload. Reduced motion changes layout immediately. |
| Missing/error | Distinct loading, unavailable thread, offline core and failed-save states; retain drafts and unsaved brief text for retry. |
| Live work | Keep the existing/proposed work drawer (#287/#288) scoped to the active conversation/thread. Finished runs stay receipts; asks/approvals keep their separate actionable states. |

The present thread data model uses a conversation plus root/thread IDs. **Neither layout requires replacing it with the child-conversation model originally proposed in #39.** Treat the layout as presentation; memory scope and permissions need their own core work.

Suggested sequence: **(1)** focused thread navigation and preserved state; **(2)** explicit reply destinations plus the inline alternative if preferred; **(3)** workspace status/notification polish; **(4)** channel brief, memory provenance and scope migration; **(5)** any channel resource restrictions only with verified enforcement.

Implementation acceptance should cover two parallel threads without draft/attachment/stop-target leakage; back/forward navigation; a late reply arriving above the viewport; pending asks inside an unopened thread; workspace switching with a draft; switching to paused/failed cores; keyboard-only operation; 390px and 200% zoom; and both themes.

**Validation of these studies:** rendered and visually inspected all seven mockups in Chrome; checked them for horizontal overflow at their authored widths, including 390px. These are static design studies. App behavior, assistive technology, 200% zoom and permission enforcement still need implementation validation.

<details>
<summary>Collected screenshot references and source</summary>

The discussion itself has no screenshot attachments. I collected these related public frames and checked the current renderer before drawing the studies:

- [Existing channel screenshot](https://github.com/eduwxyz/tucano/blob/95e6b6210422f4b9128fb648c1958dae86eb5851/docs/images/conversation.png): warm surfaces, sidebar, message hierarchy and composer.
- [Quoted-reply screenshot from #32](https://github.com/marcelogrcia/tucano/blob/aed52402701aee5f94abb013f94994e853315931/docs/images/pt/message-reply.png): selected excerpt and cancellable source preview.
- [Built-app work-drawer frame from #287/#288](https://raw.githubusercontent.com/apoapostolov/tucano/a977fa8/frames/drawer2-3-the-x-that-stops.png): the composer-attached running/finished list.
- [Current thread UI](https://github.com/eduwxyz/tucano/blob/95e6b6210422f4b9128fb648c1958dae86eb5851/src/renderer/src/components/Conversation.tsx), [layout tokens](https://github.com/eduwxyz/tucano/blob/95e6b6210422f4b9128fb648c1958dae86eb5851/src/renderer/src/styles.css) and [workspace behavior](https://github.com/eduwxyz/tucano/blob/95e6b6210422f4b9128fb648c1958dae86eb5851/docs/workspaces.md).

[Mockup source, PNGs, capture script and handoff](https://github.com/apoapostolov/tucano/tree/design/discussion-52-context-and-threads/design/discussion-52). The mockups reuse public Tucano icon paths and avatar crops for continuity; references are credited in the source folder.

</details>
