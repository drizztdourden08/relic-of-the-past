/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { EdgeName } from './exit-order.type';

const entryFromEdge = (edge: EdgeName, pos: number): GridPos =>
  edge === 'north' ? { row: 63, col: pos }
  : edge === 'south' ? { row: 0, col: pos }
  : edge === 'west' ? { row: pos, col: 63 }
  : { row: pos, col: 0 };

export { entryFromEdge };
