# Working on this checkout

This is Apo's fork of `eduwxyz/tucano`. Branch `next` carries every merged upstream PR (44 of them)
plus the second-instance work, and it is what the installed **TucanoNext** is built from.

The released app (`Tucano`) and this build (`TucanoNext`) live side by side and never share code,
data or ports. A change that blurs the two is a bug, not a convenience.

## Commands

```sh
npm ci                                  # once, after a branch switch
npx tsc --noEmit -p tsconfig.json       # typecheck: expect no "error TS" line
npx vitest run                          # full suite: expect 0 failed
npm run build                            # electron-vite build -> out/
node scripts/whisper.mjs win x64         # whisper assets -> build/whisper/win-x64 (cached)
npx electron-builder --win nsis --x64 --publish never   # -> dist/tucanonext-setup-<version>.exe
./dist/tucanonext-setup-*.exe //S        # silent install, from bash; /S from cmd.exe
```

A build is done when typecheck and the full suite are clean, the installer is newer than the source
change, and the running app passes the smoke check below. "The build succeeded" is not the check.

## Hard rules

1. **Never rename the product.** `NAME` in `src/main/index.ts`, `package.json` `name` (`tucanonext`),
   `build.productName`, `build.appId` and `nsis.shortcutName` each decide something different: the
   data directory and single-instance lock, the Windows install folder, the executable and shortcuts,
   and the separate uninstaller. Renaming any of them either makes this build open the released app
   instead of itself, or installs it into `Programs\tucano`, where its uninstaller deletes the
   released app.
2. **Never write to the released app.** Its install is `%LOCALAPPDATA%\Programs\tucano`, its data is
   `%APPDATA%\Tucano`. This build's are `Programs\tucanonext` and `%APPDATA%\TucanoNext`.
3. **Never edit the live database under the running app.** `%APPDATA%\TucanoNext\tucano.db` is WAL
   mode with a `lockfile` held by the app. Read it with a read-only connection. For anything else,
   launch a throwaway instance instead: `TUCANO_DATA=<scratch>\ tn TucanoNext.exe`.
4. **One definition per surface.** The merged feature set already declares most RPC methods, settings
   keys and columns. Extend the existing one; a second declaration is the defect `tsc` catches as
   `TS2300`/`TS2451`.
5. **Do not bump the version, move tags or publish.** Releases are the maintainer's call.
6. **Do not commit `out/`, `dist/`, `node_modules/` or `build/whisper/`.** They are gitignored; if one
   appears in `git status`, something wrote outside its lane.

## Smoke check after install

Close the app first (`taskkill /F /IM TucanoNext.exe`; bash users must write `/F`, not `//F`), then
run the installer, which starts the app itself. In the window:

- the title bar reads `TucanoNext`
- clicking a sidebar DM opens that conversation, and clicking an agent opens its DM
- the workspace lists the existing agents, channels and settings
- Settings › Update reads `off`

## Where things live

| Path | What |
| --- | --- |
| `src/core/` | the engine: `index.ts` RPC handlers, `runs.ts` a reply's lifecycle, `db.ts` schema and `COLUMNS`, `policy-people.ts` settings scopes, `context.ts` per-turn context |
| `src/shared/` | the contract: `rpc.ts` + `rpc-shapes.ts` methods and parameters, `types.ts` shared types |
| `src/main/` | Electron: `index.ts` window, identity and the core process, `workspaces.ts` data dirs and ports, `servers.ts` window title, `updates.ts` self-update |
| `src/renderer/src/` | the UI: `store.ts` state and RPC calls, `components/` screens, `reorder.ts` press-and-hold rows |
| `test/` | vitest, one file per behaviour; renderer tests render with `linkedom` (`test/steer-pill.test.tsx` is the pattern) |

## Conventions the repository already follows

- Commit subjects are plain sentences in the imperative about the behaviour, not about the code
  ("Let a routine say nothing when it has nothing to report"). No conventional-commit prefixes here.
- A test ships with the behaviour: a new renderer interaction gets a `test/*.test.tsx` that drives it
  through real DOM events, and a fix that changes a shared helper gets a case that fails on the old
  code.
- Comments explain why a choice was made, in the same voice as the surrounding file. Do not add
  comments that restate the code.
- `linkedom` has no `MouseEvent` and no layout: dispatch `new window.Event(...)` with the fields
  React reads set by `Object.defineProperty`, and stub `document.elementFromPoint` for geometry.
- A pointer capture taken on `pointerdown` retargets the following click to the capturing element, so
  a button inside it never fires. Capture only once a gesture has actually started, and release it in
  the same handler that ends the gesture.

## Pull requests

The 43 open upstream PRs are already merged into `next`. Duplicates were closed (`#352` is superseded
by `#353`), stacks merge in order (`#261` → `#332` → `#338`, `#258` → `#259`, `#327` → `#329`), and the
written triage lives in `C:/git/_notes/tucanonext-pr-triage.md`. Read that before rebasing or
reopening any PR branch.

`next` also moves on its own: a daily job merges new upstream releases into it and resolves the
conflicts by the union rules, so pull before starting work and expect the merge commit on top. If it
reports a hard conflict, `next` is untouched and the two options in its brief are the decision.
