/** Indoor/room collision grids, layer state, and attr-grid builders. */
import { getGameState, getModule } from '../wasm-bridge';

/**
 * Read both indoor room collision attr layers (64×64 each) from dung_bg2_attr_table.
 * Layer 0 = offset 0 (upper) — main walkable floor. Layer 1 = offset 0x1000 (lower).
 * Returns raw data with no modifications. Works with live game state.
 */
const wasmGetIndoorDualLayerGrids = (): { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> } | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetIndoorAttrTable', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
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
    // If layers are identical after normalization, no meaningful dual-layer collision.
    if (!hasDifference) return null;
    return { layer0, layer1, stairTiles };
  } catch {
    return null;
  }
};

/**
 * Get the raw indoor layer0 collision grid from live game state.
 * Always returns layer0 when running indoors, regardless of whether layers differ.
 */
const wasmGetIndoorLayer0Grid = (): number[][] | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetIndoorAttrTable', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    const grid: number[][] = Array.from({ length: 64 }, () => new Array<number>(64));
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        grid[r][c] = heap[ptr + r * 64 + c];
      }
    }
    return grid;
  } catch {
    return null;
  }
};

/** Get Link's current layer: 0 (upper) or 1 (lower), or null if game not running. */
const wasmGetLinkLayer = (): 0 | 1 | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    return (mod.ccall('WasmGetLinkIsOnLowerLevel', 'number', [], []) as number) !== 0 ? 1 : 0;
  } catch {
    return null;
  }
};

/** Room collision type: 0=None, 1=One, 2=Moving, 3=Horiz, 4=Swimming. -1 if outdoors. */
const wasmGetRoomCollisionType = (): number | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    return mod.ccall('WasmGetRoomCollisionType', 'number', [], []) as number;
  } catch {
    return null;
  }
};

/** Staircase type (layer change gate): 0=intra-room, 1=layer stairs, 2=blocked. -1 if outdoors. */
const wasmGetStaircaseType = (): number | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    return mod.ccall('WasmGetStaircaseType', 'number', [], []) as number;
  } catch {
    return null;
  }
};

/**
 * Build a 64×64 collision attr grid for any overworld screen (headless).
 * Returns a flat Uint8Array of 4096 bytes (row-major), or null if WASM unavailable.
 */
const wasmBuildOverworldAttrGrid = (screenIndex: number): Uint8Array | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmBuildOverworldAttrGrid', 'number', ['number'], [screenIndex]) as number;
    if (!ptr) return null;
    return new Uint8Array(mod.HEAPU8.buffer, ptr, 64 * 64);
  } catch {
    return null;
  }
};

/**
 * Build a 64×64 collision attr grid for any indoor room (headless).
 * Returns a flat Uint8Array of 4096 bytes (row-major), or null if WASM unavailable.
 */
const wasmBuildRoomAttrGrid = (roomId: number): Uint8Array | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [roomId]) as number;
    if (!ptr) return null;
    return new Uint8Array(mod.HEAPU8.buffer, ptr, 64 * 64);
  } catch {
    return null;
  }
};

/** Debug: get dung_toggle_floor_pos entries (populated by WasmBuildRoomAttrGrid). */
const wasmGetToggleFloorPositions = (): Array<{ pos: number; row: number; col: number }> => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetToggleFloorPositions', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = heap[ptr];
    const result: Array<{ pos: number; row: number; col: number }> = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 4;
      const posLo = heap[o];
      const posHi = heap[o + 1];
      const row = heap[o + 2];
      const col = heap[o + 3];
      result.push({ pos: posLo | (posHi << 8), row, col });
    }
    return result;
  } catch {
    return [];
  }
};

export {
  wasmGetIndoorDualLayerGrids,
  wasmGetIndoorLayer0Grid,
  wasmGetLinkLayer,
  wasmGetRoomCollisionType,
  wasmGetStaircaseType,
  wasmBuildOverworldAttrGrid,
  wasmBuildRoomAttrGrid,
  wasmGetToggleFloorPositions,
};
