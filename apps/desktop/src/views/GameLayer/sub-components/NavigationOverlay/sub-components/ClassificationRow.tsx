/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { ClassificationRowProps } from './ClassificationRow.type';

const ClassificationRow = ({ label, value, tag, tone }: ClassificationRowProps) => (
  <Box className="nav-tip__class-row">
    <Text className="nav-tip__class-label">{label}</Text>
    <Text className={tone ? undefined : 'nav-tip__text'} data-tone={tone}>{value}</Text>
    {tag && <Text className="nav-tip__class-tag">{tag}</Text>}
  </Box>
);

export { ClassificationRow };
