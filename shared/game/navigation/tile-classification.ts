import type { TilePassability } from './types';
import { getTileAttrsMap, type TileAttrContext } from './tile-attrs';

/**
 * Classify a raw Map8 collision attribute into a TilePassability.
 * Thin lookup into TILE_ATTRS — the unified source of truth.
 */
function classifyTileAttr(attr: number, context: TileAttrContext = 'overworld'): TilePassability {
  const def = getTileAttrsMap(context)[attr];
  if (!def) return { type: 'blocked' };

  if (def.cat === 'stairs') return { type: 'stairs' };

  switch (def.pass) {
    case 'free':    return { type: 'free' };
    case 'obstacle': return { type: 'obstacle', req: def.req! };
    case 'water':   return { type: 'water' };
    case 'pit':     return { type: 'pit' };
    case 'blocked': return { type: 'blocked' };
  }
}

export { classifyTileAttr };
