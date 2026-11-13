// Real layout coverage: linkedom cannot establish line wrapping or clipping.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { measureCopy } from './lib/copy-layout.mjs';
const browser = await chromium.launch({ headless: true, ...(process.env.TUCANO_BROWSER_CHANNEL ? { channel: process.env.TUCANO_BROWSER_CHANNEL } : {}) });
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await page.setContent(`<style>body { font: 16px/24px Arial; } p { width: 180px; margin: 0; } #clipped { height: 24px; overflow: hidden; } #overflow { white-space: nowrap; } #hidden { display: none; }</style>
    <p id="short">Use <strong>memory</strong> model.</p>
    <label id="inline">Model</label>
    <p id="long">Choose a model for this task. Agents use these settings for new replies. You can change them at any time.</p>
    <p id="clipped">Choose a model for this task. Agents use these settings for new replies.</p>
    <p id="overflow">ThisTextCannotFitInsideTheAvailableWidth</p>
    <p id="hidden">Hidden hint</p>`);
  const good = await measureCopy(page, [{ selector: '#short', maxLines: 1 }, { selector: '#inline', maxLines: 1 }]);
  assert.equal(good.passed, true, JSON.stringify(good.failures));
  assert.equal(good.results[0].rows[0].lines, 1, 'mixed inline text is one line');
  assert.equal(good.results[0].rows[0].characters, 17);
  const bad = await measureCopy(page, ['#long', '#clipped', '#overflow', '#hidden', '#missing'].map(selector => ({ selector })));
  assert.equal(bad.passed, false);
  assert.ok(bad.failures.some(f => f.selector === '#long' && f.problem.includes('lines exceeds')));
  assert.ok(bad.failures.some(f => f.selector === '#clipped' && f.problem.includes('clipped')));
  assert.ok(bad.failures.some(f => f.selector === '#overflow' && f.problem.includes('overflows')));
  assert.ok(bad.failures.some(f => f.selector === '#hidden' && f.problem === 'Hidden element'));
  assert.ok(bad.failures.some(f => f.selector === '#missing' && f.problem === 'No matching elements'));
  await assert.rejects(measureCopy(page, [{ selector: '#long', maxLines: 5 }]), /Explain exceptions/);
  const exception = await measureCopy(page, [{ selector: '#long', maxLines: 10, reason: 'Fixture tests an explicitly documented warning exception.' }]);
  assert.equal(exception.passed, true);
  console.log('Copy layout checks passed: inline text, wrapping, clipping, overflow, hidden/missing targets, and explicit exceptions.');
} finally {
  await browser.close();
}

const server = createServer((_request, response) => {
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end('<style>p { font: 16px/24px Arial; width: 120px }</style><p id="short">Memory model</p><p id="long">Choose a model for this task. Agents use these settings for new replies. You can change them at any time.</p>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const output = mkdtempSync(join(tmpdir(), 'tucano-copy-tool-test-'));
try {
  for (const [selector, expected] of [['#short', 0], ['#long', 1]]) {
    const destination = join(output, selector.slice(1));
    const child = spawn(process.execPath, [fileURLToPath(new URL('./check-copy-layout.mjs', import.meta.url)),
      '--url', `http://127.0.0.1:${server.address().port}/`, '--selector', selector, '--output', destination],
    { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    child.stdout.on('data', data => log += data);
    child.stderr.on('data', data => log += data);
    const exit = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
    assert.equal(exit, expected, log);
    const report = JSON.parse(readFileSync(join(destination, 'report.json'), 'utf8'));
    assert.equal(report.passed, expected === 0);
    assert.deepEqual(report.checks.map(check => check.viewport.width), [900, 1280]);
    assert.ok(existsSync(join(destination, '900.png')));
    assert.ok(existsSync(join(destination, '1280.png')));
  }
  console.log(`CLI exit status, JSON and screenshots verified at both widths: ${output}`);
} finally {
  await new Promise(resolve => server.close(resolve));
}
