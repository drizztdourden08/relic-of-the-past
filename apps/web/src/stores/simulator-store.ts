/* @layer renderer-stores @kind logic */
/**
 * Simulator run state — status, progress, the full narrative event list, and the
 * finished-run artefacts (outcome, dataset suggestions, softlock report). The
 * runner (useSimulatorRun) writes here; the widget sub-components read.
 *
 * Events are kept in FULL: a long run's early history is exactly what makes a
 * log worth reading, and a capped tail silently hides it. The dialog windows
 * the list instead of trimming it (see LogView).
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
  pushEvents: (incoming) => set((s) => ({ events: [...s.events, ...incoming] })),
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
