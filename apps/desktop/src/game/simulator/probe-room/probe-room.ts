/* @layer bridge-wasm @kind logic */
import { wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetFallHoles, wasmGetRoomWalkBoundariesFor, wasmGetRoomStairInfoFor } from '../..';
import type { TileReq } from '@rotp/game-data';
import { detectRoom } from '../room-exits';
import { floodRoomRun, probeRoomThreat, floodAnchorReport, edgeOpenCount, entranceRows, gridBuilt, chestProbes, attrRows, roomMap, neighbourEntrances, reachBbox, transitionProbes } from '@rotp/navigation';
import type { RoomProbe } from '@rotp/navigation';
import { doorRows } from './door-rows';
import { entranceIdsOf } from './entrance-ids-of';
import { entranceTableOf } from './entrance-table-of';
import { exitRows } from './exit-rows';
import { seedRows } from './seed-rows';
import { spriteRows } from './sprite-rows';

const probeRoom = (roomId: number, entryTile?: { row: number; col: number }, items: TileReq[] = ['lift.1']): RoomProbe => {
  const rooms = wasmGetEntranceRooms();
  const entranceIds = entranceIdsOf(rooms, roomId);
  const holeIds = new Set(wasmGetFallHoles().map((h) => h.entranceId));
  const run = floodRoomRun(roomId, items, entryTile);
  const detected = detectRoom(roomId, items, entryTile);
  return {
    roomId,
    exitScreen: wasmGetExitScreenMap().get(roomId),
    entranceIds,
    fallHoleIds: entranceIds.filter((id) => holeIds.has(id)),
    entranceRows: entranceRows(entranceIds),
    seeds: seedRows(roomId, run),
    transitions: transitionProbes(run, items),
    exits: exitRows(detected),
    gridBuilt: gridBuilt(roomId),
    chests: chestProbes(roomId, run),
    doors: doorRows(roomId),
    sprites: spriteRows(roomId),
    attrRows: attrRows(roomId, run),
    map: roomMap(roomId, run),
    entranceTable: entranceTableOf(rooms),
    neighbourEntrances: neighbourEntrances(roomId, rooms),
    scrolls: {
      boundaries: wasmGetRoomWalkBoundariesFor(roomId).map((b) => ({ row: b.row, col: b.col, destRoom: b.destRoom })),
      stairs: wasmGetRoomStairInfoFor(roomId).map((s) => ({ row: s.row, col: s.col, destRoom: s.destRoom })),
    },
    edgeOpen: { north: edgeOpenCount(roomId, 'north'), south: edgeOpenCount(roomId, 'south'), east: edgeOpenCount(roomId, 'east'), west: edgeOpenCount(roomId, 'west') },
    anchors: run ? floodAnchorReport(roomId, run) : undefined,
    reachable: detected?.flood.reachableCount ?? 0,
    bbox: run ? reachBbox(run) : undefined,
    threat: probeRoomThreat(roomId, run),
  };
};

export { probeRoom };
