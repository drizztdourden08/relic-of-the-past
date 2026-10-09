/* @layer shared-input @kind logic */
import type { SlotAssignment, SlotIndex } from '../../../types/controls/scheme';

const remapAssignments = (
  assignments: Readonly<Record<SlotIndex, SlotAssignment>>,
  renumber: ReadonlyMap<SlotIndex, SlotIndex>,
): Record<SlotIndex, SlotAssignment> => {
  const next: Record<SlotIndex, SlotAssignment> = {};
  for (const [key, assignment] of Object.entries(assignments)) {
    const moved = renumber.get(Number(key));
    if (moved !== undefined) next[moved] = assignment;
  }
  return next;
};

export { remapAssignments };
