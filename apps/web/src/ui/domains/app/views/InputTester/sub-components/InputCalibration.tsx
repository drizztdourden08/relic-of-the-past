/* @layer renderer-components @kind component */
// SDL3 is the only controller transport (the browser Gamepad API path is gone), so every card comes from its snapshot.

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Button } from '../../../../../design-system/primitives/Button';
import { DiagnosticsWizardDialog } from './diagnostics-wizard';
import { ControllerDeviceList } from './ControllerDeviceList';
import { ControllerReportDialog } from './controller-report';
import { useInputCalibration } from './useInputCalibration';
import { DiagnosticsLog } from './DiagnosticsLog';
import { RescanButton } from '../../../compounds/RescanButton';
import './InputCalibration.css';
import './InputCalibration.sticks.css';
import './InputCalibration.hid.css';

const S: Record<string, CSSProperties> = {
  hint: { fontSize: 'var(--text-sm)', opacity: 0.6 },
  metaXs: { fontSize: 'var(--text-xs)', color: 'var(--c-text-muted)' },
  mt: { marginTop: 'var(--space-sm)' },
};

const InputCalibration = () => {
  const [reportDeviceKey, setReportDeviceKey] = useState<string | null>(null);
  const {
    events, logRef, controllerConnected, controllerStates, controllerDiag,
    calibrating, setCalibrating, lastCalibration, stickCalibrationStore,
    controllerGroups, connectedCount, isRescanPending, handleRescan, addMapping,
    handleCalibrationComplete, handleStickCalibrationComplete,
    handleTriggerCalibrationComplete,
  } = useInputCalibration();

  const anyHidConnected = controllerConnected || connectedCount > 0;

  return (
    <Box className="input-cal">
      {/* Header */}
      <Box className="input-cal__header">
        <Text className={`input-cal__status ${anyHidConnected ? 'input-cal__status--connected' : 'input-cal__status--disconnected'}`}>
          {anyHidConnected
            ? `Connected ${'•'} ${connectedCount} controller(s)`
            : '0 controllers detected'}
        </Text>
        <RescanButton isPending={isRescanPending} onRescan={handleRescan} />
      </Box>

      {/* Actions */}
      <Box className="input-cal__actions">
        <Text style={S.hint}>
          A controller is bound from a console default or a pasted mapping, not from this page.
        </Text>
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => setCalibrating(true)}
          disabled={!anyHidConnected}
        >
          Gamepad Diagnostics
        </Button>
      </Box>

      {/* A modal, so it replaces this screen while open. */}
      <DiagnosticsWizardDialog
        open={calibrating}
        onClose={() => setCalibrating(false)}
        onComplete={handleCalibrationComplete}
      />

      {/* Diagnostics Result */}
      {lastCalibration && !calibrating && (
        <Box className="input-cal__section">
          <Box className="input-cal__result">
            <Box className="input-cal__result-header">
              <Text className="input-cal__result-title">Diagnostics Report</Text>
              <Text style={S.metaXs}>
                {lastCalibration.name}: {Object.keys(lastCalibration.buttons).length + Object.keys(lastCalibration.axes).length} inputs mapped
              </Text>
            </Box>
            <Box as="pre">{JSON.stringify(lastCalibration, null, 2)}</Box>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(lastCalibration, null, 2))}
              style={S.mt}
            >
              Copy JSON
            </Button>
          </Box>
        </Box>
      )}

      {/* Controller Cards */}
      <Box className="input-cal__section">
        <Box className="input-cal__section-title">Controllers</Box>

        {controllerGroups.length === 0 && (
          <Box className="input-cal__empty">
            <Text as="p">No controllers detected.</Text>
          </Box>
        )}

        <Box className="input-cal__cards">
          {/* SDL3 controller snapshot: ready, unavailable, and adapter cards */}
          <ControllerDeviceList
            groups={controllerGroups}
            controllerStates={controllerStates}
            stickCalibrationStore={stickCalibrationStore}
            onStickCalibrationComplete={handleStickCalibrationComplete}
            onTriggerCalibrationComplete={handleTriggerCalibrationComplete}
            onAddMapping={addMapping}
            onReportDevice={setReportDeviceKey}
          />
        </Box>
      </Box>

      {/* Diagnostics */}
      <DiagnosticsLog events={events} controllerDiag={controllerDiag} logRef={logRef} />

      {/* Mounted by the screen, not the card: the report releases SDL partway through, which
          unmounts the card mid-run. */}
      {reportDeviceKey && (
        <ControllerReportDialog
          open
          deviceKey={reportDeviceKey}
          onClose={() => setReportDeviceKey(null)}
        />
      )}
    </Box>
  );
};

export { InputCalibration };
