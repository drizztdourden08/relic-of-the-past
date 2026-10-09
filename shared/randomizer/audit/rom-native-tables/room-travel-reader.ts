/* @layer shared-game @kind logic */
import {
  ROOM_HEADER_BANK, ROOM_HEADER_HOLE_DEST, ROOM_HEADER_POINTERS_ADDRESS, ROOM_HEADER_SHARED_ADDRESS,
  ROOM_HEADER_SHARED_POINTER, ROOM_HEADER_STAIR_DEST, ROOM_HEADER_TAG_FIRST, ROOM_HEADER_TAG_SECOND,
} from './rom-native-tables.constants';
import type { RomByteReader } from '../rom-byte-reader.type';
import type { RomRoomTravel } from './rom-native-tables.type';

const roomTravelReader = ({ byteAt, wordAt }: RomByteReader) => (room: number): RomRoomTravel => {
  let header = ROOM_HEADER_BANK | wordAt(ROOM_HEADER_POINTERS_ADDRESS + room * 2);
  if (header === ROOM_HEADER_SHARED_POINTER) header = ROOM_HEADER_SHARED_ADDRESS;
  const page = room & 0xff00;
  return {
    holeDest: page | byteAt(header + ROOM_HEADER_HOLE_DEST),
    stairDest: [0, 1, 2, 3].map((n) => page | byteAt(header + ROOM_HEADER_STAIR_DEST + n)),
    tags: [byteAt(header + ROOM_HEADER_TAG_FIRST), byteAt(header + ROOM_HEADER_TAG_SECOND)],
  };
};

export { roomTravelReader };
