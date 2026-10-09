/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { SpecialExitArrays } from './overworld-exits.type';
import { SPECIAL_EXIT_COUNT, SPECIAL_EXIT_FIRST_ROOM } from './overworld-exits.constants';

const zeroes = (): number[] => new Array<number>(SPECIAL_EXIT_COUNT).fill(0);

const readSpecialExit = (rom: RomData, s: SpecialExitArrays, j: number): void => {
  s.dir[j] = rom.getByte(0x82e801 + j) & 0xfe;
  s.sprGfx[j] = rom.getByte(0x82e811 + j);
  s.auxGfx[j] = rom.getByte(0x82e821 + j);
  s.palBg[j] = rom.getByte(0x82e831 + j);
  s.palSpr[j] = rom.getByte(0x82e841 + j);
  s.top[j] = rom.getWord(0x82e6e1 + j * 2);
  s.bottom[j] = rom.getWord(0x82e701 + j * 2);
  s.left[j] = rom.getWord(0x82e721 + j * 2);
  s.right[j] = rom.getWord(0x82e741 + j * 2);
  s.leftEdge[j] = rom.getWord(0x82e7e1 + j * 2);
  s.tab4[j] = rom.getInt16(0x82e761 + j * 2);
  s.tab6[j] = rom.getInt16(0x82e781 + j * 2);
  s.tab5[j] = rom.getInt16(0x82e7a1 + j * 2);
  s.tab7[j] = rom.getInt16(0x82e7c1 + j * 2);
};

const readSpecialExits = (rom: RomData, exitRooms: readonly number[]): SpecialExitArrays => {
  const s: SpecialExitArrays = {
    top: zeroes(), bottom: zeroes(), left: zeroes(), right: zeroes(),
    tab4: zeroes(), tab5: zeroes(), tab6: zeroes(), tab7: zeroes(),
    leftEdge: zeroes(), dir: zeroes(), sprGfx: zeroes(), auxGfx: zeroes(),
    palBg: zeroes(), palSpr: zeroes(),
  };
  for (const room of exitRooms) {
    const j = room - SPECIAL_EXIT_FIRST_ROOM;
    if (j >= 0 && j < SPECIAL_EXIT_COUNT) readSpecialExit(rom, s, j);
  }
  return s;
};

export { readSpecialExits };
