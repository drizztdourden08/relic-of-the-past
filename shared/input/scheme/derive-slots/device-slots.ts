/* @layer shared-input @kind logic */
import { renumberSlots } from '../slot-list';
import { slotForControl } from './slot-for-control';
import type { ResolvedControl } from '../../family/family.type';
import type { ModernSlot } from '../../../types/controls';

const deviceSlots = (controls: readonly ResolvedControl[]): ModernSlot[] => {
  const slots: Omit<ModernSlot, 'index'>[] = [];
  for (const control of controls) {
    const slot = slotForControl(control);
    if (slot) slots.push(slot);
  }
  return renumberSlots(slots.map((slot) => ({ ...slot, index: 0 }))).slots;
};

export { deviceSlots };
