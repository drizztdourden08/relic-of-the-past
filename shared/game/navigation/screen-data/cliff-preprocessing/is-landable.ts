/* @layer shared-game @kind logic */
import type { TilePassability } from '@rotp/game-core';
import { inBounds } from '../../core/in-bounds';

const isLandable = (grid: TilePassability[][], r: number, c: number): boolean => {
  if (!inBounds(r, c)) return false;
  const t = grid[r][c].type;
  return t === 'free' || t === 'water';
};

export { isLandable };
