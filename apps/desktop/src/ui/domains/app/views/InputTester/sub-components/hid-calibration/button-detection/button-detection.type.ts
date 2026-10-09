/* @layer renderer-components @kind types */
import type React from 'react';
import type { AxisSubStep, CaptureState, HidButtonMapping, InputItem } from '../hid-calibration.type';
import type { NoiseTracker } from '../noisy-bytes';

interface AxisCapture {
  posBytes: Uint8Array | null;
  negBytes: Uint8Array | null;
}

interface ButtonRefs {
  activeIdxRef: React.MutableRefObject<number>;
  captureStateRef: React.MutableRefObject<CaptureState>;
  axisSubStepRef: React.MutableRefObject<AxisSubStep>;
  itemsRef: React.MutableRefObject<InputItem[]>;
  releaseCountRef: React.MutableRefObject<number>;
  detectedBtnRef: React.MutableRefObject<HidButtonMapping | null>;
  confirmCountRef: React.MutableRefObject<number>;
  axisCapRef: React.MutableRefObject<Record<string, AxisCapture>>;
  advanceTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  autoAdvanceRef: React.MutableRefObject<boolean>;
  inputPhaseActiveRef: React.MutableRefObject<boolean>;
  baselineRef: React.MutableRefObject<Uint8Array>;
  excludedRef: React.MutableRefObject<Set<number>>;
  noiseRef: React.MutableRefObject<NoiseTracker>;
  awaitingButtonRestRef: React.MutableRefObject<boolean>;
  heldAtActivationRef: React.MutableRefObject<Set<string>>;
  lastDetectLogAtRef: React.MutableRefObject<number>;
}

interface ButtonCallbacks {
  setCaptureState: (s: CaptureState) => void;
  setAxisSubStep: (s: AxisSubStep) => void;
  setItems: (updater: (prev: InputItem[]) => InputItem[]) => void;
  addLog: (msg: string) => void;
  updateByteStatuses: (len: number) => void;
  doAdvance: () => void;
}

interface AxisStepArgs {
  bytes: Uint8Array;
  bl: Uint8Array;
  excl: Set<number>;
  item: InputItem;
  idx: number;
  refs: ButtonRefs;
  cb: ButtonCallbacks;
}

export type { AxisCapture, AxisStepArgs, ButtonCallbacks, ButtonRefs };
