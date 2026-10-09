/* @layer shared-game @kind logic */
import { inventoryToReachTokens } from '../../requirements-map/inventory-to-reach-tokens';
import type { EngineState } from '../state/state.type';

const syncReachTokens = (state: EngineState): void => {
  state.reachTokens = inventoryToReachTokens(state.inventory);
};

export { syncReachTokens };
