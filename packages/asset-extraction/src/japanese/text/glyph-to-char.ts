/* @layer shared-asset-extraction @kind logic */
import { KANJI_CHARSET, UNIDENTIFIED_KANJI } from './japanese-kanji.constants';
import { KANA_CHARSET, PRIVATE_USE_BASE, SPACE_CHAR, SPACE_GLYPH } from './japanese-charset.constants';
import { KANJI_BASE } from './japanese-text.constants';

const kanjiChar = (glyph: number): string => {
  const char = KANJI_CHARSET.charAt(glyph - KANJI_BASE);
  return char === '' || char === UNIDENTIFIED_KANJI ? String.fromCharCode(PRIVATE_USE_BASE + glyph) : char;
};

const glyphToChar = (glyph: number): string => {
  if (glyph === SPACE_GLYPH) return SPACE_CHAR;
  if (glyph < KANA_CHARSET.length) return KANA_CHARSET.charAt(glyph);
  if (glyph >= KANJI_BASE) return kanjiChar(glyph);
  return String.fromCharCode(PRIVATE_USE_BASE + glyph);
};

export { glyphToChar };
