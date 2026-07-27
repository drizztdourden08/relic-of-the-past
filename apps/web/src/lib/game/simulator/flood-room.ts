/* @layer bridge-wasm @kind logic */
/**
 * Addressable single-room indoor flood for the game-driven simulator. Unlike a
 * bare grid flood, this feeds floodFillScreen the room's REAL entrances — every
 * game entrance whose destination is this room (its exit doors back outside, at
 * the spawn tile the player appears on) plus, when the room is the live loaded
 * one, its inter-room stairs and walk-through boundaries — so an interior like
 * the player's house correctly detects its way out (entrances ≥ 1, never 0).
 */
import {
  wasmGetEntranceSpawns, wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetFallHoles,
  wasmGetRoomStairInfo, wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundaries, wasmGetRoomWalkBoundariesFor, wasmGetRoomLayoutInfo, wasmGetRoomDoorInfo,
} from '../';
import { floodFillScreen, getConnections } from '@shared/game/navigation';
import { buildFloodOptions, getScreenGrids, roomEntrances } from '../flood';
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
 *  (see screen-grids.ts) — remote rooms included. */
const floodRoomRun = (roomId: number, items: TileReq[], startPos?: GridPos): RoomFloodRun | null => {
  const bundle = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
  const entrances = roomEntrances(roomId);
  const location = { isIndoors: true as const, roomId, owScreenIndex: 0 };
  const runFrom = (from?: GridPos) => floodFillScreen(bundle.rawAttrGrid, bundle.screenIndex,
    buildFloodOptions({ location, items, startPos: from, entrances }, bundle));
  // A room's spawn record can sit outside its own walkable floor — the threshold
  // tile of the door rather than the ground behind it. Seeding there reaches
  // nothing at all, which reads as a sealed room and sends the run straight back
  // out. A seed that reaches nothing is not a seed, so fall back to the room's
  // own entrance list, which lands on floor.
  const seeded = runFrom(startPos);
  const result = startPos && seeded.reachableCount === 0 ? runFrom(undefined) : seeded;
  // Intra-room scroll boundaries (a 2×2 room's internal doorway) come from the
  // live room-layout read — only available for the loaded room.
  const live = readMapState();
  const intraEdges = live?.isIndoors && live.roomIndex === roomId ? (wasmGetRoomLayoutInfo()?.intraEdges ?? []) : [];
  return { result, connections: getConnections(result, intraEdges.length > 0 ? intraEdges : undefined), entrances };
};

/** Flood an indoor room and report widget-style numbers. */
const floodRoomScreen = (roomId: number, startPos?: GridPos, items: TileReq[] = ['lift.1']): ScreenFlood | null => {
  const run = floodRoomRun(roomId, items, startPos);
  return run ? summarizeRun(run, items) : null;
};

export { floodRoomRun, floodRoomScreen };
export type { RoomFloodRun };
