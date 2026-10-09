/* @layer bridge-wasm @kind logic */
import type { CheckId } from '@rotp/game-data';
import { collectedChecksState } from './collected-checks-state';

const withCollectedChecks = (completed: Set<CheckId>): Set<CheckId> => {
  for (const id of collectedChecksState.collected) completed.add(id);
  return completed;
};

export { withCollectedChecks };
