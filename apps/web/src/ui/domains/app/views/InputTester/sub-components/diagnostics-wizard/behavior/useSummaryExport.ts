/* @layer renderer-components @kind hook */
/** Copy-to-clipboard and debug-folder save for the summary step's combined
 *  payload: the byte capture and the positional records together, exactly
 *  what the summary step displays. */
import { useCallback } from 'react';
import type { HidControllerMap } from '../../HidCalibrationWizard';
import type { PositionalCaptureRecord } from '../positional-capture/positional-capture.type';

interface SummaryPayload {
  createdAt: number;
  byteCapture: HidControllerMap | null;
  positionalCapture: PositionalCaptureRecord[];
}

const useSummaryExport = (byteCapture: HidControllerMap | null, positionalRecords: PositionalCaptureRecord[]) => {
  const buildPayload = useCallback((): SummaryPayload => ({
    createdAt: Date.now(),
    byteCapture,
    positionalCapture: positionalRecords,
  }), [byteCapture, positionalRecords]);

  const handleCopyJson = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildPayload(), null, 2));
      return true;
    } catch {
      return false;
    }
  }, [buildPayload]);

  const handleSaveToDisk = useCallback(async (): Promise<boolean> => {
    try {
      const payload = buildPayload();
      await window.api.writeHidDebugFile(payload.byteCapture?.name ?? 'diagnostics-wizard', payload);
      return true;
    } catch {
      return false;
    }
  }, [buildPayload]);

  return { handleCopyJson, handleSaveToDisk };
};

export { useSummaryExport };
export type { SummaryPayload };
