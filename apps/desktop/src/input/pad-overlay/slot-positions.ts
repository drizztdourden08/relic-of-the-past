/* @layer renderer-lib @kind logic */
import { SLOT_POSITIONS } from '../controller-families/controller-families.constants';
import type { OverlaySlot } from './pad-overlay.type';
import { DPAD_SLOTS } from './slot-positions.constants';

const slotPositions = (slot: OverlaySlot): readonly string[] =>
  slot.kind === 'dpad'
    ? DPAD_SLOTS.flatMap((id) => SLOT_POSITIONS[id] ?? [])
    : (SLOT_POSITIONS[slot.anchor] ?? []);

export { slotPositions };
