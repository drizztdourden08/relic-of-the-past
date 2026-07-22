/* @layer renderer-widgets @kind logic */
/**
 * Derives the store-facing progress snapshot from live engine state and the
 * finished-run artefacts (dataset suggestions + softlock report) from the
 * recorder and final state.
 */
import type {
  EngineState,
  SimOutcome,
  DatasetSuggestion,
  SoftlockReport,
  RecorderState,
} from '@shared/game/simulation';
import { buildDatasetSuggestions, buildSoftlockReport } from '@shared/game/simulation';
import type { SimProgress } from '@app/stores/simulator-store';

const computeProgress = (state: EngineState): SimProgress => ({
  phase: state.phase,
  checksDone: state.completedChecks.size,
  discovered: state.done.size + state.failed.size + state.pending.length,
  epoch: state.epoch,
  currentScreen: state.virtual.screenId,
});

interface RunResults {
  outcome: SimOutcome | null;
  suggestions: DatasetSuggestion[];
  softlockReport: SoftlockReport | null;
}

const buildRunResults = (state: EngineState, recorder: RecorderState): RunResults => ({
  outcome: state.outcome,
  suggestions: buildDatasetSuggestions(recorder),
  softlockReport: state.outcome === 'not-completable' ? buildSoftlockReport(state) : null,
});

export { computeProgress, buildRunResults };
export type { RunResults };
