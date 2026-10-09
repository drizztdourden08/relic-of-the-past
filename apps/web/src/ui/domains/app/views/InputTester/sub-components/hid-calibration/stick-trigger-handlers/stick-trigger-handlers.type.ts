/* @layer renderer-components @kind types */
import type React from 'react';
import type { InputItem, StickSide, TriggerSide } from '../hid-calibration.type';

interface StickFinalizeRefs {
  stickMinsRef: React.MutableRefObject<Uint8Array>;
  stickMaxsRef: React.MutableRefObject<Uint8Array>;
  stickCounterBytesRef: React.MutableRefObject<Set<number>>;
  excludedRef: React.MutableRefObject<Set<number>>;
  capturedStickBytesRef: React.MutableRefObject<Set<number>>;
  leftStickBytesRef: React.MutableRefObject<Set<number>>;
  rightStickBytesRef: React.MutableRefObject<Set<number>>;
  activeStickRef: React.MutableRefObject<StickSide | null>;
}

interface StickFinalizeCallbacks {
  addLog: (msg: string) => void;
  updateByteStatuses: (len: number) => void;
  setItems: (updater: (prev: InputItem[]) => InputItem[]) => void;
  setActiveStick: (s: StickSide | null) => void;
  setStickBusy: (v: boolean) => void;
  setStickLiveInfo: (s: string) => void;
  setGyroExcluded: (s: Set<number>) => void;
}

type StickResetRefs = Pick<StickFinalizeRefs, 'excludedRef' | 'capturedStickBytesRef' | 'leftStickBytesRef' | 'rightStickBytesRef' | 'activeStickRef'>;

type StickResetCallbacks = Pick<StickFinalizeCallbacks, 'addLog' | 'updateByteStatuses' | 'setItems' | 'setActiveStick' | 'setStickBusy' | 'setGyroExcluded'> & {
  setStickPickMode: (v: boolean) => void;
  setStickPickedBytes: (v: number[]) => void;
  setStickLiveInfo: (s: string) => void;
  stickRecordingRef: React.MutableRefObject<boolean>;
};

interface TriggerFinalizeRefs {
  excludedRef: React.MutableRefObject<Set<number>>;
  capturedTriggerBytesRef: React.MutableRefObject<Set<number>>;
  leftTriggerByteRef: React.MutableRefObject<number | null>;
  rightTriggerByteRef: React.MutableRefObject<number | null>;
  activeTriggerRef: React.MutableRefObject<TriggerSide | null>;
  baselineRef: React.MutableRefObject<Uint8Array>;
}

interface TriggerFinalizeCallbacks {
  addLog: (msg: string) => void;
  updateByteStatuses: (len: number) => void;
  setItems: (updater: (prev: InputItem[]) => InputItem[]) => void;
  setActiveTrigger: (s: TriggerSide | null) => void;
  setTriggerBusy: (v: boolean) => void;
  setTriggerLiveInfo: (s: string) => void;
  setGyroExcluded: (s: Set<number>) => void;
}

type TriggerResetRefs = Pick<TriggerFinalizeRefs, 'excludedRef' | 'capturedTriggerBytesRef' | 'leftTriggerByteRef' | 'rightTriggerByteRef' | 'activeTriggerRef'>;

type TriggerResetCallbacks = Pick<TriggerFinalizeCallbacks, 'addLog' | 'updateByteStatuses' | 'setItems' | 'setActiveTrigger' | 'setTriggerBusy' | 'setGyroExcluded'> & {
  setTriggerPickMode: (v: boolean) => void;
  setTriggerPickedByte: (v: number | null) => void;
  setTriggerLiveInfo: (s: string) => void;
  triggerRecordingRef: React.MutableRefObject<boolean>;
};

export type {
  StickFinalizeCallbacks, StickFinalizeRefs, StickResetCallbacks, StickResetRefs,
  TriggerFinalizeCallbacks, TriggerFinalizeRefs, TriggerResetCallbacks, TriggerResetRefs,
};
