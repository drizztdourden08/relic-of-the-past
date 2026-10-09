/* @layer shared-input @kind logic */
import { renumberSlots } from './renumber-slots';
import type { ModernSlot, SlotIndex } from '../../../types/controls/scheme';
import type { SlotListEdit } from './slot-list.type';

const removeSlot = (slots: readonly ModernSlot[], index: SlotIndex): SlotListEdit =>
  renumberSlots(slots.filter((slot) => slot.index !== index));

export { removeSlot };
