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
import { wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetFallHoles, wasmGetOverworldEntrances, wasmGetEntranceSpawns, wasmGetAreaHeads } from '../';
import { roomEntrances, getScreenGrids } from '../flood';
import { enrichEntrances } from '@domains/widgets/navigation/widget-helpers';
import { usableEntranceTransition } from '@shared/game/navigation';
import { detectRoom } from './room-exits';
import { floodRoomRun } from './flood-room';

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
  /** Bounding box of the reached region — shows where the flood actually is. */
  bbox?: { minRow: number; maxRow: number; minCol: number; maxCol: number };
}

const probeRoom = (roomId: number, entryTile?: { row: number; col: number }): RoomProbe => {
  const rooms = wasmGetEntranceRooms();
  const entranceIds: number[] = [];
  for (let id = 0; id < (rooms?.length ?? 0); id++) if (rooms?.[id] === roomId) entranceIds.push(id);
  const holeIds = new Set(wasmGetFallHoles().map((h) => h.entranceId));
  const run = floodRoomRun(roomId, ['lift.1'], entryTile);
  const detected = detectRoom(roomId, ['lift.1'], entryTile);
  const owIds = new Set(enrichEntrances().map((e) => e.id));
  const transitions = (run?.result.transitions ?? [])
    .filter((t) => t.edge === 'entrance' && t.entranceIdx != null)
    .map((t) => ({
      idx: t.entranceIdx as number,
      row: t.row,
      col: t.col,
      usable: run ? usableEntranceTransition(run.result, t, ['lift.1']) : false,
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
  };
};

export { probeRoom };
export type { RoomProbe };
