/* @layer renderer-stores @kind logic */
/**
 * Simulator run state: status, progress, the full narrative event list, and the
 * finished-run artefacts (outcome, dataset suggestions, softlock report). The
 * runner (useSimulatorRun) writes here; the widget sub-components read.
 *
 * Events are kept in FULL: a long run's early history is what makes a log
 * worth reading. The dialog windows the list instead of trimming it (see LogView).
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

/** One screen the run entered, in the order it actually walked the route. */
interface TrailStop {
  screenId: string;
  /** Epoch the run was on when it arrived. */
  epoch: number;
  /** Checks completed at arrival, so a stop's own haul is the next delta. */
  checksAt: number;
}

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
  trail: TrailStop[];
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
  // The trail is derived here, not pushed separately: the engine's own
  // currentScreen is the single source, so the route cannot drift from the run.
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
export type { RunStatus, SimProgress, TrailStop };
