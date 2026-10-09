/* @layer renderer-components @kind types */
import type React from 'react';
import type { GyroReclaimRefs } from '../stick-gyro-reclaim';

interface GyroRefs {
  gyroMinsRef: React.MutableRefObject<Uint8Array>;
  gyroMaxsRef: React.MutableRefObject<Uint8Array>;
  gyroBufferRef: React.MutableRefObject<Uint8Array[]>;
}

interface StickRefs extends GyroReclaimRefs {
  stickMinsRef: React.MutableRefObject<Uint8Array>;
  stickMaxsRef: React.MutableRefObject<Uint8Array>;
  stickCounterBytesRef: React.MutableRefObject<Set<number>>;
  stickSamplesRef: React.MutableRefObject<number>;
  stickStableCountRef: React.MutableRefObject<number>;
  stickLastTop2Ref: React.MutableRefObject<string>;
  stickBufferRef: React.MutableRefObject<Uint8Array[]>;
  capturedStickBytesRef: React.MutableRefObject<Set<number>>;
  baselineRef: React.MutableRefObject<Uint8Array>;
}

interface TriggerRefs {
  triggerMinsRef: React.MutableRefObject<Uint8Array>;
  triggerMaxsRef: React.MutableRefObject<Uint8Array>;
  triggerSamplesRef: React.MutableRefObject<number>;
  triggerStableCountRef: React.MutableRefObject<number>;
  triggerLastTopRef: React.MutableRefObject<string>;
  triggerBufferRef: React.MutableRefObject<Uint8Array[]>;
  capturedStickBytesRef: React.MutableRefObject<Set<number>>;
  capturedTriggerBytesRef: React.MutableRefObject<Set<number>>;
  excludedRef: React.MutableRefObject<Set<number>>;
  baselineRef: React.MutableRefObject<Uint8Array>;
}

export type { GyroRefs, StickRefs, TriggerRefs };
