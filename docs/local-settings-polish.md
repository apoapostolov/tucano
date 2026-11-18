# Local TucanoNext settings polish

This change is confined to `next`. It has no upstream PR and must not be ported to released Tucano.

The language picker lists English first and retains Portuguese second in source, hidden from the Settings UI. “Idioma · Language” becomes “Language”. No translation is removed. Dictation model choices share a row; “Turn dictation on” precedes the microphone checkbox on the same row. Workspace name and Your name share equal columns. The notification preview gains the title “Notification preview”; its existing explanation and action remain intact.

The new control is “Launch minimized”, with the hint “Keep TucanoNext in the system tray when it starts at login.” It belongs to App / Startup (`app-startup`), uses `launchMinimized`, and is an app-wide startup preference stored with the default workspace's existing settings. Admins and owners can configure it in the installed default workspace when Launch at login is enabled. Its default is false. Changing it refreshes login registration immediately and takes effect on the next login launch; manual launches still show the app. Disabling Launch at login preserves the choice but disables its control. There are no object overrides or new privacy or destructive consequences. Hidden QA must never change real login registration.

Editorial review: labels name their setting or action directly. The new hint states the tray destination and login-only scope; the notification description still enumerates all five types. Existing English labels and checkbox wording remain unchanged. The layout and installed-app evidence is collected by `scripts/qa-local-settings.mjs` at native scaling, 900 and 1280 CSS pixels.
