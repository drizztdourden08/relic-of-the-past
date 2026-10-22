/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import { MIN_TRIGGER_RANGE } from '../trigger-calibration.constants';
import type { TriggerStepProps } from '../trigger-calibration.type';
import { TriggerBar } from './TriggerBar';

const TriggerMaxStep = ({ cal, label }: TriggerStepProps) => {
  const { setStep } = cal;
  const goReview = useCallback(() => setStep('review'), [setStep]);
  const goRest = useCallback(() => setStep('rest'), [setStep]);
  const tooShallow = cal.maxValue - cal.baseValue < MIN_TRIGGER_RANGE;

  return (
    <Box>
      <Text as="p" className="cal-wizard__para">
        <Text as="strong">Fully press the {label}</Text> and hold it down. The software tracks the maximum value.
      </Text>

      <Box className="cal-wizard__value-box">
        <Box>Rest: {cal.baseValue.toFixed(3)}</Box>
        <Box>Max recorded: {cal.maxValue.toFixed(3)}</Box>
        <Box>Range: {(cal.maxValue - cal.baseValue).toFixed(3)}</Box>
      </Box>

      <Box className="trigger-cal__bar-row-center">
        <TriggerBar value={cal.rawValue} label={`${label} (live)`} step={cal.step} deadzone={cal.deadzone} />
      </Box>

      <Box className="cal-wizard__actions">
        <Button variant="primary" size="sm" onClick={goReview} disabled={tooShallow}>
          Next
        </Button>
        <Button variant="tertiary" size="sm" onClick={goRest}>Back</Button>
        {tooShallow && (
          <Text className="cal-wizard__hint">
            Press the trigger fully...
          </Text>
        )}
      </Box>
    </Box>
  );
};

export { TriggerMaxStep };
