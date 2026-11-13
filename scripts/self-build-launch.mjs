// Reinstalling from a test shell must return the regular app to its regular workspace.
export function dailyEnvironment(source) {
  return Object.fromEntries(Object.entries(source).filter(([key]) => !key.toUpperCase().startsWith('TUCANO_') && !['ELECTRON_RUN_AS_NODE', 'ELECTRON_RENDERER_URL'].includes(key.toUpperCase())))
}

export function dailyLaunch(source) {
  return { args: ['--background'], options: { detached: true, stdio: 'ignore', env: dailyEnvironment(source) } }
}
