/* @layer shared-asset-extraction @kind logic */
import { cropShape } from './accents/crop-shape';
import { shapeDistance } from './accents/shape-distance';
import { glyphPixelGrid } from './glyph-pixel-grid';
import { isBlankGlyph } from './is-blank-glyph';

const shiftedCopyOf = (tiles: Uint8Array, alphabet: readonly string[], glyph: number): string | null => {
  const target = cropShape(glyphPixelGrid(tiles, glyph));
  if (target === null) return null;
  for (let home = 0; home < alphabet.length; home += 1) {
    const token = alphabet[home];
    if (token === undefined || isBlankGlyph(tiles, home)) continue;
    const shape = cropShape(glyphPixelGrid(tiles, home));
    if (shape?.top === target.top && shapeDistance(shape, target) === 0) return token;
  }
  return null;
};

export { shiftedCopyOf };
