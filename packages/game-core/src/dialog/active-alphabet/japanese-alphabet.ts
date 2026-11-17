/* @layer bridge-wasm @kind logic */
import { glyphToChar, JAPANESE_GLYPH_LIMIT } from '@rotp/asset-extraction';

const japaneseAlphabet = (): readonly string[] =>
  Array.from({ length: JAPANESE_GLYPH_LIMIT }, (_, glyph) => glyphToChar(glyph));

export { japaneseAlphabet };
