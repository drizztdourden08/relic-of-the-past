/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import { EXIT_RING, GRID, UNREACHED } from './exit-order.constants';

const distanceAt = (dist: Uint16Array, tile: GridPos): number => {
  let best = UNREACHED;
  for (let dr = -EXIT_RING; dr <= EXIT_RING; dr++) {
    for (let dc = -EXIT_RING; dc <= EXIT_RING; dc++) {
      const r = tile.row + dr;
      const c = tile.col + dc;
      if (r < 0 || r >= GRID || c < 0 || c >= GRID) continue;
      const d = dist[r * GRID + c];
      if (d < best) best = d;
    }
  }
  return best;
};

export { distanceAt };
