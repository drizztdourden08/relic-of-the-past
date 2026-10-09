/* @layer renderer-components @kind logic */
import { DPAD_ART } from './glyph-art.constants';
import type { GlyphPack, GlyphSource, HudGlyphPosition } from '@shared/types/hud';

const glyphSourceFor = (
  pack: GlyphPack | null, generic: GlyphPack | null, position: HudGlyphPosition,
): GlyphSource | null => {
  if (position === 'DPAD') return DPAD_ART;
  if (!pack) return generic?.glyphs[position] ?? null;
  return pack.glyphs[position] ?? generic?.glyphs[position] ?? null;
};

export { glyphSourceFor };
