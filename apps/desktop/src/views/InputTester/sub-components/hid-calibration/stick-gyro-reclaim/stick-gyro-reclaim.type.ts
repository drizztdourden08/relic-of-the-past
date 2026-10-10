/* @layer renderer-components @kind types */
import type React from 'react';

interface GyroReclaimRefs {
  excludedRef: React.RefObject<Set<number>>;
  gyroExcludedBytesRef: React.RefObject<Set<number>>;
  stickCaptureStartedAtRef: React.RefObject<number>;
  stickReclaimAttemptedRef: React.RefObject<boolean>;
}

export type { GyroReclaimRefs };
