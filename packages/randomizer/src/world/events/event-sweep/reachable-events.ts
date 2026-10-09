/* @layer shared-game @kind logic */
import { canReachEvent } from './can-reach-event';
import type { CheckId } from '@rotp/game-data';
import type { CollectionState } from '../../collection-state';

const reachableEvents = (state: CollectionState): CheckId[] => {
  if (state.world.options.actTokens !== undefined) return [];
  return [...state.world.eventsByKey.keys()].filter((key) => !state.has(key) && canReachEvent(state, key));
};

export { reachableEvents };
