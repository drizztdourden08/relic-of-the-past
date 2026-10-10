/* @layer renderer-components @kind types */
import type React from 'react';
import type { AxisSubStep, CaptureState, HidButtonMapping, InputItem } from '../hid-calibration.type';
import type { NoiseTracker } from '../noisy-bytes';

interface AxisCapture {
  posBytes: Uint8Array | null;
  negBytes: Uint8Array | null;
}

interface ButtonRefs {
  activeIdxRef: React.RefObject<number>;
  captureStateRef: React.RefObject<CaptureState>;
  axisSubStepRef: React.RefObject<AxisSubStep>;
  itemsRef: React.RefObject<InputItem[]>;
  releaseCountRef: React.RefObject<number>;
  detectedBtnRef: React.RefObject<HidButtonMapping | null>;
  confirmCountRef: React.RefObject<number>;
  axisCapRef: React.RefObject<Record<string, AxisCapture>>;
  advanceTimerRef: React.RefObject<ReturnType<typeof setTimeout> | null>;
  autoAdvanceRef: React.RefObject<boolean>;
  inputPhaseActiveRef: React.RefObject<boolean>;
  baselineRef: React.RefObject<Uint8Array>;
  excludedRef: React.RefObject<Set<number>>;
  noiseRef: React.RefObject<NoiseTracker>;
  awaitingButtonRestRef: React.RefObject<boolean>;
  heldAtActivationRef: React.RefObject<Set<string>>;
  lastDetectLogAtRef: React.RefObject<number>;
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

interface AxisPick {
  byte: number;
  pos: number;
  neg: number;
}

export type { AxisCapture, AxisPick, AxisStepArgs, ButtonCallbacks, ButtonRefs };
