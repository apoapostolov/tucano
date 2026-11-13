# Writing and checking interface copy

Write the shortest complete text that helps someone understand the setting, make a decision
or take the next action. Professional English should sound direct and natural. Brevity does
not justify ambiguous fragments, missing consequences or unfamiliar abbreviations.

## Draft in context

Before implementing a feature, list its new labels, hints, buttons, states and errors. Put
each string beside the control it describes. For replacements, retain the old/new comparison
in the PR or proposal. Read the surrounding screen once to catch repeated explanations and
inconsistent terms. The [English copy proposal](english-copy-proposal.md) and
[fork supplement](english-copy-fork-proposal.md) provide reviewed examples.

| Surface | Rule | Example |
| --- | --- | --- |
| Setting label | Name what is configured; usually a short noun phrase | “Time format”, “Resolver model” |
| Toggle | Describe the enabled behavior | “Show reasoning” |
| Button | Name the action and object when needed | “Save changes”, “Delete channel”, “Use memory model” |
| Hint | Add scope, default, fallback or a necessary condition; omit redundant narration | “Default: memory model, then Haiku.” |
| Error | State the problem and an available recovery action; do not promise unsupported recovery | “Folder not found. Choose another folder.” |
| Destructive confirmation | Name what will change and whether it can be undone | Keep replacement/deletion consequences explicit |

Use sentence case. Omit terminal punctuation in short labels and buttons; use complete,
punctuated hint sentences when explaining behavior. Do not turn an obvious label into a
question such as “Who settles it”. Do not describe a journey through the software when one
action or condition is enough. Keep necessary scope such as “new replies”, “this agent”,
“all channels” or “after restart”.

Use **agent** in ordinary interface copy; retain Bot where it is an established proper name
or literal identifier. Use **runtime** for the executable integration when matching current
controls, **model** for the model, **reasoning** for reasoning controls, and **fallback model**
for the fallback selection. Preserve established labels such as **Memory**, **Wiki** and
**Resolver**. Read neighboring controls before introducing another term. Exact API identifiers,
quoted output and command syntax keep their original spelling.

## Layout requirements and exceptions

Labels and buttons should normally occupy one line; secondary hints must fit within two
rendered lines. Check 900 and 1280 CSS-pixel viewports plus the feature's smaller supported
layout, if any. Measure the available text column after icons, switches, buttons, selected
models and long values take their space. Test expanded and enabled states as well as defaults.
Scroll to inspect the entire screen and capture the neighboring controls.

Use the actual font after `document.fonts.ready`. In the prior audit, 12-pixel hints in a
263-pixel column fitted 88 sample characters across two lines, while a 13-pixel hint in a
538-pixel column fitted 162. Those are examples from that font and sample text, **not string
length limits**. Words, font metrics, display scaling and layout change the result. See
[the delivery measurements](english-copy-delivery.md).

Rewrite unnecessary wording before changing layout. If the meaning still needs more room,
give controls their own row or separate the detailed explanation. Preserve readable type and
full access to the text. Do not use truncation, clipping, line clamps, smaller fonts or hidden
overflow to make a failed hint look short. A destructive or privacy warning can exceed two
lines when all its information is necessary. Document why that particular warning is exempt;
the exemption does not excuse overflow or hidden text.

## Reuse the measurement helper

`scripts/lib/copy-layout.mjs` exports `measureCopy(page, rules)`. It does not launch an app,
navigate, click, seed data or change settings. Import it into the nearest existing
`screens-*.mjs` or QA harness after the harness has reached the relevant feature state:

```javascript
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { measureCopy } from './lib/copy-layout.mjs';

// `page` is an isolated Playwright page. Reach the enabled/custom state first.
for (const width of [900, 1280]) {
  await page.setViewportSize({ width, height: 900 });
  const evidence = await measureCopy(page, [
    { selector: '.feature .setting-label', maxLines: 1 },
    { selector: '.feature .hint' }, // two lines by default
    {
      selector: '.feature .replacement-warning', maxLines: 6,
      reason: 'Must explain replacement of existing data and the backup requirement.'
    }
  ]);
  writeFileSync(`${output}/${width}-copy.json`, JSON.stringify(evidence, null, 2));
  await page.locator('.feature').screenshot({ path: `${output}/${width}-copy.png` });
  assert.ok(evidence.passed, JSON.stringify(evidence.failures));
}
```

Select the text element, not its surrounding card or an entire dialog. Each selector must
match at least one visible, nonempty element. Scope selectors to the active state: matching
a hidden duplicate is a failure. Record source SHA and dirty state in the harness report,
along with runtime/version, display scaling, locale and the state exercised. Keep test URLs
and authentication tokens out of public reports. Reports and screenshots may contain visible
text; use synthetic data.

The result includes text, Unicode code-point count, text width, height, font, font size,
line height, rendered line count, overflow flags and failures. The line measurement counts
text rectangles rather than dividing box height by line height, so inline emphasis does not
count as another line. It detects overflow within the target; screenshots must also be
reviewed for clipping by ancestors, overlapping neighbors and overall usability. It does
not check grammar, terminology, comprehension or every CSS clipping technique.

## Command-line checks

For a directly reachable feature on an **already isolated** local test server:

```powershell
$env:TUCANO_BROWSER_CHANNEL = 'msedge' # optional; default is Playwright Chromium
node scripts/check-copy-layout.mjs --url http://127.0.0.1:PORT/ --selector ".feature .hint" --selector ".feature .description" --output C:/tmp/feature-copy
```

The CLI defaults to 900 and 1280 pixels wide, with a 900-pixel height. Repeat `--width` to
check other supported widths. Use `--max-lines 1` for a labels-only invocation. An explicit
exception above two lines requires `--reason "..."`. The CLI writes a screenshot for each
width and `report.json`, and exits nonzero on failure. It accepts only loopback URLs but
cannot determine whether their server uses scratch data: isolation remains the caller's
responsibility. It does not navigate into settings or dialogs. Use the imported helper for
those flows. Neither command attaches to the user's existing browser or desktop.

The existing `node scripts/check-english-copy.mjs C:/tmp/settings-copy` builds on an isolated
seeded server and checks the original Settings/Wiki audit surfaces; run `npm run build` first.
Extend a feature harness for new controls or states rather than assuming this fixed tour
covers them. Its `--baseline` flag collects comparison evidence without enforcing line limits;
it is not a passing feature check.

Run `node scripts/test-copy-layout.mjs` after changing the helper. This checks real browser
wrapping, inline text, clipping, horizontal overflow, missing/hidden targets and exceptions.
Finally, verify affected copy in the installed Electron renderer at the user's display scaling,
following the background testing policy. A headless browser result alone missed an extra line
in the previous resolver hint. Report any unavailable installed check as incomplete.

## Evidence required before delivery

- Review exact text for grammar, meaning, professional tone and terminology consistency.
- Check all changed states at the required widths; save the measurement report and screenshots.
- Resolve line/overflow failures; explain each necessary long warning separately.
- Verify affected installed Electron text and report runtime/scaling differences.
- Include source identity, commands, outcomes and evidence links in the PR. Do not call a
  feature complete on the strength of character counts or an automated writing score.
