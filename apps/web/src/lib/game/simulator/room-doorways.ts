/* @layer bridge-wasm @kind logic */
/**
 * Doorway-object exit detection through a room's OUTER walls. Door records are
 * scanned in BOTH this room's and each neighbour's door tables (a doorway's
 * object may live on either side), and every candidate is validated against the
 * DESTINATION room's own grids: exit doors back to the overworld share the same
 * door-table encoding, so blindly mirroring one into the neighbouring room id
 * fabricates a connection into solid wall (e.g. the castle's front entrance
 * doors "leading" into the basement jail rooms below).
 */
import type { GridPos } from '@shared/game/navigation';
import type { SimExit } from '@shared/game/simulation';
import type { ScreenDefinition } from '@shared/game/types';
import { SCREEN_BY_ID } from '@shared/game/data/screens';
import { wasmGetRoomDoorInfo, wasmGetRoomTravelDestinationsFor } from '../';
import { getScreenGrids } from '../flood';
import { interiorScreenId } from './screen-resolve';
import { doorwayDistance, entryFromEdge, exitFromEdge } from './exit-order';
import type { EdgeName } from './exit-order';

const ROOM_EDGE_ADJ: Record<EdgeName, (r: number) => number | null> = {
  north: (r) => (Math.floor(r / 16) > 0 ? r - 16 : null),
  south: (r) => (Math.floor(r / 16) < 19 ? r + 16 : null),
  west: (r) => (r % 16 > 0 ? r - 1 : null),
  east: (r) => (r % 16 < 15 ? r + 1 : null),
};

const OPPOSITE: Record<EdgeName, EdgeName> = { north: 'south', south: 'north', west: 'east', east: 'west' };

/** A room-to-room destination is plausible only when the dataset knows it AND it
 *  lives in the same world as the source — a "neighbor" resolving to nothing or
 *  the other world is a room-index artefact (e.g. the player's house door tiles read
 *  as a south border into "room 0x114" = the DARK-world bumper cave). */
const plausibleRoomNeighbor = (id: string, src?: ScreenDefinition): boolean => {
  if (id.startsWith('room:')) return false;
  const world = SCREEN_BY_ID.get(id)?.world;
  return src == null || world === src.world;
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
  for (let depth = 0; depth <= 14; depth++) {
    for (let dpos = -4; dpos <= 4; dpos++) {
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

interface DoorwayScanArgs {
  roomId: number;
  src?: ScreenDefinition;
  /** Walk-step distances over the source room's flood (see stepDistances). */
  dist: Uint16Array;
  push: (exit: SimExit, score: number) => void;
  /** True when this wall spot is an exit-door transition (leads OUTSIDE). */
  isExitSpot: (edge: EdgeName, pos: number) => boolean;
}

/** kDoorType_WarpRoomDoor: crossing it TELEPORTS to the room header's travel
 *  destination — west door → dests[3], east door → dests[4] (the castle's dark
 *  North Corridor warps; Dungeon_StartInterRoomTrans_Left, dungeon.c:2067).
 *  Never an edge-adjacent doorway. */
const WARP_DOOR = 0x46;

/** Scan door tables for passable outer-wall doorways; returns how many exits
 *  were pushed. Passable now = plain door, or a locked kind already opened. */
const collectDoorwayExits = ({ roomId, src, dist, push, isExitSpot }: DoorwayScanArgs): number => {
  const doorTargets = new Set<string>();
  let count = 0;
  const warp = (door: { direction: EdgeName; row: number; col: number }): void => {
    if (door.direction !== 'west' && door.direction !== 'east') return;
    const steps = doorwayDistance(dist, door.direction, door.row);
    if (steps >= 0xffff) return; // this side not reachable
    const dests = wasmGetRoomTravelDestinationsFor(roomId) ?? [];
    const destRoom = door.direction === 'west' ? dests[3] : dests[4];
    if (!destRoom) return;
    const to = interiorScreenId(destRoom, src);
    if (!plausibleRoomNeighbor(to, src)) return;
    if (doorTargets.has(`warp:${to}`)) return;
    doorTargets.add(`warp:${to}`);
    // Land at the destination's reciprocal warp door (its own dests point back).
    const back = wasmGetRoomDoorInfo(destRoom).find((d) => d.nativeType === WARP_DOOR && d.direction === OPPOSITE[door.direction]);
    count += 1;
    push({ to, entryTile: back ? { row: back.row, col: back.col } : undefined, fromTile: { row: door.row, col: door.col }, twoWay: true }, steps);
  };
  const doorway = (edge: EdgeName, pos: number, fromTile: GridPos): void => {
    const steps = doorwayDistance(dist, edge, pos);
    if (steps >= 0xffff) return; // this side not reachable
    const adj = ROOM_EDGE_ADJ[edge](roomId);
    if (adj === null) return;
    const to = interiorScreenId(adj, src);
    if (!plausibleRoomNeighbor(to, src)) return;
    if (doorTargets.has(`${edge}:${to}`)) return; // duplicate door records
    if (isExitSpot(edge, pos)) return; // this IS the exit door back outside
    if (!doorwayLandingOpen(adj, edge, pos)) return; // no floor behind — not a real doorway
    doorTargets.add(`${edge}:${to}`);
    count += 1;
    push({ to, entryTile: entryFromEdge(edge, pos), fromTile, twoWay: true }, steps);
  };
  for (const door of wasmGetRoomDoorInfo(roomId)) {
    if (door.nativeType === WARP_DOOR) { warp(door); continue; }
    if (!(door.kind === 0 || door.isOpen)) continue;
    if (!outerWall(door.direction, door.row, door.col)) continue; // internal quadrant doors
    doorway(door.direction, door.direction === 'north' || door.direction === 'south' ? door.col : door.row, { row: door.row, col: door.col });
  }
  for (const edge of ['north', 'south', 'west', 'east'] as const) {
    const adj = ROOM_EDGE_ADJ[edge](roomId);
    if (adj === null) continue;
    for (const door of wasmGetRoomDoorInfo(adj)) {
      if (door.nativeType === WARP_DOOR) continue; // teleports, never edge-adjacent
      if (!(door.kind === 0 || door.isOpen)) continue;
      if (door.direction !== OPPOSITE[edge]) continue;
      if (!outerWall(door.direction, door.row, door.col)) continue;
      // Mirror the neighbour's door onto THIS room's matching wall.
      const pos = edge === 'north' || edge === 'south' ? door.col : door.row;
      doorway(edge, pos, exitFromEdge(edge, pos));
    }
  }
  return count;
};

export { collectDoorwayExits, doorwayLandingOpen, exitDoorAt, plausibleRoomNeighbor, outerWall, OPPOSITE, ROOM_EDGE_ADJ };
