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
const home = mkdtempSync(join(tmpdir(), 'tucano-files-browser-home-'));
const fixtureEnv = { HOME: home, USERPROFILE: home };
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
  ...process.env, ...fixtureEnv,
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
  await page.locator('.section .nav-item').filter({ hasText: 'engineering' }).first().click();
  const picker = page.locator('.composer input[type="file"]');
  await picker.setInputFiles({ name: 'browser-qa.txt', mimeType: 'text/plain', buffer: Buffer.from('Synthetic browser file content') });
  await page.locator('.composer__file-name').filter({ hasText: 'browser-qa.txt' }).waitFor();
  await page.locator('.composer textarea').fill('Check this attached document');
  await page.locator('.composer textarea').press('Enter');
  await page.locator('.composer__file-name').waitFor({ state: 'detached' });
  await page.getByText('browser-qa.txt', { exact: true }).first().waitFor();
  await page.reload();
  await page.locator('.sidebar').waitFor();
  if (await page.locator('.modal').count()) await page.keyboard.press('Escape');
  await page.locator('.section .nav-item').filter({ hasText: 'engineering' }).first().click();
  await page.getByText('browser-qa.txt', { exact: true }).first().waitFor();
  await page.screenshot({ path: join(output, 'browser-attached-file.png') });
  report.captures.push('browser-attached-file.png');
  report.checks = ['ordinary browser file attaches, sends and survives renderer reload'];
  await page.locator('.composer input[type="file"]').setInputFiles({ name: 'browser-large.bin', mimeType: 'application/octet-stream', buffer: Buffer.alloc(21 * 1024 * 1024) });
  await page.waitForFunction(() => document.querySelector('.composer textarea')?.value.includes('browser-large.bin'));
  assert.equal(await page.locator('.composer__file-name').count(), 0);
  await page.screenshot({ path: join(output, 'browser-large-file-path.png') });
  report.captures.push('browser-large-file-path.png');
  report.checks.push('oversized browser file uploads and inserts its server path');
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
