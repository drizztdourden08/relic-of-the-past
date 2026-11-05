/* @layer renderer-components @kind logic */
import type { BindingSlot } from '@drizztdourden08/brock-input';
import type { SlotAssignment, SlotIndex } from '@rotp/game-data';
import type { AbsentAssignment } from './slots-footer.type';

const findAbsentAssignments = (
  assignments: Readonly<Record<SlotIndex, SlotAssignment>>,
  slots: readonly BindingSlot[],
): AbsentAssignment[] => {
  const present = new Set(slots.map((slot) => slot.index));
  return Object.entries(assignments)
    .map(([key, assignment]) => ({ index: Number(key), assignment }))
    .filter((entry) => !present.has(entry.index) && entry.assignment.kind !== 'none');
};

export { findAbsentAssignments };
