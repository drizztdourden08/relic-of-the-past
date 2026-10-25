/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { usePlatform } from '@drizztdourden08/brock-react';
import { useAppVersion } from '@app/hooks/useAppVersion';
import type { GamepadDiagnosticsReport } from '@drizztdourden08/brock-input/renderer';
import { buildReport } from '@drizztdourden08/brock-input/renderer';
import { useDiagnosticsWizardState } from '@drizztdourden08/brock-input/renderer';

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
