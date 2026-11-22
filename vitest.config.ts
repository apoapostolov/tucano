import { configDefaults, defineConfig } from 'vitest/config'

// On Windows, tests that write a lot to SQLite run several times slower (the summary
// tests took 6 s on GitHub's runner), so they get more time there than vitest's 5 s.
// site/ has its own node:test files (`node --test site/`), which vitest can't run.
// 60 s, not 30: the whole of team-round3 takes 99 s on GitHub's Windows runner, and one
// of its wiki tests crossed 30 s while a Chrome test in the same shard held the CPU — the
// worker was starved, not stuck. A real hang now costs 30 s more before it's called.
export default defineConfig({
  test: {
    // quarantine/ holds the tests of the fork's own surfaces that upstream 0.2.45 replaced (the reply
    // queue, the hold, follow-up, the settings placement, the steps modes). They are kept as the spec
    // of what each wave re-applies, not run: a test there names behaviour this build no longer has.
    exclude: [...configDefaults.exclude, 'site/**', 'quarantine/**'],
    testTimeout: process.platform === 'win32' ? 60_000 : 5_000,
    hookTimeout: process.platform === 'win32' ? 60_000 : 10_000
  }
})
