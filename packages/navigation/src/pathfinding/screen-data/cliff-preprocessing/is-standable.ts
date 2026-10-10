/* @layer shared-game @kind logic */
import type { TilePassability } from '@rotp/game-core';
import { inBounds } from '../../core/in-bounds';
import { cellAt } from '../../../checked-access';
import { LEDGE_TRIGGER_RANGE } from './cliff-preprocessing.constants';

const isStandable = (grid: TilePassability[][], rawAttr: number[][], r: number, c: number): boolean => {
  if (!inBounds(r, c)) return false;
  const t = cellAt(grid, r, c).type;
  if (t === 'free' || t === 'ledge') return true;
  const a = cellAt(rawAttr, r, c);
  return a >= LEDGE_TRIGGER_RANGE.first && a <= LEDGE_TRIGGER_RANGE.last;
};

export { isStandable };
