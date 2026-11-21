/* @layer shared-asset-extraction @kind logic */
import { glyphBytes } from './glyph-bytes';

const glyphKey = (tiles: Uint8Array, glyph: number): string => Buffer.from(glyphBytes(tiles, glyph)).toString('hex');

export { glyphKey };
