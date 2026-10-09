/* @layer shared-game @kind types */
type GlyphSpan = 'whole' | 'first' | 'second';

interface PictureGlyphSprite {
  file: string;
  glyph: number;
  span: GlyphSpan;
}

interface GlyphExtract {
  method: string;
  glyph: number;
  glyphRight?: number;
}

export type { GlyphExtract, GlyphSpan, PictureGlyphSprite };
