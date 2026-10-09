/* @layer bridge-wasm @kind logic */
import { callPtr, decodeCountPrefixed, readU16 } from '../wasm-call';
import { STARTING_BG_SHIFT } from './nav-tables.constants';
import type { EntranceSpawn } from './nav-tables.type';

const wasmGetEntranceSpawns = (): Array<EntranceSpawn> | null =>
  callPtr('WasmGetEntranceSpawns', (mod, ptr) =>
    decodeCountPrefixed(mod, ptr, { countBytes: 2, dataStart: 2, stride: 5 }, (heap, o) => ({
      x: readU16(heap, o),
      y: readU16(heap, o + 2),
      startingLayer: heap[o + 4] >> STARTING_BG_SHIFT,
    })),
  );

export { wasmGetEntranceSpawns };
