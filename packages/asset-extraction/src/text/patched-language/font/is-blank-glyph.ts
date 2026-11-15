/* @layer shared-asset-extraction @kind logic */
import { glyphBytes } from './glyph-bytes';

const isBlankGlyph = (tiles: Uint8Array, glyph: number): boolean => glyphBytes(tiles, glyph).every((byte) => byte === 0);

export { isBlankGlyph };
