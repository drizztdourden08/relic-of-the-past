/* @layer renderer-components @kind hook */
import { useRef } from 'react';
import type { StickCandidate, StickSide } from '../hid-calibration.type';
import type { IdleResult, IdleSampler } from '../stick-center';

const useStickCaptureRefs = () => {
  const gyroRecordingRef = useRef(false);
  const gyroMinsRef = useRef<Uint8Array>(new Uint8Array(0));
  const gyroMaxsRef = useRef<Uint8Array>(new Uint8Array(0));
  const gyroBufferRef = useRef<Uint8Array[]>([]);
  const stickRecordingRef = useRef(false);
  const stickMinsRef = useRef<Uint8Array>(new Uint8Array(0));
  const stickMaxsRef = useRef<Uint8Array>(new Uint8Array(0));
  const stickCounterBytesRef = useRef(new Set<number>());
  const stickSamplesRef = useRef(0);
  const stickStableCountRef = useRef(0);
  const stickLastTop2Ref = useRef('');
  const activeStickRef = useRef<StickSide | null>(null);
  const stickBufferRef = useRef<Uint8Array[]>([]);
  const capturedStickBytesRef = useRef(new Set<number>());
  const leftStickBytesRef = useRef(new Set<number>());
  const rightStickBytesRef = useRef(new Set<number>());
  const finalizeStickRef = useRef<(c1: StickCandidate, c2: StickCandidate | null) => void>(() => {});
  const stickIdleRef = useRef<IdleSampler | null>(null);
  const applyIdleRef = useRef<(result: IdleResult) => void>(() => {});

  return {
    gyroRecordingRef, gyroMinsRef, gyroMaxsRef, gyroBufferRef, stickRecordingRef, stickMinsRef, stickMaxsRef,
    stickCounterBytesRef, stickSamplesRef, stickStableCountRef, stickLastTop2Ref, activeStickRef, stickBufferRef,
    capturedStickBytesRef, leftStickBytesRef, rightStickBytesRef, finalizeStickRef, stickIdleRef, applyIdleRef,
  };
};

export { useStickCaptureRefs };
