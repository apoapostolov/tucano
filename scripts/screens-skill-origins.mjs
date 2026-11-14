import { measureCopy } from './lib/copy-layout.mjs';
// Built-renderer copy checks. Run npm run build first.
// Optional: TUCANO_BROWSER_CHANNEL=msedge (or chrome). The default uses Playwright Chromium.
// Scratch data, fake engines, loopback ports, and a headless browser keep daily work untouched.
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer } from 'node:net';
import { chromium } from 'playwright';
const root = resolve(process.env.TUCANO_QA_ROOT || '.');
const output = resolve(process.argv[2] || join(tmpdir(), 'tucano-english-copy-report'));
mkdirSync(output, {
  recursive: true
});
const data = mkdtempSync(join(tmpdir(), 'tucano-skill-origins-'));
const home = mkdtempSync(join(tmpdir(), 'tucano-skill-home-'));
const fixtures = [
  ['.hermes/skills/tools/hermes-audit/SKILL.md', 'Hermes'],
  ['.config/opencode/skills/opencode-audit/SKILL.md', 'OpenCode'],
  ['.copilot/skills/copilot-audit/SKILL.md', 'Copilot'],
  ['.gemini/skills/gemini-audit/SKILL.md', 'Gemini'],
  ['.codex/skills/codex-audit/SKILL.md', 'Codex'],
  ['.pi/skills/pi-audit/SKILL.md', 'Pi'],
  ['.agents/skills/agents-audit/SKILL.md', 'Agents'],
  ['.claude/skills/claude-audit/SKILL.md', 'Claude Code']
];
for (const [relative, harness] of fixtures) {
  const file = join(home, relative);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, `---\nname: ${harness} audit skill\ndescription: Review a synthetic example from ${harness}.\nversion: 1.0.0\n---\n# Audit\nRead the fixture and report the result.`);
}

const reservations = await Promise.all([0, 1, 2].map(async () => {
  const server = createServer();
  await new Promise(y => server.listen(0, '127.0.0.1', y));
  return {
    server,
    port: server.address().port
  };
}));
await Promise.all(reservations.map(({
  server
}) => new Promise(y => server.close(y))));
const env = {
  ...process.env, HOME: home, USERPROFILE: home, HERMES_HOME: join(home, '.hermes'), CODEX_HOME: join(home, '.codex'), CLAUDE_CONFIG_DIR: join(home, '.claude'), OPENCODE_CONFIG_DIR: join(home, '.config/opencode'), AGENTS_HOME: join(home, '.agents'), PI_HOME: join(home, '.pi'),
  TUCANO_DATA: data,
  TUCANO_SEED: '1',
  TUCANO_FAKE_ENGINES: '1',
  TUCANO_LOCALE: 'en-US',
  TUCANO_HOST: '127.0.0.1',
  TUCANO_PORT: String(reservations[0].port),
  TUCANO_WEBHOOK_PORT: String(reservations[1].port),
  TUCANO_GIT_PORT: String(reservations[2].port),
  TUCANO_TOKEN: 'copy-audit-scratch-only'
};
const server = spawn(process.execPath, ['out/main/server.js'], {
  cwd: root,
  env,
  windowsHide: true,
  stdio: ['ignore', 'pipe', 'pipe']
});
let log = '';
server.stdout.on('data', b => log += b);
server.stderr.on('data', b => log += b);
const report = {
  dirty: !!execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], {
    cwd: root,
    encoding: 'utf8'
  }).trim(),
  source: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8'
  }).trim(),
  data,
  measurements: [],
  captures: [],
  errors: []
};
let browser;
let page;
try {
  const url = `http://127.0.0.1:${reservations[0].port}`;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(url)).ok) break; } catch {}
    await new Promise(y => setTimeout(y, 100));
  }
  browser = await chromium.launch({ headless: true, ...(process.env.TUCANO_BROWSER_CHANNEL ? { channel: process.env.TUCANO_BROWSER_CHANNEL } : {}) });
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', e => report.errors.push(String(e)));
  await page.goto(`${url}/?token=copy-audit-scratch-only`);
  await page.locator('.sidebar').waitFor();
  if (await page.locator('.modal').count()) await page.keyboard.press('Escape');
  await page.locator('.sidebar .nav-item').filter({ hasText: 'Skills' }).first().click();
  for (const [, harness] of fixtures) {
    await page.getByRole('button', { name: 'Find existing skills', exact: true }).click();
    await page.locator('.skill-add__item').filter({ hasText: `${harness} audit skill` }).click();
    await page.locator('.skill-add__step').getByRole('button', { name: 'Use', exact: true }).click();
    await page.locator('.skill-line').filter({ hasText: `${harness.toLowerCase().replaceAll(' ', '-')}-audit-skill` }).waitFor();
  }
  for (const width of [1280, 900, 420]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [, harness] of fixtures) {
      const meta = page.locator('.skill-line').filter({ hasText: `${harness.toLowerCase().replaceAll(' ', '-')}-audit-skill` }).locator('.skill-line__meta');
      assert.ok((await meta.innerText()).includes(`from your ${harness}`), `${harness} source label missing`);
    }
    const copy = await measureCopy(page, [{ selector: '.skill-line__meta' }]);
    assert.ok(copy.passed, JSON.stringify(copy.failures));
    report.measurements.push(copy);
    const name = `origins-${width}.png`;
    await page.screenshot({ path: join(output, name) });
    report.captures.push(name);
  }
  assert.deepEqual(report.errors, []);
  report.passed = true;
} catch (error) {
  report.failure = String(error.stack || error);
  report.log = log;
  if (page) { report.text = await page.locator('body').innerText().catch(() => ''); await page.screenshot({ path: join(output, 'failure.png') }).catch(() => {}); }
  process.exitCode = 1;
} finally {
  await browser?.close();
  server.kill('SIGKILL');
  writeFileSync(join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, failure: report.failure, captures: report.captures.length }));
}
