/* @layer renderer-widgets @kind logic */
import type { ScreenBundleGrid } from '@rotp/game-data';
import { AVAIL, EDGE_PAD, GAP } from '../sub-components/OverworldMinimap.constants';
import type { OverworldGrid } from '../sub-components/OverworldMinimap.type';

const overworldGridOf = (bundle: ScreenBundleGrid): OverworldGrid => {
  const { cols, rows } = bundle;
  const cellW = Math.floor((AVAIL - EDGE_PAD * 2 - (cols - 1) * GAP) / cols);
  const gridW = cols * cellW + (cols - 1) * GAP;
  const gridH = rows * cellW + (rows - 1) * GAP;

  return { cols, rows, cellW, cellH: cellW, gridW, gridH, totalW: gridW + EDGE_PAD * 2, totalH: gridH + EDGE_PAD * 2 };
};

export { overworldGridOf };
