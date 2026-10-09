/* @layer renderer-widgets @kind logic */
import type { EngineState, RecorderState } from '@rotp/navigation';
import { buildDatasetSuggestions, buildSoftlockReport } from '@rotp/navigation';
import type { RunResults } from '../SimulatorWidget.type';

const buildRunResults = (state: EngineState, recorder: RecorderState): RunResults => ({
  outcome: state.outcome,
  suggestions: buildDatasetSuggestions(recorder),
  softlockReport: state.outcome === 'not-completable' ? buildSoftlockReport(state) : null,
});

export { buildRunResults };
