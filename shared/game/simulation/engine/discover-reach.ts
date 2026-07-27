/* @layer shared-game @kind logic */
/**
 * Neighbour-reachability against the detect flood's `reached` grid, shared by
 * every interactable kind whose own tile is solid (a sprite, a door record
 * inside a wall, a cracked-wall marker) — what matters for each is whether the
 * player can stand on a tile beside it.
 */
import type { GridPos } from '../../navigation/types';

/** Tiles the detect flood reached; undefined = no grid, so gating is skipped. */
type Reached = boolean[][] | undefined;

/**
 * A sprite is interactable when the player can stand NEXT to it — its own tiles are
 * often solid (a blocking NPC like the uncle stamps a 3×3 footprint into the
 * grid, so the spawn tile itself never floods). Any reachable tile within a
 * 2-tile ring around the spawn counts as "can talk to it".
 */
const SPRITE_TALK_RADIUS = 2;

/** Door records sit several tiles inside walls, away from walkable floor
 *  (internal quadrant doors run up to ~10 tiles from the nearest floor). */
const DOOR_REACH_RADIUS = 10;

const hasReachableNeighbor = (reached: Reached, tile: GridPos, radius: number = SPRITE_TALK_RADIUS): boolean => {
  if (!reached) return true;
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      if (reached[tile.row + dr]?.[tile.col + dc] === true) return true;
    }
  }
  return false;
};

export { hasReachableNeighbor, DOOR_REACH_RADIUS, SPRITE_TALK_RADIUS };
export type { Reached };
