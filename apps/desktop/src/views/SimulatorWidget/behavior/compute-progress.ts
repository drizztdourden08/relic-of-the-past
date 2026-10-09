/* @layer renderer-widgets @kind logic */
import type { EngineState } from '@rotp/navigation';
import type { SimProgress } from '@app/stores/simulator-store';

const computeProgress = (state: EngineState): SimProgress => ({
  phase: state.phase,
  checksDone: state.completedChecks.size,
  discovered: state.done.size + state.failed.size + state.pending.length,
  epoch: state.epoch,
  currentScreen: state.virtual.screenId,
});

export { computeProgress };
