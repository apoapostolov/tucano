import React, { useState, useMemo } from 'react'
import { Reading } from '../src/renderer/src/reading-context'
import { createRoot } from 'react-dom/client'
import { Thought } from '../src/renderer/src/components/Conversation'
import * as store from '../src/renderer/src/store'
import '../src/renderer/src/styles.css'

let listener: (event: any) => void
const settings = { workspaceName: 'QA', language: 'en', engines: {}, theme: 'system', showThinking: true }
const port: any = {
  onmessage: null,
  postMessage(req: any) {
    const result = req.method === 'snapshot' ? { settings, agents: [], conversations: [], messages: [], since: {}, connectors: [], approvals: [], memories: [], artifacts: [], computers: [], browsers: [], routines: [], skills: [], platform: 'win32', packaged: false, isolatedComputers: true, people: [], you: '' } : undefined
    queueMicrotask(() => port.onmessage({ data: { id: req.id, result } }))
  }
}
window.addEventListener = ((original) => function(name: string, fn: any, ...rest: any[]) { if (name === 'message') listener = fn; return original.call(window, name, fn, ...rest) }) (window.addEventListener) as any
;(window as any).tucano = { onNavigate: () => {}, viewing: () => {}, connect: () => queueMicrotask(() => listener({ source: window, data: 'core:port', ports: [port] })) }
await store.start()
function Fixture() {
  const [working, setWorking] = useState(true)
  const [visible, setVisible] = useState(true)
  Object.assign(window, { setWorking, setVisible })
  const calls = (window as any).readingCalls ??= { held: false, releases: 0, forgets: 0 }
  const reading = useMemo(() => ({
    hold: () => { calls.held = true },
    release: () => { calls.held = false; calls.releases++ },
    forget: () => { calls.held = false; calls.forgets++ },
    preserve: () => {}, follows: () => true
  }), [])
  return <Reading.Provider value={reading}><div style={{ width: '100%' }}>{visible && <Thought message={{ id: 'm', conversationId: 'c', author: { kind: 'agent', id: 'a' }, text: '', at: 1 }} working={working} />}</div></Reading.Provider>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
;(window as any).setSize = (thinkingSize: string) => port.onmessage({ data: { event: { type: 'settings', settings: { ...settings, thinkingSize } } } })
;(window as any).emitThought = (text: string) => port.onmessage({ data: { event: { type: 'thinking', id: 'm', text } } })
