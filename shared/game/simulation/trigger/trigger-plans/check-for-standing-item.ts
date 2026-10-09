/* @layer shared-game @kind logic */
import type { SimSprite } from '../../types';
import type { CheckRecord } from '@rotp/game-data';
import { getCheckByGameId } from '@rotp/game-data';
import { OW_PICKUP_MASK } from './trigger-plans.constants';
import { indoorPickupSlot } from './indoor-pickup-slot';

const checkForStandingItem = (sprite: SimSprite): CheckRecord | undefined => {
  if (sprite.kind !== 'standing' && sprite.kind !== 'overworld') return undefined;
  if (sprite.outdoor) return getCheckByGameId({ owScreen: sprite.roomId, mask: OW_PICKUP_MASK });
  return getCheckByGameId({ roomId: sprite.roomId, chestIndex: indoorPickupSlot(sprite) });
};

export { checkForStandingItem };
