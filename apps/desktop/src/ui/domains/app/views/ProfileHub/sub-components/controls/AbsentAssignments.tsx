/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { assignmentLabel } from './assignment-label';
import { slotName } from '@rotp/input-mapping';
import type { AbsentAssignmentsProps } from './controls.type';

const AbsentAssignments = ({ entries }: AbsentAssignmentsProps) => {
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
