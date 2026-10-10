/* @layer renderer-components @kind types */
import type React from 'react';
import type { InputItem, StickSide, TriggerSide } from '../hid-calibration.type';

interface StickFinalizeRefs {
  stickMinsRef: React.RefObject<Uint8Array>;
  stickMaxsRef: React.RefObject<Uint8Array>;
  stickCounterBytesRef: React.RefObject<Set<number>>;
  excludedRef: React.RefObject<Set<number>>;
  capturedStickBytesRef: React.RefObject<Set<number>>;
  leftStickBytesRef: React.RefObject<Set<number>>;
  rightStickBytesRef: React.RefObject<Set<number>>;
  activeStickRef: React.RefObject<StickSide | null>;
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
  stickRecordingRef: React.RefObject<boolean>;
};

interface TriggerFinalizeRefs {
  excludedRef: React.RefObject<Set<number>>;
  capturedTriggerBytesRef: React.RefObject<Set<number>>;
  leftTriggerByteRef: React.RefObject<number | null>;
  rightTriggerByteRef: React.RefObject<number | null>;
  activeTriggerRef: React.RefObject<TriggerSide | null>;
  baselineRef: React.RefObject<Uint8Array>;
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
  triggerRecordingRef: React.RefObject<boolean>;
};

export type {
  StickFinalizeCallbacks, StickFinalizeRefs, StickResetCallbacks, StickResetRefs,
  TriggerFinalizeCallbacks, TriggerFinalizeRefs, TriggerResetCallbacks, TriggerResetRefs,
};
