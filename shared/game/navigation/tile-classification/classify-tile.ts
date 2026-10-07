/* @layer shared-game @kind logic */
import {
  OVERWORLD_TILE_BEHAVIOR, INTERIOR_TILE_BEHAVIOR, OVERWORLD_TILE_VISUAL, INTERIOR_TILE_VISUAL,
} from '../../data/native-tables';
import { classifyTileAttr } from './classify-collision';
import { resolveInteractable } from './resolve-interactable';
import type { ClassifyTileParams, TileClassification } from './types';

/**
 * Joins the five independently-sourced facts about one tile: behavior + visual
 * (native tables keyed by attr/indoors), room context (plain values from the
 * caller), collision (the existing `classifyTileAttr`, reused unmodified, from
 * classify-collision.ts) and interactable identity (a live side-table lookup,
 * see resolve-interactable.ts). No dimension here is derived from another; each
 * comes from its own source and this function only joins them.
 */
const classifyTile = (params: ClassifyTileParams): TileClassification => {
  const { attr, layer, indoors, palaceIndex, replacementTileState, chestLocations, doors } = params;

  const behavior = (indoors ? INTERIOR_TILE_BEHAVIOR : OVERWORLD_TILE_BEHAVIOR)[attr];
  const visual = (indoors ? INTERIOR_TILE_VISUAL : OVERWORLD_TILE_VISUAL)[attr];
  const collision = classifyTileAttr(attr, indoors);
  const interactable = resolveInteractable({ attr, behavior, replacementTileState, chestLocations, doors });

  return {
    attr,
    layer,
    behavior,
    visual,
    room: { indoors, palaceIndex },
    collision,
    ...(interactable && { interactable }),
  };
};

export { classifyTile };
