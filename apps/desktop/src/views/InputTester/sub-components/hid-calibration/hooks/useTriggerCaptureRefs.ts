/* @layer renderer-components @kind hook */
import { useRef } from 'react';
import type { HidButtonMapping, StickCandidate, TriggerSide } from '../hid-calibration.type';

const useTriggerCaptureRefs = () => {
  const triggerRecordingRef = useRef(false);
  const triggerMinsRef = useRef<Uint8Array>(new Uint8Array(0));
  const triggerMaxsRef = useRef<Uint8Array>(new Uint8Array(0));
  const triggerSamplesRef = useRef(0);
  const triggerStableCountRef = useRef(0);
  const triggerLastTopRef = useRef('');
  const activeTriggerRef = useRef<TriggerSide | null>(null);
  const triggerBufferRef = useRef<Uint8Array[]>([]);
  const capturedTriggerBytesRef = useRef(new Set<number>());
  const leftTriggerByteRef = useRef<number | null>(null);
  const rightTriggerByteRef = useRef<number | null>(null);
  const finalizeTriggerRef = useRef<(c: StickCandidate) => void>(() => {});
  const finalizeDigitalTriggerRef = useRef<(mapping: HidButtonMapping) => void>(() => {});

  return {
    triggerRecordingRef, triggerMinsRef, triggerMaxsRef, triggerSamplesRef, triggerStableCountRef, triggerLastTopRef,
    activeTriggerRef, triggerBufferRef, capturedTriggerBytesRef, leftTriggerByteRef, rightTriggerByteRef,
    finalizeTriggerRef, finalizeDigitalTriggerRef,
  };
};

export { useTriggerCaptureRefs };
