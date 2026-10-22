/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { DeviceStickCalibration, TriggerCalibration } from '@drizztdourden08/brock-input';
import { Box } from '@drizztdourden08/tessera/primitives';
import { StickCalibrationWizard } from './stick-calibration';
import { TriggerCalibrationWizard } from './trigger-calibration';
import type { CardCalibrationProps } from './ControllerCard.type';

const CardCalibration = (props: CardCalibrationProps) => {
  const { deviceKey, target, existingStickCal, onClose, onStickCalibrationComplete, onTriggerCalibrationComplete } = props;
  const triggerAxisIndex = target?.type === 'trigger' ? target.axisIndex : -1;
  const completeStick = useCallback((cal: DeviceStickCalibration) => {
    onStickCalibrationComplete?.(cal);
    onClose();
  }, [onStickCalibrationComplete, onClose]);
  const completeTrigger = useCallback((cal: TriggerCalibration) => {
    onTriggerCalibrationComplete?.(deviceKey, triggerAxisIndex, cal);
    onClose();
  }, [onTriggerCalibrationComplete, deviceKey, triggerAxisIndex, onClose]);

  if (target?.type === 'stick') {
    return (
      <Box className="input-cal__wizard-wrap">
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
      <Box className="input-cal__wizard-wrap">
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
