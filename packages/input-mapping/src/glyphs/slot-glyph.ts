/* @layer shared-input @kind logic */
import { keyboardGlyphPath } from './keyboard-glyph-path';
import { resolveGlyph } from './resolve-glyph';
import type { DeviceFamily, ModernSlot } from '@rotp/game-data';
import type { GlyphPack, GlyphSource } from '../types/glyph-pack';

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
