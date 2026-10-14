/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import type { HidControllerMap } from '../../HidCalibrationWizard';
import type { PositionalCaptureRecord } from '../positional-capture/positional-capture.type';

const useCaptureResults = (onComplete: ((map: HidControllerMap) => void) | undefined) => {
  const [byteCapture, setByteCapture] = useState<HidControllerMap | null>(null);
  const [positionalRecords, setPositionalRecords] = useState<PositionalCaptureRecord[]>([]);

  const handleByteCaptureComplete = useCallback((map: HidControllerMap) => {
    setByteCapture(map);
  }, []);

  const handleRecordsChange = useCallback((records: PositionalCaptureRecord[]) => {
    setPositionalRecords(records);
  }, []);

  const clearResults = useCallback(() => {
    setByteCapture(null);
    setPositionalRecords([]);
  }, []);

  const finishAndClose = useCallback((onClose: () => void) => {
    if (byteCapture) onComplete?.(byteCapture);
    onClose();
  }, [byteCapture, onComplete]);

  return { byteCapture, positionalRecords, handleByteCaptureComplete, handleRecordsChange, clearResults, finishAndClose };
};

export { useCaptureResults };
