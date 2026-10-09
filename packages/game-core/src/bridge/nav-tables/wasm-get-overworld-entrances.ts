/* @layer bridge-wasm @kind logic */
import { readU8, decodeTable, readU16 } from '../wasm-call';
import type { OverworldEntrance } from './nav-tables.type';

const wasmGetOverworldEntrances = (): OverworldEntrance[] =>
  decodeTable('WasmGetOverworldEntrances', { countBytes: 2, dataStart: 2, stride: 5 }, (heap, o) => ({
    area: readU16(heap, o),
    pos: readU16(heap, o + 2),
    id: readU8(heap, o + 4),
  }));

export { wasmGetOverworldEntrances };
