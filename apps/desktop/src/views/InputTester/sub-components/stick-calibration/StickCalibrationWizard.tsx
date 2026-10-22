/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { CalibrationHeader, CalibrationStepIndicator } from '../calibration-parts';
import { STICK_STEPS } from './stick-calibration.constants';
import type { StickCalibrationWizardProps } from './stick-calibration.type';
import { useStickCalibration } from './behavior/useStickCalibration';
import { StickCenterStep } from './sub-components/StickCenterStep';
import { StickRangeStep } from './sub-components/StickRangeStep';
import { StickReviewStep } from './sub-components/StickReviewStep';
import './StickCalibrationWizard.css';

const StickCalibrationWizard = (props: StickCalibrationWizardProps) => {
  const { onComplete, onCancel, existingCalibration, target, deviceKey } = props;
  const cal = useStickCalibration({ existingCalibration, target, deviceKey });
  const title = target ? `${target === 'left' ? 'Left' : 'Right'} Stick Calibration` : 'Stick Calibration';

  return (
    <Box className="hid-cal stick-cal">
      <CalibrationHeader title={title} onCancel={onCancel} />
      <CalibrationStepIndicator steps={STICK_STEPS} current={cal.step} />
      {cal.step === 'center' && <StickCenterStep cal={cal} target={target} />}
      {cal.step === 'range' && <StickRangeStep cal={cal} target={target} />}
      {cal.step === 'review' && <StickReviewStep cal={cal} onComplete={onComplete} />}
    </Box>
  );
};

export { StickCalibrationWizard };
