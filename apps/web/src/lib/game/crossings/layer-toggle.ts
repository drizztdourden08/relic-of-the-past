/* @layer bridge-wasm @kind logic */
import type { ConnectionInfo } from '@shared/game/navigation';

type EdgeSide = ConnectionInfo['edge'];

/** A tile whose door record is kDoorType_PlayerBgChange, in room grid coordinates. */
interface TogglePosition {
  row: number;
  col: number;
}

/** How close to a wall a toggle tile must sit to belong to that wall's scrolls. */
const EDGE_THRESHOLD = 8;
/** How far along the wall a toggle tile may drift from the run it belongs to. */
const POSITION_SPREAD = 3;
const GRID_MAX = 63;

const nearEdge = (side: EdgeSide, toggle: TogglePosition): boolean => {
  switch (side) {
    case 'north': return toggle.row <= EDGE_THRESHOLD;
    case 'south': return toggle.row >= GRID_MAX - EDGE_THRESHOLD;
    case 'west': return toggle.col <= EDGE_THRESHOLD;
    case 'east': return toggle.col >= GRID_MAX - EDGE_THRESHOLD;
  }
};

/** The coordinate a boundary run is measured along: columns north/south, rows east/west. */
const alongWall = (side: EdgeSide, toggle: TogglePosition): number =>
  side === 'north' || side === 'south' ? toggle.col : toggle.row;

/**
 * Whether crossing this boundary flips the floor the player stands on.
 *
 * The toggle table holds the tiles a room loads for door type 22
 * (kDoorType_PlayerBgChange), which flip `link_is_on_lower_level` when walked
 * over. One counts for a boundary when it sits against that wall AND lands on
 * the run of tiles the boundary occupies.
 */
const togglesLayer = (
  side: EdgeSide,
  positions: readonly number[],
  toggles: readonly TogglePosition[],
): boolean =>
  toggles.some((toggle) => nearEdge(side, toggle)
    && positions.some((pos) => Math.abs(pos - alongWall(side, toggle)) <= POSITION_SPREAD));

export { togglesLayer };
export type { TogglePosition };
