/* @layer shared-game @kind logic */
import {
  EXIT_LANDING_X_ADDRESS, EXIT_LANDING_Y_ADDRESS, EXIT_ROOMS_ADDRESS, EXIT_SCREEN_INDEX_ADDRESS, EXIT_SLOTS,
} from './rom-native-tables.constants';
import type { RomByteReader } from '../rom-byte-reader.type';
import type { RomExit } from './rom-native-tables.type';

const readRomExits = ({ byteAt, wordAt }: RomByteReader): RomExit[] => {
  const exits: RomExit[] = [];
  for (let i = 0; i < EXIT_SLOTS; i++) {
    const screenIndex = byteAt(EXIT_SCREEN_INDEX_ADDRESS + i);
    exits.push({
      index: i,
      room: wordAt(EXIT_ROOMS_ADDRESS + i * 2),
      screenIndex,
      x: wordAt(EXIT_LANDING_X_ADDRESS + i * 2) - ((screenIndex & 7) << 9),
      y: wordAt(EXIT_LANDING_Y_ADDRESS + i * 2) - ((screenIndex & 56) << 6),
    });
  }
  return exits;
};

export { readRomExits };
