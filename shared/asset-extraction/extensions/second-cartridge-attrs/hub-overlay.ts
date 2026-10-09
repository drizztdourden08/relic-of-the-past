/* @layer shared-asset-extraction @kind logic */
import type { AttrOverlayCell } from './second-cartridge-attrs.type';
import { ATTR_GRID_COLS, WALL } from './second-cartridge-attrs.constants';

const hubOverlay = (): AttrOverlayCell[] => {
  const cells: AttrOverlayCell[] = [];
  for (let row = 4; row <= 6; row++) {
    for (let col = 30; col <= 33; col++) cells.push({ layer: 0, cell: row * ATTR_GRID_COLS + col, attr: WALL });
  }
  return cells;
};

export { hubOverlay };
