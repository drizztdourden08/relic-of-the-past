/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { RGBA } from '../graphics/palette';
import { snesToRgba } from '../graphics/palette';
import { TITLE_PALETTE_LOADS } from './title-tables';
import { CGRAM_WORDS, ROW_WORDS } from './title-palette.constants';

const buildTitlePalette = (rom: RomData): RGBA[] => {
  const cgram = new Array<number>(CGRAM_WORDS).fill(0);
  for (const { rom: src, dst, count, rows } of TITLE_PALETTE_LOADS) {
    const words = rom.getWords(src, count * rows);
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < count; c += 1) cgram[dst + r * ROW_WORDS + c] = words[r * count + c];
    }
  }
  return cgram.map(snesToRgba);
};

export { buildTitlePalette };
