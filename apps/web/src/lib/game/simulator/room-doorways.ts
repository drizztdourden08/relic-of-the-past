/* @layer bridge-wasm @kind logic */
/**
 * Geometry tests for a doorway through a room's OUTER wall, shared by every
 * detector that has to decide whether a door-table record is a real way through.
 *
 * A candidate is validated against the DESTINATION room's own grids: exit doors
 * back to the overworld share the same door-table encoding, so blindly mirroring
 * one into the neighbouring room id fabricates a connection into solid wall (e.g.
 * the castle's front entrance doors "leading" into the basement jail rooms below).
 */
import { wasmGetEntranceRooms, wasmGetExitScreenMap } from '../';
import { getScreenGrids } from '../flood';
import { usesCachedEntrance } from './screen-resolve';

/** Rooms the game can leave straight to the overworld — see room-exits.ts. */
const isStandalone = (roomId: number): boolean =>
  usesCachedEntrance(roomId) || wasmGetExitScreenMap().has(roomId);
import type { EdgeName } from './exit-order';

const ROOM_EDGE_ADJ: Record<EdgeName, (r: number) => number | null> = {
  north: (r) => (Math.floor(r / 16) > 0 ? r - 16 : null),
  south: (r) => (Math.floor(r / 16) < 19 ? r + 16 : null),
  west: (r) => (r % 16 > 0 ? r - 1 : null),
  east: (r) => (r % 16 < 15 ? r + 1 : null),
};

const OPPOSITE: Record<EdgeName, EdgeName> = { north: 'south', south: 'north', west: 'east', east: 'west' };

/**
 * Rooms an overworld entrance points at — the MOUTH of a standalone place.
 *
 * Two mouths never scroll into one another: each is the way into a different
 * cave, house or dungeon. `ROOM_EDGE_ADJ` proposes roomId±1/±16 as a neighbour
 * regardless, which is how room 0x10a "scrolled north" into 0xfa and the run
 * walked from the desert to the mountain summit through two unrelated caves.
 * A mouth scrolling INWARD is still fine — that is exactly what a dungeon's
 * entrance hall does — so only a mouth-to-mouth crossing is rejected.
 */
let entranceRoomMemo: Set<number> | null = null;

const entranceRoomSet = (): Set<number> => {
  if (entranceRoomMemo) return entranceRoomMemo;
  const rooms = wasmGetEntranceRooms();
  const set = new Set<number>();
  for (let id = 0; id < (rooms?.length ?? 0); id++) {
    const room = rooms?.[id];
    if (room != null) set.add(room);
  }
  // Only memoize once the table has actually loaded.
  if (set.size > 0) entranceRoomMemo = set;
  return set;
};

const bothAreEntranceRooms = (a: number, b: number): boolean => {
  const set = entranceRoomSet();
  return set.has(a) && set.has(b);
};

/** Door trigger tiles sit a few tiles INSIDE the wall (a south door's record is
 *  ~row 55, a north one ~row 4); mid-grid records (e.g. row 36 = the lower
 *  page's top) are internal quadrant doors, not ways out of the room. */
const outerWall = (edge: EdgeName, row: number, col: number): boolean =>
  (edge === 'north' && row < 8) || (edge === 'south' && row >= 52) ||
  (edge === 'west' && col < 8) || (edge === 'east' && col >= 52);

/** Wall-strip attrs that mean "crossing here never scrolls to the adjacent
 *  room": 0x8E = exit-door trigger (walks OUT of the dungeon), 0xF0-0xF7 =
 *  flag-gated door (solid until its story flag — the sanctuary's escape door). */
const blockedTriggerAttr = (a: number): boolean => a === 0x8e || (a >= 0xf0 && a <= 0xf7);

/** True when the wall strip at `pos` (±1 tile — notches are 2 wide) carries an
 *  exit-door or flag-gated trigger on any layer. */
const exitDoorAt = (roomId: number, edge: EdgeName, pos: number): boolean => {
  const bundle = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
  const grids = [bundle.rawAttrGrid, ...(bundle.dualLayerGrids ? [bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1] : [])];
  for (let depth = 0; depth <= 14; depth++) {
    for (let dpos = -1; dpos <= 2; dpos++) {
      const p = pos + dpos;
      if (p < 0 || p >= 64) continue;
      const r = edge === 'north' ? depth : edge === 'south' ? 63 - depth : p;
      const c = edge === 'west' ? depth : edge === 'east' ? 63 - depth : p;
      if (grids.some((g) => blockedTriggerAttr(g[r]?.[c] ?? 0))) return true;
    }
  }
  return false;
};

/** True when the DESTINATION room has walkable floor (or door passage) behind
 *  this doorway, on any of its layers — the game-derived reality check that
 *  kills fabricated connections. */
const doorwayLandingOpen = (adjRoomId: number, edge: EdgeName, pos: number): boolean => {
  const bundle = getScreenGrids({ isIndoors: true, roomId: adjRoomId, owScreenIndex: 0 });
  const grids = [bundle.rawAttrGrid, ...(bundle.dualLayerGrids ? [bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1] : [])];
  const passable = (a: number): boolean => a === 0x00 || (a >= 0x80 && a <= 0x8d) || (a >= 0x90 && a <= 0xaf);
  // A real doorway lines up with its opening. The old 14-deep x 9-wide window
  // accepted any room with floor loosely near that wall, which is how unrelated
  // caves at consecutive room indices "scrolled" into one another.
  for (let depth = 0; depth <= 3; depth++) {
    for (let dpos = -1; dpos <= 1; dpos++) {
      const p = pos + dpos;
      if (p < 0 || p >= 64) continue;
      // Landing on the destination side is against its OPPOSITE wall.
      const r = edge === 'north' ? 63 - depth : edge === 'south' ? depth : p;
      const c = edge === 'west' ? 63 - depth : edge === 'east' ? depth : p;
      if (grids.some((g) => passable(g[r]?.[c] ?? 1))) return true;
    }
  }
  return false;
};

export { doorwayLandingOpen, exitDoorAt, bothAreEntranceRooms, outerWall, OPPOSITE, ROOM_EDGE_ADJ };
