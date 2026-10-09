/* @layer renderer-lib @kind logic */
import type { OutfitId, PaletteOverride, PlayerSheet } from '@rotp/game-data';

const withColor = (sheet: PlayerSheet, outfit: OutfitId, index: number, word: number): PaletteOverride => {
  const { original, override } = sheet;
  const current = override.outfits?.[outfit] ?? original.outfits[outfit];
  const next = [...current];
  next[index] = word;
  return { ...override, outfits: { ...override.outfits, [outfit]: next } };
};

export { withColor };
