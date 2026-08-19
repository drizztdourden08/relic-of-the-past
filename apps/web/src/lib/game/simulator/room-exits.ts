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
import type { ScreenRecord } from '@shared/game/data';
import { enrichEntrances } from '@domains/widgets/navigation/widget-helpers';
import { wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundariesFor, wasmGetRoomDoorInfo, wasmGetExitScreenMap, wasmReadFlagSnapshot } from '../';
import { summarizeRun, usableEntranceTransition } from './flood-screen';
import { floodRoomRun } from './flood-room';
import { owScreenId, interiorScreenId, cachedEntranceOf, usesCachedEntrance, screenAreaInfo } from './screen-resolve';
import { stepDistances, distanceAt, sortExitsByDistance, entryFromEdge, exitFromEdge, reachedGrid } from './exit-order';
import type { EdgeName } from './exit-order';
import { collectDoorwayExits, doorwayLandingOpen, exitDoorAt, plausibleRoomNeighbor, ROOM_EDGE_ADJ } from './room-doorways';
import type { DetectedScreen } from './screen-exits';

/** Can the game leave this room straight to the overworld? Cached-entrance rooms
 *  restore the door they came in by; the rest are listed in kExitDataRooms. */
/**
 * Widest a room-to-room crossing can be and still be a doorway.
 *
 * A supertile's outer padding ring is open tiles all the way round, so a flood
 * that gets into it anywhere runs the whole perimeter and reports a crossing
 * spanning most of every edge — which is how the first castle's basement
 * "scrolled" east into the desert dungeon over 54 tiles. A real doorway is a
 * notch a few tiles wide; the castle's own room-to-room walks measure 2 to 6.
 */
const MAX_DOORWAY_SPAN = 12;

const isStandaloneInterior = (roomId: number): boolean =>
  usesCachedEntrance(roomId) || wasmGetExitScreenMap().has(roomId);

/**
 * Drop genuinely duplicate exits — same destination AND same way in.
 *
 * Keying on the destination alone collapsed every crossing into a screen down to
 * one, and they are not interchangeable: one side of a screen can carry several
 * separate crossings landing in places that do not connect. The sanctuary
 * grounds hold a ledge the lower part cannot reach, and the only way onto it is
 * the second of two east crossings from the screen to its west — which this
 * threw away, making the ledge permanently unreachable.
 */
const dedupe = (exits: SimExit[]): SimExit[] => {
  const seen = new Set<string>();
  return exits.filter((e) => {
    const key = `${e.to}#${e.edgeSig ?? ''}`;
    return seen.has(key) ? false : (seen.add(key), true);
  });
};

/** The DESTINATION room's stair/walk-boundary that leads back here = the
 *  landing tile the player appears on after taking this transition. */
const stairLandingTile = (destRoom: number, fromRoom: number): GridPos | undefined => {
  const back = wasmGetRoomStairInfoFor(destRoom).find((s) => s.destRoom === fromRoom)
    ?? wasmGetRoomWalkBoundariesFor(destRoom).find((b) => b.destRoom === fromRoom);
  return back ? { row: back.row, col: back.col } : undefined;
};

/** Flood an indoor room; exits = its doors back outside + stairs/boundaries. */
const detectRoom = (roomId: number, items: TileReq[], entryTile?: GridPos, src?: ScreenRecord, fromKey = ''): DetectedScreen | null => {
  const run = floodRoomRun(roomId, items, entryTile);
  if (!run) return null;
  const owSide = enrichEntrances();
  const cached = cachedEntranceOf(fromKey);
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
  const blockedSpots = (wasmGetRoomDoorInfo(roomId) ?? [])
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
      const stairLanding = entry ? stairLandingTile(entry.roomId, roomId) : undefined;
      const to = entry ? interiorScreenId(entry.roomId, stairLanding, cached) : null;
      if (to && entry && plausibleRoomNeighbor(to, src)) {
        borderCount += 1;
        pushExit({ to, entryTile: stairLanding, fromTile: { row: t.row, col: t.col }, twoWay: true, origin: 'room-stair', edgeSig: `s${t.entranceIdx}` });
      }
      continue;
    }
    // Exit door → the OVERWORLD screen its entrance sits on (the entrance table
    // knows the area; the room→exit-screen map has gaps).
    // A cached-entrance room leaves by the door it was entered through. Picking
    // the first table row with this entrance id sent BOTH huts sharing id 101 out
    // at lw-11, which is the wormhole. See usesCachedEntrance.
    const ow = cached
      ? owSide.find((e) => e.id === t.entranceIdx && `^ow:${e.area}` === cached) ?? owSide.find((e) => e.id === t.entranceIdx)
      : owSide.find((e) => e.id === t.entranceIdx);
    if (!ow) continue;
    doorSpots.add(`${ow.area}:${ow.gridRow},${ow.gridCol}`);
    const row = Math.min(63, ow.gridRow + 2);
    const to = cached ? cached.slice(1) : owScreenId(ow.area);
    // Two-way like the stairs and border scrolls below: a door back outside is
    // the same door from the other side, so the graph gets the reverse edge and
    // an interior whose own way out went undetected can still be walked out of.
    pushExit({ to, entryTile: { row, col: ow.gridCol }, fromTile: { row: t.row, col: t.col }, twoWay: true, origin: 'room-door', edgeSig: `e${t.entranceIdx}`, area: screenAreaInfo(to) });
  }
  // Border-scroll edges into adjacent rooms (castle/dungeon room-to-room walks).
  // An exit door's walkable notch also touches the room border — the landing
  // check keeps those from reading as room-to-room edges into solid wall.
  for (const conn of run.connections) {
    if (conn.isIntraRoom) continue;
    if (conn.positions.length > MAX_DOORWAY_SPAN) continue;
    const adj = ROOM_EDGE_ADJ[conn.edge](roomId);
    if (adj === null) continue;
    const mid0 = conn.positions[Math.floor(conn.positions.length / 2)] ?? 32;
    const to = interiorScreenId(adj, entryFromEdge(conn.edge, mid0), cached);
    if (!plausibleRoomNeighbor(to, src)) continue;
    // Two STANDALONE interiors never scroll into one another. A standalone room is
    // one the game can leave straight to the overworld — either it restores a cached
    // entrance, or it has a row in kExitDataRooms. `ROOM_EDGE_ADJ` proposes roomId±16
    // regardless, which is how the bomb hut (0x10a) "scrolled north" into the fairy
    // cave (0xfa) and the run reached the mountain summit from the desert. A
    // standalone scrolling INWARD is still fine — that is a dungeon's entrance hall.
    if (isStandaloneInterior(roomId) && isStandaloneInterior(adj)) continue;
    const mid = conn.positions[Math.floor(conn.positions.length / 2)] ?? 32;
    const span = conn.positions.length ? `${Math.min(...conn.positions)}-${Math.max(...conn.positions)}` : '?';
    if (isExitSpot(conn.edge, mid)) continue;
    if (!doorwayLandingOpen(adj, conn.edge, mid)) continue;
    borderCount += 1;
    pushExit({ to, entryTile: entryFromEdge(conn.edge, mid), fromTile: exitFromEdge(conn.edge, mid), twoWay: true, origin: 'room-border', edgeSig: `${conn.edge}:${span}` });
  }
  // Doorway objects through the outer walls (validated against the neighbour's
  // own floor — see room-doorways.ts).
  borderCount += collectDoorwayExits({ roomId, src, dist, push: pushExit, isExitSpot, cached });
  // Every room the exit table lists HAS a way back outside — that table is the
  // game's own answer and does not depend on the flood. The loop above only emits
  // that exit when the flood physically touched the entrance's tile, and a small
  // cave's spawn record sits a few rows outside its walkable floor (room 0xe2's
  // spawn is row 59, its floor ends at row 55), so the transition never fires and
  // the room reads as a dead end. Before doors were two-way that merely lost a few
  // screens; now it strands the run, and a run that falls into a hole must always
  // be able to walk back out. Anchor it on the outdoor side of the same door.
  if (!doorSpots.size) {
    const exitScreen = wasmGetExitScreenMap().get(roomId);
    const owBack = owSide.find((e) => e.roomId === roomId);
    if (exitScreen != null && owBack) {
      const to = owScreenId(exitScreen);
      pushExit({
        to,
        entryTile: { row: Math.min(63, owBack.gridRow + 2), col: owBack.gridCol },
        twoWay: true,
        origin: 'exit-table',
        edgeSig: `x${roomId}`,
        area: screenAreaInfo(to),
      });
    }
  }
  // Report what's REAL for a room: distinct usable doors + plausible room borders
  // (the raw formulas over-count spawn markers and door tiles read as borders).
  const flood = { ...summarizeRun(run, items), entranceCount: doorSpots.size, edgeCount: borderCount };
  return { flood, exits: dedupe(sortExitsByDistance(exits, scores)), reached: reachedGrid(run.result.reachable) };
};

export { detectRoom, dedupe };
