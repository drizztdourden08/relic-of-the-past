/* @layer bridge-wasm @kind logic */
/** Room layout shape + dungeon map position. */
import { getGameState, getModule } from '../wasm-bridge';

interface RoomLayoutInfo {
  layout: number;
  shape: '2x2' | '2x1' | '1x2' | '1x1';
  quadrantFullsizeX: number;
  quadrantFullsizeY: number;
  quadrantX: number;
  quadrantY: number;
  /** Which edges of the current quadrant are intra-room boundaries (not room-to-room). */
  intraEdges: ('north' | 'south' | 'east' | 'west')[];
}

interface DungeonMapPosition {
  mapCol: number;
  mapRow: number;
  /** Raw floor value: 0=1F, 1=2F, 0xFF=B1, 0xFE=B2, etc. */
  floorRaw: number;
  /** Human-readable floor label */
  floorLabel: string;
  numAboveFloors: number;
  numBasementFloors: number;
  found: boolean;
  /** Effective room width in map cells (bounding box of all cells containing this room) */
  effectiveWidth: number;
  /** Effective room height in map cells */
  effectiveHeight: number;
  /** Effective layout as WxH string */
  effectiveLayout: string;
}

const LAYOUT_SHAPES: Array<'2x2' | '2x1' | '1x2' | '1x1'> = ['2x2', '2x2', '2x1', '2x1', '1x2', '1x2', '1x1', '1x1'];

const wasmGetRoomLayoutInfo = (): RoomLayoutInfo | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetRoomLayoutInfo', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    const layout = heap[ptr];
    const qfx = heap[ptr + 1];
    const qfy = heap[ptr + 2];
    const qx = heap[ptr + 3];
    const qy = heap[ptr + 4];
    const shape = LAYOUT_SHAPES[layout] ?? '1x1';

    // Which edges are intra-room boundaries for the current quadrant.
    const intraEdges: ('north' | 'south' | 'east' | 'west')[] = [];
    if (shape === '2x2' || shape === '1x2') {
      if (qfy === 0) { // not merged by blastwall
        if (qy === 0) intraEdges.push('south');
        if (qy === 2) intraEdges.push('north');
      }
    }
    if (shape === '2x2' || shape === '2x1') {
      if (qfx === 0) { // not merged by blastwall
        if (qx === 0) intraEdges.push('east');
        if (qx === 1) intraEdges.push('west');
      }
    }

    return { layout, shape, quadrantFullsizeX: qfx, quadrantFullsizeY: qfy, quadrantX: qx, quadrantY: qy, intraEdges };
  } catch {
    return null;
  }
};

const floorRawToLabel = (raw: number): string => {
  if (raw === 0) return '1F';
  if (raw < 128) return `${raw + 1}F`;
  // Negative floors (stored as unsigned): 0xFF = -1 = B1, 0xFE = -2 = B2, etc.
  const basement = 256 - raw;
  return `B${basement}`;
};

const wasmGetDungeonMapPosition = (): DungeonMapPosition | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetDungeonMapPosition', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    const mapCol = heap[ptr];
    const mapRow = heap[ptr + 1];
    const floorRaw = heap[ptr + 2];
    const numAbove = heap[ptr + 3];
    const numBasement = heap[ptr + 4];
    const found = heap[ptr + 5] !== 0;
    const effectiveWidth = heap[ptr + 6] || 1;
    const effectiveHeight = heap[ptr + 7] || 1;
    return {
      mapCol, mapRow, floorRaw,
      floorLabel: floorRawToLabel(floorRaw),
      numAboveFloors: numAbove,
      numBasementFloors: numBasement,
      found,
      effectiveWidth,
      effectiveHeight,
      effectiveLayout: `${effectiveWidth}×${effectiveHeight}`,
    };
  } catch {
    return null;
  }
};

export { wasmGetRoomLayoutInfo, wasmGetDungeonMapPosition };
export type { RoomLayoutInfo, DungeonMapPosition };
