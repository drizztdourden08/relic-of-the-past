/* @layer renderer-lib @kind logic */
import { BUILT_IN_GLYPH_PACKS } from '@shared/input/glyphs';
import type { GlyphPack } from '@shared/types/hud';
import { readCustomPacks } from './read-custom-packs';

const allGlyphPacks = async (): Promise<GlyphPack[]> => [...BUILT_IN_GLYPH_PACKS, ...(await readCustomPacks())];

export { allGlyphPacks };
