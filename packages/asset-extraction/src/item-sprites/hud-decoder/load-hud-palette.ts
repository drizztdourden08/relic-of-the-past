/* @layer shared-asset-extraction @kind logic */
import { snesToRgba, TRANSPARENT } from '../../graphics/palette';
import { ADDR_HUD_PALETTE } from '../../data/constants';
import type { RomData } from '../../rom/rom-types';
import type { RGBA } from '../../graphics/palette';

const loadHudPalette = (rom: RomData): Map<number, RGBA> => {
  const words = rom.getWords(ADDR_HUD_PALETTE, 64);
  const palette = new Map<number, RGBA>();
  for (const [key, w] of words.entries()) {
    palette.set(key, w === 0 ? TRANSPARENT : snesToRgba(w));
  }
  return palette;
};

export { loadHudPalette };
