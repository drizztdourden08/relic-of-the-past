/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, ToolGroups } from '@drizztdourden08/tessera/primitives';
import { toToolGroups } from '../behavior/to-tool-groups';
import type { StudioActionRowProps } from '../StudioPane.type';

const StudioActionRow = (props: StudioActionRowProps) => {
  const { label, actions, status } = props;
  const groups = useMemo(() => toToolGroups(actions), [actions]);

  return (
    <Box className="studio-pane__actions">
      <ToolGroups compact groups={groups} label={label} />
      {status && <Box className="studio-pane__status" role="status">{status}</Box>}
    </Box>
  );
};

export { StudioActionRow };
