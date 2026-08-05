/* @layer bridge-wasm @kind logic */
/**
 * Where a crossing PUTS the player — the two "and then you are standing here"
 * answers `propagateArea` needs to seed the screen on the far side of a
 * crossing. Split out of flood-area.ts so the propagation loop itself stays
 * readable; both are pure lookups with no flood state of their own.
 */
import type { GridPos } from '@shared/game/navigation';
import { wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundariesFor } from '../';

type EdgeName = 'north' | 'south' | 'east' | 'west';

/**
 * The DESTINATION room's own stair/walk-boundary record leading back to
 * `fromRoom` — where Link actually lands after crossing. Mirrors
 * apps/web/src/lib/game/simulator/room-exits.ts's stairLandingTile; kept as a
 * separate copy rather than imported since that file depends on the flood
 * (via floodRoomRun) and importing it back would make the dependency circular.
 */
const roomLandingTile = (destRoom: number, fromRoom: number): GridPos | undefined => {
  const back = wasmGetRoomStairInfoFor(destRoom).find((s) => s.destRoom === fromRoom)
    ?? wasmGetRoomWalkBoundariesFor(destRoom).find((b) => b.destRoom === fromRoom);
  return back ? { row: back.row, col: back.col } : undefined;
};

/** Where a border crossing puts the player: the adjacent screen, against its
 *  opposite wall at the same position along the edge. */
const crossingLanding = (
  screenIndex: number,
  edge: EdgeName,
  at: { row: number; col: number },
): { screenIndex: number; tile: GridPos } | null => {
  const sRow = (screenIndex >> 3) & 7;
  const sCol = screenIndex & 7;
  switch (edge) {
    case 'north': return sRow > 0 ? { screenIndex: ((sRow - 1) << 3) | sCol, tile: { row: 63, col: at.col } } : null;
    case 'south': return sRow < 7 ? { screenIndex: ((sRow + 1) << 3) | sCol, tile: { row: 0, col: at.col } } : null;
    case 'west': return sCol > 0 ? { screenIndex: (sRow << 3) | (sCol - 1), tile: { row: at.row, col: 63 } } : null;
    case 'east': return sCol < 7 ? { screenIndex: (sRow << 3) | (sCol + 1), tile: { row: at.row, col: 0 } } : null;
  }
};

export { roomLandingTile, crossingLanding };
export type { EdgeName };
