/* @layer shared-game @kind logic */
import type { GridPos } from '../../../navigation/types';
import type { SimSprite } from '../../types';
import { BIG_KEY_RECEIVE_ID, SMALL_KEY_RECEIVE_ID } from '../../key-items';
import type { SimTarget } from '../state/state.type';
import type { DiscoverScope } from './discover.type';

const keyCarrierTarget = (scope: DiscoverScope, sprite: SimSprite, key: string, tile: GridPos | undefined): SimTarget => {
  const { killGated, shutters, living, screenId, trapArm } = scope;
  const itemId = sprite.carriesBigKey ? BIG_KEY_RECEIVE_ID : SMALL_KEY_RECEIVE_ID;
  const noun = sprite.carriesBigKey ? 'big key guard' : 'key guard';
  const lastLivingKillable = living.every((l) => l === sprite);
  const reopens = killGated && shutters.length > 0 && lastLivingKillable;
  const action = { type: 'kill', roomId: sprite.roomId, itemId, opensShutters: reopens } as const;
  return { screenId, roomId: sprite.roomId, action, key, role: 'check', label: `${noun} (room ${sprite.roomId.toString(16)})`, noun, verb: 'Defeating', tile, trap: trapArm };
};

export { keyCarrierTarget };
