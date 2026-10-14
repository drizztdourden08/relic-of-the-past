/* @layer renderer-components @kind logic */
import type { TilePassability } from '@rotp/game-core';
import type { TooltipTone } from '../tooltip/tooltip.type';

const collisionTone = (collision: TilePassability, canPass: boolean | null): TooltipTone | undefined => {
  if (collision.type !== 'obstacle' || canPass === null) return undefined;
  return canPass ? 'ok' : 'bad';
};

export { collisionTone };
