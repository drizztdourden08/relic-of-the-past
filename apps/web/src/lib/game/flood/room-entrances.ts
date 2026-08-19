/* @layer bridge-wasm @kind logic */
/**
 * THE indoor entrance list: every way into `roomId`, at the tile the player actually
 * arrives on.
 *
 * The widget and the simulator each built this separately. The widget refined an
 * overworld-door entrance's tile to the real door opening but had no follower gate
 * and could only read the LIVE room; the simulator gated on the follower and could
 * address any room but placed those entrances on the raw spawn tile. Both halves
 * live here now, so a seed list is the same list whoever asks.
 */
import type { OverworldEntrance } from '@shared/game/navigation';
import {
  wasmGetEntranceSpawns, wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetFallHoles,
  wasmGetRoomStairInfo, wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundaries,
  wasmGetRoomWalkBoundariesFor, wasmGetRoomDoorInfo, wasmGetRoomExitDoors,
} from '../';
import { readMapState } from '../simulator/read-game-state';
import { isFollowerActive } from '../follower-state';
import { roomOrigin, tileInScreen } from './world-origin';

/** kDoorType_ThroneRoom — its walk-through boundary needs the follower in tow. */
const THRONE_DOOR = 0x14;
/** Synthetic id bases, so a seed's origin is readable from its id. */
const STAIR_ID_BASE = 1000;
const BOUNDARY_ID_BASE = 2000;

type ExitDoor = { row: number; col: number; direction: string; used: boolean };

/**
 * An exit door's walkable tile. The door RECORD sits in the wall; the player stands a
 * few tiles inside it, and how far depends on which wall it is.
 */
const doorLandingTile = (door: ExitDoor): { row: number; col: number } => {
  switch (door.direction) {
    case 'south': return { row: door.row + 3, col: door.col + 1 };
    case 'north': return { row: door.row + 4, col: door.col + 1 };
    default: return { row: door.row + 1, col: door.col + 2 };
  }
};

/** Nearest unused exit door to a spawn, so two doors never claim one tile. */
const claimNearestDoor = (doors: ExitDoor[], row: number, col: number): ExitDoor | null => {
  let best: ExitDoor | null = null;
  let bestDist = Infinity;
  for (const door of doors) {
    if (door.used) continue;
    const dist = (door.row - row) ** 2 + (door.col - col) ** 2;
    if (dist < bestDist) { bestDist = dist; best = door; }
  }
  if (best) best.used = true;
  return best;
};

const inGrid = (row: number, col: number): boolean => row >= 0 && row < 64 && col >= 0 && col < 64;

const roomEntrances = (roomId: number): OverworldEntrance[] => {
  const spawns = wasmGetEntranceSpawns();
  const rooms = wasmGetEntranceRooms();
  if (!spawns || !rooms) return [];

  const exitScreen = wasmGetExitScreenMap().get(roomId);
  const holeIds = new Set(wasmGetFallHoles().map((h) => h.entranceId));
  const origin = roomOrigin(roomId);
  const live = readMapState();
  const isLive = live?.isIndoors === true && live.roomIndex === roomId;

  // Exit-door refinement only applies to the loaded room (the door table is a
  // live read); other rooms fall back to the raw spawn tile.
  const exitDoors: ExitDoor[] = isLive
    ? wasmGetRoomExitDoors().map((d) => ({ row: d.row, col: d.col, direction: d.direction, used: false }))
    : [];

  const out: OverworldEntrance[] = [];
  for (let id = 0; id < rooms.length; id++) {
    if (rooms[id] !== roomId || holeIds.has(id)) continue;
    const spawn = spawns[id];
    if (!spawn) continue;
    const spawnTile = tileInScreen(spawn.x, spawn.y, origin);
    // An entrance that leads back outside arrives at its door, not its spawn.
    const door = exitScreen != null ? claimNearestDoor(exitDoors, spawnTile.row, spawnTile.col) : null;
    const tile = door ? doorLandingTile(door) : spawnTile;
    if (!inGrid(tile.row, tile.col)) continue;
    out.push({ area: roomId, pos: 0, id, gridRow: tile.row, gridCol: tile.col, roomId: exitScreen ?? 0 });
  }

  // Inter-room stairs and walk-through boundaries are room-addressable: the
  // loaded room reads its live tables, any other room rebuilds its own.
  const stairs = isLive ? wasmGetRoomStairInfo() : wasmGetRoomStairInfoFor(roomId);
  for (let i = 0; i < stairs.length; i++) {
    if (stairs[i].destRoom === 0) continue;
    out.push({ area: roomId, pos: 0, id: STAIR_ID_BASE + i, gridRow: stairs[i].row, gridCol: stairs[i].col, roomId: stairs[i].destRoom });
  }

  // The throne room's push wall opens only with the follower in tow, so rooms whose
  // door table carries a ThroneRoom record gate their boundary on the follower.
  const bounds = isLive ? wasmGetRoomWalkBoundaries() : wasmGetRoomWalkBoundariesFor(roomId);
  const followerGated = bounds.length > 0
    && (wasmGetRoomDoorInfo(roomId) ?? []).some((d) => d.nativeType === THRONE_DOOR)
    && !isFollowerActive();
  if (!followerGated) {
    for (let i = 0; i < bounds.length; i++) {
      if (bounds[i].destRoom === 0) continue;
      out.push({ area: roomId, pos: 0, id: BOUNDARY_ID_BASE + i, gridRow: bounds[i].row, gridCol: bounds[i].col, roomId: bounds[i].destRoom });
    }
  }
  return out;
};

export { roomEntrances, STAIR_ID_BASE, BOUNDARY_ID_BASE };
