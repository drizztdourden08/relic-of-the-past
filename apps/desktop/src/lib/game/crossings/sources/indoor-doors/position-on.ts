/* @layer bridge-wasm @kind logic */
import type { EdgeName } from '../../../simulator/exit-order';

const positionOn = (edge: EdgeName, door: { row: number; col: number }): number =>
  edge === 'north' || edge === 'south' ? door.col : door.row;

export { positionOn };
