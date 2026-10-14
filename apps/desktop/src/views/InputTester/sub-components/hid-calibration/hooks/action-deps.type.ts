/* @layer renderer-components @kind types */
import type React from 'react';
import type { DeviceProfile } from '@rotp/input-mapping';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { IdleResult, IdleSampler } from '../stick-center';
import type {
  AxisSubStep,
  ByteStatus,
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
import type { RawHidInfo } from './device-raw-info.type';

interface ActionDeps {
  latestBytes: Uint8Array;
  gyroExcluded: Set<number>;
  stickPickMode: boolean;
  stickPickedBytes: number[];
  triggerPickMode: boolean;
  triggerPickedByte: number | null;
  selectedProfileId: string;
  detectedProfile: DeviceProfile | null;
  profile: DeviceProfile | null;
  idleResults: Record<string, IdleRecordResult>;
  recordIdleResult: (label: string, result: IdleRecordResult) => void;
  capturedEntry?: DeviceEntry | null;
  sdlVersion: string | null;
  baselineRef: React.RefObject<Uint8Array>;
  excludedRef: React.RefObject<Set<number>>;
  capturedStickBytesRef: React.RefObject<Set<number>>;
  capturedTriggerBytesRef: React.RefObject<Set<number>>;
  leftStickBytesRef: React.RefObject<Set<number>>;
  rightStickBytesRef: React.RefObject<Set<number>>;
  leftTriggerByteRef: React.RefObject<number | null>;
  rightTriggerByteRef: React.RefObject<number | null>;
  activeStickRef: React.RefObject<StickSide | null>;
  activeTriggerRef: React.RefObject<TriggerSide | null>;
  stickMinsRef: React.RefObject<Uint8Array>;
  stickMaxsRef: React.RefObject<Uint8Array>;
  stickCounterBytesRef: React.RefObject<Set<number>>;
  stickSamplesRef: React.RefObject<number>;
  stickStableCountRef: React.RefObject<number>;
  stickLastTop2Ref: React.RefObject<string>;
  stickBufferRef: React.RefObject<Uint8Array[]>;
  stickRecordingRef: React.RefObject<boolean>;
  triggerMinsRef: React.RefObject<Uint8Array>;
  triggerMaxsRef: React.RefObject<Uint8Array>;
  triggerSamplesRef: React.RefObject<number>;
  triggerStableCountRef: React.RefObject<number>;
  triggerLastTopRef: React.RefObject<string>;
  triggerBufferRef: React.RefObject<Uint8Array[]>;
  triggerRecordingRef: React.RefObject<boolean>;
  gyroMinsRef: React.RefObject<Uint8Array>;
  gyroMaxsRef: React.RefObject<Uint8Array>;
  gyroBufferRef: React.RefObject<Uint8Array[]>;
  gyroRecordingRef: React.RefObject<boolean>;
  finalizeStickRef: React.RefObject<(c1: StickCandidate, c2: StickCandidate | null) => void>;
  stickIdleRef: React.RefObject<IdleSampler | null>;
  applyIdleRef: React.RefObject<(result: IdleResult) => void>;
  finalizeTriggerRef: React.RefObject<(c: StickCandidate) => void>;
  finalizeDigitalTriggerRef: React.RefObject<(mapping: HidButtonMapping) => void>;
  activeIdxRef: React.RefObject<number>;
  advanceTimerRef: React.RefObject<ReturnType<typeof setTimeout> | null>;
  itemsRef: React.RefObject<InputItem[]>;
  releaseCountRef: React.RefObject<number>;
  confirmCountRef: React.RefObject<number>;
  detectedBtnRef: React.RefObject<HidButtonMapping | null>;
  inputPhaseActiveRef: React.RefObject<boolean>;
  byteStatusesRef: React.RefObject<ByteStatus[]>;
  gyroExcludedBytesRef: React.RefObject<Set<number>>;
  stickCaptureStartedAtRef: React.RefObject<number>;
  stickReclaimAttemptedRef: React.RefObject<boolean>;
  awaitingButtonRestRef: React.RefObject<boolean>;
  deviceInfoRef: React.RefObject<{ vendorId: number; productId: number; reportId: number; reportLength: number }>;
  rawInfoRef: React.RefObject<RawHidInfo>;
  platform: string;
  appVersion: string;
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

interface ByteClickParams {
  handleStickBytePicked: (idx: number) => void;
  handleTriggerBytePicked: (idx: number) => void;
  handleManualByteAssign: (byteIdx: number) => void;
}

export type { ActionDeps, ByteClickParams };
