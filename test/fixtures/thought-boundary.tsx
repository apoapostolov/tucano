import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Thought } from '../../src/renderer/src/components/Conversation'
import * as store from '../../src/renderer/src/store'
import '../../src/renderer/src/styles.css'

const settings = { workspaceName: 'QA', language: 'en', engines: {}, theme: 'system', showThinking: true }
// Give the renderer a real MessagePort the way the preload does. A patched global message listener
// used to work, but Vite's own client also listens for window messages and took the fake port.
const channel = new MessageChannel()
const core = channel.port1
core.onmessage = (m: MessageEvent<{ id: number; method: string }>) => {
  const req = m.data
  const result = req.method === 'snapshot' ? { settings, agents: [], conversations: [], messages: [], since: {}, connectors: [], approvals: [], memories: [], artifacts: [], computers: [], browsers: [], routines: [], skills: [], platform: 'win32', packaged: false, isolatedComputers: true, people: [], you: '' } : undefined
  queueMicrotask(() => core.postMessage({ id: req.id, result }))
}
const event = (e: Record<string, unknown>): void => core.postMessage({ event: e })
;(window as any).tucano = {
  onNavigate: () => {},
  viewing: () => {},
  connect: () => window.postMessage('core:port', '*', [channel.port2])
}
await store.start()
function Fixture() {
  const [working, setWorking] = useState(true)
  const [visible, setVisible] = useState(true)
  Object.assign(window, { setWorking, setVisible })
  return <div style={{ width: '100%' }}>{visible && <Thought message={{ id: 'm', conversationId: 'c', author: { kind: 'agent', id: 'a' }, text: '', at: 1 }} working={working} />}</div>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
;(window as any).setSize = (thinkingSize: string) => event({ type: 'settings', settings: { ...settings, thinkingSize } })
;(window as any).emitThought = (text: string) => event({ type: 'thinking', id: 'm', text })
;(window as any).setThinking = (showThinking: boolean) => event({ type: 'settings', settings: { ...settings, showThinking } })
