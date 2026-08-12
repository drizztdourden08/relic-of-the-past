/* @layer renderer-components @kind hook */
/**
 * Every mutable ref the HID Calibration Wizard's state machine shares across
 * its callbacks and effects. Pure declarations, no behavior of its own.
 * Split out of useHidCalibration.ts purely for file-size compliance.
 */
import { useRef } from 'react';
import type { AxisSubStep, ByteStatus, CaptureState, HidButtonMapping, InputItem, StickCandidate, StickSide, TriggerSide } from '../hid-calibration.type';
import { createNoiseTracker } from '../noisy-bytes';
import type { IdleResult, IdleSampler } from '../stick-center';

const useCalibrationRefs = () => {
  const logRef = useRef<HTMLDivElement>(null);
  const activeIdxRef = useRef(-1);
  const captureStateRef = useRef<CaptureState>('waiting-press');
  const axisSubStepRef = useRef<AxisSubStep>('pos');
  const itemsRef = useRef<InputItem[]>([]);
  const releaseCountRef = useRef(0);
  const detectedBtnRef = useRef<HidButtonMapping | null>(null);
  const confirmCountRef = useRef(0);
  const axisCapRef = useRef<Record<string, { posBytes: Uint8Array | null; negBytes: Uint8Array | null }>>({});
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceRef = useRef(false);
  const lastReportIdRef = useRef(0);
  const inputPhaseActiveRef = useRef(false);
  // Settle gate for button capture (item 4): true whenever a button item is
  // active and hasn't yet been seen back at the idle baseline. See
  // processButtonItem in button-detection.ts.
  const awaitingButtonRestRef = useRef(false);
  const heldAtActivationRef = useRef(new Set<string>());
  const lastDetectLogAtRef = useRef(0);
  const baselineRef = useRef(new Uint8Array(0));
  const excludedRef = useRef(new Set<number>());
  // Bytes that keep moving by themselves (motion sensors, analog rest jitter).
  // Detection ignores them so a restless pad can still show a moment of rest;
  // never merged into excludedRef, so it changes no cell's colour. See
  // noisy-bytes.ts.
  const noiseRef = useRef(createNoiseTracker());
  const deviceInfoRef = useRef({ vendorId: 0, productId: 0, reportId: 0, reportLength: 0 });
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
  // Non-null only while an idle reading is running. See stick-center.ts.
  const stickIdleRef = useRef<IdleSampler | null>(null);
  const applyIdleRef = useRef<(result: IdleResult) => void>(() => {});
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
  const byteStatusesRef = useRef<ByteStatus[]>([]);
  const latestBytesRef = useRef<Uint8Array>(new Uint8Array(0));
  // Exactly which bytes the gyro step excluded, kept separate from excludedRef
  // (which keeps growing as sticks/triggers/buttons capture their own bytes)
  // so a stick capture can reconsider only gyro's own candidates, never a
  // byte another step already claimed. See report-processing.ts.
  const gyroExcludedBytesRef = useRef(new Set<number>());
  const stickCaptureStartedAtRef = useRef(0);
  const stickReclaimAttemptedRef = useRef(false);

  return {
    logRef, activeIdxRef, captureStateRef, axisSubStepRef, itemsRef, releaseCountRef, detectedBtnRef,
    confirmCountRef, axisCapRef, advanceTimerRef, autoAdvanceRef, lastReportIdRef, inputPhaseActiveRef,
    awaitingButtonRestRef, heldAtActivationRef, lastDetectLogAtRef, baselineRef, excludedRef, noiseRef, deviceInfoRef, gyroRecordingRef, gyroMinsRef, gyroMaxsRef,
    gyroBufferRef, stickRecordingRef, stickMinsRef, stickMaxsRef, stickCounterBytesRef, stickSamplesRef,
    stickStableCountRef, stickLastTop2Ref, activeStickRef, stickBufferRef, capturedStickBytesRef,
    leftStickBytesRef, rightStickBytesRef, finalizeStickRef, stickIdleRef, applyIdleRef, triggerRecordingRef, triggerMinsRef,
    triggerMaxsRef, triggerSamplesRef, triggerStableCountRef, triggerLastTopRef, activeTriggerRef,
    triggerBufferRef, capturedTriggerBytesRef, leftTriggerByteRef, rightTriggerByteRef, finalizeTriggerRef, finalizeDigitalTriggerRef,
    byteStatusesRef, latestBytesRef, gyroExcludedBytesRef, stickCaptureStartedAtRef, stickReclaimAttemptedRef,
  };
};

export { useCalibrationRefs };
