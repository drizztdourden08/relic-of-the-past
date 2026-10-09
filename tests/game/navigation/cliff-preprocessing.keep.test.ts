/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { processStraightCliffs } from '../../../shared/game/navigation/screen-data/cliff-preprocessing';
import type { TilePassability, LedgeTraversal } from '@rotp/game-core';
import { GRID_SIZE } from '@shared/game/navigation/types/grid.constants';

const JUMP_TRIGGER = 0x28;

const emptyAttr = (): number[][] =>
  Array.from({ length: GRID_SIZE }, () => new Array<number>(GRID_SIZE).fill(0));

const freeGrid = (): TilePassability[][] =>
  Array.from({ length: GRID_SIZE }, () => new Array<TilePassability>(GRID_SIZE).fill({ type: 'free' }));

const run = (rawAttr: number[][]): { grid: TilePassability[][]; ledges: LedgeTraversal[] } => {
  const grid = freeGrid();
  const ledges: LedgeTraversal[] = [];
  processStraightCliffs(grid, rawAttr, ledges, true);
  return { grid, ledges };
};

describe('processStraightCliffs (indoor) and the 2-wide same-direction rule', () => {
  it('drops a lone trigger beside a staircase whose neighbor infers the opposite direction', () => {
    const rawAttr = emptyAttr();
    rawAttr[22][12] = JUMP_TRIGGER;
    rawAttr[22][13] = JUMP_TRIGGER;
    for (const r of [19, 20, 21]) { rawAttr[r][12] = 0x04; rawAttr[r][13] = 0x04; }
    for (const r of [23, 24, 25]) rawAttr[r][12] = 0x04;
    rawAttr[22][14] = 0x02;

    const { grid, ledges } = run(rawAttr);

    expect(grid[22][13].type).not.toBe('ledge');
    expect(ledges.some(l => l.startRow === 22 && l.startCol === 13)).toBe(false);
  });

  it('keeps a wide same-direction fan (room 0x72 north jump)', () => {
    const rawAttr = emptyAttr();
    for (let c = 6; c <= 9; c++) {
      rawAttr[53][c] = JUMP_TRIGGER;
      rawAttr[52][c] = 0x01;
      rawAttr[51][c] = 0x04;
    }

    const { grid, ledges } = run(rawAttr);

    for (let c = 6; c <= 9; c++) {
      expect(grid[53][c]).toEqual({ type: 'ledge', dir: 'n' });
      expect(ledges.some(l => l.startRow === 53 && l.startCol === c)).toBe(true);
    }
  });
});
