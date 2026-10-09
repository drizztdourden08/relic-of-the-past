/* @layer tests @kind helper */
import type { GridPos } from '@rotp/game-core';
import type { SimSprite } from '../../../shared/game/simulation/types';

const makeSprite = (tile: GridPos, spriteType = 1): SimSprite => ({
  roomId: 1,
  spriteType,
  tile,
  posKnown: true,
  kind: 'other',
});

export { makeSprite };
