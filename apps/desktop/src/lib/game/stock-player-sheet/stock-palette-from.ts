/* @layer renderer-lib @kind logic */
import type { OutfitId, OutfitPalette, SheetPalette } from '@rotp/game-data';
import { readDatEntry } from '@shared/asset-extraction/dat-reader';
import { COLORS_PER_OUTFIT, OUTFIT_IDS } from '@rotp/game-data';
import { STOCK_GLOVES } from '@rotp/game-data';
import { BYTES_PER_COLOR_WORD, GEAR_PALETTE_KEY } from './stock-player-sheet.constants';

const paletteFromWords = (words: Uint8Array): SheetPalette | null => {
  if (words.length < OUTFIT_IDS.length * COLORS_PER_OUTFIT * BYTES_PER_COLOR_WORD) return null;
  const outfits = {} as Record<OutfitId, OutfitPalette>;
  OUTFIT_IDS.forEach((id, slot) => {
    const colors: number[] = [];
    for (let i = 0; i < COLORS_PER_OUTFIT; i++) {
      const at = (slot * COLORS_PER_OUTFIT + i) * BYTES_PER_COLOR_WORD;
      colors.push(words[at] | (words[at + 1] << 8));
    }
    outfits[id] = colors;
  });
  return { outfits, gloves: STOCK_GLOVES };
};

const stockPaletteFrom = (dat: Uint8Array): SheetPalette | null => {
  const gear = readDatEntry(dat, GEAR_PALETTE_KEY);
  return gear ? paletteFromWords(gear) : null;
};

export { stockPaletteFrom };
