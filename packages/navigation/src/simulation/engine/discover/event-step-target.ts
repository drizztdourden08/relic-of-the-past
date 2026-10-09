/* @layer shared-game @kind logic */
import type { SimSprite } from '../../types';
import { hasReachableNeighbor } from '../discover-reach/has-reachable-neighbor';
import { DOOR_REACH_RADIUS } from '../discover-reach/discover-reach.constants';
import type { SimTarget } from '../state/state.type';
import type { DiscoverScope, EventStep } from './discover.type';
import { followerInTow } from './follower-in-tow';

const eventStepTarget = (scope: DiscoverScope, sprite: SimSprite, estep: EventStep, key: string): SimTarget | null => {
  const ready = !estep.needsFollower || followerInTow(scope.obs);
  if (!ready || !hasReachableNeighbor(scope.reached, sprite.tile, DOOR_REACH_RADIUS)) return null;
  const action = { type: 'progress', step: estep.step } as const;
  const tile = sprite.posKnown ? sprite.tile : undefined;
  return { screenId: scope.screenId, roomId: sprite.roomId, action, key, role: 'check', label: estep.noun, noun: estep.noun, verb: estep.verb, tile };
};

export { eventStepTarget };
