/* @layer renderer-components @kind component */
/**
 * HapticsToggle - one switch for this profile's rumble: when on, every
 * controller assigned to the profile receives it, not a hand-picked subset.
 * Sits top right of the mapping container's heading row (see ControlsMain),
 * since it is a property of this profile's mapping, not of any one device.
 * Presentational - state lives in useHapticsToggle.
 */

import { Box } from '../../../../../../design-system/primitives/Box';
import { Toggle } from '../../../../../../design-system/primitives/Toggle';
import './HapticsToggle.css';

interface HapticsToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

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
