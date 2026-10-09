/* @layer shared-input @kind logic */
import { BUILT_IN_GLYPH_PACKS } from './built-in-glyph-packs.constants';
import type { GlyphPack } from '../../types/glyph-pack';

const findGlyphPack = (id: string, packs: readonly GlyphPack[] = BUILT_IN_GLYPH_PACKS): GlyphPack | null => {
  return packs.find(pack => pack.id === id) ?? null;
};

export { findGlyphPack };
