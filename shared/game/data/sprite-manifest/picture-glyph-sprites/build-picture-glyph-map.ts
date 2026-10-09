/* @layer shared-game @kind logic */
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import { SPRITE_DEFINITIONS } from '../manifest';
import type { GlyphSpan, PictureGlyphSprite } from './picture-glyph-sprites.type';
import { asGlyphExtract } from './as-glyph-extract';

const addToken = (
  map: Record<string, PictureGlyphSprite>,
  file: string,
  glyph: number,
  span: GlyphSpan,
): void => {
  const token = kLanguages.us.alphabet[glyph];
  if (token === undefined) return;
  map[token] = { file, glyph, span };
};

const buildPictureGlyphMap = (): Record<string, PictureGlyphSprite> => {
  const map: Record<string, PictureGlyphSprite> = {};
  for (const sprite of SPRITE_DEFINITIONS) {
    const extract = asGlyphExtract(sprite.extract);
    if (!extract) continue;
    const right = extract.glyphRight;
    addToken(map, sprite.file, extract.glyph, right === undefined ? 'whole' : 'first');
    if (right !== undefined) addToken(map, sprite.file, right, 'second');
  }
  return map;
};

export { buildPictureGlyphMap };
