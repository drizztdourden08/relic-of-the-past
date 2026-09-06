/* @layer renderer-lib @kind logic */
/**
 * Collapse a sheet's two palette layers into one.
 *
 * The override layer is sparse, holding only the outfits and the glove pair that were
 * actually edited, so reading a colour means asking the override first and the original
 * second. Anything that needs a single complete palette (a ZSPR export, the boot
 * flatten) goes through here instead of repeating that fallback.
 */
import type { OutfitId, OutfitPalette, SheetPalette, PaletteOverride, PlayerSheet } from '@shared/game/data/player-sheet/types';
import { OUTFIT_IDS } from '@shared/game/data/player-sheet/types';

const flattenPalette = (sheet: PlayerSheet): SheetPalette => {
  const { original, override } = sheet;
  const outfits = {} as Record<OutfitId, OutfitPalette>;
  for (const id of OUTFIT_IDS) outfits[id] = override.outfits?.[id] ?? original.outfits[id];
  return { outfits, gloves: override.gloves ?? original.gloves };
};

/** True when nothing has been edited, i.e. Revert has nothing to undo. */
const isEmptyOverride = (override: PaletteOverride): boolean =>
  !override.gloves && Object.keys(override.outfits ?? {}).length === 0;

/** Returns a new override layer with one colour changed, leaving the original untouched. */
const withColor = (sheet: PlayerSheet, outfit: OutfitId, index: number, word: number): PaletteOverride => {
  const { original, override } = sheet;
  const current = override.outfits?.[outfit] ?? original.outfits[outfit];
  const next = [...current];
  next[index] = word;
  return { ...override, outfits: { ...override.outfits, [outfit]: next } };
};

/** Same, for one of the two glove colours. */
const withGloveColor = (sheet: PlayerSheet, slot: 0 | 1, word: number): PaletteOverride => {
  const current = sheet.override.gloves ?? sheet.original.gloves;
  const gloves: [number, number] = [current[0], current[1]];
  gloves[slot] = word;
  return { ...sheet.override, gloves };
};

export { flattenPalette, isEmptyOverride, withColor, withGloveColor };
