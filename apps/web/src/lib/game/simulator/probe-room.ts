/* @layer bridge-wasm @kind logic */
/**
 * Indoor counterpart of the `flood=` diagnostic: everything that decides whether
 * a room has a detectable way out, in one report.
 *
 * A room that reads as a dead end strands the run, and the cause is always one of
 * a few tables disagreeing — the entrance list the flood seeds from, the
 * entrance→room mapping, the fall-hole table, and the room→exit-screen table. Put
 * them side by side and the disagreement is obvious; inferring it from a finished
 * run's trail is not.
 */
import { wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetFallHoles, wasmGetOverworldEntrances, wasmGetEntranceSpawns, wasmGetAreaHeads, wasmGetRoomWalkBoundariesFor, wasmGetRoomStairInfoFor } from '../';
import { roomEntrances, getScreenGrids } from '../flood';
import { enrichEntrances } from '../flood/overworld-entrances';
import { usableEntranceTransition } from '@shared/game/navigation';
import { detectRoom } from './room-exits';
import { getRoomChests, getRoomSprites, getRoomDoors } from './interactables';
import { floodRoomRun } from './flood-room';
import { probeRoomThreat } from './probe-room-threat';
import { floodAnchorReport, edgeOpenCount } from './probe-room-anchors';
import type { RoomThreatProbe } from './probe-room-threat';
import type { TileReq } from '@shared/game/navigation/tile-attrs';

interface RoomProbe {
  roomId: number;
  /** Overworld screen the exit table says this room comes out on (undefined = no entry). */
  exitScreen?: number;
  /** Entrance ids whose destination is this room, per the entrance→room table. */
  entranceIds: number[];
  /** Raw vs enriched entrance rows for those ids — where the game says the door is. */
  entranceRows: Array<{
    id: number; rawArea: number; rawPos: number; tableIndex: number;
    spawnX?: number; spawnY?: number;
    enrichedArea?: number; gridRow?: number; gridCol?: number;
    areaHead?: number;
  }>;
  /** Of those, the ones the fall-hole table claims — currently dropped as seeds. */
  fallHoleIds: number[];
  /** The seeds the flood actually ran with (id ≥ 1000 stair, ≥ 2000 boundary). */
  seeds: Array<{ id: number; row: number; col: number; dest: number; reached: boolean }>;
  /** Entrance transitions the flood actually emitted, and why each was kept or dropped. */
  transitions: Array<{ idx: number; row: number; col: number; usable: boolean; inOwTable: boolean }>;
  /** What exit detection produced for the room. */
  exits: Array<{ to: string; steps?: number }>;
  reachable: number;
  /** Did the addressable rebuild actually produce this room's grid? */
  gridBuilt: { raw: boolean; dual: boolean };
  /** Chests the room reports, and whether the flood can stand next to each. */
  chests: Array<{ index: number; row: number; col: number; opened: boolean; big: boolean; touchable: boolean; itemId?: number }>;
  /** Doors the room reports — kind, native type and open state. */
  doors: Array<{ index: number; kind: string; nativeType?: number; dir: string; row: number; col: number; opened: boolean }>;
  /** Sprites the room reports, with the kind the simulator assigns them. */
  sprites: Array<{ type: string; row: number; col: number; kind: string; carriesKey?: boolean; carriesBigKey?: boolean }>;
  /** Raw attrs per layer across the rows where the flood stops — what it thinks is solid. */
  attrRows: Array<{ row: number; raw: string; l0: string; l1: string; reached: string }>;
  /** Whole-room shape: '.' solid, ' ' floor, 'o' obstacle(req), '#' flooded, '*' flooded obstacle. */
  map: string[];
  /** Whole entrance→room table, so an absent room can be told from a short read. */
  entranceTable: { size: number; rooms: string };
  /** Entrance ids landing in nearby rooms — finds the door when this room has none. */
  neighbourEntrances: Array<{ room: number; ids: number[] }>;
  /** Open tiles on each outer wall ring. Mostly reads 64 — that ring is the
   *  supertile's padding, which is what lets a stray flood run a whole perimeter. */
  edgeOpen: { north: number; south: number; east: number; west: number };
  /** Which of the room's own anchors the flood reached — none means dead space. */
  anchors?: { total: number; hits: string[]; missed: string[] };
  /** The game's own edge-scroll records, for comparison against what the flood
   *  claims: staircases, and the walk boundaries that name a destination room. */
  scrolls: { boundaries: Array<{ row: number; col: number; destRoom: number }>; stairs: Array<{ row: number; col: number; destRoom: number }> };
  /** Bounding box of the reached region — shows where the flood actually is. */
  bbox?: { minRow: number; maxRow: number; minCol: number; maxCol: number };
  /** The combat sweep's verdict on this room's gating sprites — see probe-room-threat.ts. */
  threat: RoomThreatProbe;
}

const probeRoom = (roomId: number, entryTile?: { row: number; col: number }, items: TileReq[] = ['lift.1']): RoomProbe => {
  const rooms = wasmGetEntranceRooms();
  const entranceIds: number[] = [];
  for (let id = 0; id < (rooms?.length ?? 0); id++) if (rooms?.[id] === roomId) entranceIds.push(id);
  const holeIds = new Set(wasmGetFallHoles().map((h) => h.entranceId));
  const run = floodRoomRun(roomId, items, entryTile);
  const detected = detectRoom(roomId, items, entryTile);
  const owIds = new Set(enrichEntrances().map((e) => e.id));
  const transitions = (run?.result.transitions ?? [])
    .filter((t) => t.edge === 'entrance' && t.entranceIdx != null)
    .map((t) => ({
      idx: t.entranceIdx as number,
      row: t.row,
      col: t.col,
      usable: run ? usableEntranceTransition(run.result, t, items) : false,
      inOwTable: owIds.has(t.entranceIdx as number),
    }));
  return {
    roomId,
    exitScreen: wasmGetExitScreenMap().get(roomId),
    entranceIds,
    fallHoleIds: entranceIds.filter((id) => holeIds.has(id)),
    entranceRows: (() => {
      const raw = wasmGetOverworldEntrances();
      const enriched = enrichEntrances();
      const spawns = wasmGetEntranceSpawns();
      const heads = wasmGetAreaHeads();
      return entranceIds.map((id) => {
        const idx = raw.findIndex((e) => e.id === id);
        const r = raw[idx];
        const en = enriched.find((e) => e.id === id);
        const sp = spawns?.[id];
        return {
          id,
          tableIndex: idx,
          rawArea: r?.area ?? -1,
          rawPos: r?.pos ?? -1,
          ...(sp ? { spawnX: sp.x, spawnY: sp.y } : {}),
          ...(en ? { enrichedArea: en.area, gridRow: en.gridRow, gridCol: en.gridCol } : {}),
          ...(r && heads ? { areaHead: heads[r.area] } : {}),
        };
      });
    })(),
    seeds: roomEntrances(roomId).map((e) => ({
      id: e.id, row: e.gridRow, col: e.gridCol, dest: e.roomId,
      reached: (run?.result.reachable[e.gridRow]?.[e.gridCol] ?? 0) > 0,
    })),
    transitions,
    exits: (detected?.exits ?? []).map((e) => ({ to: e.to, ...(e.steps == null ? {} : { steps: e.steps }) })),
    gridBuilt: (() => {
      const b = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
      const raw = b.rawAttrGrid.some((r) => r.some((v) => v !== 0));
      const dual = !!b.dualLayerGrids && b.dualLayerGrids.layer0.some((r) => r.some((v) => v !== 0));
      return { raw, dual };
    })(),
    chests: getRoomChests(roomId).map((c) => ({
      index: c.chestIndex, row: c.tile.row, col: c.tile.col, opened: c.opened, big: c.isBig, itemId: c.itemId,
      // Chests are solid: the run must stand on a NEIGHBOUR, so that is the test.
      touchable: (() => {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const rr = c.tile.row + dr;
            const cc = c.tile.col + dc;
            if ((run?.result.reachable[rr]?.[cc] ?? 0) > 0) return true;
          }
        }
        return false;
      })(),
    })),
    doors: getRoomDoors(roomId).map((d) => ({
      index: d.index, kind: d.kind, nativeType: d.nativeType, dir: d.direction,
      row: d.tiles[0]?.row ?? -1, col: d.tiles[0]?.col ?? -1, opened: d.opened,
    })),
    sprites: getRoomSprites(roomId).map((sp) => ({
      type: `0x${sp.spriteType.toString(16)}`, row: sp.tile.row, col: sp.tile.col, kind: sp.kind,
      ...(sp.carriesKey ? { carriesKey: true } : {}),
      ...(sp.carriesBigKey ? { carriesBigKey: true } : {}),
    })),
    attrRows: (() => {
      const b = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
      const hex = (g?: number[][], row?: number) =>
        g && row != null ? (g[row] ?? []).slice(24, 40).map((v) => v.toString(16).padStart(2, '0')).join(' ') : '';
      const out = [];
      for (let row = 30; row <= 52; row++) {
        out.push({
          row,
          raw: hex(b.rawAttrGrid, row),
          l0: hex(b.dualLayerGrids?.layer0, row),
          l1: hex(b.dualLayerGrids?.layer1, row),
          reached: (run?.result.reachable[row] ?? []).slice(8, 32).map((v) => (v > 0 ? '#' : '.')).join(''),
        });
      }
      return out;
    })(),
    map: (() => {
      const b = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
      const grids = [b.rawAttrGrid];
      const rows: string[] = [];
      for (let row = 0; row < 64; row++) {
        let line = '';
        for (let col = 0; col < 64; col++) {
          const a = Math.min(...grids.map((g) => g[row]?.[col] ?? 0xff));
          const hot = (run?.result.reachable[row]?.[col] ?? 0) > 0;
          const obstacle = a >= 0xf0 || a === 0x71;
          line += obstacle ? (hot ? '*' : 'o') : a === 0x00 ? (hot ? '#' : ' ') : (hot ? '+' : '.');
        }
        rows.push(`${String(row).padStart(2)}|${line}`);
      }
      return rows;
    })(),
    entranceTable: {
      size: rooms?.length ?? 0,
      rooms: Array.from(rooms ?? []).map((r, i) => `${i}:${r.toString(16)}`).join(' '),
    },
    neighbourEntrances: (() => {
      const out: Array<{ room: number; ids: number[] }> = [];
      for (let r = roomId - 8; r <= roomId + 8; r++) {
        const ids: number[] = [];
        for (let id = 0; id < (rooms?.length ?? 0); id++) if (rooms?.[id] === r) ids.push(id);
        if (ids.length > 0) out.push({ room: r, ids });
      }
      return out;
    })(),
    scrolls: {
      boundaries: wasmGetRoomWalkBoundariesFor(roomId).map((b) => ({ row: b.row, col: b.col, destRoom: b.destRoom })),
      stairs: wasmGetRoomStairInfoFor(roomId).map((s) => ({ row: s.row, col: s.col, destRoom: s.destRoom })),
    },
    edgeOpen: { north: edgeOpenCount(roomId,'north'), south: edgeOpenCount(roomId,'south'), east: edgeOpenCount(roomId,'east'), west: edgeOpenCount(roomId,'west') },
    anchors: run ? floodAnchorReport(roomId, run) : undefined,
    reachable: detected?.flood.reachableCount ?? 0,
    bbox: run ? (() => {
      let minRow = 99, maxRow = -1, minCol = 99, maxCol = -1;
      for (let r = 0; r < 64; r++) {
        for (let c = 0; c < 64; c++) {
          if ((run.result.reachable[r]?.[c] ?? 0) <= 0) continue;
          if (r < minRow) minRow = r;
          if (r > maxRow) maxRow = r;
          if (c < minCol) minCol = c;
          if (c > maxCol) maxCol = c;
        }
      }
      return { minRow, maxRow, minCol, maxCol };
    })() : undefined,
    threat: probeRoomThreat(roomId, run),
  };
};

export { probeRoom };
export type { RoomProbe };
