/* @layer renderer-components @kind logic */
import type { TilePassability } from '@shared/game/navigation/types';

const collisionColor = (collision: TilePassability, canPass: boolean | null): string | undefined => {
  if (collision.type !== 'obstacle' || canPass === null) return undefined;
  return canPass ? 'var(--c-green-bright)' : 'var(--c-danger)';
};

export { collisionColor };
