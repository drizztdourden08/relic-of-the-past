/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { ExitArrays } from '../extensions/second-cartridge-links/second-cartridge-links.type';
import { OVERWORLD_EXIT_COUNT } from './overworld-exits.constants';

const readOverworldExits = (rom: RomData): ExitArrays => {
  const column = (read: (i: number) => number): number[] =>
    Array.from({ length: OVERWORLD_EXIT_COUNT }, (_, i) => read(i));
  return {
    screen: column(i => rom.getByte(0x82de28 + i)),
    rooms: column(i => rom.getWord(0x82dd8a + i * 2)),
    loadOff: column(i => rom.getWord(0x82de77 + i * 2)),
    scrollX: column(i => rom.getWord(0x82dfb3 + i * 2)),
    scrollY: column(i => rom.getWord(0x82df15 + i * 2)),
    x: column(i => rom.getWord(0x82e0ef + i * 2)),
    y: column(i => rom.getWord(0x82e051 + i * 2)),
    camX: column(i => rom.getWord(0x82e22b + i * 2)),
    camY: column(i => rom.getWord(0x82e18d + i * 2)),
    unk1: column(i => rom.getInt8(0x82e2c9 + i)),
    unk3: column(i => rom.getInt8(0x82e318 + i)),
    nDoor: column(i => rom.getWord(0x82e367 + i * 2)),
    fDoor: column(i => rom.getWord(0x82e405 + i * 2)),
  };
};

export { readOverworldExits };
