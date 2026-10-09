/* @layer bridge-wasm @kind logic */
import { GRID_SIZE } from '@shared/game/navigation/types/grid.constants';

const emptyGrid64 = (): number[][] =>
  Array.from({ length: GRID_SIZE }, () => new Array<number>(GRID_SIZE).fill(0));

export { emptyGrid64 };
