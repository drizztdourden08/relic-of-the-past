/* @layer renderer-components @kind logic */
import { findGlyphPack, GENERIC_PACK_ID } from '@shared/input/glyphs';
import { glyphSourceFor } from './glyph-source-for';
import { glyphUrlOf } from './glyph-url-of';
import type { GlyphPack, HudGlyphPosition } from '@shared/types/hud';

const glyphArtUrl = (
  packs: readonly GlyphPack[], packId: string | undefined, position: string,
): string | undefined => {
  const generic = findGlyphPack(GENERIC_PACK_ID, packs);
  const pack = packId ? findGlyphPack(packId, packs) : null;
  return glyphUrlOf(glyphSourceFor(pack, generic, position as HudGlyphPosition));
};

export { glyphArtUrl };
