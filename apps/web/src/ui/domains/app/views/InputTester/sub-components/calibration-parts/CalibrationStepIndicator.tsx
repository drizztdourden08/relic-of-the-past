/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import {
  STEP_BAR, STEP_ITEM_ACTIVE, STEP_ITEM_IDLE, STEP_NUMBER_ACTIVE, STEP_NUMBER_IDLE,
} from './calibration-parts.constants';
import type { CalibrationStepIndicatorProps } from './calibration-parts.type';

const CalibrationStepIndicator = <K extends string,>(props: CalibrationStepIndicatorProps<K>) => {
  const { steps, current } = props;
  return (
    <Box style={STEP_BAR}>
      {steps.map((s, i) => (
        <Box key={s.key} style={current === s.key ? STEP_ITEM_ACTIVE : STEP_ITEM_IDLE}>
          <Text style={current === s.key ? STEP_NUMBER_ACTIVE : STEP_NUMBER_IDLE}>{i + 1}</Text>
          {s.label}
        </Box>
      ))}
    </Box>
  );
};

export { CalibrationStepIndicator };
