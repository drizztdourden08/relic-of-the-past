/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { CalibrationHeader, CalibrationStepIndicator } from '../calibration-parts';
import { useTriggerCalibration } from './behavior/useTriggerCalibration';
import { TRIGGER_STEPS } from './trigger-calibration.constants';
import type { TriggerCalibrationWizardProps } from './trigger-calibration.type';
import { TriggerRestStep } from './sub-components/TriggerRestStep';
import { TriggerMaxStep } from './sub-components/TriggerMaxStep';
import { TriggerReviewStep } from './sub-components/TriggerReviewStep';
import './TriggerCalibrationWizard.css';

const TriggerCalibrationWizard = (props: TriggerCalibrationWizardProps) => {
  const { axisIndex, label, onComplete, onCancel, existingCalibration, deviceKey } = props;
  const cal = useTriggerCalibration({ axisIndex, deviceKey, existingCalibration });

  return (
    <Box className="hid-cal trigger-cal">
      <CalibrationHeader title={`${label} Calibration`} onCancel={onCancel} />
      <CalibrationStepIndicator steps={TRIGGER_STEPS} current={cal.step} />
      {cal.step === 'rest' && <TriggerRestStep cal={cal} label={label} axisIndex={axisIndex} />}
      {cal.step === 'max' && <TriggerMaxStep cal={cal} label={label} />}
      {cal.step === 'review' && <TriggerReviewStep cal={cal} onComplete={onComplete} />}
    </Box>
  );
};

export { TriggerCalibrationWizard };
