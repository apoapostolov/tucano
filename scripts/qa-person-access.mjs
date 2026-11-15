// Actual built/installed renderers, synthetic data, hidden native windows. No desktop input.
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'node:net'
import { _electron as electron } from 'playwright'
import { measureCopy } from './lib/copy-layout.mjs'
import { supportsBackgroundCopyQA } from './lib/copy-runtime.mjs'

async function seedSectors(page) {
  return page.evaluate(async () => {
    const port = await new Promise(resolve => {
      const receive = event => {
        if (event.source !== window || event.data !== 'core:port' || !event.ports[0]) return
        window.removeEventListener('message', receive)
        resolve(event.ports[0])
      }
      window.addEventListener('message', receive)
      window.tucano.connect()
    })
    let sequence = 0
    const pending = new Map()
    port.onmessage = event => {
      const data = event.data
      const result = pending.get(data.id)
      if (!result) return
      pending.delete(data.id)
      if (data.error !== undefined) result.reject(new Error(data.error))
      else result.resolve(data.result)
    }
    const call = (method, params) => new Promise((resolve, reject) => {
      const id = ++sequence
      pending.set(id, { resolve, reject })
      port.postMessage({ id, method, params })
    })
    try {
      const snapshot = await call('snapshot')
      const lia = snapshot.agents.find(agent => agent.handle === 'lia')
      const theo = snapshot.agents.find(agent => agent.handle === 'theo')
      const nina = snapshot.agents.find(agent => agent.handle === 'nina')
      if (!lia || !theo || !nina) throw new Error('Missing synthetic seed agents')
      const save = agent => call('saveAgent', { agent, channelIds: snapshot.conversations.filter(conversation => conversation.members?.includes(agent.id)).map(conversation => conversation.id) })
      await call('createChannel', { name: 'platform-reliability-and-release-coordination' })
      const entryId = crypto.randomUUID()
      await save({ ...lia, id: entryId, name: 'Alexandra Research Coordination', handle: 'qa-entry', entry: true, reportsTo: undefined })
      await save({ ...lia, reportsTo: entryId, name: 'Lia Engineering and Reliability', sectorName: 'Engineering and Platform Reliability', sectorDoes: 'Build and verify the application' })
      await save({ ...theo, name: 'Theodore Infrastructure Operations', reportsTo: lia.id })
      await save({ ...nina, reportsTo: entryId, name: 'Nina Documentation and Research', sectorName: 'Documentation and Research Operations', sectorDoes: 'Write and review documentation' })
      await save({ ...nina, id: crypto.randomUUID(), name: 'Christopher Knowledge Management', handle: 'qa-member', reportsTo: nina.id, sectorName: undefined, sectorDoes: undefined })
    } finally { port.close() }
  })
}


const output = resolve(process.argv[2] || '.tucano-local/person-access')
mkdirSync(output, { recursive: true })
const reservations = await Promise.all([0, 1].map(async () => {
  const server = createServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return { server, port: server.address().port }
}))
const data = mkdtempSync(join(tmpdir(), 'tucano-person-access-'))
const env = { ...process.env, TUCANO_DATA: data, TUCANO_SEED: '1', TUCANO_FAKE_ENGINES: '1', TUCANO_LOCALE: 'en-US', TUCANO_WEBHOOK_PORT: String(reservations[0].port), TUCANO_GIT_PORT: String(reservations[1].port) }
delete env.ELECTRON_RUN_AS_NODE
delete env.ELECTRON_RENDERER_URL
const report = { source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), dirty: !!execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim(), captures: [], copy: [], errors: [], passed: false, userContentPolicy: 'User-provided agent names may wrap to two lines. Authored labels remain one line; authored hints remain two.' }
let app
try {
  await Promise.all(reservations.map(({ server }) => new Promise(resolve => server.close(resolve))))
  assert.ok(supportsBackgroundCopyQA(env.TUCANO_ELECTRON), 'Refuse to launch a bundle without hidden QA support')
  app = await electron.launch({ args: [...(env.TUCANO_ELECTRON ? [] : ['.']), '--qa-background'], ...(env.TUCANO_ELECTRON ? { executablePath: env.TUCANO_ELECTRON } : {}), env })

  report.runtime = await app.evaluate(({ app, BrowserWindow }) => {
    globalThis.__copyExposure = []
    const watch = w => ['show', 'focus'].forEach(event => w.on(event, () => globalThis.__copyExposure.push(event)))
    BrowserWindow.getAllWindows().forEach(watch)
    app.on('browser-window-created', (_e, w) => watch(w))
    return { executable: process.execPath, version: app.getVersion(), electron: process.versions.electron }
  })
  const page = await app.firstWindow()
  const mainId = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].id)
  page.on('pageerror', error => report.errors.push(String(error)))
  page.setDefaultTimeout(60000)
  const guard = async () => {
    const state = await app.evaluate(({ BrowserWindow }) => ({ events: globalThis.__copyExposure, hidden: BrowserWindow.getAllWindows().every(w => !w.isVisible() && !w.isFocused() && !w.isFocusable()) }))
    assert.deepEqual(state.events, [])
    assert.ok(state.hidden, 'All QA windows must stay hidden and unfocusable')
  }
  const resize = async (id, width, height = 900) => {
    await guard()
    await app.evaluate(({ BrowserWindow }, { id, width, height }) => BrowserWindow.fromId(id).setContentSize(width, height), { id, width, height })
  }
  const capture = async (target, name, rules) => {
    await guard()
    const copy = await measureCopy(target, rules)
    const display = await target.evaluate(() => ({ width: innerWidth, height: innerHeight, deviceScaleFactor: devicePixelRatio }))
    const screenshot = `${name}-${display.width}.png`
    await target.screenshot({ path: join(output, screenshot) })
    report.captures.push(screenshot)
    report.copy.push({ name, display, ...copy })

  }
  await page.locator('.sidebar').waitFor()
  // Only this script's throwaway profile is seeded; the installed app's data is never opened.
  const fixture = new DatabaseSync(join(data, 'tucano.db'))
  fixture.prepare("INSERT INTO people (id, name, role, about, created_at, named) VALUES (?, ?, 'member', ?, ?, 1)").run('qa-person-access', 'Alexandra Research Operations', 'Synthetic access fixture', Date.now())
  fixture.close()
  await page.reload()
  await page.locator('.sidebar').waitFor()
  await seedSectors(page)
  await page.locator('.sidebar .nav-item').filter({ hasText: 'Settings' }).first().click()
  await page.locator('#settings-tab-workspace').click()
  await page.locator('.settings-sections a[href="#settings-workspace-people"]').click()
  await page.getByRole('button', { name: 'Invite', exact: true }).click()
  const access = page.locator('.access')
  await access.waitFor()
  for (const width of [1280, 900]) {
    await resize(mainId, width)
    await page.waitForFunction(width => innerWidth === width, width)
    await access.getByRole('radio').first().click()
    await capture(page, 'all', [
      { selector: '.access-mode__text strong:visible', maxLines: 1 },
      { selector: '.access-mode__text > span:visible, .access-fine:visible, .access-result > span:visible' }
    ])
    await access.getByRole('radio').nth(1).click()
    while (await access.locator('.access-sector__open[aria-expanded="false"]').count()) await access.locator('.access-sector__open[aria-expanded="false"]').first().click()
    const sector = access.locator('.access-sector__check').first()
    await sector.click()
    assert.equal(await sector.getAttribute('aria-checked'), 'true')
    const agent = access.locator('.access-agents').first().getByRole('checkbox').first()
    await agent.click()
    assert.equal(await sector.getAttribute('aria-checked'), 'mixed')
    const channel = access.locator('.access-channel').first()
    await channel.click()
    assert.equal(await channel.getAttribute('aria-checked'), 'true')
    await access.scrollIntoViewIfNeeded()
    await capture(page, 'picked', [
      { selector: '.access-mode__text strong:visible, .access-label:visible', maxLines: 1 },
      { selector: '.access-mode__text > span:visible, .access-hint:visible, .access-fine:visible' },
      { selector: '.access-sector__name strong:visible', maxLines: 1 },
      { selector: '.access-agent__text strong:visible', maxLines: 2 },
      { selector: '.access-agent__text > span:visible' },
      { selector: '.access-channel:visible', maxLines: 1 },
      { selector: '.access-result > span:visible', maxLines: 8, reason: 'Access and privacy consequences must remain fully visible with realistic selected names.' }
    ])
    await access.getByRole('radio').first().evaluate(node => node.scrollIntoView({ block: 'center' }))
    await page.screenshot({ path: join(output, `picked-${width}-top.png`) })
    await access.locator('.access-result').evaluate(node => node.scrollIntoView({ block: 'center' }))
    await page.screenshot({ path: join(output, `picked-${width}-result.png`) })
    report.captures.push(`picked-${width}-top.png`, `picked-${width}-result.png`)
    await channel.click()
    await access.getByRole('radio').first().click()
  }
  await resize(mainId, 720)
  report.smallerViewport = await page.evaluate(() => ({ requested: 720, actual: innerWidth, supported: innerWidth === 720 }))
  await guard()
  assert.deepEqual(report.errors, [])
  report.passed = report.copy.every(result => result.passed)
  if (!report.passed) process.exitCode = 1
} catch (error) {
  report.failure = String(error.stack ?? error)
  console.error(report.failure)
  if (app?.windows()[0]) await app.windows()[0].screenshot({ path: join(output, 'failure.png') })
  process.exitCode = 1
} finally {
  writeFileSync(join(output, 'report.json'), JSON.stringify(report, null, 2))
  if (app) await app.close()
  for (const { server } of reservations) if (server.listening) server.close()
  writeFileSync(join(output, 'report.json'), JSON.stringify(report, null, 2))
}
console.log(JSON.stringify({ passed: report.passed, output, captures: report.captures.length, errors: report.errors, failure: report.failure, runtime: report.runtime }))
