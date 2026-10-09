/* @layer shared-game @kind logic */
import type { BorderEdge } from '../types';

const getAdjacentScreen = (screenIdx: number, edge: BorderEdge): number | null => {
  const col = screenIdx & 7;
  const row = (screenIdx >> 3) & 7;
  const world = screenIdx & 0x40;
  switch (edge) {
    case 'north': return row > 0 ? world | ((row - 1) << 3) | col : null;
    case 'south': return row < 7 ? world | ((row + 1) << 3) | col : null;
    case 'west': return col > 0 ? world | (row << 3) | (col - 1) : null;
    case 'east': return col < 7 ? world | (row << 3) | (col + 1) : null;
  }
};

export { getAdjacentScreen };
