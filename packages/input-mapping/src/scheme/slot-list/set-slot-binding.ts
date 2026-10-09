/* @layer shared-input @kind logic */
import type { InputBinding, ModernSlot, SlotIndex } from '@rotp/game-data';
import type { SlotSeed } from './slot-list.type';

const setSlotBinding = (
  slots: readonly ModernSlot[],
  index: SlotIndex,
  binding: InputBinding,
  display?: Pick<SlotSeed, 'position' | 'icon' | 'label'>,
): ModernSlot[] => slots.map((slot) => {
  if (slot.index !== index) return slot;
  return {
    index: slot.index,
    binding,
    label: display?.label ?? slot.label,
    ...(display?.position ? { position: display.position } : {}),
    ...(display?.icon ? { icon: display.icon } : {}),
  };
});

export { setSlotBinding };
