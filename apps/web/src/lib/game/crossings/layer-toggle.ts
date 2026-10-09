/* @layer bridge-wasm @kind logic */
import { EDGE_THRESHOLD, GRID_MAX, POSITION_SPREAD } from './layer-toggle.constants';
import type { EdgeSide, TogglePosition } from './layer-toggle.type';

const nearEdge = (side: EdgeSide, toggle: TogglePosition): boolean => {
  switch (side) {
    case 'north': return toggle.row <= EDGE_THRESHOLD;
    case 'south': return toggle.row >= GRID_MAX - EDGE_THRESHOLD;
    case 'west': return toggle.col <= EDGE_THRESHOLD;
    case 'east': return toggle.col >= GRID_MAX - EDGE_THRESHOLD;
  }
};

const alongWall = (side: EdgeSide, toggle: TogglePosition): number =>
  side === 'north' || side === 'south' ? toggle.col : toggle.row;

const togglesLayer = (
  side: EdgeSide,
  positions: readonly number[],
  toggles: readonly TogglePosition[],
): boolean =>
  toggles.some((toggle) => nearEdge(side, toggle)
    && positions.some((pos) => Math.abs(pos - alongWall(side, toggle)) <= POSITION_SPREAD));

export { togglesLayer };
export type { TogglePosition } from './layer-toggle.type';
