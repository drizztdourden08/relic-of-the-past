/* @layer renderer-components @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { useCallback } from 'react';
import type { HidControllerMap } from '../../HidCalibrationWizard';
import type { PositionalCaptureRecord } from '../positional-capture/positional-capture.type';
import type { SummaryPayload } from '../diagnostics-wizard.type';

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
      await requireHostApi().writeHidDebugFile(payload.byteCapture?.name ?? 'diagnostics-wizard', payload);
      return true;
    } catch {
      return false;
    }
  }, [buildPayload]);

  return { handleCopyJson, handleSaveToDisk };
};

export { useSummaryExport };
