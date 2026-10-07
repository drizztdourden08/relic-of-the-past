/* @layer shared-input @kind logic */
/**
 * The glyph one modern slot draws. It is the control the player actually PRESSES.
 *
 * A slot carries two facts that can disagree: WHERE it sits on the device
 * (`position`, fixed for the life of the pad) and WHAT it reads (`binding`,
 * which the player may have moved onto a key). The binding is what a finger
 * has to find, so it is asked first: a slot at EAST bound to a key draws that
 * key's cap, never the pad artwork for a button pressing which does nothing.
 *
 * Position-first was the original order, and it reached the keyboard branch
 * only for a slot with no position at all. That is right for a whole keyboard
 * profile and wrong for one rebound control on a pad, because it sent that chip
 * through the pack chain for its POSITION, so the chip showed whatever cap the
 * keyboard preset happens to place on EAST. The live HUD carried a corrected
 * copy of this rule while the layout editor's preview kept calling here, which
 * is exactly the drift one shared rule exists to prevent.
 *
 * The keyboard branch is not an optional nicety either: a cluster skips any
 * chip with no glyph, so without it "this device has no SDL positions" renders
 * as "this device has no buttons", and a keyboard player sees an empty corner
 * where their whole control map should be.
 */
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
