/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import { DiagnosticsWizardDialog } from './diagnostics-wizard';
import { ControllersSection } from './ControllersSection';
import { CalibrationResult } from './CalibrationResult';
import { ControllerReportDialog } from './controller-report';
import { useInputCalibration } from './useInputCalibration';
import { DiagnosticsLog } from './DiagnosticsLog';
import { RescanButton } from '../../../compounds/RescanButton';
import './InputCalibration.css';

const InputCalibration = () => {
  const [reportDeviceKey, setReportDeviceKey] = useState<string | null>(null);
  const {
    events, logRef, controllerConnected, controllerStates, controllerDiag,
    calibrating, setCalibrating, lastCalibration,
    entries, connectedCount, isRescanPending, handleRescan, handleCalibrationComplete,
  } = useInputCalibration();
  const openDiagnostics = useCallback(() => setCalibrating(true), [setCalibrating]);
  const closeDiagnostics = useCallback(() => setCalibrating(false), [setCalibrating]);
  const closeReport = useCallback(() => setReportDeviceKey(null), []);

  const anyHidConnected = controllerConnected || connectedCount > 0;

  return (
    <Box className="input-cal">
      <Box className="input-cal__header">
        <Text className={`input-cal__status ${anyHidConnected ? 'input-cal__status--connected' : 'input-cal__status--disconnected'}`}>
          {anyHidConnected
            ? `Connected: ${connectedCount} controller(s)`
            : '0 controllers detected'}
        </Text>
        <RescanButton isPending={isRescanPending} onRescan={handleRescan} />
      </Box>

      <Box className="input-cal__actions">
        <Text className="input-cal__hint">
          Live input, stick and trigger calibration, rumble tests and diagnostics are together here.
        </Text>
        <Button
          variant="tertiary"
          size="sm"
          onClick={openDiagnostics}
          disabled={!anyHidConnected}
        >
          Gamepad Diagnostics
        </Button>
      </Box>

      <DiagnosticsWizardDialog
        open={calibrating}
        onClose={closeDiagnostics}
        onComplete={handleCalibrationComplete}
      />

      {lastCalibration && !calibrating && <CalibrationResult calibration={lastCalibration} />}

      <ControllersSection
        connectedCount={connectedCount}
        entries={entries}
        controllerStates={controllerStates}
        onReportDevice={setReportDeviceKey}
      />

      <DiagnosticsLog events={events} controllerDiag={controllerDiag} logRef={logRef} />

      {reportDeviceKey && (
        <ControllerReportDialog
          open
          deviceKey={reportDeviceKey}
          onClose={closeReport}
        />
      )}
    </Box>
  );
};

export { InputCalibration };
