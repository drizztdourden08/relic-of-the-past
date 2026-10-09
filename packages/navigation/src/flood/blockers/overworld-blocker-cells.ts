/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import { wasmGetOverworldSpriteSpawns, wasmGetAreaHeads } from '@rotp/game-core';
import { resolveAreaSprite } from '../../simulator/overworld-area';
import { BLOCKER_SPRITES, UNCLE_SPRITE } from './blockers.constants';
import { uncleCollected } from './uncle-collected';
import { footprint } from './footprint';
import { liveBlockerCells } from './live-blocker-cells';

const overworldBlockerCells = (screenIndex: number): GridPos[] => {
  const skipUncle = uncleCollected();
  const heads = wasmGetAreaHeads();
  const cells: GridPos[] = [];
  for (const raw of wasmGetOverworldSpriteSpawns(screenIndex) ?? []) {
    if (!BLOCKER_SPRITES.has(raw.spriteType)) continue;
    if (raw.spriteType === UNCLE_SPRITE && skipUncle) continue;
    const resolved = heads
      ? resolveAreaSprite(screenIndex, { row: raw.row, col: raw.col }, heads)
      : { screenIndex, tile: { row: raw.row, col: raw.col } };
    if (resolved.screenIndex !== screenIndex) continue;
    cells.push(...footprint(resolved.tile.row, resolved.tile.col));
  }
  cells.push(...liveBlockerCells(screenIndex, skipUncle));
  return cells;
};

export { overworldBlockerCells };
