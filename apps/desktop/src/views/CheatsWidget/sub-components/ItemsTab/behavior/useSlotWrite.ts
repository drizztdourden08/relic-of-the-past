/* @layer renderer-widgets @kind hook */
import { useCallback } from 'react';
import { cheatSetInventorySlot, deliverItem } from '@app/game';
import { CHEAT_SOURCE } from '../ItemsTab.constants';
import type { SlotWrite } from '../ItemsTab.type';

const useSlotWrite = () => useCallback((write: SlotWrite): void => {
  if (write.op === 'give') {
    deliverItem({ itemId: write.receiveItemId, message: write.label, source: CHEAT_SOURCE });
    return;
  }
  cheatSetInventorySlot(write.slot, write.value);
}, []);

export { useSlotWrite };
