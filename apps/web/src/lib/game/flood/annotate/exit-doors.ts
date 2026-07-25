/* @layer bridge-wasm @kind logic */
/**
 * Finds the room's exit doors — the tiles carrying attr 0x8E, which walk the player
 * OUT of the dungeon rather than scrolling to the next room.
 *
 * The existing `exitDoorAt` only answers "is there one near this wall position",
 * which is what the connection filter needs; the overlay needs the tiles
 * themselves. Adjacent 0x8E tiles are one door (notches are 2 wide and doors are
 * several tiles deep), so cells are clustered into a single marker each.
 */
import type { GridPos } from '@shared/game/navigation';
import { getScreenGrids } from '../screen-grids';

/** kDoorType exit trigger — crossing it leaves the dungeon. */
const EXIT_DOOR_ATTR = 0x8e;
const GRID = 64;

/** Cluster radius in tiles: one physical door never spans more than this. */
const NEAR = 3;

const exitDoorTiles = (roomId: number): GridPos[] => {
  const bundle = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
  const grids = [
    bundle.rawAttrGrid,
    ...(bundle.dualLayerGrids ? [bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1] : []),
  ];

  const found: GridPos[] = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (!grids.some((g) => g[row]?.[col] === EXIT_DOOR_ATTR)) continue;
      // Keep only the first tile of each cluster — the rest are the same door.
      if (found.some((p) => Math.abs(p.row - row) <= NEAR && Math.abs(p.col - col) <= NEAR)) continue;
      found.push({ row, col });
    }
  }
  return found;
};

export { exitDoorTiles, EXIT_DOOR_ATTR };
