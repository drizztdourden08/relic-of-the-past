/* @layer shared-asset-extraction @kind logic */
import type { SpriteSource } from '../item-sprites/sources';
import type { RGBA } from '../graphics/palette';
import { snesToRgba } from '../graphics/palette';
import { TITLE_PALETTE_LOADS, TRIFORCE_OBJ_PALETTE_CGRAM, TRIFORCE_PALETTE_WORDS } from './title-tables';
import { CGRAM_WORDS, ROW_WORDS } from './title-palette.constants';

const buildTitlePalette = (source: SpriteSource): RGBA[] => {
  const cgram = new Array<number>(CGRAM_WORDS).fill(0);
  for (const { table, first, dst, count, rows } of TITLE_PALETTE_LOADS) {
    const words = source.readPaletteWords(table, first, count * rows);
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < count; c += 1) cgram[dst + r * ROW_WORDS + c] = words[r * count + c] ?? 0;
    }
  }
  const triforce = source.rom.getWords(source.polyPalette, TRIFORCE_PALETTE_WORDS);
  for (const [c, word] of triforce.entries()) cgram[TRIFORCE_OBJ_PALETTE_CGRAM + c] = word;
  return cgram.map(snesToRgba);
};

export { buildTitlePalette };
