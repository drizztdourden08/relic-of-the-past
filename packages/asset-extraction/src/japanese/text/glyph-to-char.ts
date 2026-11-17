/* @layer shared-asset-extraction @kind logic */
import { KANA_CHARSET, PRIVATE_USE_BASE, SPACE_CHAR, SPACE_GLYPH } from './japanese-charset.constants';

const glyphToChar = (glyph: number): string => {
  if (glyph === SPACE_GLYPH) return SPACE_CHAR;
  if (glyph < KANA_CHARSET.length) return KANA_CHARSET.charAt(glyph);
  return String.fromCharCode(PRIVATE_USE_BASE + glyph);
};

export { glyphToChar };
