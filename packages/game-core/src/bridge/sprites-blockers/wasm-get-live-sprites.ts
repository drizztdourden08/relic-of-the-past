/* @layer bridge-wasm @kind logic */
import { readU8, decodeTable, readU16 } from '../wasm-call';
import type { LiveSpriteInfo } from './sprites-blockers.type';

const wasmGetLiveSprites = (): LiveSpriteInfo[] =>
  decodeTable('WasmGetLiveSprites', { countBytes: 1, dataStart: 1, stride: 10, maxCount: 16 }, (heap, o) => ({
    slot: readU8(heap, o + 0),
    type: readU8(heap, o + 1),
    state: readU8(heap, o + 2),
    subtype: readU8(heap, o + 3),
    subtype2: readU8(heap, o + 4),
    e: readU8(heap, o + 5),
    x: readU16(heap, o + 6),
    y: readU16(heap, o + 8),
  }));

export { wasmGetLiveSprites };
