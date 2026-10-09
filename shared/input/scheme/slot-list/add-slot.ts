/* @layer shared-input @kind logic */
import { FIRST_SLOT, UNBOUND } from './slot-list.constants';
import { renumberSlots } from './renumber-slots';
import { slotName } from './slot-name';
import type { ModernSlot } from '../../../types/controls/scheme';
import type { SlotListEdit, SlotSeed } from './slot-list.type';

const addSlot = (slots: readonly ModernSlot[], seed?: SlotSeed): SlotListEdit => {
  const index = slots.length + FIRST_SLOT;
  const slot: ModernSlot = {
    index,
    binding: seed?.binding ?? UNBOUND,
    label: seed?.label ?? slotName(index),
    ...(seed?.position ? { position: seed.position } : {}),
    ...(seed?.icon ? { icon: seed.icon } : {}),
  };
  return renumberSlots([...slots, slot]);
};

export { addSlot };
