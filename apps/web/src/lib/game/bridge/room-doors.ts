/* @layer bridge-wasm @kind logic */
/** Room door/stair/walk/exit boundaries + travel destinations. */
import { callPtr, decodeTable, readU16 } from './wasm-call';

interface DoorBoundaryTile {
  direction: 'north' | 'south' | 'west' | 'east';
  col: number;
  row: number;
  doorType: number;
  isOpen: boolean;
}

interface RoomStairInfo {
  destRoom: number;
  row: number;
  col: number;
  direction: 'up' | 'down';
}

interface RoomWalkBoundary {
  destRoom: number;
  row: number;
  col: number;
}

interface RoomExitDoor {
  col: number;
  row: number;
  direction: 'north' | 'south' | 'west' | 'east';
}

const DIR_NAMES: Array<'north' | 'south' | 'west' | 'east'> = ['north', 'south', 'west', 'east'];

const wasmGetRoomDoorBoundaryTiles = (): DoorBoundaryTile[] =>
  decodeTable('WasmGetRoomDoorBoundaryTiles', { countBytes: 1, dataStart: 2, stride: 5, maxCount: 16 }, (heap, o) => ({
    direction: DIR_NAMES[heap[o]] ?? 'north',
    col: heap[o + 1],
    row: heap[o + 2],
    doorType: heap[o + 3],
    isOpen: heap[o + 4] !== 0,
  }));

const wasmGetRoomStairInfo = (): RoomStairInfo[] =>
  decodeTable('WasmGetRoomStairInfo', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 4 }, (heap, o) => ({
    destRoom: heap[o + 0],
    row: heap[o + 1],
    col: heap[o + 2],
    direction: heap[o + 3] ? 'down' : 'up',
  }));

/** Get inter-room walk-through boundaries (palace toggles like Castle→Sewer). */
const wasmGetRoomWalkBoundaries = (): RoomWalkBoundary[] =>
  decodeTable('WasmGetRoomWalkBoundaries', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 4 }, (heap, o) => ({
    destRoom: readU16(heap, o),
    row: heap[o + 2],
    col: heap[o + 3],
  }));

/** Get exit-to-overworld door positions for the current room. */
const wasmGetRoomExitDoors = (): RoomExitDoor[] =>
  decodeTable('WasmGetRoomExitDoors', { countBytes: 1, dataStart: 2, stride: 3, maxCount: 8 }, (heap, o) => ({
    col: heap[o + 0],
    row: heap[o + 1],
    direction: DIR_NAMES[heap[o + 2]] ?? 'south',
  }));

/** Get the 5 room travel destination bytes from the current room header. */
const wasmGetRoomTravelDestinations = (): number[] | null =>
  callPtr('WasmGetRoomTravelDestinations', (mod, ptr) => {
    const heap = mod.HEAPU8;
    return [heap[ptr], heap[ptr + 1], heap[ptr + 2], heap[ptr + 3], heap[ptr + 4]];
  });

export {
  wasmGetRoomDoorBoundaryTiles,
  wasmGetRoomStairInfo,
  wasmGetRoomWalkBoundaries,
  wasmGetRoomExitDoors,
  wasmGetRoomTravelDestinations,
};
export type { DoorBoundaryTile, RoomStairInfo, RoomWalkBoundary, RoomExitDoor };
