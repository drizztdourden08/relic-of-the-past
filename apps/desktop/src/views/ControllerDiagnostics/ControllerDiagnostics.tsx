/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { CalibrationResult, DiagnosticsWizard } from '@app/views/InputTester';
import type { HidControllerMap } from '@app/views/InputTester';
import { RESULT_TITLE, RUN_LABEL } from './ControllerDiagnostics.constants';
import type { ControllerDiagnosticsProps } from './ControllerDiagnostics.type';
import './ControllerDiagnostics.css';

const ControllerDiagnostics = (props: ControllerDiagnosticsProps) => {
  const { initialDeviceKey } = props;
  const [running, setRunning] = useState(true);
  const [lastResult, setLastResult] = useState<HidControllerMap | null>(null);
  const start = useCallback(() => setRunning(true), []);
  const stop = useCallback(() => setRunning(false), []);

  return (
    <Box className="controller-diagnostics">
      {running
        ? <DiagnosticsWizard initialDeviceKey={initialDeviceKey} onComplete={setLastResult} onClose={stop} />
        : <Box className="controller-diagnostics__idle"><Button variant="primary" onClick={start}>{RUN_LABEL}</Button></Box>}
      {lastResult && (
        <Box className="controller-diagnostics__result">
          <Text className="controller-diagnostics__label">{RESULT_TITLE}</Text>
          <CalibrationResult calibration={lastResult} />
        </Box>
      )}
    </Box>
  );
};

export { ControllerDiagnostics };
