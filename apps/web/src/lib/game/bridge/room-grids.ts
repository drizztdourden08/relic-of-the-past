/* @layer bridge-wasm @kind logic */
/** Indoor/room collision grids, layer state, and attr-grid builders. */
import { callPtr, callWhenRunning, decodeTable, readU16 } from './wasm-call';

/**
 * Read both indoor room collision attr layers (64×64 each) from dung_bg2_attr_table.
 * Layer 0 = offset 0 (upper) — main walkable floor. Layer 1 = offset 0x1000 (lower).
 * Returns raw data with no modifications. Works with live game state.
 */
type DualLayerGrids = { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> };

/** Decode a 0x2000-byte attr table ([BG2 at +0][BG1 at +0x1000]) into both layers.
 *  Returns null when the layers are identical (no meaningful dual-layer collision). */
const decodeDualLayers = (heap: Uint8Array, ptr: number): DualLayerGrids | null => {
  const layer0: number[][] = Array.from({ length: 64 }, () => new Array<number>(64));
  const layer1: number[][] = Array.from({ length: 64 }, () => new Array<number>(64));
  const stairTiles: Array<{ row: number; col: number }> = [];
  let hasDifference = false;
  for (let r = 0; r < 64; r++) {
    const row0 = ptr + r * 64;
    const row1 = ptr + 0x1000 + r * 64;
    for (let c = 0; c < 64; c++) {
      let a0 = heap[row0 + c];
      let a1 = heap[row1 + c];
      // Record upper-floor stair positions (raw 0x1C on BG1/layer1) before normalization.
      if (a1 === 0x1C) {
        stairTiles.push({ row: r, col: c });
      }
      // 0x1C is a filler/stair-detection value; normalize it away by copying the other layer.
      if (a0 === 0x1C && a1 !== 0x1C) a0 = a1;
      if (a1 === 0x1C && a0 !== 0x1C) a1 = a0;
      layer0[r][c] = a0;
      layer1[r][c] = a1;
      if (a0 !== a1) hasDifference = true;
    }
  }
  if (!hasDifference) return null;
  return { layer0, layer1, stairTiles };
};

const wasmGetIndoorDualLayerGrids = (): DualLayerGrids | null =>
  callPtr('WasmGetIndoorAttrTable', (mod, ptr) => decodeDualLayers(mod.HEAPU8, ptr));

/**
 * Build BOTH collision layers for any indoor room (headless, room-addressable).
 * Castle basements and other split-level rooms keep their walkable floor on
 * BG1 (lower layer, table offset +0x1000) — a BG2-only flood renders them as
 * solid wall. Null when the layers are identical.
 */
const wasmBuildRoomDualLayerGrids = (roomId: number): DualLayerGrids | null =>
  callPtr('WasmBuildRoomAttrGrid', (mod, ptr) => decodeDualLayers(mod.HEAPU8, ptr), { argTypes: ['number'], args: [roomId] });

/**
 * Get the raw indoor layer0 collision grid from live game state.
 * Always returns layer0 when running indoors, regardless of whether layers differ.
 */
const wasmGetIndoorLayer0Grid = (): number[][] | null =>
  callPtr('WasmGetIndoorAttrTable', (mod, ptr) => {
    const heap = mod.HEAPU8;
    const grid: number[][] = Array.from({ length: 64 }, () => new Array<number>(64));
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        grid[r][c] = heap[ptr + r * 64 + c];
      }
    }
    return grid;
  });

/** Get the player's current layer: 0 (upper) or 1 (lower), or null if game not running. */
const wasmGetLinkLayer = (): 0 | 1 | null =>
  callWhenRunning<0 | 1 | null>(null, (mod) => ((mod.ccall('WasmGetLinkIsOnLowerLevel', 'number', [], []) as number) !== 0 ? 1 : 0));

/** Room collision type: 0=None, 1=One, 2=Moving, 3=Horiz, 4=Swimming. -1 if outdoors. */
const wasmGetRoomCollisionType = (): number | null =>
  callWhenRunning<number | null>(null, (mod) => mod.ccall('WasmGetRoomCollisionType', 'number', [], []) as number);

/** Staircase type (layer change gate): 0=intra-room, 1=layer stairs, 2=blocked. -1 if outdoors. */
const wasmGetStaircaseType = (): number | null =>
  callWhenRunning<number | null>(null, (mod) => mod.ccall('WasmGetStaircaseType', 'number', [], []) as number);

/**
 * Build a 64×64 collision attr grid for any overworld screen (headless).
 * Returns a flat Uint8Array of 4096 bytes (row-major), or null if WASM unavailable.
 */
const wasmBuildOverworldAttrGrid = (screenIndex: number): Uint8Array | null =>
  callPtr('WasmBuildOverworldAttrGrid', (mod, ptr) => new Uint8Array(mod.HEAPU8.buffer, ptr, 64 * 64), { argTypes: ['number'], args: [screenIndex] });

/**
 * Build a 64×64 collision attr grid for any indoor room (headless).
 * Returns a flat Uint8Array of 4096 bytes (row-major), or null if WASM unavailable.
 */
const wasmBuildRoomAttrGrid = (roomId: number): Uint8Array | null =>
  callPtr('WasmBuildRoomAttrGrid', (mod, ptr) => new Uint8Array(mod.HEAPU8.buffer, ptr, 64 * 64), { argTypes: ['number'], args: [roomId] });

/** Debug: get dung_toggle_floor_pos entries (populated by WasmBuildRoomAttrGrid). */
const wasmGetToggleFloorPositions = (): Array<{ pos: number; row: number; col: number }> =>
  decodeTable('WasmGetToggleFloorPositions', { countBytes: 1, dataStart: 2, stride: 4 }, (heap, o) => ({
    pos: readU16(heap, o),
    row: heap[o + 2],
    col: heap[o + 3],
  }));

/** Read a fixed-length, non-count-prefixed uint16 table starting at `ptr`. */
const readU16Table = (heap: Uint8Array, ptr: number, length: number): number[] =>
  Array.from({ length }, (_, i) => readU16(heap, ptr + i * 2));

/**
 * Replacement tile state for slots referenced by attrs 0x70-0x7F (low nibble = slot).
 * 16 entries; a value's `& 0xf0f0` identifies pot (0x1010), large block (0x2020),
 * hammer peg (0x4040), or bombable floor (0x3030). Zeroed (all-0) when outdoors.
 */
const wasmGetReplacementTileState = (): number[] | null =>
  callPtr('WasmGetReplacementTileState', (mod, ptr) => readU16Table(mod.HEAPU8, ptr, 16));

/**
 * Chest lock state for slots referenced by attrs 0x58-0x5D (slot = attr - 0x58).
 * 6 entries; `>= 0x8000` means the chest is locked. Zeroed (all-0) when outdoors.
 */
const wasmGetChestLocations = (): number[] | null =>
  callPtr('WasmGetChestLocations', (mod, ptr) => readU16Table(mod.HEAPU8, ptr, 6));

export {
  wasmGetIndoorDualLayerGrids,
  wasmBuildRoomDualLayerGrids,
  wasmGetIndoorLayer0Grid,
  wasmGetLinkLayer,
  wasmGetRoomCollisionType,
  wasmGetStaircaseType,
  wasmBuildOverworldAttrGrid,
  wasmBuildRoomAttrGrid,
  wasmGetToggleFloorPositions,
  wasmGetReplacementTileState,
  wasmGetChestLocations,
};
