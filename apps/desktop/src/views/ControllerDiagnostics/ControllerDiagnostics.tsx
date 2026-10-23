/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Button, Card, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { CalibrationResult, DiagnosticsWizard } from '@app/views/InputTester';
import type { HidControllerMap } from '@app/views/InputTester';
import { IDLE_HINT, IDLE_TITLE, RESULT_TITLE } from './ControllerDiagnostics.constants';
import type { ControllerDiagnosticsProps } from './ControllerDiagnostics.type';

const ControllerDiagnostics = (props: ControllerDiagnosticsProps) => {
  const { initialDeviceKey } = props;
  const [running, setRunning] = useState(true);
  const [lastResult, setLastResult] = useState<HidControllerMap | null>(null);
  const start = useCallback(() => setRunning(true), []);
  const stop = useCallback(() => setRunning(false), []);

  return (
    <Stack gap="md" align="stretch">
      {running ? (
        <Card>
          <DiagnosticsWizard initialDeviceKey={initialDeviceKey} onComplete={setLastResult} onClose={stop} />
        </Card>
      ) : (
        <Card title={IDLE_TITLE}>
          <Stack gap="sm" align="start">
            <Text as="p">{IDLE_HINT}</Text>
            <Button variant="primary" onClick={start}>Run diagnostics</Button>
          </Stack>
        </Card>
      )}
      {lastResult && (
        <Card title={RESULT_TITLE}>
          <CalibrationResult calibration={lastResult} />
        </Card>
      )}
    </Stack>
  );
};

export { ControllerDiagnostics };
