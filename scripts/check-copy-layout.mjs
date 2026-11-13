// Read-only check of an isolated local test page; never attach to the user's daily app.
import { parseArgs } from 'node:util';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { measureCopy } from './lib/copy-layout.mjs';

const { values } = parseArgs({ options: {
  url: { type: 'string' }, selector: { type: 'string', multiple: true },
  width: { type: 'string', multiple: true }, height: { type: 'string', default: '900' },
  'max-lines': { type: 'string', default: '2' }, reason: { type: 'string' },
  output: { type: 'string', default: resolve(tmpdir(), 'tucano-copy-layout') },
  help: { type: 'boolean' }
} });
if (values.help) {
  console.log('node scripts/check-copy-layout.mjs --url http://127.0.0.1:PORT/ --selector ".feature .hint" [--width 900 --width 1280] [--max-lines 1] [--output PATH]\nUse only a scratch server. Navigate conditional dialogs in a feature harness and import measureCopy for those states.');
  process.exit(0);
}
const url = new URL(values.url || 'about:blank');
if (!['http:', 'https:'].includes(url.protocol) || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw new Error('--url must address an isolated loopback test server.');
if (!values.selector?.length) throw new Error('Provide --selector for the labels or hints being checked.');
const widths = (values.width || ['900', '1280']).map(Number);
const height = Number(values.height);
if (![...widths, height].every(n => Number.isInteger(n) && n > 0)) throw new Error('Viewport dimensions must be positive integers.');
const output = resolve(values.output);
mkdirSync(output, { recursive: true });
const report = {
  source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  dirty: !!execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim(),
  channel: process.env.TUCANO_BROWSER_CHANNEL || 'chromium', checks: [], errors: []
};
const browser = await chromium.launch({ headless: true, ...(process.env.TUCANO_BROWSER_CHANNEL ? { channel: process.env.TUCANO_BROWSER_CHANNEL } : {}) });
try {
  const page = await browser.newPage();
  page.on('pageerror', e => report.errors.push(String(e)));
  for (const width of widths) {
    await page.setViewportSize({ width, height });
    await page.goto(url.href);
    await page.locator(values.selector[0]).first().waitFor({ state: 'attached' });
    const check = await measureCopy(page, values.selector.map(selector => ({ selector, maxLines: Number(values['max-lines']), reason: values.reason })));
    check.screenshot = `${width}.png`;
    await page.screenshot({ path: resolve(output, check.screenshot), fullPage: true });
    report.checks.push(check);
  }
  report.passed = !report.errors.length && report.checks.every(c => c.passed);
} catch (error) {
  report.passed = false;
  report.errors.push(String(error.stack || error));
} finally {
  await browser.close();
  writeFileSync(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
}
console.log(JSON.stringify({ passed: report.passed, report: resolve(output, 'report.json'), failures: report.checks.flatMap(c => c.failures), errors: report.errors }));
if (!report.passed) process.exitCode = 1;
