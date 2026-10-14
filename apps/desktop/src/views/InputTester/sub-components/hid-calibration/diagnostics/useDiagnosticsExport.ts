/* @layer renderer-components @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { useCallback } from 'react';
import type { GamepadDiagnosticsReport } from './diagnostics.type';

const useDiagnosticsExport = (report: GamepadDiagnosticsReport, addLog: (msg: string) => void) => {
  const handleCopyJson = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      addLog('Copied the diagnostics report to the clipboard.');
      return true;
    } catch (err) {
      addLog(`Failed to copy the diagnostics report: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [report, addLog]);

  const handleSaveDebugFile = useCallback(async (): Promise<boolean> => {
    try {
      const filePath = await requireHostApi().writeHidDebugFile(report.name || report.deviceKey, report);
      addLog(`Saved the diagnostics report to ${filePath}`);
      return true;
    } catch (err) {
      addLog(`Failed to save the diagnostics report: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [report, addLog]);

  return { handleCopyJson, handleSaveDebugFile };
};

export { useDiagnosticsExport };
