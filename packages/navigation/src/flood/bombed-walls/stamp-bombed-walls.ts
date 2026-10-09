/* @layer bridge-wasm @kind logic */
import { FLOOR_ATTR } from './bombed-walls.constants';
import { bombedWallsRegistry } from './bombed-walls-registry';
import { carve } from './carve';
import { cellKey } from './cell-key';

const stampBombedWalls = (roomId: number, grids: number[][][]): void => {
  const { seeds, opened } = bombedWallsRegistry;
  const blasts = seeds.get(roomId);
  if (!blasts || grids.length === 0) return;
  const set = opened.get(roomId) ?? new Set<string>();
  for (const tile of blasts) {
    for (const grid of grids) {
      for (const cell of carve(grid, tile)) {
        grid[cell.row][cell.col] = FLOOR_ATTR;
        set.add(cellKey(cell.row, cell.col));
      }
    }
  }
  opened.set(roomId, set);
};

export { stampBombedWalls };
