/* @layer shared-game @kind logic */
import { romByteReader } from '../rom-byte-reader';
import {
  DOORS_FOLLOW, LAYER_SECTIONS, OBJECTS_END, ROOM_COUNT, ROOM_POINTERS, ROOM_STREAM_HEADER_BYTES,
} from './rom-room-doors.constants';
import { doorOf } from './door-of';
import type { RomByteReader } from '../rom-byte-reader.type';
import type { RomRoomDoor } from './rom-room-doors.type';

const skipObjects = (wordAt: RomByteReader['wordAt'], start: number): { at: number; listed: boolean } => {
  let at = start;
  for (;;) {
    const word = wordAt(at);
    if (word === OBJECTS_END) return { at: at + 2, listed: false };
    if (word === DOORS_FOLLOW) return { at: at + 2, listed: true };
    at += 3;
  }
};

const readDoorList = (wordAt: RomByteReader['wordAt'], start: number, doors: RomRoomDoor[]): number => {
  let at = start;
  for (;;) {
    const word = wordAt(at);
    at += 2;
    if (word === OBJECTS_END) return at;
    doors.push(doorOf(word));
  }
};

const doorsOfRoom = ({ byteAt, wordAt }: RomByteReader, room: number): RomRoomDoor[] => {
  const pointer = ROOM_POINTERS + room * 3;
  let at = (byteAt(pointer) | (byteAt(pointer + 1) << 8) | (byteAt(pointer + 2) << 16)) + ROOM_STREAM_HEADER_BYTES;
  const doors: RomRoomDoor[] = [];
  for (let section = 0; section < LAYER_SECTIONS; section++) {
    const scan = skipObjects(wordAt, at);
    at = scan.listed ? readDoorList(wordAt, scan.at, doors) : scan.at;
  }
  return doors;
};

const readRomRoomDoors = (romBytes: Uint8Array): ReadonlyMap<number, readonly RomRoomDoor[]> => {
  const reader = romByteReader(romBytes);
  const out = new Map<number, readonly RomRoomDoor[]>();
  for (let room = 0; room < ROOM_COUNT; room++) out.set(room, doorsOfRoom(reader, room));
  return out;
};

export { readRomRoomDoors };
