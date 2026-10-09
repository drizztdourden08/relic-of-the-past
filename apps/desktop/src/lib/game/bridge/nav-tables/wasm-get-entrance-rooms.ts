/* @layer bridge-wasm @kind logic */
import { callPtr, decodeCountPrefixed, readU16 } from '../wasm-call';

const wasmGetEntranceRooms = (): Uint16Array | null =>
  callPtr('WasmGetEntranceRooms', (mod, ptr) => {
    const rows = decodeCountPrefixed(mod, ptr, { countBytes: 2, dataStart: 2, stride: 2 }, (heap, o) => readU16(heap, o));
    return Uint16Array.from(rows);
  });

export { wasmGetEntranceRooms };
