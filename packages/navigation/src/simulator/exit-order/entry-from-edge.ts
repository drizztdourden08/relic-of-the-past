/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { EdgeName } from './exit-order.type';
import { alongEdge } from './along-edge';

const entryFromEdge = (edge: EdgeName, pos: number): GridPos =>
  alongEdge(edge, pos, { north: 63, south: 0, west: 63, east: 0 });

export { entryFromEdge };
