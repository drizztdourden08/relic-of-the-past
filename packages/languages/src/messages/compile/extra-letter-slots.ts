/* @layer shared-game @kind logic */
import { kLanguages } from '@rotp/asset-extraction';
import type { GlyphMap } from '@rotp/asset-extraction';
import { extraGlyphSlots } from '@rotp/game-data';

const extraLetterSlots = (base: string, widthCount: number): GlyphMap => {
  const alphabet = kLanguages[base]?.alphabet ?? [];
  return Object.fromEntries(extraGlyphSlots(alphabet, widthCount).map((extra) => [extra.char, extra.slot]));
};

export { extraLetterSlots };
