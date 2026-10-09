/* @layer renderer-components @kind logic */
import type { SlotAssignment } from '@rotp/game-data';

const assignmentLabel = (assignment: SlotAssignment | undefined): string => {
  if (!assignment) return 'Unassigned';
  switch (assignment.kind) {
    case 'sword': return 'Sword';
    case 'action': return 'Action';
    case 'item': return 'Item';
    case 'none': return 'Unassigned';
  }
};

export { assignmentLabel };
