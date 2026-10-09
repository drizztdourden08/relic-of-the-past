/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import type { EdgeName } from './exit-order.type';

const exitFromEdge = (edge: EdgeName, pos: number): GridPos =>
  edge === 'north' ? { row: 0, col: pos }
  : edge === 'south' ? { row: 63, col: pos }
  : edge === 'west' ? { row: pos, col: 0 }
  : { row: pos, col: 63 };

export { exitFromEdge };
