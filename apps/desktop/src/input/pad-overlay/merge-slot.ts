/* @layer renderer-lib @kind logic */
import type { ControllerSlotId } from '@drizztdourden08/tessera/composites';
import type { SlotPatches } from './merge-slot.type';
import type { OverlaySlot } from './pad-overlay.type';

const isComplete = (slot: Partial<OverlaySlot>): slot is OverlaySlot =>
  slot.anchor !== undefined && slot.kind !== undefined && slot.glyph !== undefined && slot.label !== undefined;

const patchedBase = (base: readonly OverlaySlot[], patches: SlotPatches): OverlaySlot[] =>
  base.flatMap((slot) => {
    const patch = patches[slot.anchor];
    if (patch === null) return [];
    return [patch ? { ...slot, ...patch } : slot];
  });

const addedSlots = (base: readonly OverlaySlot[], patches: SlotPatches): OverlaySlot[] =>
  Object.entries(patches).flatMap(([anchor, patch]) => {
    if (!patch || base.some((slot) => slot.anchor === anchor)) return [];
    const added = { ...patch, anchor: anchor as ControllerSlotId };
    return isComplete(added) ? [added] : [];
  });

const mergeSlots = (base: readonly OverlaySlot[], patches: SlotPatches | undefined): OverlaySlot[] =>
  patches ? [...patchedBase(base, patches), ...addedSlots(base, patches)] : [...base];

export { mergeSlots };
