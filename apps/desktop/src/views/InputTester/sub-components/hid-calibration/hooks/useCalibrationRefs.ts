/* @layer renderer-components @kind hook */
import { useRef } from 'react';
import type { ByteStatus } from '../hid-calibration.type';
import { useButtonCaptureRefs } from './useButtonCaptureRefs';
import { useStickCaptureRefs } from './useStickCaptureRefs';
import { useTriggerCaptureRefs } from './useTriggerCaptureRefs';

const useCalibrationRefs = () => {
  const deviceInfoRef = useRef({ vendorId: 0, productId: 0, reportId: 0, reportLength: 0 });
  const byteStatusesRef = useRef<ByteStatus[]>([]);
  const latestBytesRef = useRef<Uint8Array>(new Uint8Array(0));
  const gyroExcludedBytesRef = useRef(new Set<number>());
  const stickCaptureStartedAtRef = useRef(0);
  const stickReclaimAttemptedRef = useRef(false);

  return {
    ...useButtonCaptureRefs(),
    ...useStickCaptureRefs(),
    ...useTriggerCaptureRefs(),
    deviceInfoRef, byteStatusesRef, latestBytesRef, gyroExcludedBytesRef, stickCaptureStartedAtRef, stickReclaimAttemptedRef,
  };
};

export { useCalibrationRefs };
