/* @layer shared-game @kind logic */
import type { SimSprite } from '../../types';
import { HALF_ROOM_COLS, ROOM_BIT_HEART_LEFT, ROOM_BIT_HEART_RIGHT } from './trigger-plans.constants';

const indoorPickupSlot = (sprite: SimSprite): number =>
  sprite.tile.col >= HALF_ROOM_COLS ? ROOM_BIT_HEART_RIGHT : ROOM_BIT_HEART_LEFT;

export { indoorPickupSlot };
