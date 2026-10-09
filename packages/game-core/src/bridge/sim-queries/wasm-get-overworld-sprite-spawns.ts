/* @layer bridge-wasm @kind logic */
import { readU8, decodeGatedTable } from '../wasm-call';
import { roomArg } from './room-arg';
import type { SimSpriteRaw } from './sim-queries.type';

const wasmGetOverworldSpriteSpawns = (screenIndex: number): SimSpriteRaw[] | null =>
  decodeGatedTable('WasmGetOverworldSpriteSpawns', { countBytes: 1, dataStart: 2, stride: 3, maxCount: 48 }, (heap, o) => ({
    spriteType: readU8(heap, o + 0),
    col: readU8(heap, o + 1),
    row: readU8(heap, o + 2),
    carriesKey: false,
    carriesBigKey: false,
    floor: 0,
  }), roomArg(screenIndex));

export { wasmGetOverworldSpriteSpawns };
