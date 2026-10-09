/* @layer bridge-wasm @kind logic */
import { readU8, decodeTable, readU16 } from '../wasm-call';
import type { ToggleFloorPosition } from './room-grids.type';

const wasmGetToggleFloorPositions = (): Array<ToggleFloorPosition> =>
  decodeTable('WasmGetToggleFloorPositions', { countBytes: 1, dataStart: 2, stride: 4 }, (heap, o) => ({
    pos: readU16(heap, o),
    row: readU8(heap, o + 2),
    col: readU8(heap, o + 3),
  }));

export { wasmGetToggleFloorPositions };
