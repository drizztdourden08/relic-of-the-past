/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';

const readRoomHeader = (rom: RomData, room: number): number[] => {
  let p = 0x40000 | rom.getWord(0x4f502 + room * 2);
  if (p === 0x4ffef) p = 0x82edc5;
  const byte = (offset: number): number => rom.getByte(p + offset);
  const flags = byte(0);
  return [
    (flags >> 5) << 5 | ((flags >> 2) & 7) << 2 | (flags & 1),
    byte(1), byte(2), byte(3),
    byte(4), byte(5), byte(6),
    byte(7), byte(8) & 3,
    byte(9), byte(10), byte(11), byte(12), byte(13),
  ];
};

export { readRoomHeader };
