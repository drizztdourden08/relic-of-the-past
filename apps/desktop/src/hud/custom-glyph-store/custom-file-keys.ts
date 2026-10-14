/* @layer renderer-lib @kind logic */
import type { GlyphPack, GlyphSource } from '@rotp/input-mapping';

const customFileKeys = (pack: GlyphPack): string[] =>
  Object.values<GlyphSource | undefined>(pack.glyphs).flatMap((source) => (source?.kind === 'custom' ? [source.fileKey] : []));

export { customFileKeys };
