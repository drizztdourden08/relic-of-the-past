/* @layer renderer-components @kind component */
import { Box, Toggle } from '@drizztdourden08/tessera/primitives';
import type { TouchOptionsTabProps } from './touch-options-tab.type';

const TouchOptionsTab = ({ touch, onChange }: TouchOptionsTabProps) => (
  <Box>
    <Toggle
      label="Touch controls"
      description="Draw the on-screen controls over the game."
      checked={touch.enabled}
      onChange={(enabled) => onChange({ touchControls: { ...touch, enabled } })}
    />
    <Toggle
      label="Hide while a controller is connected"
      checked={touch.hideWithPad}
      disabled={!touch.enabled}
      onChange={(hideWithPad) => onChange({ touchControls: { ...touch, hideWithPad } })}
    />
  </Box>
);

export { TouchOptionsTab };
