/* @layer shared-game @kind logic */
import type { GridPos } from '../../../navigation/types';
import type { SimSprite } from '../../types';
import type { SimTarget } from '../state/state.type';
import type { DiscoverScope } from './discover.type';
import { FOLLOWER_STEPS } from './discover.constants';
import { followerInTow } from './follower-in-tow';

const followerTarget = (scope: DiscoverScope, sprite: SimSprite, key: string, tile: GridPos | undefined): SimTarget | null => {
  const following = followerInTow(scope.obs);
  const fstep = FOLLOWER_STEPS.find((f) => f.room === sprite.roomId && f.following === following);
  if (!fstep) return null;
  const action = { type: 'progress', step: fstep.step } as const;
  return { screenId: scope.screenId, roomId: sprite.roomId, action, key, role: 'gate', label: fstep.noun, noun: fstep.noun, verb: fstep.verb, tile };
};

export { followerTarget };
