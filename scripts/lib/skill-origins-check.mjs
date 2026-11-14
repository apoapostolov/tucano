import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { measureCopy } from './copy-layout.mjs'

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

  return { HOME: home, USERPROFILE: home, HERMES_HOME: join(home, '.hermes'), CODEX_HOME: join(home, '.codex'), CLAUDE_CONFIG_DIR: join(home, '.claude'), OPENCODE_CONFIG_DIR: join(home, '.config/opencode'), AGENTS_HOME: join(home, '.agents'), PI_HOME: join(home, '.pi') };
}

export async function checkSkillOrigins(page, output, guard = async () => {}) {
  const report = { measurements: [], captures: [], interactions: [] };
  await page.setViewportSize({ width: 1280, height: 900 });
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
    await guard();
    await page.screenshot({ path: join(output, name) });
    report.captures.push(name);
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator('.skill-line').filter({ hasText: 'hermes-audit-skill' }).click();
  await page.locator('.skill-facts').waitFor();
  assert.ok((await page.locator('.skill-facts').innerText()).includes('from your Hermes'));
  await guard();
  await page.screenshot({ path: join(output, 'hermes-detail.png') });
  report.captures.push('hermes-detail.png');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.locator('.agent-form').waitFor();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await page.getByRole('button', { name: /Archived/ }).click();
  await page.getByRole('button', { name: 'Reactivate', exact: true }).click();
  await page.locator('.skill-line').filter({ hasText: 'hermes-audit-skill' }).waitFor();
  report.interactions = ['import-eight-harnesses', 'open-detail', 'edit-linked-skill', 'cancel-edit', 'archive', 'reactivate'];
  await guard();
  return report;
}
