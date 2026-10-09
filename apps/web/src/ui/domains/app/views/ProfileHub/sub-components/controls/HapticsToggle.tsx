/* @layer renderer-components @kind component */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Toggle } from '../../../../../../design-system/primitives/Toggle';
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
