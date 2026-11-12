/* @layer renderer-components @kind component */
import { Box, Slider, Toggle } from '@drizztdourden08/tessera/primitives';
import type { TouchOptionsTabProps } from './touch-options-tab.type';

const percent = (value: number): string => `${Math.round(value * 100)}%`;

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
    <Toggle
      label="Vibration"
      checked={touch.haptics}
      disabled={!touch.enabled}
      onChange={(haptics) => onChange({ touchControls: { ...touch, haptics } })}
    />
    <Slider
      label="Vibration strength"
      value={touch.hapticStrength}
      min={0.05}
      max={1}
      step={0.05}
      disabled={!touch.enabled || !touch.haptics}
      formatValue={percent}
      showValue
      onChange={(hapticStrength) => onChange({ touchControls: { ...touch, hapticStrength } })}
    />
  </Box>
);

export { TouchOptionsTab };
