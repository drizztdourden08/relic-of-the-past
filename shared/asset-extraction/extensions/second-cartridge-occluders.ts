/* @layer shared-asset-extraction @kind logic */
/**
 * Restores "draws in front of the player" to the objects the port occludes with sprites.
 *
 * The port anchors an entity at each standing lamp's base (type 202 in this dungeon) and its
 * handler draws the lamp head as a sprite above the player - GBA tilemaps have no per-tile
 * priority bit, so that was its only way. This engine has the native way: the head cells are
 * already in the baked bottom layer, so they get the SNES priority bit at extraction, derived
 * from the port's own entity anchors (the head is the two rows above the anchor, two columns
 * wide - measured against the baked footprint).
 */
import type { DungeonRoomRecord } from '../dungeon/model';

/** Entity types whose baked background carries the object; the head rows get priority. */
const OCCLUDER_ENTITY_TYPES: ReadonlySet<number> = new Set([202]);

const MAP_COLS = 64;
const HEAD_ROWS = 2;
const HEAD_COLS = 2;

/** Bottom-layer cells that draw in front of the player, from the room's entity anchors. */
const occluderCells = (room: DungeonRoomRecord): Set<number> => {
  const cells = new Set<number>();
  for (const entity of room.entities) {
    if (!OCCLUDER_ENTITY_TYPES.has(entity.type)) continue;
    const col = entity.x >> 3;
    const baseRow = (entity.y >> 3) - HEAD_ROWS;
    for (let dy = 0; dy < HEAD_ROWS; dy++) {
      for (let dx = 0; dx < HEAD_COLS; dx++) {
        const row = baseRow + dy;
        if (row >= 0 && row < MAP_COLS && col + dx < MAP_COLS) cells.add(row * MAP_COLS + col + dx);
      }
    }
  }
  return cells;
};

export { occluderCells };
