/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { TriggerActionButtons } from './TriggerActionButtons';
import type { TriggerCardActionsProps } from './TriggerCards.type';

const TriggerCardActions = (props: TriggerCardActionsProps) => (
  <Box className="hid-cal__prereq-actions">
    <TriggerActionButtons {...props} />
  </Box>
);

export { TriggerCardActions };
