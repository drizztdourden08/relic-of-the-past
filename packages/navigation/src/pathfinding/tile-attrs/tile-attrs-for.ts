/* @layer shared-game @kind logic */
import type { TileAttrDef } from '@rotp/game-data';
import { INTERIOR_ATTRS, OVERWORLD_TILE_ATTRS } from '@rotp/game-data';

const tileAttrsFor = (indoors: boolean): Readonly<Record<number, TileAttrDef>> =>
  indoors ? INTERIOR_ATTRS : OVERWORLD_TILE_ATTRS;

export { tileAttrsFor };
