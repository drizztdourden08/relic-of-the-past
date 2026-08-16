/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { SimExit } from '@shared/game/simulation';
import { collectCrossings } from '../crossings';
import { usableCrossings } from '../usable-crossings';
import { summarizeRun } from './flood-screen';
import { floodRoomRun } from './flood-room';
import { cachedEntranceOf } from './screen-resolve';
import { stepDistances, distanceAt, sortExitsByDistance, reachedGrid } from './exit-order';
import { roomCrossingExits } from './room-crossing-exits';
import type { DetectedScreen } from './screen-exits';

/** Ordering score for an exit whose tile the walk never reached. */
const UNREACHED = 0xffff;

/** Origins that leave the dungeon or house entirely, rather than move within it. */
const OUTSIDE_ORIGINS: ReadonlySet<string> = new Set(['room-door', 'exit-table']);

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

/**
 * What is REAL for a room, for the log's numbers: distinct doors back outside,
 * and every other crossing counted as an edge. The raw flood formulas over-count
 * spawn markers and door tiles read as borders.
 */
const roomCounts = (exits: readonly SimExit[]): { entranceCount: number; edgeCount: number } => {
  const outside = exits.filter((e) => OUTSIDE_ORIGINS.has(e.origin ?? ''));
  return { entranceCount: new Set(outside.map((e) => e.to)).size, edgeCount: exits.length - outside.length };
};

/**
 * Flood an indoor room and turn its crossings into traversal exits: the facade
 * answers what leaves the room, `usableCrossings` keeps the ones the player
 * could walk, and the adapter speaks them in the engine's `SimExit` vocabulary.
 */
const detectRoom = (roomId: number, items: TileReq[], entryTile?: GridPos, fromKey = ''): DetectedScreen | null => {
  const run = floodRoomRun(roomId, items, entryTile);
  if (!run) return null;
  const scope = {
    isIndoors: true, roomIndex: roomId, owScreenIndex: 0,
    flood: run.result, connections: run.connections, items,
  };
  const crossings = usableCrossings(collectCrossings(scope), scope);
  const exits = roomCrossingExits(crossings, {
    roomIndex: roomId, cached: cachedEntranceOf(fromKey), connections: run.connections,
  });
  const dist = stepDistances(run.result.reachable, run.result.startPos, run.result.ledges);
  const scores = exits.map((exit) => (exit.fromTile ? distanceAt(dist, exit.fromTile) : UNREACHED));
  return {
    flood: { ...summarizeRun(run, items), ...roomCounts(exits) },
    exits: dedupe(sortExitsByDistance(exits, scores)),
    reached: reachedGrid(run.result.reachable),
  };
};

export { detectRoom, dedupe };
