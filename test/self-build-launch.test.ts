import { expect, it } from 'vitest'
// @ts-expect-error The maintenance helper is JavaScript, executed directly by Node.
import { dailyLaunch } from '../scripts/self-build-launch.mjs'

it('returns the installed app to its normal data and engines after a test-shell build', () => {
  const source = { PATH: 'normal-path', APPDATA: 'normal-profile', TUCANO_DATA: 'scratch', TUCANO_FAKE_ENGINES: '1', TUCANO_SEED: '1', TUCANO_WEBHOOK_PORT: '51001', TUCANO_UPDATE_URL: 'test-feed', ELECTRON_RUN_AS_NODE: '1', ELECTRON_RENDERER_URL: 'http://test' }
  const launch = dailyLaunch(source)
  expect(launch.args).toEqual(['--background'])
  expect(launch.options.env).toEqual({ PATH: 'normal-path', APPDATA: 'normal-profile' })
  expect(source.TUCANO_DATA).toBe('scratch')
})

it('filters Windows environment names without depending on their casing', () => {
  expect(dailyLaunch({ Tucano_Data: 'scratch', electron_run_as_node: '1', SystemRoot: 'Windows' }).options.env).toEqual({ SystemRoot: 'Windows' })
})
