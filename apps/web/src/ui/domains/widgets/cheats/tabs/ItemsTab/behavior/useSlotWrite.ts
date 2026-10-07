/* @layer renderer-widgets @kind hook */
/**
 * The two write paths a tier choice resolves to. A give rides the delivery queue, so the
 * hold-up, the message and the counters are the game's own; a set writes the byte directly,
 * which is the remove, downgrade and "exactly this tier" path.
 */
import { useCallback } from 'react';
import { cheatSetInventorySlot, deliverItem } from '@app/lib/game';
import type { SlotWrite } from '../ItemsTab.type';

const CHEAT_SOURCE = 'cheat';

const useSlotWrite = () => useCallback((write: SlotWrite): void => {
  if (write.op === 'give') {
    deliverItem(write.receiveItemId, write.label, CHEAT_SOURCE);
    return;
  }
  cheatSetInventorySlot(write.slot, write.value);
}, []);

export { useSlotWrite };
