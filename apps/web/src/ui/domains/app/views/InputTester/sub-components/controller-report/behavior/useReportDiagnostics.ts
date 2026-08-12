/* @layer renderer-components @kind hook */
/**
 * Wires the shared diagnostics-wizard state machine into the report's own
 * step flow: the run stays closed (SDL keeps its normal hold) until the
 * report reaches its diagnostics step, and pre-selects the device the
 * report is already about. The byte capture the wizard produces is used
 * directly as this hook's calibration map, so nothing here re-derives it.
 * The richer diagnostics-report JSON attached to the issue is assembled
 * from the same captured layout and live mapping line the wizard itself
 * already resolved, once a capture exists.
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
      // There is no per-model preset to resolve here — SDL's own capability
      // report, already folded into the calibration map above, is the
      // identity signal now; resolvedPreset in the report always reads null.
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
