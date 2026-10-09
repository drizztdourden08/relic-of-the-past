/* @layer shared-game @kind logic */
import type { EngineState } from '../state/state.type';

const resetFrontier = (state: EngineState): void => {
  state.epoch += 1;
  state.frontier = [];
  state.route = [];
  state.progressSinceEpoch = false;
  state.visited = new Set();
  state.failed = new Set();
};

export { resetFrontier };
