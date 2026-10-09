/* @layer shared-game @kind logic */
import type { TilePassability } from '@rotp/game-core';
import { bodyTiles } from './body-tiles';

const isBodyPassable = (r: number, c: number, grid: TilePassability[][], inventory: Set<string>): boolean => {
  for (const [tr, tc] of bodyTiles(r, c)) {
    const t = grid[tr][tc];
    if (t.type === 'blocked') return false;
    if (t.type === 'obstacle' && !inventory.has(t.req)) return false;
    if (t.type === 'water' && !inventory.has('flippers')) return false;
  }
  return true;
};

export { isBodyPassable };
