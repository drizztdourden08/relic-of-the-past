/* @layer shared-asset-extraction @kind logic */
import { UNKNOWN_LETTER } from '../font';

const unnamedGlyphs = (letters: readonly string[], texts: readonly string[]): string[] => {
  if (!texts.some((text) => text.includes(UNKNOWN_LETTER))) return [];
  return letters.flatMap((letter, glyph) => (letter === UNKNOWN_LETTER ? [`0x${glyph.toString(16).padStart(2, '0')}`] : []));
};

export { unnamedGlyphs };
