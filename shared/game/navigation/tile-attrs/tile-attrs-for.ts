/* @layer shared-game @kind logic */
import type { TileAttrDef } from '../../data/types/tile-attrs-types';
import { INTERIOR_ATTRS, OVERWORLD_TILE_ATTRS } from '../../data/native-tables';

const tileAttrsFor = (indoors: boolean): Readonly<Record<number, TileAttrDef>> =>
  indoors ? INTERIOR_ATTRS : OVERWORLD_TILE_ATTRS;

export { tileAttrsFor };
