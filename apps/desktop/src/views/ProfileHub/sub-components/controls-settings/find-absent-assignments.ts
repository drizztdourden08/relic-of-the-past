/* @layer renderer-components @kind logic */
import type { ModernSlot, SlotAssignment, SlotIndex } from '@rotp/game-data';
import type { AbsentAssignment } from './controls-settings.type';

const findAbsentAssignments = (
  assignments: Readonly<Record<SlotIndex, SlotAssignment>>,
  slots: readonly ModernSlot[],
): AbsentAssignment[] => {
  const present = new Set(slots.map((slot) => slot.index));
  return Object.entries(assignments)
    .map(([key, assignment]) => ({ index: Number(key), assignment }))
    .filter((entry) => !present.has(entry.index) && entry.assignment.kind !== 'none');
};

export { findAbsentAssignments };
