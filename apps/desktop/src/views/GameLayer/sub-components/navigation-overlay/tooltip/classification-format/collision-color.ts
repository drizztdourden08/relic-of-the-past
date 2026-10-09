/* @layer renderer-components @kind logic */
import type { TilePassability } from '@rotp/game-core';

const collisionColor = (collision: TilePassability, canPass: boolean | null): string | undefined => {
  if (collision.type !== 'obstacle' || canPass === null) return undefined;
  return canPass ? 'var(--c-secondary-bright)' : 'var(--c-danger)';
};

export { collisionColor };
