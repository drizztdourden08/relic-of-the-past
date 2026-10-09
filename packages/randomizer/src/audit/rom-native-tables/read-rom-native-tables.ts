/* @layer shared-game @kind logic */
import { romByteReader } from '../rom-byte-reader';
import {
  AREA_COUNT, AREA_HEADS_ADDRESS, ENTRANCE_COUNT, ENTRANCE_PALACES_ADDRESS, ENTRANCE_ROOMS_ADDRESS, SPECIAL_SCREEN_FIRST,
} from './rom-native-tables.constants';
import { readPalaceOfRoom } from './read-palace-of-room';
import { readRomExits } from './read-rom-exits';
import { readRomMouths } from './read-rom-mouths';
import { roomTravelReader } from './room-travel-reader';
import type { RomNativeTables } from './rom-native-tables.type';

const readRomNativeTables = (romBytes: Uint8Array): RomNativeTables => {
  const reader = romByteReader(romBytes);
  const { byteAt, wordAt, signedAt } = reader;

  const areaHeads: number[] = [];
  for (let i = 0; i < AREA_COUNT; i++) areaHeads.push(byteAt(AREA_HEADS_ADDRESS + i));
  const headOf = (area: number): number =>
    area >= SPECIAL_SCREEN_FIRST ? area : areaHeads[area & 0x3f] | (area & 0x40);
  const isAreaHead = (area: number): boolean => headOf(area) === area;

  const entranceRooms: number[] = [];
  const entrancePalaces: number[] = [];
  for (let i = 0; i < ENTRANCE_COUNT; i++) {
    entranceRooms.push(wordAt(ENTRANCE_ROOMS_ADDRESS + i * 2));
    entrancePalaces.push(signedAt(ENTRANCE_PALACES_ADDRESS + i));
  }

  return {
    areaHeads,
    entranceRooms,
    entrancePalaces,
    mouths: readRomMouths(reader),
    exits: readRomExits(reader),
    isAreaHead,
    headOf,
    palaceOfRoom: readPalaceOfRoom(reader),
    roomTravel: roomTravelReader(reader),
  };
};

export { readRomNativeTables };
