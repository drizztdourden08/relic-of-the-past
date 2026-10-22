/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { FULL_PRESS_HIGHLIGHT } from '../trigger-calibration.constants';
import type { TriggerBarProps } from '../trigger-calibration.type';

const TriggerBar = (props: TriggerBarProps) => {
  const { value, label, step, deadzone } = props;
  const fill = Math.max(0, Math.min(1, value));
  const levels = { '--trigger-fill': fill, '--trigger-deadzone': deadzone } as CSSProperties;
  const fillClass = fill > FULL_PRESS_HIGHLIGHT ? 'trigger-cal__fill trigger-cal__fill--full' : 'trigger-cal__fill';

  return (
    <Box className="trigger-cal__bar-col">
      <Text className="trigger-cal__bar-label">{label}</Text>
      <Box className="trigger-cal__track" style={levels}>
        <Box className={fillClass} />
        {step === 'review' && deadzone > 0 && <Box className="trigger-cal__deadzone" />}
      </Box>
      <Text className="trigger-cal__bar-values">
        {value.toFixed(2)}
      </Text>
    </Box>
  );
};

export { TriggerBar };
