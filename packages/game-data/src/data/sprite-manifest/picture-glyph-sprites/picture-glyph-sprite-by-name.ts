/* @layer shared-game @kind logic */
import type { PictureGlyphSprite } from './picture-glyph-sprites.type';
import { PICTURE_GLYPH_SPRITES } from './picture-glyph-sprites.constants';

const pictureGlyphSpriteByName = (name: string): PictureGlyphSprite | undefined =>
  PICTURE_GLYPH_SPRITES[`[${name}]`];

export { pictureGlyphSpriteByName };
