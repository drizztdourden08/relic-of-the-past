/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { S } from '@app/navigation-overlay/tooltip/styles';
import type { ClassificationRowProps } from './ClassificationRow.type';

const ClassificationRow = ({ label, value, tag, color }: ClassificationRowProps) => {
  const valueStyle = useMemo(() => (color ? { color } : S.text), [color]);
  return (
    <Box style={S.classRow}>
      <Text style={S.classLabel}>{label}</Text>
      <Text style={valueStyle}>{value}</Text>
      {tag && <Text style={S.classTag}>{tag}</Text>}
    </Box>
  );
};

export { ClassificationRow };
