/* @layer bridge-wasm @kind logic */
import { readU8, callPtr } from '../wasm-call';
import { ROOM_TILES } from './room-grids.constants';

const wasmGetIndoorLayer0Grid = (): number[][] | null =>
  callPtr('WasmGetIndoorAttrTable', (mod, ptr) => {
    const heap = mod.HEAPU8;
    return Array.from({ length: ROOM_TILES }, (_row, r) =>
      Array.from({ length: ROOM_TILES }, (_cell, c) => readU8(heap, ptr + r * ROOM_TILES + c)));
  });

export { wasmGetIndoorLayer0Grid };
