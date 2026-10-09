/* @layer renderer-stores @kind types */
import type { SimEvent, SimOutcome, SimPhase, DatasetSuggestion, SoftlockReport } from '@rotp/navigation';

type RunStatus = 'idle' | 'running' | 'paused' | 'done';

interface TrailStop {
  screenId: string;
  epoch: number;
  checksAt: number;
}

interface SimProgress {
  phase: SimPhase;
  checksDone: number;
  discovered: number;
  epoch: number;
  currentScreen: string;
}

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

export type { RunStatus, SimProgress, SimulatorStore, TrailStop };
