/* @layer bridge-wasm @kind logic */
/** Live sprites + dynamic/static navigation blockers. */
import { getGameState, getModule } from '../wasm-bridge';

interface LiveSpriteInfo {
  slot: number;
  type: number;
  state: number;
  subtype: number;
  subtype2: number;
  e: number;
  x: number;
  y: number;
}

/** Get active Uncle sprite blocker coordinates for indoor early-game variants. */
const wasmGetIndoorUncleBlockers = (): Array<{ x: number; y: number }> => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetIndoorUncleBlockers', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 2);
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 1 + i * 4;
      const x = heap[o + 0] | (heap[o + 1] << 8);
      const y = heap[o + 2] | (heap[o + 3] << 8);
      out.push({ x, y });
    }
    return out;
  } catch {
    return [];
  }
};

/** Get live dynamic blocker coordinates used by navigation flood fill. */
const wasmGetNavigationBlockers = (): Array<{ x: number; y: number }> => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetNavigationBlockers', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 16);
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 1 + i * 4;
      const x = heap[o + 0] | (heap[o + 1] << 8);
      const y = heap[o + 2] | (heap[o + 3] << 8);
      out.push({ x, y });
    }
    return out;
  } catch {
    return [];
  }
};

/** Read all currently active live sprites with debug metadata. */
const wasmGetLiveSprites = (): LiveSpriteInfo[] => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetLiveSprites', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 16);
    const out: LiveSpriteInfo[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 1 + i * 10;
      out.push({
        slot: heap[o + 0],
        type: heap[o + 1],
        state: heap[o + 2],
        subtype: heap[o + 3],
        subtype2: heap[o + 4],
        e: heap[o + 5],
        x: heap[o + 6] | (heap[o + 7] << 8),
        y: heap[o + 8] | (heap[o + 9] << 8),
      });
    }
    return out;
  } catch {
    return [];
  }
};

/**
 * Read static overworld tutorial guard spawn positions (0x3F/0x40) for the
 * current area, independent of camera proximity loading.
 */
const wasmGetOverworldGuardSpawns = (): Array<{ x: number; y: number }> => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetOverworldGuardSpawns', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 16);
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 1 + i * 4;
      const x = heap[o + 0] | (heap[o + 1] << 8);
      const y = heap[o + 2] | (heap[o + 3] << 8);
      out.push({ x, y });
    }
    return out;
  } catch {
    return [];
  }
};

export { wasmGetIndoorUncleBlockers, wasmGetNavigationBlockers, wasmGetLiveSprites, wasmGetOverworldGuardSpawns };
export type { LiveSpriteInfo };
