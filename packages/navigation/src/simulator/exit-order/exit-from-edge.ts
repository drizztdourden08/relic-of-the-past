/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { EdgeName } from './exit-order.type';
import { alongEdge } from './along-edge';

const exitFromEdge = (edge: EdgeName, pos: number): GridPos =>
  alongEdge(edge, pos, { north: 0, south: 63, west: 0, east: 63 });

export { exitFromEdge };
