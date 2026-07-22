/* @layer renderer-stores @kind logic */
/**
 * Simulator run state — status, progress, narrative event ring buffer, and the
 * finished-run artefacts (outcome, dataset suggestions, softlock report). The
 * runner (useSimulatorRun) writes here; the widget sub-components read.
 */
import { create } from 'zustand';
import type {
  SimEvent,
  SimOutcome,
  SimPhase,
  DatasetSuggestion,
  SoftlockReport,
} from '@shared/game/simulation';

type RunStatus = 'idle' | 'running' | 'paused' | 'done';

interface SimProgress {
  phase: SimPhase;
  checksDone: number;
  discovered: number;
  epoch: number;
  currentScreen: string;
}

const EVENT_CAP = 500;

const emptyProgress = (): SimProgress => ({
  phase: 'idle',
  checksDone: 0,
  discovered: 0,
  epoch: 0,
  currentScreen: '',
});

interface SimulatorStore {
  status: RunStatus;
  runId: string | null;
  phaseLabel: string;
  outcome: SimOutcome | null;
  progress: SimProgress;
  events: SimEvent[];
  suggestions: DatasetSuggestion[];
  softlockReport: SoftlockReport | null;

  beginRun: (runId: string) => void;
  setStatus: (status: RunStatus) => void;
  setPhaseLabel: (label: string) => void;
  pushEvents: (events: SimEvent[]) => void;
  setProgress: (progress: SimProgress) => void;
  finishRun: (result: { outcome: SimOutcome | null; suggestions: DatasetSuggestion[]; softlockReport: SoftlockReport | null }) => void;
  reset: () => void;
}

const useSimulatorStore = create<SimulatorStore>()((set) => ({
  status: 'idle',
  runId: null,
  phaseLabel: '',
  outcome: null,
  progress: emptyProgress(),
  events: [],
  suggestions: [],
  softlockReport: null,

  beginRun: (runId) => set({
    status: 'running',
    runId,
    phaseLabel: 'Starting …',
    outcome: null,
    progress: emptyProgress(),
    events: [],
    suggestions: [],
    softlockReport: null,
  }),
  setStatus: (status) => set({ status }),
  setPhaseLabel: (phaseLabel) => set({ phaseLabel }),
  pushEvents: (incoming) => set((s) => {
    const next = [...s.events, ...incoming];
    return { events: next.length > EVENT_CAP ? next.slice(-EVENT_CAP) : next };
  }),
  setProgress: (progress) => set({ progress }),
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
    suggestions: [],
    softlockReport: null,
  }),
}));

export { useSimulatorStore };
export type { RunStatus, SimProgress };
