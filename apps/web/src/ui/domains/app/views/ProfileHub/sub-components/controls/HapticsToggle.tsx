/* @layer renderer-components @kind component */
import { Box, Toggle } from '@drizztdourden08/tessera/primitives';
import type { HapticsToggleProps } from './controls.type';
import './HapticsToggle.css';

const HapticsToggle = (props: HapticsToggleProps) => {
  const { enabled, onChange } = props;

  return (
    <Box className="haptics-toggle">
      <Toggle
        label="Haptics"
        checked={enabled}
        onChange={onChange}
      />
    </Box>
  );
};

export { HapticsToggle };
