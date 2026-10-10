/* @layer shared-game @kind logic */
import type { TilePassability } from '@rotp/game-core';
import { tileAttrsFor } from '../tile-attrs';

const obstacleReq = (req: string | undefined, attr: number): string => {
  if (req === undefined) throw new Error(`Obstacle tile attr ${attr} has no requirement`);
  return req;
};

const classifyTileAttr = (attr: number, indoors = false): TilePassability => {
  const def = tileAttrsFor(indoors)[attr];
  if (!def) return { type: 'blocked' };

  if (def.cat === 'stairs') return { type: 'stairs' };

  switch (def.pass) {
    case 'free':    return { type: 'free' };
    case 'obstacle': return { type: 'obstacle', req: obstacleReq(def.req, attr) };
    case 'water':   return { type: 'water' };
    case 'pit':     return { type: 'pit' };
    case 'blocked': return { type: 'blocked' };
  }
};

export { classifyTileAttr };
