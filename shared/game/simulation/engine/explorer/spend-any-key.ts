/* @layer shared-game @kind logic */
import type { EngineState } from '../state/state.type';

const spendAnyKey = (state: EngineState): void => {
  for (const [dungeon, n] of state.keys) {
    if (n > 0) { state.keys.set(dungeon, n - 1); return; }
  }
};

export { spendAnyKey };
