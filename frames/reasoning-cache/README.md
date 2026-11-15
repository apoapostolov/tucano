# Temporary reasoning cache checks

The browser capture source is ff6364e7a4d34f85c6c61070656bb23301274dea. Public head
c35e802c9fb651eac195a1837d922b18c217e47e adds only one additional test; application source is identical.
Headless Edge against the built app's local server, synthetic user/data, fake engines and separate ports.
Completed reasoning is readable, disabling removes it, re-enabling does not resurrect the old text.
No interface string, CSS or layout is changed by the cache repair.

A fresh checkout of the previous feature head 5f4a1a21 fails five lifecycle/retention regressions:
settings-event disable, local disable, conversation removal, replacement snapshot and window-wide
retention across 250 runs. The unrelated-setting/conversation control passes. The repair clears the
specified lifecycle transitions and caps retained reasoning at 200 recently streamed replies, each
with at most 20,000 UTF-16 code units. This bounds string content, not whole-renderer memory.
Older reasoning can disappear before restart; it is temporary and never stored with the answer.

Final public full suite at c35e802c: 1,756 passed, 60 skipped, zero failures. An initial full run
failed the unchanged legacy delegation timing fixture; no assertion or timeout was changed, and
the final full run passes. Its main-branch replacement is tracked independently in upstream #453.

Maintainability remains BLOCKED on the existing renderer store.ts monolith (MI 0 before/after).
The new cache (MI 46.72) and regression files (30.55 and 40.94) pass their file gates. This is a
bounded functional repair, not a completed feature audit or a passing repository maintainability gate.
