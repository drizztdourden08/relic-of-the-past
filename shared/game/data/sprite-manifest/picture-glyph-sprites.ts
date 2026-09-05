/* @layer shared-game @kind data */
/**
 * Bracketed alphabet token → the sprite file extracted for it.
 *
 * The dialogue alphabet mixes letters with picture characters, written as a
 * bracket run (see `codes/glyph.ts`, which tells those apart from control
 * codes). Each picture has a sprite-manifest entry cut from the dialogue font,
 * and this map is the lookup an editor needs to go from the token it parsed to
 * the file name it should show. It is derived from the manifest itself plus the base
 * alphabet, so the two can never drift apart.
 *
 * Keys are base-alphabet tokens with their brackets intact. A localized
 * alphabet that splits a picture differently keeps its own token names; those
 * resolve to `undefined` here and the caller falls back to text.
 */
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import { SPRITE_DEFINITIONS } from './manifest';

/** How much of one sprite a single token accounts for. */
type GlyphSpan = 'whole' | 'first' | 'second';

interface PictureGlyphSprite {
  /** Sprite file stem, matching the manifest `file` (no extension). */
  file: string;
  /** The token's index in the base alphabet. */
  glyph: number;
  /**
   * `whole` means the sprite is this token on its own. `first`/`second` mean the sprite
   * holds both halves of a two-token picture: draw it on `first`, skip `second`.
   */
  span: GlyphSpan;
}

interface GlyphExtract {
  method: string;
  glyph: number;
  glyphRight?: number;
}

const BASE_ALPHABET = kLanguages.us.alphabet;

const asGlyphExtract = (extract: unknown): GlyphExtract | null => {
  const candidate = extract as Partial<GlyphExtract> | null | undefined;
  if (!candidate || candidate.method !== 'dialogue-glyph') return null;
  if (typeof candidate.glyph !== 'number') return null;
  return candidate as GlyphExtract;
};

const addToken = (
  map: Record<string, PictureGlyphSprite>,
  file: string,
  glyph: number,
  span: GlyphSpan,
): void => {
  const token = BASE_ALPHABET[glyph];
  if (token === undefined) return;
  map[token] = { file, glyph, span };
};

const buildSpriteMap = (): Record<string, PictureGlyphSprite> => {
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

const PICTURE_GLYPH_SPRITES: Readonly<Record<string, PictureGlyphSprite>> = buildSpriteMap();

/** Resolve a bracket name as parsed out of a line (`Up`, without its brackets). */
const pictureGlyphSpriteByName = (name: string): PictureGlyphSprite | undefined =>
  PICTURE_GLYPH_SPRITES[`[${name}]`];

export { PICTURE_GLYPH_SPRITES, pictureGlyphSpriteByName };
export type { GlyphSpan, PictureGlyphSprite };
