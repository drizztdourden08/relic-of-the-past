/* @layer shared-asset-extraction @kind logic */
import type { AttrOverlayCell } from './second-cartridge-attrs.type';
import { ATTR_GRID_COLS, DOORWAY_STRIPE, WALL } from './second-cartridge-attrs.constants';

const entranceChamberOverlay = (): AttrOverlayCell[] => {
  const cells: AttrOverlayCell[] = [];
  for (let row = 4; row <= 61; row++) {
    cells.push({ layer: 0, cell: row * ATTR_GRID_COLS + 19, attr: WALL });
    cells.push({ layer: 0, cell: row * ATTR_GRID_COLS + 44, attr: WALL });
  }
  for (let row = 59; row <= 63; row++) {
    cells.push({ layer: 0, cell: row * ATTR_GRID_COLS + 31, attr: DOORWAY_STRIPE });
    cells.push({ layer: 0, cell: row * ATTR_GRID_COLS + 32, attr: DOORWAY_STRIPE });
  }
  return cells;
};

export { entranceChamberOverlay };
