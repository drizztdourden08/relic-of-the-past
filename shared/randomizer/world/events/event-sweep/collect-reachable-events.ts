/* @layer shared-game @kind logic */
import { reachableEvents } from './reachable-events';
import type { CollectionState } from '../../collection-state';

const collectReachableEvents = (state: CollectionState): void => {
  for (let batch = reachableEvents(state); batch.length > 0; batch = reachableEvents(state)) {
    for (const key of batch) state.collect(key);
  }
};

export { collectReachableEvents };
