/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { StickActionButtons } from './StickActionButtons';
import type { StickCardActionsProps } from './StickCards.type';

const StickCardActions = (props: StickCardActionsProps) => (
  <Box className="hid-cal__prereq-actions">
    <StickActionButtons {...props} />
  </Box>
);

export { StickCardActions };
