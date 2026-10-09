/* @layer shared-game @kind logic */
import type { CheckId } from '@shared/game/data/types/ids';
import type { CollectionState } from '../../collection-state';

const canReachEvent = (state: CollectionState, key: CheckId): boolean => {
  const event = state.world.eventsByKey.get(key);
  if (event === undefined) return false;
  if (!state.canReachRegion(event.region)) return false;
  const rule = state.world.getEventRule(key);
  return rule === undefined || rule(state);
};

export { canReachEvent };
