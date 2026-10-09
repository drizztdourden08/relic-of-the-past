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
import { dedupe } from './dedupe';
import { OUTSIDE_ORIGINS, ROOM_EXIT_UNREACHED } from './room-exits.constants';
import type { DetectedScreen } from './screen-exits.type';

const roomCounts = (exits: readonly SimExit[]): { entranceCount: number; edgeCount: number } => {
  const outside = exits.filter((e) => OUTSIDE_ORIGINS.has(e.origin ?? ''));
  return { entranceCount: new Set(outside.map((e) => e.to)).size, edgeCount: exits.length - outside.length };
};

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
  const scores = exits.map((exit) => (exit.fromTile ? distanceAt(dist, exit.fromTile) : ROOM_EXIT_UNREACHED));
  return {
    flood: { ...summarizeRun(run, items), ...roomCounts(exits) },
    exits: dedupe(sortExitsByDistance(exits, scores)),
    reached: reachedGrid(run.result.reachable),
  };
};

export { detectRoom };
