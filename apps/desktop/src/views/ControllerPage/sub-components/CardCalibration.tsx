/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { DeviceStickCalibration, TriggerCalibration } from '@drizztdourden08/brock-input';
import { Box } from '@drizztdourden08/tessera/primitives';
import { StickCalibrationWizard } from '@app/views/InputTester/sub-components/stick-calibration';
import { TriggerCalibrationWizard } from '@app/views/InputTester/sub-components/trigger-calibration';
import type { CardCalibrationProps } from '../ControllerPage.type';

const CardCalibration = (props: CardCalibrationProps) => {
  const { deviceKey, target, existingStickCal, onClose, onStickComplete, onTriggerComplete } = props;
  const triggerAxisIndex = target?.type === 'trigger' ? target.axisIndex : -1;
  const completeStick = useCallback((calibration: DeviceStickCalibration) => {
    onStickComplete(calibration);
    onClose();
  }, [onStickComplete, onClose]);
  const completeTrigger = useCallback((calibration: TriggerCalibration) => {
    onTriggerComplete(triggerAxisIndex, calibration);
    onClose();
  }, [onTriggerComplete, triggerAxisIndex, onClose]);

  if (target?.type === 'stick') {
    return (
      <Box>
        <StickCalibrationWizard
          target={target.side === 'both' ? undefined : target.side}
          onComplete={completeStick}
          onCancel={onClose}
          existingCalibration={existingStickCal}
          deviceKey={deviceKey}
        />
      </Box>
    );
  }
  if (target?.type === 'trigger') {
    return (
      <Box>
        <TriggerCalibrationWizard
          axisIndex={target.axisIndex}
          label={target.label}
          onComplete={completeTrigger}
          onCancel={onClose}
          deviceKey={deviceKey}
        />
      </Box>
    );
  }
  return null;
};

export { CardCalibration };
