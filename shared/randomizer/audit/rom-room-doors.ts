/* @layer shared-game @kind logic */
/**
 * Every door a dungeon room declares, read straight out of a ROM image.
 *
 * A room's object stream ends each of its three layer sections with `0xfff0` and then lists
 * its doors as words, terminated by `0xffff` (dungeon.c:2670 RoomDraw_DrawAllObjects). One
 * word is `type << 8 | position << 4 | direction`, exactly as dungeon.c:2689
 * RoomData_DrawObject_Door takes it apart. The type values are the `kDoorType_*` enumeration
 * in dungeon.h:5-36.
 *
 * What a door ASKS FOR is the cartridge's own answer too: dungeon.c:5069-5094 opens a small
 * key door for a key and a `kDoorType_1E` for the dungeon's big key, dungeon.c:5200 lists the
 * three types a bomb blows open, and dungeon.c:3036 names the four locked staircase masks,
 * one per staircase slot of the room header. That makes a door table the place a wing of a
 * dungeon ends, which is what `regionId` on a room is derived from.
 */
import { snesToLinear } from '../../asset-extraction/rom/snes-address';
import { stripCopierHeader } from './rom-native-tables';

/** What the player must bring to pass a door, in the cartridge's own terms. */
type RomDoorGate = 'none' | 'shutter' | 'small-key' | 'big-key' | 'bomb' | 'curtain' | 'throne';

interface RomRoomDoor {
  /** The raw `kDoorType_*` value. */
  type: number;
  /** 0-11: which of the wall's door slots, upper half first (dungeon.c:84-87). */
  position: number;
  /** 0 north, 1 south, 2 west, 3 east, as RoomData_DrawObject_Door dispatches it. */
  direction: number;
  /**
   * True when the door sits on the room's OWN outer wall, so it crosses into the next room.
   * North and west doors take the low six slots, south and east the high six: the other half
   * of each table is the wall between the room's own quadrants (dungeon.c:84-87).
   */
  leavesRoom: boolean;
  /** Which of the three door slots along that wall, so a crossing record can be matched to it. */
  slot: number;
  gate: RomDoorGate;
  /** For a locked staircase mask: which of the room header's four staircase slots it locks. */
  lockedStairIndex?: number;
}

const ROOM_COUNT = 320;
const LAYER_SECTIONS = 3;
/** The 3-byte pointer table to each room's object stream (extract_resources reads the same one). */
const ROOM_POINTERS = 0x1f8000;
const OBJECTS_END = 0xffff;
const DOORS_FOLLOW = 0xfff0;
const HALF_SLOTS = 6;
const WALL_SLOTS = 3;

const SMALL_KEY_DOOR = 0x1c;
const BIG_KEY_DOOR = 0x1e;
const LOCKED_STAIR_FIRST = 0x20;
const LOCKED_STAIR_LAST = 0x26;
const THRONE_DOOR = 0x14;
const CURTAIN_DOOR = 0x32;
const BOMBABLE: readonly number[] = [0x28, 0x2a, 0x2e, 0x30];
const SHUTTERS: readonly number[] = [0x18, 0x36, 0x38, 0x44, 0x48, 0x4a];

const gateOf = (type: number): RomDoorGate => {
  if (type === SMALL_KEY_DOOR || (type >= LOCKED_STAIR_FIRST && type <= LOCKED_STAIR_LAST)) return 'small-key';
  if (type === BIG_KEY_DOOR) return 'big-key';
  if (BOMBABLE.includes(type)) return 'bomb';
  if (type === CURTAIN_DOOR) return 'curtain';
  if (type === THRONE_DOOR) return 'throne';
  if (SHUTTERS.includes(type)) return 'shutter';
  return 'none';
};

const doorOf = (word: number): RomRoomDoor => {
  const type = word >> 8;
  const position = (word >> 4) & 0xf;
  const direction = word & 3;
  const outer = direction === 0 || direction === 2;
  const locked = type >= LOCKED_STAIR_FIRST && type <= LOCKED_STAIR_LAST
    ? (type - LOCKED_STAIR_FIRST) >> 1
    : undefined;
  return {
    type,
    position,
    direction,
    leavesRoom: outer ? position < HALF_SLOTS : position >= HALF_SLOTS,
    slot: position % WALL_SLOTS,
    gate: gateOf(type),
    ...(locked === undefined ? {} : { lockedStairIndex: locked }),
  };
};

/** Reads the door list of every dungeon room, keyed by room index. */
const readRomRoomDoors = (romBytes: Uint8Array): ReadonlyMap<number, readonly RomRoomDoor[]> => {
  const bytes = stripCopierHeader(romBytes);
  const byteAt = (ea: number): number => bytes[snesToLinear(ea)];
  const wordAt = (ea: number): number => byteAt(ea) | (byteAt(ea + 1) << 8);
  const out = new Map<number, readonly RomRoomDoor[]>();
  for (let room = 0; room < ROOM_COUNT; room++) {
    const pointer = ROOM_POINTERS + room * 3;
    // The first two bytes of the stream are the floor and layout bytes; the objects follow.
    let at = (byteAt(pointer) | (byteAt(pointer + 1) << 8) | (byteAt(pointer + 2) << 16)) + 2;
    const doors: RomRoomDoor[] = [];
    for (let section = 0; section < LAYER_SECTIONS; section++) {
      let listed = false;
      for (;;) {
        const word = wordAt(at);
        if (word === OBJECTS_END) { at += 2; break; }
        if (word === DOORS_FOLLOW) { at += 2; listed = true; break; }
        at += 3;
      }
      if (!listed) continue;
      for (;;) {
        const word = wordAt(at);
        at += 2;
        if (word === OBJECTS_END) break;
        doors.push(doorOf(word));
      }
    }
    out.set(room, doors);
  }
  return out;
};

export { readRomRoomDoors };
export type { RomDoorGate, RomRoomDoor };
