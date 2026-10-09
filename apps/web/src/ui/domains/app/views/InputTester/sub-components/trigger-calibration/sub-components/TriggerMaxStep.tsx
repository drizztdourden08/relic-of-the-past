/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Button } from '../../../../../../../design-system/primitives';
import { CALIBRATION_STYLE } from '../../calibration-parts';
import { MIN_TRIGGER_RANGE, TRIGGER_WIZARD_STYLE } from '../trigger-calibration.constants';
import type { TriggerStepProps } from '../trigger-calibration.type';
import { TriggerBar } from '../TriggerBar';

const TriggerMaxStep = ({ cal, label }: TriggerStepProps) => {
  const { setStep } = cal;
  const goReview = useCallback(() => setStep('review'), [setStep]);
  const goRest = useCallback(() => setStep('rest'), [setStep]);
  const tooShallow = cal.maxValue - cal.baseValue < MIN_TRIGGER_RANGE;

  return (
    <Box>
      <Text as="p" style={CALIBRATION_STYLE.para}>
        <Text as="strong">Fully press the {label}</Text> and hold it down. The software tracks the maximum value.
      </Text>

      <Box style={TRIGGER_WIZARD_STYLE.valueBox}>
        <Box>Rest: {cal.baseValue.toFixed(3)}</Box>
        <Box>Max recorded: {cal.maxValue.toFixed(3)}</Box>
        <Box>Range: {(cal.maxValue - cal.baseValue).toFixed(3)}</Box>
      </Box>

      <Box style={TRIGGER_WIZARD_STYLE.barRowCenter}>
        <TriggerBar value={cal.rawValue} label={`${label} (live)`} step={cal.step} deadzone={cal.deadzone} />
      </Box>

      <Box style={CALIBRATION_STYLE.actions12}>
        <Button variant="primary" size="sm" onClick={goReview} disabled={tooShallow}>
          Next →
        </Button>
        <Button variant="tertiary" size="sm" onClick={goRest}>← Back</Button>
        {tooShallow && (
          <Text style={CALIBRATION_STYLE.hint}>
            Press the trigger fully...
          </Text>
        )}
      </Box>
    </Box>
  );
};

export { TriggerMaxStep };
