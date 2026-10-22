/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import { DeadzoneSlider } from '../../calibration-parts';
import type { TriggerReviewStepProps } from '../trigger-calibration.type';
import { TriggerBar } from './TriggerBar';

const TriggerReviewStep = ({ cal, onComplete }: TriggerReviewStepProps) => {
  const { baseValue, maxValue, deadzone, setDeadzone, setStep, resetRest } = cal;
  const handleSave = useCallback(
    () => onComplete({ base: baseValue, max: maxValue, deadzone }),
    [onComplete, baseValue, maxValue, deadzone],
  );
  const goMax = useCallback(() => setStep('max'), [setStep]);
  const startOver = useCallback(() => { resetRest(); setStep('rest'); }, [resetRest, setStep]);

  return (
    <Box>
      <Text as="p" className="cal-wizard__para">
        <Text as="strong">Test the calibrated output.</Text> The trigger should read 0 at rest and 1 when fully pressed.
      </Text>

      <Box className="trigger-cal__dz-box">
        <DeadzoneSlider title="Deadzone" value={deadzone} min={0} max={20} note="Eliminates noise near rest position" onChange={setDeadzone} />
      </Box>

      <Box className="trigger-cal__bar-pair">
        <TriggerBar value={cal.rawValue} label="Raw" step={cal.step} deadzone={deadzone} />
        <TriggerBar value={cal.calibratedValue()} label="Calibrated" step={cal.step} deadzone={deadzone} />
      </Box>

      <Box className="cal-wizard__actions cal-wizard__actions--wide">
        <Button variant="primary" size="sm" onClick={handleSave}>
          Save Calibration
        </Button>
        <Button variant="tertiary" size="sm" onClick={goMax}>Back</Button>
        <Button variant="tertiary" size="sm" onClick={startOver}>
          Start Over
        </Button>
      </Box>
    </Box>
  );
};

export { TriggerReviewStep };
