/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { EdgeName } from './exit-order.type';

const alongEdge = (edge: EdgeName, pos: number, lineOf: Readonly<Record<EdgeName, number>>): GridPos =>
  edge === 'north' || edge === 'south' ? { row: lineOf[edge], col: pos } : { row: pos, col: lineOf[edge] };

export { alongEdge };
