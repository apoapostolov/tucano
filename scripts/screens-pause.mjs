// Pause captures use the same scratch profile, reserved ports and hidden-window guards as smoke QA.
// TUCANO_ELECTRON can point to the installed executable; regular workspace data is never used.
process.argv.push('--pause')
await import('./qa-background.mjs')
