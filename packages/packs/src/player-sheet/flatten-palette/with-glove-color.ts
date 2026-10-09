/* @layer renderer-lib @kind logic */
import type { PaletteOverride, PlayerSheet } from '@rotp/game-data';

const withGloveColor = (sheet: PlayerSheet, slot: 0 | 1, word: number): PaletteOverride => {
  const current = sheet.override.gloves ?? sheet.original.gloves;
  const gloves: [number, number] = [current[0], current[1]];
  gloves[slot] = word;
  return { ...sheet.override, gloves };
};

export { withGloveColor };
