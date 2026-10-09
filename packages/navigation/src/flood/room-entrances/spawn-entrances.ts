/* @layer bridge-wasm @kind logic */
import type { OverworldEntrance } from '@rotp/game-core';
import { wasmGetEntranceSpawns, wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetFallHoles, wasmGetRoomExitDoors } from '@rotp/game-core';
import { roomOrigin, tileInScreen } from '../world-origin';
import { GRID } from './room-entrances.constants';
import { claimNearestDoor } from './claim-nearest-door';
import { doorLandingTile } from './door-landing-tile';
import type { ExitDoor } from './room-entrances.type';

const inGrid = (row: number, col: number): boolean => row >= 0 && row < GRID && col >= 0 && col < GRID;

const liveExitDoors = (isLive: boolean): ExitDoor[] => isLive
  ? wasmGetRoomExitDoors().map((d) => ({ row: d.row, col: d.col, direction: d.direction, used: false }))
  : [];

const spawnEntrances = (roomId: number, isLive: boolean): OverworldEntrance[] | null => {
  const spawns = wasmGetEntranceSpawns();
  const rooms = wasmGetEntranceRooms();
  if (!spawns || !rooms) return null;
  const exitScreen = wasmGetExitScreenMap().get(roomId);
  const holeIds = new Set(wasmGetFallHoles().map((h) => h.entranceId));
  const origin = roomOrigin(roomId);
  const exitDoors = liveExitDoors(isLive);
  const out: OverworldEntrance[] = [];
  for (let id = 0; id < rooms.length; id++) {
    if (rooms[id] !== roomId || holeIds.has(id)) continue;
    const spawn = spawns[id];
    if (!spawn) continue;
    const spawnTile = tileInScreen(spawn.x, spawn.y, origin);
    const leadsOutside = exitScreen != null;
    const door = leadsOutside ? claimNearestDoor(exitDoors, spawnTile.row, spawnTile.col) : null;
    const tile = door ? doorLandingTile(door) : spawnTile;
    if (!inGrid(tile.row, tile.col)) continue;
    out.push({ area: roomId, pos: 0, id, gridRow: tile.row, gridCol: tile.col, roomId: exitScreen ?? 0 });
  }
  return out;
};

export { spawnEntrances };
