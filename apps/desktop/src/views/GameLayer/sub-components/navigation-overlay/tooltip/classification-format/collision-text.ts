/* @layer renderer-components @kind logic */
import type { TilePassability } from '@rotp/game-core';

const collisionText = (collision: TilePassability): string => {
  if (collision.type === 'obstacle') return `obstacle · req ${collision.req}`;
  if (collision.type === 'ledge') return `ledge (${collision.dir})`;
  return collision.type;
};

export { collisionText };
