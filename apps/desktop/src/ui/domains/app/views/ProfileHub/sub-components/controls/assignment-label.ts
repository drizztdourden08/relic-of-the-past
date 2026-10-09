/* @layer renderer-components @kind logic */
import type { SlotAssignment } from '@shared/types/controls';

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
