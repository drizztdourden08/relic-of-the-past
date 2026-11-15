/* @layer shared-asset-extraction @kind logic */
import { MIN_DRAWN_GLYPHS } from './font.constants';
import { glyphKey, isBlankGlyph } from './glyph-bytes';

const fontMatchRatio = (tiles: Uint8Array, keys: ReadonlyMap<string, string>, glyphLimit: number): number => {
  let drawn = 0;
  let known = 0;
  for (let glyph = 0; glyph < glyphLimit; glyph += 1) {
    if (isBlankGlyph(tiles, glyph)) continue;
    drawn += 1;
    if (keys.has(glyphKey(tiles, glyph))) known += 1;
  }
  return drawn < MIN_DRAWN_GLYPHS ? 0 : known / drawn;
};

export { fontMatchRatio };
