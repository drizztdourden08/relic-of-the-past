/* @layer shared-asset-extraction @kind logic */
import type { FontReference } from './font.type';
import { glyphKey, isBlankGlyph } from './glyph-bytes';

const byBaseFirst = (references: readonly FontReference[]): FontReference[] =>
  [...references].sort((left, right) => Number(right.isBase) - Number(left.isBase));

const referenceKeys = (references: readonly FontReference[], glyphLimit: number): Map<string, string> => {
  const keys = new Map<string, string>();
  for (const reference of byBaseFirst(references)) {
    const count = Math.min(glyphLimit, reference.alphabet.length);
    for (let glyph = 0; glyph < count; glyph += 1) {
      const token = reference.alphabet[glyph];
      if (token === undefined || isBlankGlyph(reference.tiles, glyph)) continue;
      const key = glyphKey(reference.tiles, glyph);
      if (!keys.has(key)) keys.set(key, token);
    }
  }
  return keys;
};

export { byBaseFirst, referenceKeys };
