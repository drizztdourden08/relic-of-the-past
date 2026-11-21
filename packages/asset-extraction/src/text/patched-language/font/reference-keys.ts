/* @layer shared-asset-extraction @kind logic */
import { byBaseFirst } from './by-base-first';
import type { FontReference } from './font.type';
import { glyphKey } from './glyph-key';
import { isBlankGlyph } from './is-blank-glyph';

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

export { referenceKeys };
