/* @layer bridge-wasm @kind logic */
import type { CheckId } from '@rotp/game-data';
import { collectedChecksState } from './collected-checks-state';

const addCollectedChecks = (ids: Iterable<CheckId>): boolean => {
  const before = collectedChecksState.collected.size;
  const next = new Set(collectedChecksState.collected);
  for (const id of ids) next.add(id);
  collectedChecksState.collected = next;
  return collectedChecksState.collected.size !== before;
};

export { addCollectedChecks };
