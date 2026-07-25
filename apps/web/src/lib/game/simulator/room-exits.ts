/* @layer bridge-wasm @kind logic */
/**
 * Indoor-room exit detection: flood the room, then turn everything the game
 * says leads out into traversal exits — exit doors back outside, inter-room
 * stairs and walk-through boundaries, border scrolls into adjacent rooms, and
 * doorway objects through the outer walls (room-doorways.ts).
 */
import type { GridPos } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { SimExit } from '@shared/game/simulation';
import type { ScreenDefinition } from '@shared/game/types';
import { enrichEntrances } from '@domains/widgets/navigation/widget-helpers';
import { wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundariesFor, wasmGetRoomDoorInfo, wasmReadFlagSnapshot } from '../';
import { summarizeRun, usableEntranceTransition } from './flood-screen';
import { floodRoomRun } from './flood-room';
import { owScreenId, interiorScreenId, screenAreaInfo } from './screen-resolve';
import { stepDistances, distanceAt, sortExitsByDistance, entryFromEdge, exitFromEdge, reachedGrid } from './exit-order';
import type { EdgeName } from './exit-order';
import { collectDoorwayExits, doorwayLandingOpen, exitDoorAt, plausibleRoomNeighbor, ROOM_EDGE_ADJ } from './room-doorways';
import type { DetectedScreen } from './screen-exits';

const dedupe = (exits: SimExit[]): SimExit[] => {
  const seen = new Set<string>();
  return exits.filter((e) => (seen.has(e.to) ? false : (seen.add(e.to), true)));
};

/** The DESTINATION room's stair/walk-boundary that leads back here = the
 *  landing tile the player appears on after taking this transition. */
const stairLandingTile = (destRoom: number, fromRoom: number): GridPos | undefined => {
  const back = wasmGetRoomStairInfoFor(destRoom).find((s) => s.destRoom === fromRoom)
    ?? wasmGetRoomWalkBoundariesFor(destRoom).find((b) => b.destRoom === fromRoom);
  return back ? { row: back.row, col: back.col } : undefined;
};

/** Flood an indoor room; exits = its doors back outside + stairs/boundaries. */
const detectRoom = (roomId: number, items: TileReq[], entryTile?: GridPos, src?: ScreenDefinition): DetectedScreen | null => {
  const run = floodRoomRun(roomId, items, entryTile);
  if (!run) return null;
  const owSide = enrichEntrances();
  const dist = stepDistances(run.result.reachable, run.result.startPos, run.result.ledges);
  const exits: SimExit[] = [];
  const scores: number[] = [];
  const pushExit = (exit: SimExit, score?: number): void => {
    exits.push(exit);
    scores.push(score ?? (exit.fromTile ? distanceAt(dist, exit.fromTile) : 0xffff));
  };
  // Distinct PHYSICAL exit doors (several entrance ids can share one door).
  const doorSpots = new Set<string>();
  // Exit-door trigger spots (attr 0x8E) — a border touch or door record there
  // means "walk OUT of the dungeon" (e.g. the castle's front doors sit right
  // above the basement jail rooms). Memoized per wall spot. The throne room's
  // push-wall (kDoorType_ThroneRoom, native 0x14) counts as blocked too until the
  // follower is in tow — its notch tiles flood, but the wall only opens for her.
  // …and warp-room doors (native 0x46) teleport rather than scroll, so their
  // wall spots are blocked for border/edge purposes too.
  const followerActive = (wasmReadFlagSnapshot()?.progress[13] ?? 0) === 1;
  const blockedSpots = wasmGetRoomDoorInfo(roomId)
    .filter((d) => d.nativeType === 0x46 || (d.nativeType === 0x14 && !followerActive))
    .map((d) => ({ edge: d.direction as EdgeName, pos: d.direction === 'north' || d.direction === 'south' ? d.col : d.row }));
  const exitSpotMemo = new Map<string, boolean>();
  const isExitSpot = (edge: EdgeName, pos: number): boolean => {
    if (blockedSpots.some((sp) => sp.edge === edge && Math.abs(sp.pos - pos) <= 4)) return true;
    const k = `${edge}:${pos}`;
    if (!exitSpotMemo.has(k)) exitSpotMemo.set(k, exitDoorAt(roomId, edge, pos));
    return exitSpotMemo.get(k)!;
  };
  let borderCount = 0;
  for (const t of run.result.transitions) {
    if (t.edge !== 'entrance' || t.entranceIdx == null) continue;
    if (!usableEntranceTransition(run.result, t, items)) continue;
    if (t.entranceIdx >= 1000) {
      // Stair / walk-through boundary → destination room, landing on ITS stair.
      const entry = run.entrances.find((e) => e.id === t.entranceIdx);
      const to = entry ? interiorScreenId(entry.roomId, src) : null;
      if (to && entry && plausibleRoomNeighbor(to, src)) {
        borderCount += 1;
        pushExit({ to, entryTile: stairLandingTile(entry.roomId, roomId), fromTile: { row: t.row, col: t.col }, twoWay: true });
      }
      continue;
    }
    // Exit door → the OVERWORLD screen its entrance sits on (the entrance table
    // knows the area; the room→exit-screen map has gaps).
    const ow = owSide.find((e) => e.id === t.entranceIdx);
    if (!ow) continue;
    doorSpots.add(`${ow.area}:${ow.gridRow},${ow.gridCol}`);
    const row = Math.min(63, ow.gridRow + 2);
    const to = owScreenId(ow.area);
    pushExit({ to, entryTile: { row, col: ow.gridCol }, fromTile: { row: t.row, col: t.col }, area: screenAreaInfo(to) });
  }
  // Border-scroll edges into adjacent rooms (castle/dungeon room-to-room walks).
  // An exit door's walkable notch also touches the room border — the landing
  // check keeps those from reading as room-to-room edges into solid wall.
  for (const conn of run.connections) {
    if (conn.isIntraRoom) continue;
    const adj = ROOM_EDGE_ADJ[conn.edge](roomId);
    if (adj === null) continue;
    const to = interiorScreenId(adj, src);
    if (!plausibleRoomNeighbor(to, src)) continue;
    const mid = conn.positions[Math.floor(conn.positions.length / 2)] ?? 32;
    if (isExitSpot(conn.edge, mid)) continue;
    if (!doorwayLandingOpen(adj, conn.edge, mid)) continue;
    borderCount += 1;
    pushExit({ to, entryTile: entryFromEdge(conn.edge, mid), fromTile: exitFromEdge(conn.edge, mid), twoWay: true });
  }
  // Doorway objects through the outer walls (validated against the neighbour's
  // own floor — see room-doorways.ts).
  borderCount += collectDoorwayExits({ roomId, src, dist, push: pushExit, isExitSpot });
  // Report what's REAL for a room: distinct usable doors + plausible room borders
  // (the raw formulas over-count spawn markers and door tiles read as borders).
  const flood = { ...summarizeRun(run, items), entranceCount: doorSpots.size, edgeCount: borderCount };
  return { flood, exits: dedupe(sortExitsByDistance(exits, scores)), reached: reachedGrid(run.result.reachable) };
};

export { detectRoom, dedupe };
