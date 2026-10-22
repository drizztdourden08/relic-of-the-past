/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import { DeadzoneSlider } from '../../calibration-parts';
import type { StickReviewStepProps } from '../stick-calibration.type';
import { applyCalibration } from '../apply-calibration';
import { StickCircle } from './StickCircle';

const StickReviewStep = ({ cal, onComplete }: StickReviewStepProps) => {
  const { buildCalibration, setStep, restart, calibrateLeft, calibrateRight } = cal;
  const { rawLX, rawLY, rawRX, rawRY, innerDz, setInnerDz, outerDz, setOuterDz } = cal;
  const previewCal = buildCalibration();
  const previewL = applyCalibration(rawLX, rawLY, previewCal.left);
  const previewR = applyCalibration(rawRX, rawRY, previewCal.right);
  const handleSave = useCallback(() => onComplete(buildCalibration()), [onComplete, buildCalibration]);
  const goRange = useCallback(() => setStep('range'), [setStep]);

  return (
    <Box>
      <Text as="p" className="cal-wizard__para">
        <Text as="strong">Test the calibrated output</Text>. Sticks should be centered at rest and reach the edge evenly. Adjust the deadzones below.
      </Text>
      <Box className="stick-cal__dz-grid">
        <DeadzoneSlider title="Inner Deadzone" value={innerDz} min={0} max={30} note="Eliminates stick drift near center" onChange={setInnerDz} />
        <DeadzoneSlider title="Outer Deadzone" value={outerDz} min={70} max={100} note="Reach full tilt before physical edge" onChange={setOuterDz} />
      </Box>
      <Box className="stick-cal__circles">
        {calibrateLeft && <StickCircle x={previewL.x} y={previewL.y} label="L Stick (calibrated)" large showDeadzones innerDeadzone={innerDz} outerDeadzone={outerDz} />}
        {calibrateRight && <StickCircle x={previewR.x} y={previewR.y} label="R Stick (calibrated)" large showDeadzones innerDeadzone={innerDz} outerDeadzone={outerDz} />}
      </Box>
      <Box className="cal-wizard__actions cal-wizard__actions--wide">
        <Button variant="primary" size="sm" onClick={handleSave}>Save Calibration</Button>
        <Button variant="tertiary" size="sm" onClick={goRange}>Back</Button>
        <Button variant="tertiary" size="sm" onClick={restart}>Start Over</Button>
      </Box>
    </Box>
  );
};

export { StickReviewStep };
