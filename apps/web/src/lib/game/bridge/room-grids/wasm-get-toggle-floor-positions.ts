/* @layer bridge-wasm @kind logic */
import { decodeTable, readU16 } from '../wasm-call';
import type { ToggleFloorPosition } from './room-grids.type';

const wasmGetToggleFloorPositions = (): Array<ToggleFloorPosition> =>
  decodeTable('WasmGetToggleFloorPositions', { countBytes: 1, dataStart: 2, stride: 4 }, (heap, o) => ({
    pos: readU16(heap, o),
    row: heap[o + 2],
    col: heap[o + 3],
  }));

export { wasmGetToggleFloorPositions };
