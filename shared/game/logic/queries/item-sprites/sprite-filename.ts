/* @layer shared-game @kind logic */
import { SPRITE_ID_PREFIX } from './item-sprites.constants';

const spriteFilename = (spriteId: string | undefined): string | undefined =>
  spriteId ? spriteId.slice(SPRITE_ID_PREFIX.length) : undefined;

export { spriteFilename };
