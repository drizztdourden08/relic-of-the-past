/* @layer shared-game @kind logic */
import type { SimSprite } from '../../types';

const spriteKey = (sprite: SimSprite): string =>
  `sprite:${sprite.roomId}:${sprite.spriteType}:${sprite.tile.row}:${sprite.tile.col}`;

export { spriteKey };
