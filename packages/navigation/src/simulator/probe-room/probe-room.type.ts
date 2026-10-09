/* @layer bridge-wasm @kind types */
import type { RoomThreatProbe } from '../probe-room-threat.type';

interface EntranceRow {
  id: number; rawArea: number; rawPos: number; tableIndex: number;
  spawnX?: number; spawnY?: number;
  enrichedArea?: number; gridRow?: number; gridCol?: number;
  areaHead?: number;
}

interface ReachBox { minRow: number; maxRow: number; minCol: number; maxCol: number }

interface RoomProbe {
  roomId: number;
  exitScreen?: number;
  entranceIds: number[];
  entranceRows: EntranceRow[];
  fallHoleIds: number[];
  seeds: Array<{ id: number; row: number; col: number; dest: number; reached: boolean }>;
  transitions: Array<{ idx: number; row: number; col: number; usable: boolean; inOwTable: boolean }>;
  exits: Array<{ to: string; steps?: number }>;
  reachable: number;
  gridBuilt: { raw: boolean; dual: boolean };
  chests: Array<{ index: number; row: number; col: number; opened: boolean; big: boolean; touchable: boolean; itemId?: number }>;
  doors: Array<{ index: number; kind: string; nativeType?: number; dir: string; row: number; col: number; opened: boolean }>;
  sprites: Array<{ type: string; row: number; col: number; kind: string; carriesKey?: boolean; carriesBigKey?: boolean }>;
  attrRows: Array<{ row: number; raw: string; l0: string; l1: string; reached: string }>;
  map: string[];
  entranceTable: { size: number; rooms: string };
  neighbourEntrances: Array<{ room: number; ids: number[] }>;
  edgeOpen: { north: number; south: number; east: number; west: number };
  anchors?: { total: number; hits: string[]; missed: string[] };
  scrolls: { boundaries: Array<{ row: number; col: number; destRoom: number }>; stairs: Array<{ row: number; col: number; destRoom: number }> };
  bbox?: ReachBox;
  threat: RoomThreatProbe;
}

export type { RoomProbe, EntranceRow, ReachBox };
