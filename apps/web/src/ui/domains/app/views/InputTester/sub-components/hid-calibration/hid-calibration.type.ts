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

/** Best-effort guess at transport, derived from the OS device path — never
 *  authoritative. 'unknown' when no path was available to inspect. */
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
  /** Raw OS device path, e.g. from node-hid enumeration — the actual ground
   *  truth for USB vs Bluetooth; connectionHint is only a guess derived from it. */
  devicePath: string | null;
  connectionHint: ConnectionHint;
  /** The device's own self-reported strings — distinct from `name`, which is
   *  this app's resolved/display name and may not match what the hardware reports. */
  rawManufacturer: string | null;
  rawProduct: string | null;
  serialNumber: string | null;
  /** OS the capture was taken on — same label the debug-info block uses. */
  platform: string;
  /** App version that produced this capture, so old/new captures aren't confused
   *  if the wizard's own detection heuristics change later. */
  appVersion: string;
}

type Phase = 'select-profile' | 'live';
type CaptureState = 'waiting-press' | 'confirming-press' | 'waiting-release';
type AxisSubStep = 'pos' | 'neg';
type InputStatus = 'pending' | 'active' | 'captured' | 'skipped';
type StickSide = 'left' | 'right';
type TriggerSide = 'left' | 'right';
type GyroState = 'idle' | 'recording' | 'done';
type IdleState = 'idle' | 'done';
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

export type {
  AxisSubStep,
  ButtonDiff,
  ByteStatus,
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
  StickSide,
  TriggerSide,
};
