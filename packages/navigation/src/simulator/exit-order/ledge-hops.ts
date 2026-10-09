/* @layer bridge-wasm @kind logic */
import type { LedgeTraversal } from '@rotp/game-core';
import { GRID } from './exit-order.constants';

const inGrid = (r: number, c: number): boolean => r >= 0 && r < GRID && c >= 0 && c < GRID;

const ledgeHops = (ledges: readonly LedgeTraversal[]): Map<number, number[]> => {
  const hops = new Map<number, number[]>();
  for (const l of ledges) {
    if (!inGrid(l.startRow, l.startCol) || !inGrid(l.endRow, l.endCol)) continue;
    const from = l.startRow * GRID + l.startCol;
    const to = l.endRow * GRID + l.endCol;
    const list = hops.get(from);
    if (list) list.push(to);
    else hops.set(from, [to]);
  }
  return hops;
};

export { ledgeHops };
