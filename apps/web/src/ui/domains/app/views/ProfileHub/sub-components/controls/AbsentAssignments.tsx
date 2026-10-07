/* @layer renderer-components @kind component */
/**
 * AbsentAssignments lists assignments on a slot number the list does not reach.
 *
 * A number can outrun the list: remove slots until there are four and an
 * assignment made on slot seven has nowhere to sit. It is kept anyway. Add
 * three slots back and it reattaches itself, because the assignment and the
 * slot are joined by the number and by nothing else (contract §19). Deleting it
 * would mean a player who trimmed their list and changed their mind loses what
 * they had set up.
 *
 * They are shown, muted, instead of hidden: an assignment that still exists
 * but does nothing is exactly the kind of state a settings screen should not
 * keep secret.
 */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { assignmentLabel } from './SlotRow';
import { slotName } from '@shared/input/scheme';
import type { AbsentAssignment } from '../controls-settings/useModernScheme';

const AbsentAssignments = ({ entries }: { entries: AbsentAssignment[] }) => {
  if (entries.length === 0) return null;

  return (
    <Box className="modern-tab__absent">
      <Text variant="caption" className="modern-tab__absent-title">
        Kept for slot numbers this profile no longer has. They come back if you add the slots again.
      </Text>
      {entries.map((entry) => (
        <Box key={entry.index} className="modern-tab__absent-row">
          <Text className="modern-tab__absent-slot">{slotName(entry.index)}</Text>
          <Text className="modern-tab__absent-value">{assignmentLabel(entry.assignment)}</Text>
        </Box>
      ))}
    </Box>
  );
};

export { AbsentAssignments };
