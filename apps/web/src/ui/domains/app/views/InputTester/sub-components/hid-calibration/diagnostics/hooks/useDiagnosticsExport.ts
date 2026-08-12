/* @layer renderer-components @kind hook */
/**
 * Copy-to-clipboard and debug-folder save for the assembled diagnostics
 * report, over the same write-debug-capture channel the wizard has always
 * used. Both report real success or failure, never an unconditional one.
 */
import { useCallback } from 'react';
import type { GamepadDiagnosticsReport } from '../diagnostics.type';

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
      const filePath = await window.api.writeHidDebugFile(report.name || report.deviceKey, report);
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
