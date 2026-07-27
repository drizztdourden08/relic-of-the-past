/* @layer bridge-wasm @kind logic */
/** Room layout shape + dungeon map position. */
import { callPtr } from './wasm-call';
import type { RoomSectionSplit } from '@shared/game/simulation';

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

const wasmGetRoomLayoutInfo = (): RoomLayoutInfo | null =>
  callPtr('WasmGetRoomLayoutInfo', (mod, ptr) => {
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
  });

/**
 * Which axes of the current room are actively split into scrolling sections,
 * plus which section the player currently stands in.
 *
 * `intraEdges` only carries an edge when the room's own quadrant flags say that
 * axis isn't merged, so seeing an east/west entry means the room is split in X
 * and a north/south entry means it's split in Y — regardless of which quadrant
 * the player currently occupies within that split. The player's own section
 * comes straight from the game's live quadrant read (`quadrantX`/`quadrantY`),
 * not re-derived from a pixel position.
 */
const roomSectionSplitFrom = (info: RoomLayoutInfo | null): RoomSectionSplit => ({
  splitX: !!info?.intraEdges.some((edge) => edge === 'east' || edge === 'west'),
  splitY: !!info?.intraEdges.some((edge) => edge === 'north' || edge === 'south'),
  playerSectionX: info?.quadrantX === 1 ? 1 : 0,
  playerSectionY: info?.quadrantY === 2 ? 1 : 0,
});

const floorRawToLabel = (raw: number): string => {
  if (raw === 0) return '1F';
  if (raw < 128) return `${raw + 1}F`;
  // Negative floors (stored as unsigned): 0xFF = -1 = B1, 0xFE = -2 = B2, etc.
  const basement = 256 - raw;
  return `B${basement}`;
};

const wasmGetDungeonMapPosition = (): DungeonMapPosition | null =>
  callPtr('WasmGetDungeonMapPosition', (mod, ptr) => {
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
  });

export { wasmGetRoomLayoutInfo, wasmGetDungeonMapPosition, roomSectionSplitFrom };
export type { RoomLayoutInfo, DungeonMapPosition };
