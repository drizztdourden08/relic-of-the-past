/* @layer shared-asset-extraction @kind logic */
/**
 * The title screen's CGRAM once every fade has finished: the palette the intro fades
 * toward (aux_palette_buffer), which the main palette equals from then on.
 */
import type { RomData } from '../rom/rom-types';
import type { RGBA } from '../graphics/palette';
import { snesToRgba } from '../graphics/palette';
import { TITLE_PALETTE_LOADS } from './title-tables';

const CGRAM_WORDS = 256;
const ROW_WORDS = 16;

/** 256 colours; the backdrop (entry 0) is black, as Palette_BgAndFixedColor_Black leaves it. */
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
