/* @layer renderer-components @kind component */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
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
