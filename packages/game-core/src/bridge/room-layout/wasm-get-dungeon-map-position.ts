/* @layer bridge-wasm @kind logic */
import { readU8, callPtr } from '../wasm-call';
import { floorRawToLabel } from './floor-raw-to-label';
import type { DungeonMapPosition } from './room-layout.type';

const atLeastOne = (size: number | undefined): number => (size === undefined || size === 0 ? 1 : size);

const wasmGetDungeonMapPosition = (): DungeonMapPosition | null =>
  callPtr('WasmGetDungeonMapPosition', (mod, ptr) => {
    const heap = mod.HEAPU8;
    const mapCol = readU8(heap, ptr);
    const mapRow = readU8(heap, ptr + 1);
    const floorRaw = readU8(heap, ptr + 2);
    const numAbove = readU8(heap, ptr + 3);
    const numBasement = readU8(heap, ptr + 4);
    const found = heap[ptr + 5] !== 0;
    const effectiveWidth = atLeastOne(heap[ptr + 6]);
    const effectiveHeight = atLeastOne(heap[ptr + 7]);
    return {
      mapCol, mapRow, floorRaw,
      floorLabel: floorRawToLabel(floorRaw),
      numAboveFloors: numAbove,
      numBasementFloors: numBasement,
      found,
      effectiveWidth,
      effectiveHeight,
      effectiveLayout: `${effectiveWidth}×${effectiveHeight}`,
    };
  });

export { wasmGetDungeonMapPosition };
