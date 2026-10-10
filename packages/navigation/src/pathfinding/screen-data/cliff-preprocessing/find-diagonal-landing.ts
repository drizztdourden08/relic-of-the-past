/* @layer shared-game @kind logic */
import type { GridPos, TilePassability } from '@rotp/game-core';
import { inBounds } from '../../core/in-bounds';
import { isLandable } from './is-landable';
import { HOP_DY_PX, MAX_HOP_STEPS, NEED_EAST, NEED_WEST, SAMPLE_DX, SAMPLE_DY, TILE_PX } from './cliff-preprocessing.constants';

const findDiagonalLanding = (grid: TilePassability[][], start: GridPos, slope: readonly [dv: -1 | 1, dh: -1 | 1]): GridPos | null => {
  const { row, col } = start;
  const [dv, dh] = slope;
  const need = dh < 0 ? NEED_WEST : NEED_EAST;
  let x = col * TILE_PX;
  let y = row * TILE_PX;
  for (let step = 0; step < MAX_HOP_STEPS; step++) {
    x += dh * TILE_PX;
    y += dv * HOP_DY_PX;
    const sr = (y + SAMPLE_DY) >> 3;
    if (!inBounds(sr, x >> 3)) return null;
    let got = 0;
    SAMPLE_DX.forEach((dx, i) => { if (isLandable(grid, sr, (x + dx) >> 3)) got |= 1 << i; });
    const arrived = (got & need) === need;
    if (arrived) return step === 0 ? null : { row: sr, col: x >> 3 };
  }
  return null;
};

export { findDiagonalLanding };
