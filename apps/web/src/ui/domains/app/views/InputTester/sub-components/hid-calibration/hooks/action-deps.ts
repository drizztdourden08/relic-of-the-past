/* @layer renderer-components @kind types */
/** Dependency surface for useCalibrationActions (state, refs, and callbacks). */
import type React from 'react';
import type { DeviceProfile } from '@shared/input';
import type {
  AxisSubStep,
  CaptureState,
  GyroState,
  HidButtonMapping,
  HidControllerMap,
  IdleRecordResult,
  IdleState,
  InputItem,
  Phase,
  StickCandidate,
  StickSide,
  TriggerSide,
} from '../hid-calibration.type';
import type { RawHidInfo } from './useDeviceRawInfo';

interface ActionDeps {
  // State
  latestBytes: Uint8Array;
  gyroExcluded: Set<number>;
  stickPickMode: boolean;
  stickPickedBytes: number[];
  triggerPickMode: boolean;
  triggerPickedByte: number | null;
  selectedProfileId: string;
  profile: DeviceProfile | null;
  idleResults: Record<string, IdleRecordResult>;
  // Refs
  baselineRef: React.MutableRefObject<Uint8Array>;
  excludedRef: React.MutableRefObject<Set<number>>;
  capturedStickBytesRef: React.MutableRefObject<Set<number>>;
  capturedTriggerBytesRef: React.MutableRefObject<Set<number>>;
  leftStickBytesRef: React.MutableRefObject<Set<number>>;
  rightStickBytesRef: React.MutableRefObject<Set<number>>;
  leftTriggerByteRef: React.MutableRefObject<number | null>;
  rightTriggerByteRef: React.MutableRefObject<number | null>;
  activeStickRef: React.MutableRefObject<StickSide | null>;
  activeTriggerRef: React.MutableRefObject<TriggerSide | null>;
  stickMinsRef: React.MutableRefObject<Uint8Array>;
  stickMaxsRef: React.MutableRefObject<Uint8Array>;
  stickCounterBytesRef: React.MutableRefObject<Set<number>>;
  stickSamplesRef: React.MutableRefObject<number>;
  stickStableCountRef: React.MutableRefObject<number>;
  stickLastTop2Ref: React.MutableRefObject<string>;
  stickBufferRef: React.MutableRefObject<Uint8Array[]>;
  stickRecordingRef: React.MutableRefObject<boolean>;
  triggerMinsRef: React.MutableRefObject<Uint8Array>;
  triggerMaxsRef: React.MutableRefObject<Uint8Array>;
  triggerSamplesRef: React.MutableRefObject<number>;
  triggerStableCountRef: React.MutableRefObject<number>;
  triggerLastTopRef: React.MutableRefObject<string>;
  triggerBufferRef: React.MutableRefObject<Uint8Array[]>;
  triggerRecordingRef: React.MutableRefObject<boolean>;
  gyroMinsRef: React.MutableRefObject<Uint8Array>;
  gyroMaxsRef: React.MutableRefObject<Uint8Array>;
  gyroBufferRef: React.MutableRefObject<Uint8Array[]>;
  gyroRecordingRef: React.MutableRefObject<boolean>;
  finalizeStickRef: React.MutableRefObject<(c1: StickCandidate, c2: StickCandidate | null) => void>;
  finalizeTriggerRef: React.MutableRefObject<(c: StickCandidate) => void>;
  activeIdxRef: React.MutableRefObject<number>;
  advanceTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  itemsRef: React.MutableRefObject<InputItem[]>;
  releaseCountRef: React.MutableRefObject<number>;
  confirmCountRef: React.MutableRefObject<number>;
  detectedBtnRef: React.MutableRefObject<HidButtonMapping | null>;
  inputPhaseActiveRef: React.MutableRefObject<boolean>;
  deviceInfoRef: React.MutableRefObject<{ vendorId: number; productId: number; reportId: number; reportLength: number }>;
  rawInfoRef: React.MutableRefObject<RawHidInfo>;
  // Environment (for a complete, self-describing capture)
  platform: string;
  appVersion: string;
  // Callbacks
  addLog: (msg: string) => void;
  updateByteStatuses: (len: number) => void;
  doAdvance: () => void;
  setItems: (u: InputItem[] | ((prev: InputItem[]) => InputItem[])) => void;
  setActiveIndex: (i: number) => void;
  setCaptureState: (s: CaptureState) => void;
  setAxisSubStep: (s: AxisSubStep) => void;
  setAutoAdvanceWrapped: (v: boolean) => void;
  setInputPhaseActiveWrapped: (v: boolean) => void;
  setGyroState: (s: GyroState) => void;
  setGyroChangedBytes: (s: Set<number>) => void;
  setGyroExcluded: (s: Set<number>) => void;
  setIdleState: (s: IdleState) => void;
  setActiveStick: (s: StickSide | null) => void;
  setStickBusy: (v: boolean) => void;
  setStickLiveInfo: (s: string) => void;
  setStickPickMode: (v: boolean) => void;
  setStickPickedBytes: (v: number[] | ((prev: number[]) => number[])) => void;
  setActiveTrigger: (s: TriggerSide | null) => void;
  setTriggerBusy: (v: boolean) => void;
  setTriggerLiveInfo: (s: string) => void;
  setTriggerPickMode: (v: boolean) => void;
  setTriggerPickedByte: (v: number | null | ((prev: number | null) => number | null)) => void;
  setProfile: (p: DeviceProfile | null) => void;
  setPhase: (p: Phase) => void;
  onComplete: (map: HidControllerMap) => void;
}

export type { ActionDeps };
