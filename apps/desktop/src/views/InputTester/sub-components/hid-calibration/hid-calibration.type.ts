/* @layer renderer-components @kind types */
interface HidButtonMapping {
  byteIndex: number;
  bitMask: number;
  threshold?: number;
  restValue?: number;
}

interface AxisIdleReading {
  drift: number;
  min: number;
  max: number;
  uniqueCount: number;
  frames: number;
}

interface HidAxisMapping {
  byteIndex: number;
  center: number;
  min: number;
  max: number;
  inverted: boolean;
  idle?: AxisIdleReading;
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

type ConnectionHint = 'usb' | 'bluetooth' | 'unknown';

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
  devicePath: string | null;
  connectionHint: ConnectionHint;
  rawManufacturer: string | null;
  rawProduct: string | null;
  serialNumber: string | null;
  platform: string;
  appVersion: string;
  guid: string | null;
  sdlMapping: string | null;
  sdlType: string | null;
  sdlHasButton: boolean[] | null;
  sdlHasAxis: boolean[] | null;
  sdlVersion: string | null;
}

type Phase = 'select-profile' | 'live';
type CaptureState = 'waiting-press' | 'confirming-press' | 'waiting-release';
type AxisSubStep = 'pos' | 'neg';
type InputStatus = 'pending' | 'active' | 'captured' | 'skipped';
type StickSide = 'left' | 'right';
type TriggerSide = 'left' | 'right';
type GyroState = 'idle' | 'recording' | 'done';
type IdleState = 'idle' | 'done';
type TriggerKind = 'analog' | 'digital' | 'unknown';

type ByteStatus = 'unknown' | 'excluded' | 'counter' | 'stick' | 'trigger' | 'button' | 'idle';

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

interface ByteCandidateSource {
  idx: number;
  mins: Uint8Array;
  maxs: Uint8Array;
  baseline: Uint8Array;
  bytes: Uint8Array;
  fallbackCenter: number;
}

interface ByteColorResult {
  bg: string;
  border: string;
  text: string;
}

export type {
  AxisIdleReading,
  ByteColorResult,
  AxisSubStep,
  ButtonDiff,
  ByteStatus,
  TriggerKind,
  CaptureState,
  ConnectionHint,
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
  ByteCandidateSource,
  StickSide,
  TriggerSide,
};
