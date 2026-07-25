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
  /** Attr page the stair tile sits on (0 = BG2, 1 = BG1) — arrival layer. */
  layer: 0 | 1;
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

const decodeStairs = (heap: Uint8Array, o: number): RoomStairInfo => ({
  destRoom: heap[o + 0],
  row: heap[o + 1],
  col: heap[o + 2],
  direction: (heap[o + 3] & 4) !== 0 ? 'down' : 'up',
  /** Attr page the stair tile sits on — taking it lands Link on that layer. */
  layer: (heap[o + 3] & 1) as 0 | 1,
});

const wasmGetRoomStairInfo = (): RoomStairInfo[] =>
  decodeTable('WasmGetRoomStairInfo', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 4 }, decodeStairs);

/** Room-addressable inter-room stairs — works for any room, not just the loaded
 *  one (rebuilds that room's attr table + header as a side effect). */
const wasmGetRoomStairInfoFor = (roomId: number): RoomStairInfo[] =>
  decodeTable('WasmGetRoomStairInfoFor', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 4 }, decodeStairs, { argTypes: ['number'], args: [roomId] });

const decodeWalkBoundary = (heap: Uint8Array, o: number): RoomWalkBoundary => ({
  destRoom: readU16(heap, o),
  row: heap[o + 2],
  col: heap[o + 3],
});

/** Get inter-room walk-through boundaries (palace toggles like Castle→Sewer). */
const wasmGetRoomWalkBoundaries = (): RoomWalkBoundary[] =>
  decodeTable('WasmGetRoomWalkBoundaries', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 4 }, decodeWalkBoundary);

/** Room-addressable walk-through boundaries — any room, not just the loaded one. */
const wasmGetRoomWalkBoundariesFor = (roomId: number): RoomWalkBoundary[] =>
  decodeTable('WasmGetRoomWalkBoundariesFor', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 4 }, decodeWalkBoundary, { argTypes: ['number'], args: [roomId] });

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

/** Room-addressable header TAG bytes ([tag1, tag2]) — scripted room effects. */
const wasmGetRoomTagsFor = (roomId: number): [number, number] =>
  callPtr('WasmGetRoomTagsFor', (mod, ptr) => [mod.HEAPU8[ptr], mod.HEAPU8[ptr + 1]] as [number, number],
    { argTypes: ['number'], args: [roomId] }) ?? [0, 0];

/** Room-addressable travel destinations — any room, not just the loaded one. */
const wasmGetRoomTravelDestinationsFor = (roomId: number): number[] | null =>
  callPtr('WasmGetRoomTravelDestinationsFor', (mod, ptr) => {
    const heap = mod.HEAPU8;
    return [heap[ptr], heap[ptr + 1], heap[ptr + 2], heap[ptr + 3], heap[ptr + 4]];
  }, { argTypes: ['number'], args: [roomId] });

export {
  wasmGetRoomDoorBoundaryTiles,
  wasmGetRoomStairInfo,
  wasmGetRoomStairInfoFor,
  wasmGetRoomWalkBoundaries,
  wasmGetRoomWalkBoundariesFor,
  wasmGetRoomExitDoors,
  wasmGetRoomTravelDestinations,
  wasmGetRoomTravelDestinationsFor,
  wasmGetRoomTagsFor,
};
export type { DoorBoundaryTile, RoomStairInfo, RoomWalkBoundary, RoomExitDoor };
