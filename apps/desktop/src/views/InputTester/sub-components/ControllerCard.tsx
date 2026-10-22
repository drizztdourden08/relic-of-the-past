/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import type { ControllerCardProps, CalibrationTarget } from './ControllerCard.type';
import { CardCalibration } from './CardCalibration';
import { ControllerAxes } from './ControllerAxes';
import { ControllerButtonGrid } from './ControllerButtonGrid';
import { ControllerCardActions } from './ControllerCardActions';
import { ControllerCardHeader } from './ControllerCardHeader';
import { ControllerRawBytes } from './ControllerRawBytes';
import { ControllerStatusBar } from '../../../compounds/ControllerStatusBar';
import './ControllerCard.css';

const ControllerCard = (props: ControllerCardProps) => {
  const { deviceKey, state, resolvedDevice, hasStickCal, existingStickCal, busType, hasRumble, hasGyro } = props;
  const { onReportDevice, onStickCalibrationComplete, onTriggerCalibrationComplete } = props;
  const [calibrationTarget, setCalibrationTarget] = useState<CalibrationTarget>(null);
  const closeWizard = useCallback(() => setCalibrationTarget(null), []);

  return (
    <Box className="input-cal__card">
      <ControllerCardHeader deviceKey={deviceKey} resolvedDevice={resolvedDevice} hasStickCal={hasStickCal} onReportDevice={onReportDevice} />
      <ControllerStatusBar busType={busType} hasRumble={hasRumble} hasGyro={hasGyro} idLabel={deviceKey} />
      <ControllerButtonGrid resolvedDevice={resolvedDevice} state={state} />
      <ControllerAxes state={state} controls={resolvedDevice.controls} onCalibrate={setCalibrationTarget} />
      <ControllerCardActions deviceKey={deviceKey} state={state} />
      <CardCalibration
        deviceKey={deviceKey}
        target={calibrationTarget}
        existingStickCal={existingStickCal}
        onClose={closeWizard}
        onStickCalibrationComplete={onStickCalibrationComplete}
        onTriggerCalibrationComplete={onTriggerCalibrationComplete}
      />
      <ControllerRawBytes state={state} />
    </Box>
  );
};

export { ControllerCard };
