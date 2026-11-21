/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SlotAssignment } from '@rotp/game-data';

const assignmentLabel = (assignment: SlotAssignment | undefined, t: I18n['t']): string => {
  if (!assignment) return t('profiles:controls.assignment.none');
  switch (assignment.kind) {
    case 'sword': return t('profiles:controls.assignment.sword');
    case 'action': return t('profiles:controls.assignment.action');
    case 'item': return t('profiles:controls.assignment.item');
    case 'none': return t('profiles:controls.assignment.none');
  }
};

export { assignmentLabel };
