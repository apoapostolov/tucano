# Background UI checks

Build with `npm run build`, then run `node scripts/qa-background.mjs`. The runner starts
Electron with `--qa-background`, a fresh temporary data directory, fake engines and two
separately allocated ports. It never sends operating-system mouse or keyboard input.
The window stays hidden and unfocusable; Playwright drives its DOM through Electron's
DevTools connection and captures the rendered page. Tray, notifications, phone restoration,
saved server restoration, update checks and protocol-client registration are suppressed.

The app rejects QA startup without an existing empty absolute data directory, fake engines,
and two distinct non-default ports. Normal application profiles, their parents and their
descendants are refused. QA data is deliberately retained in the reported temporary path
for investigation; it is never the normal workspace.

The smoke flow checks the seeded workspace, agent profile, Open DM action, Settings,
Team board and Usage. Each capture verifies that every app window remains hidden,
unfocused and unfocusable. Show and focus events also fail the run. A failing assertion
sets a nonzero exit code and retains the report, failure screenshot and Playwright trace.
Artifacts default to `.tucano-local/audit/background-qa`; pass an output directory as the
first argument. Reports include the source commit, tracked-diff status, actual executable,
app and Electron versions, scratch data, ports, completed checks and renderer errors.

Set `TUCANO_ELECTRON` to an absolute packaged executable to check an installed build.
Leave it unset to check the built source app. The script always launches a new isolated
instance and closes it afterward, so it can run beside the regular app. Port allocation
is released immediately before launch; a competing bind must cause a failed startup,
not a retry using an application's normal ports.

`--background` is a separate normal-use launch option: it shows the window without
activating it and leaves real workspace behavior intact. A second invocation carrying
that option does not raise an existing window.

These checks cover rendered navigation and isolation. They do not establish accessibility,
real engine authentication, operating-system dialogs, or physical input behavior. Add
focused DOM interactions and assertions to the runner as features are audited; retain
unit and integration regressions for concurrency and persistence.

## A feature's own flow

`scripts/screens-initiative.mjs` plays a bot's initiative end to end in the built app: the
way in from a DM with no coordinator, the setup, a check-in that reports and one that stays
quiet and leaves the conversation untouched, the record of both, a 520 px window measured
for overflow and folded columns, and the switch that stops it. The fake engine answers a
check-in by the brief's own words, so a run is deterministic without touching a provider.

```
npm run build && node scripts/screens-initiative.mjs [output directory]
TUCANO_ELECTRON=<installed TucanoNext.exe> node scripts/screens-initiative.mjs
```

It follows the same isolation, reporting and capture rules as the runner above: the same
scratch data, reserved ports, hidden window, `report.json` with the source commit, and a
failure screenshot with the page text left behind. Use the installed executable when what
is being checked is the bundle a person has, not the checkout's build.

`scripts/screens-notices.mjs` is the exception to the hidden-window rule, because it checks the
notification cards. `--qa-background` suppresses notifications on purpose, so this run starts an
ordinary isolated instance, and its window is visible for the few seconds it takes. It sends a
prompt in an agent's DM, leaves that conversation so the reply is not silently swallowed by the
screen the person is looking at, waits for the app's own notify path to put a card over every
window, and then checks the card is a real record rather than a Settings test card, that the page
hit-tests it where it is drawn, that a click opens the conversation, and that the cards window
hides afterwards.

```
node scripts/screens-notices.mjs [output directory]
TUCANO_ELECTRON=<installed TucanoNext.exe> node scripts/screens-notices.mjs
```

The approach uses Electron's [hidden BrowserWindow support](https://www.electronjs.org/docs/latest/api/browser-window)
and Playwright's [Electron automation](https://playwright.dev/docs/api/class-electron).
