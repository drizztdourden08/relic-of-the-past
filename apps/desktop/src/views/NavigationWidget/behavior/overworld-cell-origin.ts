/* @layer renderer-widgets @kind logic */
import { EDGE_PAD, GAP } from '../sub-components/OverworldMinimap.constants';
import type { CellOrigin, OverworldGrid } from '../sub-components/OverworldMinimap.type';

const overworldCellOrigin = (grid: OverworldGrid, slot: number): CellOrigin => ({
  left: EDGE_PAD + (slot % grid.cols) * (grid.cellW + GAP),
  top: EDGE_PAD + Math.floor(slot / grid.cols) * (grid.cellH + GAP),
});

export { overworldCellOrigin };
