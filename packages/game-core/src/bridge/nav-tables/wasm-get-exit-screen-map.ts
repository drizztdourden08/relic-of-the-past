/* @layer bridge-wasm @kind logic */
import { callWhenRunning, decodeCountPrefixed, readU16 } from '../wasm-call';

const wasmGetExitScreenMap = (): Map<number, number> =>
  callWhenRunning(new Map<number, number>(), (mod) => {
    const ptr = mod.ccall('WasmGetExitScreenMap', 'number', [], []);
    if (!ptr) return new Map();
    const rows = decodeCountPrefixed(mod, ptr, { countBytes: 2, dataStart: 2, stride: 3 }, (heap, o) => [
      readU16(heap, o),
      heap[o + 2],
    ] as const);
    return new Map(rows);
  });

export { wasmGetExitScreenMap };
