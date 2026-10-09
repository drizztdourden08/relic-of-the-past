/* @layer shared-input @kind logic */
import { FIRST_SLOT } from './slot-list.constants';
import type { ModernSlot, SlotIndex } from '../../../types/controls/scheme';
import type { SlotListEdit } from './slot-list.type';

const renumberSlots = (slots: readonly ModernSlot[]): SlotListEdit => {
  const renumber = new Map<SlotIndex, SlotIndex>();
  const next = slots.map((slot, position) => {
    const index = FIRST_SLOT + position;
    renumber.set(slot.index, index);
    return slot.index === index ? slot : { ...slot, index };
  });
  return { slots: next, renumber };
};

export { renumberSlots };
