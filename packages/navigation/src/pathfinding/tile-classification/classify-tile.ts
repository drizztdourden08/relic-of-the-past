/* @layer shared-game @kind logic */
import type { ClassifyTileParams, TileClassification } from './tile-classification.type';
import { OVERWORLD_TILE_BEHAVIOR, INTERIOR_TILE_BEHAVIOR, OVERWORLD_TILE_VISUAL, INTERIOR_TILE_VISUAL } from '@rotp/game-data';
import { classifyTileAttr } from './classify-collision';
import { resolveInteractable } from './resolve-interactable';

const classifyTile = (params: ClassifyTileParams): TileClassification => {
  const { attr, layer, indoors, palaceIndex, replacementTileState, chestLocations, doors } = params;

  const behavior = (indoors ? INTERIOR_TILE_BEHAVIOR : OVERWORLD_TILE_BEHAVIOR)[attr];
  const visual = (indoors ? INTERIOR_TILE_VISUAL : OVERWORLD_TILE_VISUAL)[attr];
  if (behavior === undefined || visual === undefined) throw new Error(`No tile behavior or visual for attr ${attr}`);
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
