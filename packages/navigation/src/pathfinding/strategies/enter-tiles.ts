/* @layer shared-game @kind logic */
import type { TilePassability } from '@rotp/game-core';
import type { EntryContext } from './layer-strategy';
import { cellAt } from '../../checked-access';
import { evaluateEntry } from './evaluate-entry';

const enterTiles = (tiles: [number, number][], grid: TilePassability[][], entry: EntryContext): Set<string> | null => {
  const { requirements } = entry;
  let newReqs = requirements;
  for (const [tr, tc] of tiles) {
    const result = evaluateEntry(cellAt(grid, tr, tc), entry);
    if (!result.canEnter) return null;
    if (result.newReqs !== newReqs) {
      newReqs = newReqs === requirements ? new Set(result.newReqs) : newReqs;
      for (const req of result.newReqs) newReqs.add(req);
    }
  }
  return newReqs;
};

export { enterTiles };
