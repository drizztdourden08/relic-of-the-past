/* @layer shared-input @kind logic */
/**
 * Which glyph to draw for one position, given the pack the player chose.
 *
 * Chain of responsibility, first answer wins:
 *   the chosen pack → the pack it names as its own fallback (followed as far
 *   as it goes) → the device's family pack → the generic pack.
 *
 * The pack id 'auto' means "whatever this device's family is", which is the
 * default: a player who never opens the glyph setting sees their own pad.
 * Choosing a pack explicitly is therefore an override of the device, not a
 * replacement for it. A custom pack that only draws four face buttons still
 * shows correct shoulders, because the device's own family answers for
 * everything the custom pack left out.
 *
 * A pack answering null for a position is not an error: the generic pack
 * covers every position, so null out the far end means the position has no
 * artwork anywhere and the caller should fall back to the control's label.
 */
import { BUILT_IN_GLYPH_PACKS, GENERIC_PACK_ID, findGlyphPack } from './built-in-packs';
import type { SdlAxisName, SdlButtonName } from '../family';
import type { DeviceFamily } from '../../types/controls';
import type { GlyphPack, GlyphSource } from '@shared/types/hud/glyph-pack';

/** The pack id that follows a device's own family. */
const AUTO_PACK_ID = 'auto';

const FAMILY_PACK_IDS: Record<DeviceFamily, string> = {
  xbox: 'xbox',
  playstation: 'playstation',
  nintendo: 'switch',
  '8bitdo': GENERIC_PACK_ID,
  keyboard: 'keyboard',
  generic: GENERIC_PACK_ID,
};

/** Walks a pack and its declared fallbacks. Cycle-safe: a pack already
 *  visited is never asked twice. */
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

export { AUTO_PACK_ID, FAMILY_PACK_IDS, resolveGlyph };
