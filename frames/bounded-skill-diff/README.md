# Bounded Skills comparison evidence

Source: 2d15a2777e3447575dafdebc121a372b3f1666ef, based on upstream main d175567b0a12d885544d74c45792717a883287f5.
Synthetic local browser data, headless Edge, 1280/900/420 CSS pixels. No regular workspace data.
Report JSON records exact text, font, available width, lines and overflow. Maximum warning captures
use one million characters; Cancel was verified to preserve the saved body. Proposal approval,
history restoration and keyboard scrolling retain both complete 6,000-line versions.

The old main comparison allocates 36,024,004 numeric cells for 6,000 lines on each side.
An isolated Node process with a deliberate 128 MiB heap cap exits 134 on that case; its 500-line
control completes. This is a resource reproduction, not an observed Electron crash or a claim
about Electron's heap limit. The original reproduction banner names 04539404; the tested main
file at d175567b is byte-identical. Original reproduction script:
https://github.com/apoapostolov/tucano/blob/30a8a9171d16a71612f4b5f9738078edc7b6c15c/frames/skill-origins/repro-skill-diff.mjs

The repaired helper completes 6,000-line and one-million-character cases under the same cap.
Resource-after JSON contains single-run measurements under Node 26 with its TypeScript loader;
these are local observations, not general latency guarantees or comparable small-case heap totals.
Typed-array cells are bounded to 1 MiB, excluding strings, maps, result objects and runtime overhead.

The maintainability comparison includes extraction, helper and tests: +139 NLOC, +35 summed CC,
+13 cognitive complexity. All authored files pass MI >=10; Skills.tsx remains yellow at 17.43.
Structural matching changed after extraction; this does not prove removed cycles or global clearance.
