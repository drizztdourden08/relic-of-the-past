/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { ByteStatus } from '../hid-calibration.type';
import { computeByteStatuses } from '../compute-byte-statuses';
import type { CalibrationRefs } from './report-subscription.type';

const useUpdateByteStatuses = (refs: CalibrationRefs, setByteStatuses: (statuses: ByteStatus[]) => void) => {
  const { excludedRef, capturedStickBytesRef, capturedTriggerBytesRef, itemsRef, byteStatusesRef } = refs;

  return useCallback((len: number) => {
    const statuses = computeByteStatuses({
      len,
      excluded: excludedRef.current,
      capturedStickBytes: capturedStickBytesRef.current,
      capturedTriggerBytes: capturedTriggerBytesRef.current,
      items: itemsRef.current,
    });
    byteStatusesRef.current = statuses; setByteStatuses([...statuses]);
  }, []);
};

export { useUpdateByteStatuses };
