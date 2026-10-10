/* @layer shared-game @kind logic */
import {
  DUNGEON_MAP_BANK, DUNGEON_MAP_EMPTY, DUNGEON_MAP_POINTERS_ADDRESS, DUNGEON_MAP_SIZES,
} from './rom-native-tables.constants';
import type { RomByteReader } from '../rom-byte-reader.type';

const readPalaceOfRoom = ({ byteAt, wordAt }: RomByteReader): Map<number, number> => {
  const palaceOfRoom = new Map<number, number>();
  for (const [palace, size] of DUNGEON_MAP_SIZES.entries()) {
    const base = DUNGEON_MAP_BANK + wordAt(DUNGEON_MAP_POINTERS_ADDRESS + palace * 2);
    for (let cell = 0; cell < size; cell++) {
      const room = byteAt(base + cell);
      if (room !== DUNGEON_MAP_EMPTY) palaceOfRoom.set(room, palace * 2);
    }
  }
  return palaceOfRoom;
};

export { readPalaceOfRoom };
