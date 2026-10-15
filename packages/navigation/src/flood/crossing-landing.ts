/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { EdgeName } from './crossing-landing.type';

const crossingLanding = (
  screenIndex: number,
  edge: EdgeName,
  at: { row: number; col: number },
): { screenIndex: number; tile: GridPos } | null => {
  const sRow = (screenIndex >> 3) & 7;
  const sCol = screenIndex & 7;
  switch (edge) {
    case 'north': return sRow > 0 ? { screenIndex: ((sRow - 1) << 3) | sCol, tile: { row: 63, col: at.col } } : null;
    case 'south': return sRow < 7 ? { screenIndex: ((sRow + 1) << 3) | sCol, tile: { row: 0, col: at.col } } : null;
    case 'west': return sCol > 0 ? { screenIndex: (sRow << 3) | (sCol - 1), tile: { row: at.row, col: 63 } } : null;
    case 'east': return sCol < 7 ? { screenIndex: (sRow << 3) | (sCol + 1), tile: { row: at.row, col: 0 } } : null;
  }
};

export { crossingLanding };
