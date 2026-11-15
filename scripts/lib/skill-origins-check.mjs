import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { measureCopy } from './copy-layout.mjs'
import { electronCopyViewport } from './electron-copy-viewport.mjs'

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
export function seedSkillOrigins() {
  const home = mkdtempSync(join(tmpdir(), 'tucano-skill-home-'));
for (const [relative, harness] of fixtures) {
  const file = join(home, relative);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, `---\nname: ${harness} audit skill\ndescription: Review a synthetic example from ${harness}.\nversion: 1.0.0\n---\n# Audit\nRead the fixture and report the result.`);
}

  const appData = join(home, 'AppData', 'Roaming');
  const localAppData = join(home, 'AppData', 'Local');
  mkdirSync(appData, { recursive: true });
  mkdirSync(localAppData, { recursive: true });
  return { APPDATA: appData, LOCALAPPDATA: localAppData, HOME: home, USERPROFILE: home, HERMES_HOME: join(home, '.hermes'), CODEX_HOME: join(home, '.codex'), CLAUDE_CONFIG_DIR: join(home, '.claude'), OPENCODE_CONFIG_DIR: join(home, '.config/opencode'), AGENTS_HOME: join(home, '.agents'), PI_HOME: join(home, '.pi') };
}

export async function checkSkillOrigins(page, output, guard = async () => {}, resize) {
  const report = { measurements: [], captures: [], interactions: [] };
  const original = page.viewportSize();
  const viewport = resize ? await electronCopyViewport(page, resize) : { set: async width => { if (width) await page.setViewportSize({ width, height: 900 }); }, restore: async () => { if (original) await page.setViewportSize(original); } };
  const captureCopy = async (state, rules) => {
    for (const width of resize ? [1280, 900] : [1280, 900, 420]) {
      await viewport.set(width);
      const copy = await measureCopy(page, rules);
      copy.state = state;
      copy.display = await page.evaluate(() => ({ width: innerWidth, devicePixelRatio }));
      report.measurements.push(copy);
      const name = `${state}-${width}.png`;
      await guard();
      await page.screenshot({ path: join(output, name) });
      report.captures.push(name);
      writeFileSync(join(output, 'skill-copy-progress.json'), JSON.stringify(report, null, 2));
      assert.ok(copy.passed, JSON.stringify(copy.failures));
    }
    await viewport.set(1280);
  };
  await viewport.set(1280);
  await page.locator('.sidebar .nav-item').filter({ hasText: 'Skills' }).first().click();
  for (const [, harness] of fixtures) {
    await page.getByRole('button', { name: 'Find existing skills', exact: true }).click();
    await page.locator('.skill-add__item').filter({ hasText: `${harness} audit skill` }).click();
    await page.locator('.skill-add__step').getByRole('button', { name: 'Use', exact: true }).click();
    await page.locator('.skill-line').filter({ hasText: `${harness.toLowerCase().replaceAll(' ', '-')}-audit-skill` }).waitFor();
  }
  await viewport.restore();
  // The desktop window has a 900px minimum; the browser surface also supports 420px.
  for (const width of resize ? [null, 1280, 900] : [null, 1280, 900, 420]) {
    await viewport.set(width);
    for (const [, harness] of fixtures) {
      const meta = page.locator('.skill-line').filter({ hasText: `${harness.toLowerCase().replaceAll(' ', '-')}-audit-skill` }).locator('.skill-line__meta');
      assert.ok((await meta.innerText()).includes(`from your ${harness}`), `${harness} source label missing`);
    }
    const copy = await measureCopy(page, [{ selector: '.skill-line__meta' }]);
    assert.ok(copy.passed, JSON.stringify(copy.failures));
    copy.viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
    copy.display = await page.evaluate(() => ({ devicePixelRatio, screenWidth: screen.width }));
    report.measurements.push(copy);
    const name = `origins-${width ?? "native"}.png`;
    await guard();
    await page.screenshot({ path: join(output, name) });
    report.captures.push(name);
  }
  await viewport.set(1280);
  await page.locator('.skill-line').filter({ hasText: 'hermes-audit-skill' }).click();
  await page.locator('.skill-facts').waitFor();
  assert.ok((await page.locator('.skill-facts').innerText()).includes('from your Hermes'));
  await captureCopy('linked-detail', [{ selector: '.skill-facts dd' }]);
  await guard();
  await page.screenshot({ path: join(output, 'hermes-detail.png') });
  report.captures.push('hermes-detail.png');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.locator('.agent-form').waitFor();
  await captureCopy('linked-editor', [
    { selector: '.agent-form .field__label', maxLines: 1 },
    { selector: '.agent-form .hint:visible' },
    { selector: '.skill-source-path', maxLines: 8, reason: 'The full source path is a value on its own row, not an explanatory hint.' }
  ]);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await page.getByRole('button', { name: /Archived/ }).click();
  await page.getByRole('button', { name: 'Reactivate', exact: true }).click();
  await page.locator('.skill-line').filter({ hasText: 'hermes-audit-skill' }).waitFor();
  await page.getByRole('button', { name: 'New skill', exact: true }).click();
  await captureCopy('new-skill', [{ selector: '.agent-form .field__label', maxLines: 1 }, { selector: '.agent-form .hint:visible' }]);
  await page.getByRole('textbox', { name: /^Name/ }).fill('Copy audit fixture');
  await page.getByRole('textbox', { name: /^When to use/ }).fill('When reviewing synthetic interface copy');
  await page.getByRole('textbox', { name: /^Instructions/ }).fill('# Review\nInspect the synthetic interface copy.');
  await page.getByRole('button', { name: 'Create skill', exact: true }).click();
  await page.locator('.skill-line').filter({ hasText: 'copy-audit-fixture' }).click();
  await page.getByText('No previous versions.', { exact: true }).waitFor();
  await captureCopy('first-version', [{ selector: '.skill-facts dd, .read-group > p.small:visible' }]);
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('textbox', { name: /^Instructions/ }).fill('# Review\nInspect the synthetic interface copy.\nRecord the checks.');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Show changes', exact: true }).first().waitFor();
  await captureCopy('version-history', [{ selector: '.skill__history button', maxLines: 1 }]);
  await page.getByRole('button', { name: 'Show changes', exact: true }).first().click();
  await captureCopy('version-diff', [{ selector: '.skill__history button', maxLines: 1 }]);
  report.interactions = ['import-eight-harnesses', 'open-detail', 'edit-linked-skill', 'cancel-edit', 'archive', 'reactivate'];
  await viewport.restore();
  await guard();
  return report;
}
