/* @layer shared-game @kind logic */
import type { EngineState } from '../state/state.type';

const globalRefresh = (state: EngineState): void => {
  state.epoch += 1;
  state.visited = new Set([state.virtual.screenId]);
  state.failed = new Set();
  state.route = [];
  state.frontier = [];
  state.progressSinceEpoch = true;
};

export { globalRefresh };
