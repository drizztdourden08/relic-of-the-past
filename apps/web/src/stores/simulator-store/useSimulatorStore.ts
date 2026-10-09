/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { SimulatorStore, TrailStop } from './simulator-store.type';
import { emptyProgress } from './emptyProgress';

const useSimulatorStore = create<SimulatorStore>()((set) => ({
  status: 'idle',
  runId: null,
  phaseLabel: '',
  outcome: null,
  progress: emptyProgress(),
  events: [],
  trail: [],
  suggestions: [],
  softlockReport: null,

  beginRun: (runId) => set({
    status: 'running',
    runId,
    phaseLabel: 'Starting...',
    outcome: null,
    progress: emptyProgress(),
    events: [],
    trail: [],
    suggestions: [],
    softlockReport: null,
  }),
  setStatus: (status) => set({ status }),
  setPhaseLabel: (phaseLabel) => set({ phaseLabel }),
  pushEvents: (incoming) => set((s) => ({ events: [...s.events, ...incoming] })),
  setProgress: (progress) => set((s) => {
    const last = s.trail[s.trail.length - 1];
    if (!progress.currentScreen || progress.currentScreen === last?.screenId) return { progress };
    const stop: TrailStop = { screenId: progress.currentScreen, epoch: progress.epoch, checksAt: progress.checksDone };
    return { progress, trail: [...s.trail, stop] };
  }),
  finishRun: ({ outcome, suggestions, softlockReport }) => set({
    status: 'done',
    outcome,
    suggestions,
    softlockReport,
  }),
  reset: () => set({
    status: 'idle',
    runId: null,
    phaseLabel: '',
    outcome: null,
    progress: emptyProgress(),
    events: [],
    trail: [],
    suggestions: [],
    softlockReport: null,
  }),
}));

export { useSimulatorStore };
