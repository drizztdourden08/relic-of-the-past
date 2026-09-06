/* @layer bridge-wasm @kind logic */
// Addressable single-room indoor flood. Feeds floodFillScreen the room's REAL entrances (exit
// doors at their spawn tiles, plus stairs and walk-through boundaries for the live room) so an
// interior always detects its way out (entrances >= 1, never 0).
import {
  wasmGetEntranceSpawns, wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetFallHoles,
  wasmGetRoomStairInfo, wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundaries, wasmGetRoomWalkBoundariesFor, wasmGetRoomLayoutInfo, wasmGetRoomDoorInfo,
} from '../';
import { floodOneScreen, roomEntrances } from '../flood';
import type { ConnectionInfo, FloodFillResult, GridPos, OverworldEntrance } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { readMapState } from './read-game-state';
import { summarizeRun } from './flood-screen';
import type { ScreenFlood } from './flood-screen';

interface RoomFloodRun {
  result: FloodFillResult;
  connections: ConnectionInfo[];
  /** The entrance list the flood ran with (exit doors + stairs + boundaries). */
  entrances: OverworldEntrance[];
}

/** Flood one indoor room with its real entrances; null when the grid can't build.
 *  The grid bundle arrives with the uncle's blocker footprint already stamped
 *  (see screen-grids.ts), remote rooms included. */
const floodRoomRun = (roomId: number, items: TileReq[], startPos?: GridPos): RoomFloodRun | null => {
  const entrances = roomEntrances(roomId);
  // Intra-room scroll boundaries (a 2x2 room's internal doorway) come from the
  // live room-layout read, which is only available for the loaded room.
  const live = readMapState();
  const intraEdges = live?.isIndoors && live.roomIndex === roomId ? (wasmGetRoomLayoutInfo()?.intraEdges ?? []) : [];
  const runFrom = (from?: GridPos) => floodOneScreen(
    { isIndoors: true, roomId, owScreenIndex: 0 },
    { items, ...(from ? { startPos: from } : {}), entrances, intraEdges },
  );
  // A room's spawn record can sit outside its walkable floor (the door threshold, not the
  // ground behind it). Seeding there reads as a sealed room, so fall back to the room's own
  // entrance list, which lands on floor.
  const seeded = runFrom(startPos);
  if (!seeded) return null;
  const run = startPos && seeded.result.reachableCount === 0 ? runFrom(undefined) ?? seeded : seeded;
  return { result: run.result, connections: run.connections, entrances };
};

/** Flood an indoor room and report widget-style numbers. */
const floodRoomScreen = (roomId: number, startPos?: GridPos, items: TileReq[] = ['lift.1']): ScreenFlood | null => {
  const run = floodRoomRun(roomId, items, startPos);
  return run ? summarizeRun(run, items) : null;
};

export { floodRoomRun, floodRoomScreen };
export type { RoomFloodRun };
