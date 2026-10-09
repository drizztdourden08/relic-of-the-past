/* @layer shared-game @kind logic */
import type { TilePassability } from '@rotp/game-core';
import { evaluateEntry } from './evaluate-entry';

const enterTiles = (tiles: [number, number][], grid: TilePassability[][], dr: number, dc: number, requirements: Set<string>, inventory: Set<string>): Set<string> | null => {
  let newReqs = requirements;
  for (const [tr, tc] of tiles) {
    const entry = evaluateEntry(grid[tr][tc], dr, dc, requirements, inventory);
    if (!entry.canEnter) return null;
    if (entry.newReqs !== newReqs) {
      newReqs = newReqs === requirements ? new Set(entry.newReqs) : newReqs;
      for (const req of entry.newReqs) newReqs.add(req);
    }
  }
  return newReqs;
};

export { enterTiles };
