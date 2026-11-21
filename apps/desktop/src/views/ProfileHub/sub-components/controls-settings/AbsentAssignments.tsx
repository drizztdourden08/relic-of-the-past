/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { assignmentLabel } from './assignment-label';
import { slotName } from '@rotp/input-mapping';
import type { AbsentAssignmentsProps } from './slots-footer.type';

const AbsentAssignments = ({ entries }: AbsentAssignmentsProps) => {
  const t = useT();
  if (entries.length === 0) return null;

  return (
    <Box className="modern-tab__absent">
      <Text variant="caption" className="modern-tab__absent-title">
        {t('profiles:controls.absent.note')}
      </Text>
      {entries.map((entry) => (
        <Box key={entry.index} className="modern-tab__absent-row">
          <Text className="modern-tab__absent-slot">{slotName(entry.index)}</Text>
          <Text className="modern-tab__absent-value">{assignmentLabel(entry.assignment, t)}</Text>
        </Box>
      ))}
    </Box>
  );
};

export { AbsentAssignments };
