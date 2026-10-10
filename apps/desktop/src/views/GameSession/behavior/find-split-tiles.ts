/* @layer renderer-appshell @kind logic */
import type { DualLayerGrids, SplitTile } from './dump-layers.type';
import { GRID_DIM } from './dump-layers.constants';

const cellOf = (grid: number[][], row: number, col: number): number => {
  const cell = grid[row]?.[col];
  if (cell === undefined) throw new Error(`layer grid has no cell at row ${row}, column ${col}`);
  return cell;
};

const findSplitTiles = (grids: DualLayerGrids): SplitTile[] => {
  const splits: SplitTile[] = [];
  for (let r = 0; r < GRID_DIM; r++) {
    for (let c = 0; c < GRID_DIM; c++) {
      const layer0 = cellOf(grids.layer0, r, c);
      const layer1 = cellOf(grids.layer1, r, c);
      if (layer0 !== layer1) splits.push({ col: c, row: r, layer0, layer1 });
    }
  }
  return splits;
};

export { findSplitTiles };
