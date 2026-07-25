/* @layer bridge-wasm @kind logic */
/**
 * Addressable single-room indoor flood for the game-driven simulator. Unlike a
 * bare grid flood, this feeds floodFillScreen the room's REAL entrances — every
 * game entrance whose destination is this room (its exit doors back outside, at
 * the spawn tile Link appears on) plus, when the room is the live loaded one,
 * its inter-room stairs and walk-through boundaries — so an interior like
 * Link's house correctly detects its way out (entrances ≥ 1, never 0).
 */
import {
  wasmGetEntranceSpawns, wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetFallHoles,
  wasmGetRoomStairInfo, wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundaries, wasmGetRoomWalkBoundariesFor, wasmGetRoomLayoutInfo, wasmGetRoomDoorInfo, wasmReadFlagSnapshot,
} from '../';
import { floodFillScreen, getConnections } from '@shared/game/navigation';
import type { ConnectionInfo, FloodFillResult, GridPos, OverworldEntrance } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { getScreenGrids } from './screen-grids';
import { readMapState } from './read-game-state';
import { summarizeRun } from './flood-screen';
import type { ScreenFlood } from './flood-screen';

interface RoomFloodRun {
  result: FloodFillResult;
  connections: ConnectionInfo[];
  /** The entrance list the flood ran with (exit doors + stairs + boundaries). */
  entrances: OverworldEntrance[];
}

/**
 * Every entrance whose destination room is `roomId`, placed at its in-room spawn
 * tile (always walkable, so the flood reliably reaches it). `roomId` on each
 * record is the OVERWORLD screen the exit door leads back to. Fall-hole landings
 * are excluded (one-way in). When the room is live-loaded, inter-room stairs and
 * walk-through boundaries are appended (their `roomId` is the destination room).
 */
const roomEntrances = (roomId: number): OverworldEntrance[] => {
  const spawns = wasmGetEntranceSpawns();
  const rooms = wasmGetEntranceRooms();
  if (!spawns || !rooms) return [];
  const exitScreen = wasmGetExitScreenMap().get(roomId);
  const holeIds = new Set(wasmGetFallHoles().map((h) => h.entranceId));
  const originX = (roomId % 16) * 512;
  const originY = Math.floor(roomId / 16) * 512;

  const out: OverworldEntrance[] = [];
  for (let id = 0; id < rooms.length; id++) {
    if (rooms[id] !== roomId || holeIds.has(id)) continue;
    const spawn = spawns[id];
    if (!spawn) continue;
    const gridRow = Math.floor((spawn.y - originY) / 8);
    const gridCol = Math.floor((spawn.x - originX) / 8);
    if (gridRow < 0 || gridRow >= 64 || gridCol < 0 || gridCol >= 64) continue;
    out.push({ area: roomId, pos: 0, id, gridRow, gridCol, roomId: exitScreen ?? 0 });
  }

  // Inter-room stairs AND walk-through boundaries are room-addressable (attr
  // scan / toggle-palace positions + header destinations); the loaded room
  // reads its live tables, any other room rebuilds its own.
  const live = readMapState();
  const isLive = live?.isIndoors === true && live.roomIndex === roomId;
  const stairs = isLive ? wasmGetRoomStairInfo() : wasmGetRoomStairInfoFor(roomId);
  for (let i = 0; i < stairs.length; i++) {
    if (stairs[i].destRoom === 0) continue;
    out.push({ area: roomId, pos: 0, id: 1000 + i, gridRow: stairs[i].row, gridCol: stairs[i].col, roomId: stairs[i].destRoom });
  }
  // The throne room's push-wall boundary opens only with Zelda following —
  // rooms whose door table carries a ThroneRoom record (kDoorType_ThroneRoom,
  // native 0x14) gate their walk-through boundary on the follower. Same
  // sanctioned transcription class as NPC presence conditions.
  const bounds = isLive ? wasmGetRoomWalkBoundaries() : wasmGetRoomWalkBoundariesFor(roomId);
  const followerGated = bounds.length > 0
    && wasmGetRoomDoorInfo(roomId).some((d) => d.nativeType === 0x14)
    && (wasmReadFlagSnapshot()?.progress[13] ?? 0) !== 1;
  if (!followerGated) {
    for (let i = 0; i < bounds.length; i++) {
      if (bounds[i].destRoom === 0) continue;
      out.push({ area: roomId, pos: 0, id: 2000 + i, gridRow: bounds[i].row, gridCol: bounds[i].col, roomId: bounds[i].destRoom });
    }
  }
  return out;
};

/** Flood one indoor room with its real entrances; null when the grid can't build.
 *  The grid bundle arrives with the uncle's blocker footprint already stamped
 *  (see screen-grids.ts) — remote rooms included. */
const floodRoomRun = (roomId: number, items: TileReq[], startPos?: GridPos): RoomFloodRun | null => {
  const bundle = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
  const entrances = roomEntrances(roomId);
  // Entering through a LOWER-layer passage must start the flood on layer 1 —
  // starting on a blocked layer-0 tile would snap the start into an unrelated
  // region. Two game-derived signals: arriving ON a stair whose attr tile sits
  // on the BG1 page (stairs deposit Link on their own layer — the sewers'
  // Behind-Sanctuary alcove), or landing where only layer 1 has floor (a BG1
  // door/border like the sewer strip).
  const startLayer = ((): 0 | 1 | undefined => {
    const dual = bundle.dualLayerGrids;
    if (!dual || !startPos) return undefined;
    const stairs = readMapState()?.isIndoors === true && readMapState()?.roomIndex === roomId
      ? wasmGetRoomStairInfo() : wasmGetRoomStairInfoFor(roomId);
    const atStair = stairs.find((st) => Math.abs(st.row - startPos.row) <= 1 && Math.abs(st.col - startPos.col) <= 1);
    if (atStair) return atStair.layer;
    // Doors carry their layer (position slots 6-11 = lower/BG1): entering
    // through a door starts the walk on ITS layer — the game keeps Link's
    // level bit across the transition (0x71's main hall is walked on BG1,
    // and only from there do the swap-stairs put Link on the upper corridor
    // where the locked key door actually gates the jail).
    const throughDoor = wasmGetRoomDoorInfo(roomId)
      .filter((d) => Math.abs(d.row - startPos.row) <= 8 && Math.abs(d.col - startPos.col) <= 8)
      .sort((a, b) => (Math.abs(a.row - startPos.row) + Math.abs(a.col - startPos.col))
        - (Math.abs(b.row - startPos.row) + Math.abs(b.col - startPos.col)))[0];
    if (throughDoor) return throughDoor.layer;
    const free = (a: number): boolean => a === 0x00 || (a >= 0x80 && a <= 0x8d) || (a >= 0x90 && a <= 0xaf);
    const near = (g: number[][]): boolean => {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (free(g[startPos.row + dr]?.[startPos.col + dc] ?? 1)) return true;
        }
      }
      return false;
    };
    return !near(dual.layer0) && near(dual.layer1) ? 1 : undefined;
  })();
  const result = floodFillScreen(bundle.rawAttrGrid, bundle.screenIndex, {
    tileContext: bundle.tileContext,
    inventory: new Set(items),
    startPos,
    ...(startLayer !== undefined ? { startLayer } : {}),
    dualLayerGrids: bundle.dualLayerGrids,
    staircaseType: bundle.staircaseType,
    entrances,
    exitScreenByRoom: wasmGetExitScreenMap(),
  });
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

export { floodRoomRun, floodRoomScreen, roomEntrances };
export type { RoomFloodRun };
