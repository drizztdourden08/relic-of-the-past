/* @layer bridge-wasm @kind logic */
import { GRID_SIZE } from '@shared/game/navigation/types';

const toGrid64 = (flat: Uint8Array): number[][] => {
  const grid: number[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = new Array<number>(GRID_SIZE);
    for (let c = 0; c < GRID_SIZE; c++) row[c] = flat[r * GRID_SIZE + c];
    grid.push(row);
  }
  return grid;
};

export { toGrid64 };
