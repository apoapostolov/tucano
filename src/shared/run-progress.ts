// What a cut reply has to go on with, and when it has nothing. The core acts on this and the window
// draws the button from it: one reading, so the button the person sees is the one the core will take.
import type { Run, RunStatus } from './types'

// A step that only says the model is working is not work the reply got done: it is the same step
// every reply has before anything came back.
export const WORKLESS_LABELS = ['Pensou', 'Pensando', 'Pausou', 'Thought', 'Thinking', 'Paused']

// A reply the app cut, rather than one that ran to its own end.
export const CUT: RunStatus[] = ['stopped', 'interrupted', 'failed']

// At least one step came back: something was read, written, edited or run, or a call failed.
export const workedOn = (run: Run): boolean =>
  (run.steps ?? []).some((s) => s.status !== 'running' && !WORKLESS_LABELS.includes(s.label))

// A reply paused at its budget always goes on; a cut one only when there is something to go on with.
// That is the bar for going on by itself: a reply that never got a tool call back doesn't restart in
// a loop. A person's Continue is their call, so it takes any reply the app cut, including one cut
// while it was still thinking.
export const canContinue = (run: Run): boolean =>
  run.status === 'paused' || (CUT.includes(run.status) && workedOn(run))

// What the person's Continue accepts: any reply the app cut, even one with nothing but thoughts behind
// it (the app closing mid-sentence, a stop from the rail). The core uses this for a Continue that was
// asked for, and `canContinue` for one that goes on by itself.
export const canResume = (run: Run): boolean => run.status === 'paused' || CUT.includes(run.status)
