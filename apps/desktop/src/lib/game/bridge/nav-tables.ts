/* @layer bridge-wasm @kind logic */
/** Navigation table bridges — entrances, fall holes, exit map, area heads, rooms/spawns. */
import { getGameState, getModule } from '../wasm-bridge';

interface OverworldEntrance {
  area: number;
  pos: number;
  id: number;
}

interface FallHole {
  area: number;
  pos: number;
  entranceId: number;
}

/** Get all overworld entrance positions from the game tables. */
const wasmGetOverworldEntrances = (): OverworldEntrance[] => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetOverworldEntrances', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = heap[ptr] | (heap[ptr + 1] << 8);
    const out: OverworldEntrance[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 5;
      out.push({
        area: heap[o] | (heap[o + 1] << 8),
        pos: heap[o + 2] | (heap[o + 3] << 8),
        id: heap[o + 4],
      });
    }
    return out;
  } catch {
    return [];
  }
};

/** Get all fall hole positions from the game tables. */
const wasmGetFallHoles = (): FallHole[] => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetFallHoles', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = heap[ptr] | (heap[ptr + 1] << 8);
    const out: FallHole[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 5;
      out.push({
        area: heap[o] | (heap[o + 1] << 8),
        pos: heap[o + 2] | (heap[o + 3] << 8),
        entranceId: heap[o + 4],
      });
    }
    return out;
  } catch {
    return [];
  }
};

/** Get exit-to-screen mapping: indoor room → overworld screen index. */
const wasmGetExitScreenMap = (): Map<number, number> => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return new Map();
  try {
    const ptr = mod.ccall('WasmGetExitScreenMap', 'number', [], []) as number;
    if (!ptr) return new Map();
    const heap = mod.HEAPU8;
    const count = heap[ptr] | (heap[ptr + 1] << 8);
    const map = new Map<number, number>();
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 3;
      const room = heap[o] | (heap[o + 1] << 8);
      const screen = heap[o + 2];
      map.set(room, screen);
    }
    return map;
  } catch {
    return new Map();
  }
};

/** Get the 64-entry area heads table (big screen grouping). */
const wasmGetAreaHeads = (): Uint8Array | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetAreaHeads', 'number', [], []) as number;
    if (!ptr) return null;
    return new Uint8Array(mod.HEAPU8.buffer, ptr, 64);
  } catch {
    return null;
  }
};

/** Get entrance ID → room ID mapping from the game tables. */
const wasmGetEntranceRooms = (): Uint16Array | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetEntranceRooms', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    const count = heap[ptr] | (heap[ptr + 1] << 8);
    const out = new Uint16Array(count);
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 2;
      out[i] = heap[o] | (heap[o + 1] << 8);
    }
    return out;
  } catch {
    return null;
  }
};

/** Get entrance spawn positions (playerX, playerY, startingBg) for all entrances. */
const wasmGetEntranceSpawns = (): Array<{ x: number; y: number; startingLayer: number }> | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetEntranceSpawns', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    const count = heap[ptr] | (heap[ptr + 1] << 8);
    const out: Array<{ x: number; y: number; startingLayer: number }> = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 5;
      out.push({
        x: heap[o] | (heap[o + 1] << 8),
        y: heap[o + 2] | (heap[o + 3] << 8),
        startingLayer: heap[o + 4] >> 4,
      });
    }
    return out;
  } catch {
    return null;
  }
};

export {
  wasmGetOverworldEntrances,
  wasmGetFallHoles,
  wasmGetExitScreenMap,
  wasmGetAreaHeads,
  wasmGetEntranceRooms,
  wasmGetEntranceSpawns,
};
export type { OverworldEntrance, FallHole };
