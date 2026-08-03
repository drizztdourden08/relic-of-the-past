/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { processStraightCliffs } from '../../../shared/game/navigation/screen-data/cliff-preprocessing';
import type { TilePassability, LedgeTraversal } from '../../../shared/game/navigation/types';
import { GRID_SIZE } from '../../../shared/game/navigation/types';

// Regression for room 0x71 (Lobby): lone 0x28 triggers flanking a staircase produced
// 1-wide up-arrows Link's 2x2 body can never use. Indoors, a trigger is only a real
// jump when a perpendicular neighbor trigger infers the SAME direction.

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

describe('processStraightCliffs (indoor) — 2-wide same-direction rule', () => {
  it('drops a lone trigger beside a staircase whose neighbor infers the opposite direction', () => {
    const rawAttr = emptyAttr();
    // Lobby pattern around the stairs: row 22 triggers at cols 12-13; col 12 is walled
    // 3-deep on both sides (ambiguous → 's' fallback), col 13 has wall north only ('n').
    rawAttr[22][12] = 0x28;
    rawAttr[22][13] = 0x28;
    for (const r of [19, 20, 21]) { rawAttr[r][12] = 0x04; rawAttr[r][13] = 0x04; }
    for (const r of [23, 24, 25]) rawAttr[r][12] = 0x04; // south walls under col 12 only
    rawAttr[22][14] = 0x02; // stair-side wall

    const { grid, ledges } = run(rawAttr);

    // col 13 ('n') has no same-direction perpendicular neighbor → no ledge, no arrow.
    expect(grid[22][13].type).not.toBe('ledge');
    expect(ledges.some(l => l.startRow === 22 && l.startCol === 13)).toBe(false);
  });

  it('keeps a wide same-direction fan (room 0x72 north jump)', () => {
    const rawAttr = emptyAttr();
    // Trigger row 53 cols 6-9, wall band rows 51-52 above, open floor elsewhere.
    for (let c = 6; c <= 9; c++) {
      rawAttr[53][c] = 0x28;
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
