/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { RowLineProps } from '../CapacityFamilyRow.type';

const RowLine = (props: RowLineProps) => {
  const { label, children, note, className = '' } = props;
  return (
    <Box className={`capacity-row__line${className ? ` ${className}` : ''}`}>
      <Text className="capacity-row__line-label">{label}</Text>
      <Box className="capacity-row__line-body">
        <Box className="capacity-row__line-controls">{children}</Box>
        {note !== undefined && <Text className="capacity-row__note">{note}</Text>}
      </Box>
    </Box>
  );
};

export { RowLine };
