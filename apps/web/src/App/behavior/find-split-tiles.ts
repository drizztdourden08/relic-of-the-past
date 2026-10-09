/* @layer renderer-appshell @kind logic */
import type { DualLayerGrids, SplitTile } from './dump-layers.type';
import { GRID_DIM } from './dump-layers.constants';

const findSplitTiles = (grids: DualLayerGrids): SplitTile[] => {
  const splits: SplitTile[] = [];
  for (let r = 0; r < GRID_DIM; r++) {
    for (let c = 0; c < GRID_DIM; c++) {
      if (grids.layer0[r][c] !== grids.layer1[r][c]) {
        splits.push({ col: c, row: r, layer0: grids.layer0[r][c], layer1: grids.layer1[r][c] });
      }
    }
  }
  return splits;
};

export { findSplitTiles };
