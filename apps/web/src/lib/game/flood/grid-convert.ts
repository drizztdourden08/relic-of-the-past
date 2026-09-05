/* @layer bridge-wasm @kind logic */
/**
 * The one flat-buffer → 64×64 grid converter. The WASM attr-table exports hand
 * back a flat Uint8Array; every consumer needs it as `number[][]`, and five
 * separate copies of this loop had drifted apart (one sliced, one indexed, one
 * pre-allocated). Import this instead of writing a sixth.
 */
import { GRID_SIZE } from '@shared/game/navigation/types';

/** Row-major flat buffer (GRID_SIZE²) → GRID_SIZE×GRID_SIZE grid. */
const toGrid64 = (flat: Uint8Array): number[][] => {
  const grid: number[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = new Array<number>(GRID_SIZE);
    for (let c = 0; c < GRID_SIZE; c++) row[c] = flat[r * GRID_SIZE + c];
    grid.push(row);
  }
  return grid;
};

/** An all-zero grid. Used as the fallback when an attr table can't be built. */
const emptyGrid64 = (): number[][] =>
  Array.from({ length: GRID_SIZE }, () => new Array<number>(GRID_SIZE).fill(0));

export { emptyGrid64, toGrid64 };
