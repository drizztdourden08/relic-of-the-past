/* @layer shared-asset-extraction @kind logic */
import { snesToRgba } from '../../graphics/palette';
import type { RomData } from '../../rom/rom-types';
import type { RGBA } from '../../graphics/palette';

const readColors = (rom: RomData, addr: number, count: number): RGBA[] =>
  rom.getWords(addr, count).map(word => snesToRgba(word));

export { readColors };
