# Screenshot stories

A story photographs one area of the app, measures what the screen actually shows, and writes
`frames.json` beside the pictures. The migrated `sidebar-reorder`, `artifact-gallery`, and
`session-buttons` stories share `scripts/screens/lib.mjs` for launch, temporary data, fake engines,
viewport, output, and error collection. Other stories still use the legacy runner.

## A story, in about fifteen lines

```js
// scripts/screens-sidebar-rest.mjs
import { close, measure, openApp, settle, shot, until, writeFrames } from './screens/lib.mjs'

export const title = 'The sidebar at rest'
export const size = '1440x900'

export default async function story(t) {
  const app = await openApp()
  await until(app.win, '.sidebar .section')
  await settle(app.win, 800)
  const [row] = await measure(app, '.sidebar')
  row.frame = await shot(app, '01-rest', '.sidebar')
  writeFrames(app.out, [row])
  await close(app)
}
```

Then:

```bash
npm run build                       # stories read the build in out/
node scripts/screens.mjs sidebar-rest
```

The file keeps its own name. `sidebar-rest` is read as `scripts/screens-<area>.mjs`, so nothing in a
pull request body, a ticket or a folder name has to change when a story moves onto the harness.

The runner prints `mode: library` for a story that imports the harness and `mode: legacy` for one that
still launches Electron itself. A legacy area is passed its frames folder as the first argument, the
way its own header already documents, and its exit code is the runner's.

## What `openApp` gives you

| Option | Default | What it does |
| --- | --- | --- |
| `size` | `1440x900` | The window's viewport, `WxH` |
| `fake` | `true` | `TUCANO_FAKE_ENGINES=1`, scripted replies, no subscription |
| `locale` | `en-US` | `TUCANO_LOCALE`; a Portuguese story passes `pt-BR` |
| `seed` | `1` | `TUCANO_SEED`; `0` starts empty |
| `data` | a fresh temp folder | Pass the previous session's `data` to keep the database across a restart |
| `env` | none | Anything else a story needs in the environment |
| `app` | this checkout | The folder to launch, or an installed build's executable |

It returns a session: `win` (the Playwright page), `errors` (every page error and console error, in
one array), `data` (the database folder), `out` (the frames folder), `size`, `tag` and `frames`.
`close(session)` disposes the window and the Electron process even when the story threw. The temp
folder is sent to the Recycle Bin when the run ends on Windows (`gio trash` on Linux), so a story
that restarts the app on the same database can close and reopen it in the middle.

`settle(target, ms = 500)` waits. `until(target, selector, { timeout, state })` waits up to 30 seconds for
an element (a cold launch spends up to 20 getting to the workspace) and returns its locator. `idle(target)` waits until nothing is routing or answering, which is the
`.steps.is-working, .shimmer, .typing, .system-line.is-pending` set. A story does not write its own
timeout, and a story that needs one that is not here adds it to the harness. `idle` throws when
its deadline expires while the app remains busy.

`shot` waits for fonts, disables animations during capture, and hides the text caret. Fresh seeded
data and fake engines make the workflow repeatable. Wall-clock labels and generated IDs can still
vary between runs, so the harness does not promise byte-identical PNGs.

## Before and after

Two runs of the same file, with a tag:

```bash
git stash                                   # or check out the build before the change
node scripts/screens.mjs session-buttons --tag before
git stash pop
node scripts/screens.mjs session-buttons --tag after
```

The tag decides the default frames folder, `frames/<area>/<tag>`, so the two runs never overwrite each
other and both are kept. `--tag before` also sets `"tag": "before"` inside `frames.json`.

## Frames and `frames.json`

A frame is `<out>/<name>.png`, and `shot` returns its path so the row that measured the screen can
carry it. `frames.json` is the record of the run:

```json
{
  "story": "sidebar-reorder",
  "script": "scripts/screens-sidebar-reorder.mjs",
  "lib": "scripts/screens/lib.mjs",
  "libSha256": "0c8f…",
  "mode": "library",
  "tag": "after",
  "size": "1280x860",
  "app": ".",
  "out": "…/frames/sidebar-reorder/after",
  "head": "77ff6e6f…",
  "dirty": false,
  "at": "2026-05-05T09:12:44.201Z",
  "data": { "steps": [] },
  "rows": [
    {
      "story": "sidebar-reorder",
      "script": "scripts/screens-sidebar-reorder.mjs",
      "libSha256": "0c8f…",
      "index": 0,
      "frame": "01-rest.png",
      "selector": ".sidebar",
      "props": { "opacity": "1", "visibility": "visible", "display": "block" },
      "box": { "x": 0, "y": 0, "w": 240, "h": 860 },
      "data": { "step": "rest" },
      "note": null
    }
  ]
}
```

Every row is stamped with the story's path and the sha256 of the library file, so two runs can be told
apart by their data. A row without a selector is refused, and `writeFrames` throws rather than writing
one. `data` carries the story's own facts: a count, a claim it checked, the order a list ended in.

## Measure, do not ask a class name

`measure(target, selector, props = [])` returns the computed style and the box of every element a
selector matches. `opacity`, `visibility` and `display` always come back; `props` adds what else the
story needs, like `max-height` or `pointer-events`. It throws when the selector matches nothing, unless
the story passes `{ optional: true }`.

```js
const ways = await measure(app, '.msg__meta button', ['pointer-events'])
// ways[0].props.opacity, .props.visibility, .props.display, .box.w
```

The selector is a plain CSS selector, because `measure` runs it with `document.querySelectorAll` inside the
page. A Playwright extension such as `:has-text()` belongs to the story's own locators.

A class name is not evidence. `is-open`, `is-on` and `msg__hire` are all booleans a component sets for
itself, and a component can carry the class while the panel is invisible, off screen or covered. Record
the resolved style and the box: an element is in sight when `display` is not `none`, `visibility` is
`visible`, `opacity` is above zero and the box has width and height. A story that needs to know whether
an element exists at all uses `measure(…, { optional: true })` and records the empty result as the fact.

## A built package, not the dev tree

`openApp()` launches the checkout when no `app` is given. To photograph an installed build:

```bash
node scripts/screens.mjs sidebar-reorder --app "$LOCALAPPDATA/Programs/tucanonext/TucanoNext.exe"
```

The harness passes the executable to Playwright instead of `electron .`, keeps the same temporary
database and the same profile rules, and records the app path in `frames.json`. On macOS pass the
`.app` bundle's executable, and on Linux the AppImage.

## A story throws

A story that finds the wrong thing throws, and the runner exits non-zero. Printing `warning:` and
carrying on is not proof, so the harness has no way to report one. At the end of the run the runner
also fails on any page error or console error the windows logged; a story that knows about a noisy but
harmless error exports `allowErrors` with the patterns to forgive.

```js
export const allowErrors = ['ResizeObserver loop']
```

Assertions come from `node:assert/strict`, as they always did: `assert.deepEqual(await channels(),
['conteudo', 'dados'])`. The frames are the picture of that claim, and the rows are the numbers behind
it.

## Writing a new story

1. `scripts/screens-<area>.mjs`, with `export const size` if the area needs its own viewport and the
   comment at the top saying what the area is and how to run it.
2. Import the harness, `openApp()`, take the steps, `measure` at each frame, `writeFrames`, `close`.
3. Seed anything the screen needs through the database folder the session returns, and reopen with
   `openApp({ data })` so the app reads it.
4. Run it at the size the frames were first taken at, then at `--size 1440x900` and, for anything with
   a narrow shape, at `--size 420x900`. The app keeps a 900-pixel minimum window, so a narrow run is an
   emulated viewport on a normal window: it lays out at 420 and reports `window.innerWidth` 420, and the
   first boot at that size can take 20 seconds before `.sidebar` is there.
