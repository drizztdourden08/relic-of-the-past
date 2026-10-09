/* @layer renderer-lib @kind logic */
import type { OutfitId, OutfitPalette, SheetPalette, PlayerSheet } from '@rotp/game-data';
import { OUTFIT_IDS } from '@rotp/game-data';

const flattenPalette = (sheet: PlayerSheet): SheetPalette => {
  const { original, override } = sheet;
  const outfits = {} as Record<OutfitId, OutfitPalette>;
  for (const id of OUTFIT_IDS) outfits[id] = override.outfits?.[id] ?? original.outfits[id];
  return { outfits, gloves: override.gloves ?? original.gloves };
};

export { flattenPalette };
