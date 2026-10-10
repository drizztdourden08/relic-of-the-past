/* @layer bridge-wasm @kind logic */
import type { EdgeName } from '../exit-order';
import { alongEdge } from '../exit-order';
import { GRID, LANDING_SCAN_DEPTH } from './room-doorways.constants';
import { roomLayerGrids } from './room-layer-grids';

const passable = (a: number): boolean => a === 0x00 || (a >= 0x80 && a <= 0x8d) || (a >= 0x90 && a <= 0xaf);

const doorwayLandingOpen = (adjRoomId: number, edge: EdgeName, pos: number): boolean => {
  const grids = roomLayerGrids(adjRoomId);
  for (let depth = 0; depth <= LANDING_SCAN_DEPTH; depth++) {
    for (let dpos = -1; dpos <= 1; dpos++) {
      const p = pos + dpos;
      if (p < 0 || p >= GRID) continue;
      const { row: r, col: c } = alongEdge(edge, p, { north: 63 - depth, south: depth, west: 63 - depth, east: depth });
      if (grids.some((g) => passable(g[r]?.[c] ?? 1))) return true;
    }
  }
  return false;
};

export { doorwayLandingOpen };
