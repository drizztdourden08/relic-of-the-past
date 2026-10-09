/* @layer bridge-wasm @kind logic */
import { wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetFallHoles, wasmGetRoomWalkBoundariesFor, wasmGetRoomStairInfoFor } from '../..';
import { roomEntrances } from '../../flood';
import type { TileReq } from '@rotp/game-data';
import { detectRoom } from '../room-exits';
import { getRoomSprites, getRoomDoors, floodRoomRun, probeRoomThreat, floodAnchorReport, edgeOpenCount, entranceRows, gridBuilt, chestProbes, attrRows, roomMap, neighbourEntrances, reachBbox, transitionProbes } from '@rotp/navigation';
import type { RoomProbe } from '@rotp/navigation';

const probeRoom = (roomId: number, entryTile?: { row: number; col: number }, items: TileReq[] = ['lift.1']): RoomProbe => {
  const rooms = wasmGetEntranceRooms();
  const entranceIds: number[] = [];
  for (let id = 0; id < (rooms?.length ?? 0); id++) if (rooms?.[id] === roomId) entranceIds.push(id);
  const holeIds = new Set(wasmGetFallHoles().map((h) => h.entranceId));
  const run = floodRoomRun(roomId, items, entryTile);
  const detected = detectRoom(roomId, items, entryTile);
  const transitions = transitionProbes(run, items);
  return {
    roomId,
    exitScreen: wasmGetExitScreenMap().get(roomId),
    entranceIds,
    fallHoleIds: entranceIds.filter((id) => holeIds.has(id)),
    entranceRows: entranceRows(entranceIds),
    seeds: roomEntrances(roomId).map((e) => ({
      id: e.id, row: e.gridRow, col: e.gridCol, dest: e.roomId,
      reached: (run?.result.reachable[e.gridRow]?.[e.gridCol] ?? 0) > 0,
    })),
    transitions,
    exits: (detected?.exits ?? []).map((e) => ({ to: e.to, ...(e.steps == null ? {} : { steps: e.steps }) })),
    gridBuilt: gridBuilt(roomId),
    chests: chestProbes(roomId, run),
    doors: getRoomDoors(roomId).map((d) => ({
      index: d.index, kind: d.kind, nativeType: d.nativeType, dir: d.direction,
      row: d.tiles[0]?.row ?? -1, col: d.tiles[0]?.col ?? -1, opened: d.opened,
    })),
    sprites: getRoomSprites(roomId).map((sp) => ({
      type: `0x${sp.spriteType.toString(16)}`, row: sp.tile.row, col: sp.tile.col, kind: sp.kind,
      ...(sp.carriesKey ? { carriesKey: true } : {}),
      ...(sp.carriesBigKey ? { carriesBigKey: true } : {}),
    })),
    attrRows: attrRows(roomId, run),
    map: roomMap(roomId, run),
    entranceTable: {
      size: rooms?.length ?? 0,
      rooms: Array.from(rooms ?? []).map((r, i) => `${i}:${r.toString(16)}`).join(' '),
    },
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
export type { RoomProbe } from '@rotp/navigation';
