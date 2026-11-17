/* @layer shared-asset-extraction @kind logic */
import {
  GLYPH_LIMIT, IDEOGRAPHIC_SPACE, KANA_CHARSET, PRIVATE_USE_BASE, SPACE_CHAR, SPACE_GLYPH,
} from './japanese-charset.constants';

const charToGlyph = (char: string): number => {
  if (char === SPACE_CHAR || char === IDEOGRAPHIC_SPACE) return SPACE_GLYPH;
  const kana = KANA_CHARSET.indexOf(char);
  if (kana >= 0) return kana;
  const privateUse = (char.codePointAt(0) ?? 0) - PRIVATE_USE_BASE;
  if (privateUse >= 0 && privateUse < GLYPH_LIMIT) return privateUse;
  throw new Error(`charToGlyph: '${char}' has no glyph in the Japanese font`);
};

export { charToGlyph };
