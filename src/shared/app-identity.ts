// The identity Windows attaches to the app: its windows, its taskbar button and its notifications.
// The installer registers the same id for the shortcut it creates (package.json › build › appId).
// They have to be one string. An id no shortcut carries leaves the window grouped on its own, and
// Windows draws it with the framework's icon instead of the toucan; a toast with no id is dropped.
// test/app-identity.test.ts keeps the two halves together.
export const APP_ID = 'dev.tucano.next'
