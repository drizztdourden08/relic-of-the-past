/* @layer bridge-wasm @kind logic */
/** Room-addressable interactable queries + overworld-check trigger for the simulator. */
import { callWhenRunning, decodeTable, readU16, voidCall } from './wasm-call';

type SimDoorDirection = 'north' | 'south' | 'west' | 'east';

/** Raw SRAM copies for the simulator's flag diffing (see shared FlagSnapshot). */
interface SimFlagSnapshot {
  /** save_dung_info — uint16[320], indexed by room ID. */
  dungInfo: Uint16Array;
  /** save_ow_event_info — uint8[0x82], indexed by overworld screen. */
  owEventInfo: Uint8Array;
  /** g_progress_buf — 16-byte progress buffer. */
  progress: Uint8Array;
}

const DUNG_INFO_LEN = 320;
const OW_EVENT_LEN = 0x82;
const PROGRESS_LEN = 16;

interface SimChestRaw {
  chestIndex: number;
  isBig: boolean;
  itemId: number;
  isOpen: boolean;
  posKnown: boolean;
  col: number;
  row: number;
}

interface SimSpriteRaw {
  spriteType: number;
  col: number;
  row: number;
  floor: number;
  /** Drops a small key on death (0xe4/0xfe die-action marker in room data). */
  carriesKey: boolean;
  /** Drops the BIG key on death (0xe4/0xfd marker). */
  carriesBigKey: boolean;
}

interface SimDoorRaw {
  direction: SimDoorDirection;
  col: number;
  row: number;
  kind: number;
  nativeType: number;
  isOpen: boolean;
  /** 0 = upper/BG2 door, 1 = lower/BG1 (door position slots 6-11). */
  layer: 0 | 1;
}

const DIR_NAMES: SimDoorDirection[] = ['north', 'south', 'west', 'east'];

const roomArg = (roomId: number) => ({ argTypes: ['number'], args: [roomId] });

const wasmGetRoomChests = (roomId: number): SimChestRaw[] =>
  decodeTable('WasmGetRoomChests', { countBytes: 1, dataStart: 2, stride: 7, maxCount: 6 }, (heap, o) => ({
    chestIndex: heap[o + 0],
    isBig: heap[o + 1] !== 0,
    itemId: heap[o + 2],
    isOpen: heap[o + 3] !== 0,
    posKnown: heap[o + 4] !== 0,
    col: heap[o + 5],
    row: heap[o + 6],
  }), roomArg(roomId));

const wasmGetRoomSpriteSpawns = (roomId: number): SimSpriteRaw[] =>
  decodeTable('WasmGetRoomSpriteSpawns', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 32 }, (heap, o) => ({
    spriteType: heap[o + 0],
    col: heap[o + 1],
    row: heap[o + 2],
    floor: heap[o + 3] & 1,
    carriesKey: (heap[o + 3] & 2) !== 0,
    carriesBigKey: (heap[o + 3] & 4) !== 0,
  }), roomArg(roomId));

/** "Virtually kill" a room's meaningful enemy: marks the room's drop-taken
 *  (0x400) or enemies-cleared (0x800, itemId 0xff) SRAM bit and grants the
 *  drop through the normal receive path. */
const wasmSimKillDrop = (roomId: number, itemId: number): void =>
  voidCall('WasmSimKillDrop', { argTypes: ['number', 'number'], args: [roomId, itemId] });

/** Open a door's SRAM/live bit as the game would when the player uses a small key.
 *  consume=false opens the counterpart record without spending another key. */
const wasmSimUnlockDoor = (roomId: number, doorIndex: number, consume: boolean): void =>
  voidCall('WasmSimUnlockDoor', { argTypes: ['number', 'number', 'number'], args: [roomId, doorIndex, consume ? 1 : 0] });

/** Big-key "Cell Lock" plates (room object 0x18) — `opened` once its bit is set. */
const wasmGetRoomCellLocks = (roomId: number): { slot: number; row: number; col: number; opened: boolean }[] =>
  decodeTable('WasmGetRoomCellLocks', { countBytes: 1, dataStart: 2, stride: 4, maxCount: 6 }, (heap, o) => ({
    slot: heap[o + 0],
    row: heap[o + 1],
    col: heap[o + 2],
    opened: heap[o + 3] !== 0,
  }), roomArg(roomId));

/** Open a cell lock — sets the slot's chest-open bit, as the game does. */
const wasmSimOpenCellLock = (roomId: number, slot: number): void =>
  voidCall('WasmSimOpenCellLock', { argTypes: ['number', 'number'], args: [roomId, slot] });

/** The princess becomes the player's follower (her cell's TransitionToTagalong state). */
const wasmSimFollowerAttach = (): void => voidCall('WasmSimFollowerAttach', { argTypes: [], args: [] });

/** The Sanctuary priest scene: progress indicator → 2 (the princess is safe). */
const wasmSimFollowerRescue = (): void => voidCall('WasmSimFollowerRescue', { argTypes: [], args: [] });

/** Clear a door's open bit — a trap shutter slamming shut again behind the player. */
const wasmSimCloseDoor = (roomId: number, doorIndex: number): void =>
  voidCall('WasmSimCloseDoor', { argTypes: ['number', 'number'], args: [roomId, doorIndex] });

const wasmGetRoomDoorInfo = (roomId: number): SimDoorRaw[] =>
  decodeTable('WasmGetRoomDoorInfo', { countBytes: 1, dataStart: 2, stride: 7, maxCount: 16 }, (heap, o) => ({
    direction: DIR_NAMES[heap[o + 0]] ?? 'north',
    col: heap[o + 1],
    row: heap[o + 2],
    kind: heap[o + 3],
    nativeType: heap[o + 4],
    isOpen: heap[o + 5] !== 0,
    layer: heap[o + 6] === 1 ? 1 : 0,
  }), roomArg(roomId));

const wasmGetOverworldSpriteSpawns = (screenIndex: number): SimSpriteRaw[] =>
  decodeTable('WasmGetOverworldSpriteSpawns', { countBytes: 1, dataStart: 2, stride: 3, maxCount: 48 }, (heap, o) => ({
    spriteType: heap[o + 0],
    col: heap[o + 1],
    row: heap[o + 2],
    carriesKey: false,
    carriesBigKey: false,
    floor: 0,
  }), roomArg(screenIndex));

/** Set a standing-overworld-item event bit and grant its item, in-game. */
const wasmTriggerOverworldCheck = (screen: number, mask: number, itemId: number): void =>
  voidCall('WasmTriggerOverworldCheck', { argTypes: ['number', 'number', 'number'], args: [screen, mask, itemId] });

/**
 * Copy the three raw SRAM flag buffers the simulator diffs. Returns independent
 * copies (never live views) so the engine can hold a pre-trigger snapshot.
 */
const wasmReadFlagSnapshot = (): SimFlagSnapshot | null =>
  callWhenRunning<SimFlagSnapshot | null>(null, (mod) => {
    const heap = mod.HEAPU8;
    const dungPtr = mod.ccall('WasmGetRoomFlags', 'number', [], []) as number;
    const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
    const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
    if (!dungPtr || !owPtr || !progPtr) return null;
    const dungInfo = new Uint16Array(DUNG_INFO_LEN);
    for (let i = 0; i < DUNG_INFO_LEN; i++) dungInfo[i] = readU16(heap, dungPtr + i * 2);
    return {
      dungInfo,
      owEventInfo: heap.slice(owPtr, owPtr + OW_EVENT_LEN),
      progress: heap.slice(progPtr, progPtr + PROGRESS_LEN),
    };
  });

export { wasmGetRoomChests, wasmGetRoomSpriteSpawns, wasmGetOverworldSpriteSpawns, wasmGetRoomDoorInfo,
  wasmSimUnlockDoor, wasmSimCloseDoor, wasmSimKillDrop, wasmSimFollowerAttach, wasmSimFollowerRescue,
  wasmGetRoomCellLocks, wasmSimOpenCellLock, wasmTriggerOverworldCheck, wasmReadFlagSnapshot };
export type { SimChestRaw, SimSpriteRaw, SimDoorRaw, SimDoorDirection, SimFlagSnapshot };
