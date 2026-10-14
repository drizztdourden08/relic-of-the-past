/* @layer renderer-components @kind hook */
import { useRef } from 'react';
import type { AxisSubStep, CaptureState, HidButtonMapping, InputItem } from '../hid-calibration.type';
import { createNoiseTracker } from '../noisy-bytes';
import type { AxisCapture } from '../button-detection/button-detection.type';

const useButtonCaptureRefs = () => {
  const logRef = useRef<HTMLDivElement>(null);
  const activeIdxRef = useRef(-1);
  const captureStateRef = useRef<CaptureState>('waiting-press');
  const axisSubStepRef = useRef<AxisSubStep>('pos');
  const itemsRef = useRef<InputItem[]>([]);
  const releaseCountRef = useRef(0);
  const detectedBtnRef = useRef<HidButtonMapping | null>(null);
  const confirmCountRef = useRef(0);
  const axisCapRef = useRef<Partial<Record<string, AxisCapture>>>({});
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceRef = useRef(false);
  const lastReportIdRef = useRef(0);
  const inputPhaseActiveRef = useRef(false);
  const awaitingButtonRestRef = useRef(false);
  const heldAtActivationRef = useRef(new Set<string>());
  const lastDetectLogAtRef = useRef(0);
  const baselineRef = useRef(new Uint8Array(0));
  const excludedRef = useRef(new Set<number>());
  const noiseRef = useRef(createNoiseTracker());

  return {
    logRef, activeIdxRef, captureStateRef, axisSubStepRef, itemsRef, releaseCountRef, detectedBtnRef,
    confirmCountRef, axisCapRef, advanceTimerRef, autoAdvanceRef, lastReportIdRef, inputPhaseActiveRef,
    awaitingButtonRestRef, heldAtActivationRef, lastDetectLogAtRef, baselineRef, excludedRef, noiseRef,
  };
};

export { useButtonCaptureRefs };
