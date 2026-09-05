/* @layer renderer-components @kind hook */
/**
 * Wires the shared diagnostics-wizard state machine into the report: the run stays closed (SDL
 * keeps its hold) until the diagnostics step, pre-selecting the report's device. The wizard's
 * byte capture is the calibration map; nothing here re-derives it.
 */
import { useMemo } from 'react';
import { usePlatform } from '@app/platform';
import { useAppVersion } from '@app/hooks/useAppVersion';
import type { GamepadDiagnosticsReport } from '../../hid-calibration/diagnostics';
import { buildReport } from '../../hid-calibration/diagnostics/report-builder';
import { useDiagnosticsWizardState } from '../../diagnostics-wizard/behavior/useDiagnosticsWizardState';

const useReportDiagnostics = (deviceKey: string, isActive: boolean) => {
  const wizard = useDiagnosticsWizardState({ open: isActive, initialDeviceKey: deviceKey });
  const { info: platformInfo } = usePlatform();
  const appVersion = useAppVersion();

  const diagnosticsReport = useMemo((): GamepadDiagnosticsReport | null => {
    const map = wizard.byteCapture;
    if (!map) return null;
    return buildReport({
      deviceKey,
      name: map.name,
      // No per-model preset: SDL's own capability report, already in the calibration map, is the
      // identity signal, so resolvedPreset always reads null.
      deviceEntry: wizard.capturedLayout?.entry ?? null,
      preset: null,
      nativeStatus: {
        rawAvailable: map.reportLength > 0,
        rawUnavailableReason: map.reportLength > 0 ? null : 'not-found',
        mappingString: wizard.mapping ?? null,
        joystickCounts: null,
      },
      platform: platformInfo.os,
      appVersion,
    });
  }, [wizard.byteCapture, wizard.capturedLayout, wizard.mapping, deviceKey, platformInfo.os, appVersion]);

  return { wizard, diagnosticsReport };
};

export { useReportDiagnostics };
