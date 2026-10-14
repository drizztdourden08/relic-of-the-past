/* @layer renderer-components @kind types */
import type React from 'react';
import type { HidButtonMapping, StickCandidate } from '../hid-calibration.type';
import type { GyroReclaimRefs } from '../stick-gyro-reclaim';

interface GyroRefs {
  gyroMinsRef: React.RefObject<Uint8Array>;
  gyroMaxsRef: React.RefObject<Uint8Array>;
  gyroBufferRef: React.RefObject<Uint8Array[]>;
}

interface StickRefs extends GyroReclaimRefs {
  stickMinsRef: React.RefObject<Uint8Array>;
  stickMaxsRef: React.RefObject<Uint8Array>;
  stickCounterBytesRef: React.RefObject<Set<number>>;
  stickSamplesRef: React.RefObject<number>;
  stickStableCountRef: React.RefObject<number>;
  stickLastTop2Ref: React.RefObject<string>;
  stickBufferRef: React.RefObject<Uint8Array[]>;
  capturedStickBytesRef: React.RefObject<Set<number>>;
  baselineRef: React.RefObject<Uint8Array>;
}

interface TriggerRefs {
  triggerMinsRef: React.RefObject<Uint8Array>;
  triggerMaxsRef: React.RefObject<Uint8Array>;
  triggerSamplesRef: React.RefObject<number>;
  triggerStableCountRef: React.RefObject<number>;
  triggerLastTopRef: React.RefObject<string>;
  triggerBufferRef: React.RefObject<Uint8Array[]>;
  capturedStickBytesRef: React.RefObject<Set<number>>;
  capturedTriggerBytesRef: React.RefObject<Set<number>>;
  excludedRef: React.RefObject<Set<number>>;
  baselineRef: React.RefObject<Uint8Array>;
}

interface StickFrameArgs {
  bytes: Uint8Array;
  refs: StickRefs;
  onLiveInfo: (info: string) => void;
  onFinalize: (c1: StickCandidate, c2: StickCandidate | null) => void;
  onStopRecording: () => void;
  addLog: (msg: string) => void;
}

interface TriggerFrameArgs {
  bytes: Uint8Array;
  refs: TriggerRefs;
  onLiveInfo: (info: string) => void;
  onFinalize: (c: StickCandidate) => void;
  onStopRecording: () => void;
  onFinalizeDigital: (mapping: HidButtonMapping) => void;
}

export type { GyroRefs, StickFrameArgs, StickRefs, TriggerFrameArgs, TriggerRefs };
