/* @layer renderer-components @kind types */
/**
 * Types for the HID Calibration Wizard.
 */

interface HidButtonMapping {
  byteIndex: number;
  bitMask: number;
  /** For analog triggers: value above which the button is considered pressed */
  threshold?: number;
  /** For analog triggers: resting value of the byte */
  restValue?: number;
}

interface HidAxisMapping {
  byteIndex: number;
  center: number;
  min: number;
  max: number;
  inverted: boolean;
}

interface IdleByteAnalysis {
  byteIndex: number;
  min: number;
  max: number;
  range: number;
  average: number;
  uniqueCount: number;
  uniqueValues: number[] | string;
}

interface IdleRecordResult {
  label: string;
  durationMs: number;
  frameCount: number;
  bytes: IdleByteAnalysis[];
}

interface HidControllerMap {
  name: string;
  profileId: string;
  vendorId: number;
  productId: number;
  reportId: number;
  reportLength: number;
  buttons: Record<string, HidButtonMapping>;
  axes: Record<string, HidAxisMapping>;
  excludedBytes: number[];
  idleData?: Record<string, IdleRecordResult>;
  createdAt: number;
}

type Phase = 'select-profile' | 'live';
type CaptureState = 'waiting-press' | 'confirming-press' | 'waiting-release';
type AxisSubStep = 'pos' | 'neg';
type InputStatus = 'pending' | 'active' | 'captured' | 'skipped';
type StickSide = 'left' | 'right';
type TriggerSide = 'left' | 'right';
type GyroState = 'idle' | 'recording' | 'done';
type IdleState = 'idle' | 'done';
type ByteStatus = 'unknown' | 'gyro' | 'counter' | 'stick' | 'trigger' | 'button' | 'idle';

interface InputItem {
  kind: 'button' | 'axis';
  id: string;
  label: string;
  category: string;
  status: InputStatus;
  result?: string;
  mapping?: HidButtonMapping;
  axisMapping?: HidAxisMapping;
}

interface ButtonDiff {
  byteIndex: number;
  bitMask: number;
  analog: boolean;
  restValue: number;
  pressedValue: number;
}

interface StickCandidate {
  idx: number;
  range: number;
  min: number;
  max: number;
  center: number;
}

export type {
  AxisSubStep,
  ButtonDiff,
  ByteStatus,
  CaptureState,
  GyroState,
  HidAxisMapping,
  HidButtonMapping,
  HidControllerMap,
  IdleByteAnalysis,
  IdleRecordResult,
  IdleState,
  InputItem,
  InputStatus,
  Phase,
  StickCandidate,
  StickSide,
  TriggerSide,
};
