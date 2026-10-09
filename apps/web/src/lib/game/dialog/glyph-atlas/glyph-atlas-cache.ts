/* @layer bridge-wasm @kind logic */
import type { GlyphAtlas } from './glyph-atlas.type';

const glyphAtlasCache = new Map<string, GlyphAtlas>();

export { glyphAtlasCache };
