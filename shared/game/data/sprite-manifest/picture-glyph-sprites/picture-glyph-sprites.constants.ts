/* @layer shared-game @kind constants */
import type { PictureGlyphSprite } from './picture-glyph-sprites.type';
import { buildPictureGlyphMap } from './build-picture-glyph-map';

const PICTURE_GLYPH_SPRITES: Readonly<Record<string, PictureGlyphSprite>> = buildPictureGlyphMap();

export { PICTURE_GLYPH_SPRITES };
