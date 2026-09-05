/* @layer bridge-wasm @kind logic */
/** Navigation table bridges for entrances, fall holes, exit map, area heads, rooms/spawns. */
import { callPtr, callWhenRunning, decodeCountPrefixed, decodeTable, readU16 } from './wasm-call';

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
const wasmGetOverworldEntrances = (): OverworldEntrance[] =>
  decodeTable('WasmGetOverworldEntrances', { countBytes: 2, dataStart: 2, stride: 5 }, (heap, o) => ({
    area: readU16(heap, o),
    pos: readU16(heap, o + 2),
    id: heap[o + 4],
  }));

/** Get all fall hole positions from the game tables. */
const wasmGetFallHoles = (): FallHole[] =>
  decodeTable('WasmGetFallHoles', { countBytes: 2, dataStart: 2, stride: 5 }, (heap, o) => ({
    area: readU16(heap, o),
    pos: readU16(heap, o + 2),
    entranceId: heap[o + 4],
  }));

/** Get exit-to-screen mapping: indoor room → overworld screen index. */
const wasmGetExitScreenMap = (): Map<number, number> =>
  callWhenRunning(new Map<number, number>(), (mod) => {
    const ptr = mod.ccall('WasmGetExitScreenMap', 'number', [], []) as number;
    if (!ptr) return new Map();
    const rows = decodeCountPrefixed(mod, ptr, { countBytes: 2, dataStart: 2, stride: 3 }, (heap, o) => [
      readU16(heap, o),
      heap[o + 2],
    ] as const);
    return new Map(rows);
  });

/** Get the 64-entry area heads table (big screen grouping). */
const wasmGetAreaHeads = (): Uint8Array | null =>
  callPtr('WasmGetAreaHeads', (mod, ptr) => new Uint8Array(mod.HEAPU8.buffer, ptr, 64));

/** Get entrance ID → room ID mapping from the game tables. */
const wasmGetEntranceRooms = (): Uint16Array | null =>
  callPtr('WasmGetEntranceRooms', (mod, ptr) => {
    const rows = decodeCountPrefixed(mod, ptr, { countBytes: 2, dataStart: 2, stride: 2 }, (heap, o) => readU16(heap, o));
    return Uint16Array.from(rows);
  });

/** Get entrance spawn positions (playerX, playerY, startingBg) for all entrances. */
const wasmGetEntranceSpawns = (): Array<{ x: number; y: number; startingLayer: number }> | null =>
  callPtr('WasmGetEntranceSpawns', (mod, ptr) =>
    decodeCountPrefixed(mod, ptr, { countBytes: 2, dataStart: 2, stride: 5 }, (heap, o) => ({
      x: readU16(heap, o),
      y: readU16(heap, o + 2),
      startingLayer: heap[o + 4] >> 4,
    })),
  );

export {
  wasmGetOverworldEntrances,
  wasmGetFallHoles,
  wasmGetExitScreenMap,
  wasmGetAreaHeads,
  wasmGetEntranceRooms,
  wasmGetEntranceSpawns,
};
export type { OverworldEntrance, FallHole };
