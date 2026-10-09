/* @layer shared-input @kind logic */
import { BUILT_IN_GLYPH_PACKS, GENERIC_PACK_ID, findGlyphPack } from './built-in-packs';
import { AUTO_PACK_ID, FAMILY_PACK_IDS } from './resolve-glyph.constants';
import type { SdlAxisName, SdlButtonName } from '../family';
import type { DeviceFamily } from '../../types/controls';
import type { GlyphPack, GlyphSource } from '@shared/types/hud/glyph-pack';

const fromPackChain = (
  packId: string,
  position: SdlButtonName | SdlAxisName,
  packs: readonly GlyphPack[],
  seen: Set<string>,
): GlyphSource | null => {
  let current: GlyphPack | null = seen.has(packId) ? null : findGlyphPack(packId, packs);
  while (current) {
    seen.add(current.id);
    const glyph = current.glyphs[position];
    if (glyph) return glyph;
    const next: string | undefined = current.fallbackPack;
    current = next && !seen.has(next) ? findGlyphPack(next, packs) : null;
  }
  return null;
};

const resolveGlyph = (
  packId: string,
  position: SdlButtonName | SdlAxisName,
  deviceFamily: DeviceFamily,
  packs: readonly GlyphPack[] = BUILT_IN_GLYPH_PACKS,
): GlyphSource | null => {
  const seen = new Set<string>();
  const chain = [
    ...(packId === AUTO_PACK_ID ? [] : [packId]),
    FAMILY_PACK_IDS[deviceFamily] ?? GENERIC_PACK_ID,
    GENERIC_PACK_ID,
  ];
  for (const id of chain) {
    const glyph = fromPackChain(id, position, packs, seen);
    if (glyph) return glyph;
  }
  return null;
};

export { resolveGlyph };
