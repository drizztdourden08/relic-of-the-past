/* @layer shared-input @kind logic */
import { KEYBOARD_PREFIX, SLOT_PREFIX } from './migrate-slots.constants';
import type { OldSlot } from './migrate-slots.type';

const oldIdsOf = (slot: OldSlot): string[] => {
  const ids: string[] = [];
  if (typeof slot.id === 'string' && slot.id.length > 0) ids.push(slot.id);
  if (slot.position) ids.push(`${SLOT_PREFIX}${slot.position}`);
  if (slot.binding?.type === 'keyboard') ids.push(`${KEYBOARD_PREFIX}${slot.binding.code}`);
  return ids;
};

export { oldIdsOf };
