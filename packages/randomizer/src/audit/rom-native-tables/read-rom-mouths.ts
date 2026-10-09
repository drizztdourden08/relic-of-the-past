/* @layer shared-game @kind logic */
import {
  FALL_HOLE_AREA_ADDRESS, FALL_HOLE_ENTRANCE_ADDRESS, FALL_HOLE_POS_ADDRESS, HOLE_SLOTS, OW_ENTRANCE_AREA_ADDRESS,
  OW_ENTRANCE_ID_ADDRESS, OW_ENTRANCE_POS_ADDRESS, OW_ENTRANCE_SLOTS, SPECIAL_SCREEN_FIRST,
} from './rom-native-tables.constants';
import type { RomByteReader } from '../rom-byte-reader.type';
import type { RomMouth } from './rom-native-tables.type';

const tileOf = (pos: number): { x: number; y: number } => ({ x: (pos >> 1) & 0x3f, y: (pos >> 7) & 0x3f });

const screenOf = (area: number, x: number, y: number): number =>
  area >= SPECIAL_SCREEN_FIRST ? area : area + (x >> 5) + (y >> 5) * 8;

const readRomMouths = ({ byteAt, wordAt }: RomByteReader): RomMouth[] => {
  const mouths: RomMouth[] = [];
  for (let i = 0; i < OW_ENTRANCE_SLOTS; i++) {
    const area = wordAt(OW_ENTRANCE_AREA_ADDRESS + i * 2);
    const { x, y } = tileOf(wordAt(OW_ENTRANCE_POS_ADDRESS + i * 2));
    mouths.push({
      table: 'entrance', slot: i, entranceId: byteAt(OW_ENTRANCE_ID_ADDRESS + i), area, screen: screenOf(area, x, y), x, y,
    });
  }
  for (let i = 0; i < HOLE_SLOTS; i++) {
    const area = wordAt(FALL_HOLE_AREA_ADDRESS + i * 2);
    const { x, y } = tileOf(wordAt(FALL_HOLE_POS_ADDRESS + i * 2));
    mouths.push({
      table: 'hole', slot: i, entranceId: byteAt(FALL_HOLE_ENTRANCE_ADDRESS + i), area, screen: screenOf(area, x, y), x, y,
    });
  }
  return mouths;
};

export { readRomMouths };
