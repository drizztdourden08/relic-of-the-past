/* @layer renderer-components @kind types */
import type React from 'react';

interface GyroReclaimRefs {
  excludedRef: React.MutableRefObject<Set<number>>;
  gyroExcludedBytesRef: React.MutableRefObject<Set<number>>;
  stickCaptureStartedAtRef: React.MutableRefObject<number>;
  stickReclaimAttemptedRef: React.MutableRefObject<boolean>;
}

export type { GyroReclaimRefs };
