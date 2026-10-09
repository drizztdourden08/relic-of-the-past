/* @layer bridge-wasm @kind logic */
import { decodeTable, readU16 } from '../wasm-call';
import type { LiveSpriteInfo } from './sprites-blockers.type';

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

export { wasmGetLiveSprites };
