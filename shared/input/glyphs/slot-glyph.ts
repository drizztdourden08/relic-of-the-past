/* @layer shared-input @kind logic */
import { keyboardGlyphPath } from './keyboard-glyph-path';
import { resolveGlyph } from './resolve-glyph';
import type { DeviceFamily } from '../../types/controls';
import type { GlyphPack, GlyphSource } from '../../types/hud/glyph-pack';
import type { ModernSlot } from '../../types/controls/scheme';

const slotGlyph = (
  slot: ModernSlot,
  packId: string,
  family: DeviceFamily,
  packs?: readonly GlyphPack[],
): GlyphSource | null => {
  if (slot.binding.type === 'keyboard') {
    const assetPath = keyboardGlyphPath(slot.binding.code);
    return assetPath ? { kind: 'built-in', assetPath } : null;
  }
  return slot.position ? resolveGlyph(packId, slot.position, family, packs) : null;
};

export { slotGlyph };
