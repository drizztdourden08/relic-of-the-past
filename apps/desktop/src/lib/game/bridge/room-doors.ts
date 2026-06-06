/** Room door/stair/walk/exit boundaries + travel destinations. */
import { getGameState, getModule } from '../wasm-bridge';

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

const wasmGetRoomDoorBoundaryTiles = (): DoorBoundaryTile[] => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetRoomDoorBoundaryTiles', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 16);
    const out: DoorBoundaryTile[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 5;
      out.push({
        direction: DIR_NAMES[heap[o]] ?? 'north',
        col: heap[o + 1],
        row: heap[o + 2],
        doorType: heap[o + 3],
        isOpen: heap[o + 4] !== 0,
      });
    }
    return out;
  } catch {
    return [];
  }
};

const wasmGetRoomStairInfo = (): RoomStairInfo[] => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetRoomStairInfo', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 4);
    const out: RoomStairInfo[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 4;
      out.push({
        destRoom: heap[o + 0],
        row: heap[o + 1],
        col: heap[o + 2],
        direction: heap[o + 3] ? 'down' : 'up',
      });
    }
    return out;
  } catch {
    return [];
  }
};

/** Get inter-room walk-through boundaries (palace toggles like Castle→Sewer). */
const wasmGetRoomWalkBoundaries = (): RoomWalkBoundary[] => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetRoomWalkBoundaries', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 4);
    const out: RoomWalkBoundary[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 4;
      out.push({
        destRoom: heap[o + 0] | (heap[o + 1] << 8),
        row: heap[o + 2],
        col: heap[o + 3],
      });
    }
    return out;
  } catch {
    return [];
  }
};

/** Get exit-to-overworld door positions for the current room. */
const wasmGetRoomExitDoors = (): RoomExitDoor[] => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetRoomExitDoors', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 8);
    const out: RoomExitDoor[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 3;
      out.push({
        col: heap[o + 0],
        row: heap[o + 1],
        direction: DIR_NAMES[heap[o + 2]] ?? 'south',
      });
    }
    return out;
  } catch {
    return [];
  }
};

/** Get the 5 room travel destination bytes from the current room header. */
const wasmGetRoomTravelDestinations = (): number[] | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetRoomTravelDestinations', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    return [heap[ptr], heap[ptr + 1], heap[ptr + 2], heap[ptr + 3], heap[ptr + 4]];
  } catch {
    return null;
  }
};

export {
  wasmGetRoomDoorBoundaryTiles,
  wasmGetRoomStairInfo,
  wasmGetRoomWalkBoundaries,
  wasmGetRoomExitDoors,
  wasmGetRoomTravelDestinations,
};
export type { DoorBoundaryTile, RoomStairInfo, RoomWalkBoundary, RoomExitDoor };
