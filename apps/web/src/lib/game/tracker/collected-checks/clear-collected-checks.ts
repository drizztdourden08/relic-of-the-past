/* @layer bridge-wasm @kind logic */
import { collectedChecksState } from './collected-checks-state';

const clearCollectedChecks = (): void => {
  collectedChecksState.collected = new Set();
};

export { clearCollectedChecks };
