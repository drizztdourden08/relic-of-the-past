/* @layer renderer-components @kind logic */
import { SAMPLE_ITEM_POOL } from './sample-state.constants';
import type { ModernSlot, SlotAssignment, SlotIndex } from '@rotp/game-data';

const sampleSlotAssignments = (
  slots: readonly ModernSlot[],
): Readonly<Record<SlotIndex, SlotAssignment>> => Object.fromEntries(slots.map((slot, order) => {
  if (order === 1) return [slot.index, { kind: 'sword' } as SlotAssignment];
  if (order === 3) return [slot.index, { kind: 'action' } as SlotAssignment];
  const at = (slot.index * 7 + 3) % SAMPLE_ITEM_POOL.length;
  return [slot.index, { kind: 'item', hudItem: SAMPLE_ITEM_POOL[at] } as SlotAssignment];
}));

export { sampleSlotAssignments };
