/* @layer shared-game @kind logic */
/** Interior tile attribute overrides + context → map selector. */
import type { TileAttrDef, TileAttrContext } from './tile-attrs-types';
import { OVERWORLD_TILE_ATTRS, INTERIOR_ATTRS } from '../data/native-tables';

// Shared instance — all interior contexts use the same map until they diverge.
const INTERIOR_HOUSE_TILE_ATTRS = INTERIOR_ATTRS;
const INTERIOR_CAVE_TILE_ATTRS = INTERIOR_ATTRS;
const INTERIOR_DUNGEON_TILE_ATTRS = INTERIOR_ATTRS;

const getTileAttrsMap = (context: TileAttrContext = 'overworld'): Readonly<Record<number, TileAttrDef>> => {
  switch (context) {
    case 'interior-house': return INTERIOR_HOUSE_TILE_ATTRS;
    case 'interior-cave': return INTERIOR_CAVE_TILE_ATTRS;
    case 'interior-dungeon': return INTERIOR_DUNGEON_TILE_ATTRS;
    case 'overworld':
    default: return OVERWORLD_TILE_ATTRS;
  }
};

export { INTERIOR_HOUSE_TILE_ATTRS, INTERIOR_CAVE_TILE_ATTRS, INTERIOR_DUNGEON_TILE_ATTRS, getTileAttrsMap };
