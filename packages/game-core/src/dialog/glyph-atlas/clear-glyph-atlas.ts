/* @layer bridge-wasm @kind logic */
import { glyphAtlasCache } from './glyph-atlas-cache';

const clearGlyphAtlas = (): void => {
  glyphAtlasCache.clear();
};

export { clearGlyphAtlas };
