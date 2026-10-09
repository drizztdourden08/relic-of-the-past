/* @layer shared-game @kind logic */
import { romByteReader } from '../rom-byte-reader';
import {
  DOORS_FOLLOW, LAYER_SECTIONS, OBJECTS_END, ROOM_COUNT, ROOM_POINTERS, ROOM_STREAM_HEADER_BYTES,
} from './rom-room-doors.constants';
import { doorOf } from './door-of';
import type { RomRoomDoor } from './rom-room-doors.type';

const readRomRoomDoors = (romBytes: Uint8Array): ReadonlyMap<number, readonly RomRoomDoor[]> => {
  const { byteAt, wordAt } = romByteReader(romBytes);
  const out = new Map<number, readonly RomRoomDoor[]>();
  for (let room = 0; room < ROOM_COUNT; room++) {
    const pointer = ROOM_POINTERS + room * 3;
    let at = (byteAt(pointer) | (byteAt(pointer + 1) << 8) | (byteAt(pointer + 2) << 16)) + ROOM_STREAM_HEADER_BYTES;
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
