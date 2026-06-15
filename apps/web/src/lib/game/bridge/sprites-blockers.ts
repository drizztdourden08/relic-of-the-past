/* @layer bridge-wasm @kind logic */
/** Live sprites + dynamic/static navigation blockers. */
import { decodeTable, readU16 } from './wasm-call';

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

type Point = { x: number; y: number };

const decodePoint = (heap: Uint8Array, o: number): Point => ({ x: readU16(heap, o), y: readU16(heap, o + 2) });

/** Get active Uncle sprite blocker coordinates for indoor early-game variants. */
const wasmGetIndoorUncleBlockers = (): Point[] =>
  decodeTable('WasmGetIndoorUncleBlockers', { countBytes: 1, dataStart: 1, stride: 4, maxCount: 2 }, decodePoint);

/** Get live dynamic blocker coordinates used by navigation flood fill. */
const wasmGetNavigationBlockers = (): Point[] =>
  decodeTable('WasmGetNavigationBlockers', { countBytes: 1, dataStart: 1, stride: 4, maxCount: 16 }, decodePoint);

/** Read all currently active live sprites with debug metadata. */
const wasmGetLiveSprites = (): LiveSpriteInfo[] =>
  decodeTable('WasmGetLiveSprites', { countBytes: 1, dataStart: 1, stride: 10, maxCount: 16 }, (heap, o) => ({
    slot: heap[o + 0],
    type: heap[o + 1],
    state: heap[o + 2],
    subtype: heap[o + 3],
    subtype2: heap[o + 4],
    e: heap[o + 5],
    x: readU16(heap, o + 6),
    y: readU16(heap, o + 8),
  }));

/**
 * Read static overworld tutorial guard spawn positions (0x3F/0x40) for the
 * current area, independent of camera proximity loading.
 */
const wasmGetOverworldGuardSpawns = (): Point[] =>
  decodeTable('WasmGetOverworldGuardSpawns', { countBytes: 1, dataStart: 1, stride: 4, maxCount: 16 }, decodePoint);

export { wasmGetIndoorUncleBlockers, wasmGetNavigationBlockers, wasmGetLiveSprites, wasmGetOverworldGuardSpawns };
export type { LiveSpriteInfo };
